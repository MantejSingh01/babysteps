import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { ChatMessage } from '../types';
import { Markdown } from './Markdown';

const MAX_CHARS = 1500;
const HISTORY_SENT = 10;

function ageLabel(months: number): string {
  return months < 24 ? `${months}-month-old` : `${Math.floor(months / 12)}-year-old`;
}

function starterQuestions(months: number): string[] {
  const age = ageLabel(months);
  if (months < 4) {
    return [
      'How many hours should a newborn sleep?',
      'How do I know my baby is feeding enough?',
      'My baby hiccups a lot. Is that normal?',
    ];
  }
  if (months < 12) {
    return [
      'How do I start solids? Which Indian foods first?',
      `What does a good sleep routine look like for a ${age}?`,
      'How can I ease teething pain?',
    ];
  }
  if (months < 36) {
    return [
      'My toddler is a fussy eater. What can I try?',
      'How do I handle tantrums calmly?',
      'How much screen time is okay?',
    ];
  }
  return [
    'How do I get my child ready for school?',
    'What activities help with early reading?',
    `How much sleep does a ${age} need?`,
  ];
}

async function errorFrom(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (data?.error) return data.error;
  if (res.status === 404) return 'Answers work on the deployed site, or locally with `netlify dev`.';
  return 'Something went wrong on our side. Try again in a moment.';
}

interface Props {
  name: string;
  ageText: string;
  ageMonths: number;
}

export function AskPanel({ name, ageText, ageMonths }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setError('');
    setDraft('');

    const history: ChatMessage[] = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);
    const request = new AbortController();
    requestRef.current = request;
    let answer = '';

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-HISTORY_SENT), child: { name, ageText, ageMonths } }),
        signal: request.signal,
      });
      if (!res.ok || !res.body) throw new Error(await errorFrom(res));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        const partial = answer;
        setMessages((thread) => [...thread.slice(0, -1), { role: 'assistant', content: partial }]);
      }
      if (!answer.trim()) throw new Error('No answer came back. Try asking in a different way.');
    } catch (e) {
      if (request.signal.aborted) return;
      if (answer.trim()) {
        setError('The answer was cut off. You can ask again.');
      } else {
        // Put the question back in the box so trying again is one click, without a duplicate in the thread.
        setMessages(messages);
        setDraft(q);
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void ask(draft);
    }
  }

  return (
    <section className="ask" aria-labelledby="ask-title">
      <div className="section-head">
        <h2 id="ask-title">Ask about {name}</h2>
        {messages.length > 0 && (
          <button className="text-button" onClick={() => setMessages([])} disabled={busy}>
            Start over
          </button>
        )}
      </div>
      <p className="section-note">Answers are written for a {ageLabel(ageMonths)}.</p>

      <div className="thread" ref={threadRef} aria-live="polite">
        {messages.length === 0 ? (
          <ul className="starters">
            {starterQuestions(ageMonths).map((question) => (
              <li key={question}>
                <button onClick={() => void ask(question)} disabled={busy}>
                  {question}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          messages.map((message, i) => (
            <div key={i} className={`message from-${message.role}`}>
              {message.role === 'user' ? (
                message.content
              ) : message.content ? (
                <Markdown text={message.content} />
              ) : (
                <span className="thinking">Writing an answer…</span>
              )}
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <form className="composer" onSubmit={onSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={onKeyDown}
          placeholder="Type a question"
          rows={2}
          aria-label={`Ask a question about ${name}`}
        />
        <button className="button" type="submit" disabled={busy || !draft.trim()}>
          Ask
        </button>
      </form>
      <p className="fine-print">Answers come from an AI model and can be wrong. Check anything important.</p>
    </section>
  );
}
