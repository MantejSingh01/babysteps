import type { ReactNode } from 'react';

// Renders the small subset of Markdown the model uses (paragraphs, lists, **bold**) as React elements.
// Building elements instead of setting innerHTML means a reply can never inject markup into the page.

function withBold(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  function flush() {
    if (paragraph.length) {
      blocks.push(<p key={blocks.length}>{withBold(paragraph.join(' '))}</p>);
      paragraph = [];
    }
    if (list) {
      const items = list.items.map((item, i) => <li key={i}>{withBold(item)}</li>);
      blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
      list = null;
    }
  }

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const listItem = /^(?:([-*•])|\d+[.)])\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);

    if (!line) {
      flush();
    } else if (listItem) {
      const ordered = !listItem[1];
      if (paragraph.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(listItem[2] ?? '');
    } else if (heading) {
      flush();
      blocks.push(
        <p key={blocks.length}>
          <strong>{(heading[1] ?? '').replaceAll('**', '')}</strong>
        </p>,
      );
    } else {
      if (list) flush();
      paragraph.push(line);
    }
  }
  flush();

  return <div className="answer">{blocks}</div>;
}
