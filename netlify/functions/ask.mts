// POST /api/ask: answers a parenting question for one child's age, streamed back as plain text.
// The Gemini key only ever lives in the GEMINI_API_KEY environment variable on Netlify.

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChildContext {
  name: string;
  ageText: string;
  ageMonths: number | null;
}

const MAX_MESSAGES = 12;
const MAX_CHARS = 1500;
const MAX_BODY_BYTES = 24_000;
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;
const UPSTREAM_TIMEOUT_MS = 45_000;

// Per-instance and reset on cold start. Enough to stop one visitor draining a demo's quota;
// a shared store (Upstash, Redis) would be needed for a hard limit.
const recentRequests = new Map<string, number[]>();

function json(status: number, body: object, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers });
}

function isRateLimited(ip: string, now = Date.now()): boolean {
  const recent = (recentRequests.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT;
  if (!limited) recent.push(now);
  recentRequests.set(ip, recent);
  if (recentRequests.size > 5_000) recentRequests.clear();
  return limited;
}

type Parsed = { ok: true; messages: ChatMessage[]; child: ChildContext } | { ok: false; error: string };

function parseRequest(body: unknown): Parsed {
  const fail = (error: string): Parsed => ({ ok: false, error });
  if (!body || typeof body !== 'object') return fail('The request body must be a JSON object.');
  const { messages, child } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return fail(`Send between 1 and ${MAX_MESSAGES} messages.`);
  }

  const cleaned: ChatMessage[] = [];
  for (const message of messages) {
    const { role, content } = (message ?? {}) as Record<string, unknown>;
    if (role !== 'user' && role !== 'assistant')
      return fail('Each message needs a role of user or assistant.');
    if (typeof content !== 'string' || !content.trim() || content.length > MAX_CHARS) {
      return fail(`Each message must be between 1 and ${MAX_CHARS} characters.`);
    }
    cleaned.push({ role, content: content.trim() });
  }
  if (cleaned.at(0)?.role !== 'user' || cleaned.at(-1)?.role !== 'user') {
    return fail('The conversation must start and end with a question from the user.');
  }

  // These values are placed in the system prompt, so keep them short and strip anything unusual.
  const details = (child && typeof child === 'object' ? child : {}) as Record<string, unknown>;
  const name = typeof details.name === 'string' ? details.name.replace(/[^\p{L}\p{N} .'-]/gu, '').trim() : '';
  const ageText = typeof details.ageText === 'string' ? details.ageText.replace(/[^\w ,]/g, '').trim() : '';
  const ageMonths =
    typeof details.ageMonths === 'number' && Number.isFinite(details.ageMonths)
      ? Math.min(216, Math.max(0, Math.round(details.ageMonths)))
      : null;

  return {
    ok: true,
    messages: cleaned,
    child: {
      name: name.slice(0, 40) || 'the child',
      ageText: ageText.slice(0, 40) || 'an unknown age',
      ageMonths,
    },
  };
}

export function systemPrompt({ name, ageText, ageMonths }: ChildContext): string {
  const approx = ageMonths === null ? '' : ` (about ${ageMonths} months)`;
  return [
    'You are BabySteps, a warm and practical parenting assistant for families in India.',
    `The parent is asking about ${name}, who is ${ageText} old${approx}.`,
    'Fit every answer to this exact age and to Indian homes: local foods, climate, family routines and the IAP vaccine schedule.',
    'Keep answers under 180 words unless asked for more. Start with the direct answer, then a few short bullet points.',
    'You are not a doctor. Do not diagnose, and do not name medicines or doses.',
    'If the question mentions a danger sign (trouble breathing, bluish lips, a seizure, fever in a baby under 3 months, signs of dehydration, a child who is hard to wake, a serious injury or poisoning), tell the parent to get emergency care now or call 112, and say nothing else.',
    'Suggest seeing their pediatrician when it would genuinely help, not in every answer.',
    'Politely decline anything unrelated to parenting, pregnancy or child health.',
  ].join('\n');
}

// Gemini streams server-sent events; each "data:" line holds a JSON chunk with a slice of the answer.
export function textFromEvent(line: string): string {
  if (!line.startsWith('data:')) return '';
  try {
    const event = JSON.parse(line.slice(5)) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return event.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  } catch {
    return '';
  }
}

function toPlainTextStream(events: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = events.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let pending = '';

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        const last = textFromEvent(pending.trim());
        if (last) controller.enqueue(encoder.encode(last));
        controller.close();
        return;
      }
      // A network chunk can end mid-line, so hold the incomplete tail until the next chunk arrives.
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? '';
      const text = lines.map(textFromEvent).join('');
      if (text) controller.enqueue(encoder.encode(text));
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

export default async function handler(req: Request, context: { ip?: string }): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' }, { allow: 'POST' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(503, { error: 'Answers aren’t switched on yet: GEMINI_API_KEY is not set.' });

  if (isRateLimited(context.ip ?? 'unknown')) {
    return json(
      429,
      { error: 'That’s a lot of questions at once. Wait a minute and try again.' },
      { 'retry-after': '60' },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'The request is too large.' });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: 'The request body must be valid JSON.' });
  }
  const parsed = parseRequest(body);
  if (!parsed.ok) return json(400, { error: parsed.error });

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt(parsed.child) }] },
          contents: parsed.messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
        }),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      },
    );
  } catch {
    return json(504, { error: 'The answer took too long. Try again.' });
  }

  if (!upstream.ok || !upstream.body) {
    console.error(`Gemini responded ${upstream.status}: ${await upstream.text().catch(() => '')}`);
    const error =
      upstream.status === 429
        ? 'Lots of people are asking right now. Try again in a minute.'
        : 'Answers are unavailable right now. Try again later.';
    return json(502, { error });
  }

  return new Response(toPlainTextStream(upstream.body), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const config = { path: '/api/ask' };
