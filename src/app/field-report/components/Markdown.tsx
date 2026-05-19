import { Fragment, type ReactNode } from "react";

/** Render inline `**bold**` and `` `code` `` within a line of text. */
function renderInline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-slate-800"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <Fragment key={index}>{part}</Fragment>;
    });
}

interface ListBlock {
  ordered: boolean;
  items: string[];
}

/**
 * A small, dependency-free Markdown renderer for agent-produced lesson text.
 *
 * It handles the structure the `write` node emits — headings, bullet and
 * numbered lists, paragraphs, bold, and inline code — and never renders raw
 * HTML, so LLM output is safe to display. A focused renderer keeps the
 * dependency count at zero (and avoids `react-markdown`, which the local npm
 * registry mirror could not serve from behind a TLS-intercepting proxy).
 */
export function Markdown({ children }: { children: string }) {
  const lines = children.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: ListBlock | null = null;
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push(
        <p key={key++} className="my-2">
          {renderInline(paragraph.join(" "))}
        </p>,
      );
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      const items = list.items.map((item, index) => (
        <li key={index}>{renderInline(item)}</li>
      ));
      blocks.push(
        list.ordered ? (
          <ol key={key++} className="my-2 list-decimal space-y-1 pl-5">
            {items}
          </ol>
        ) : (
          <ul key={key++} className="my-2 list-disc space-y-1 pl-5">
            {items}
          </ul>
        ),
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);

    if (line === "") {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const content = renderInline(heading[2]);
      if (heading[1].length === 1) {
        blocks.push(
          <h1
            key={key++}
            className="mt-5 mb-2 text-xl font-semibold tracking-tight"
          >
            {content}
          </h1>,
        );
      } else if (heading[1].length === 2) {
        blocks.push(
          <h2 key={key++} className="mt-5 mb-2 text-base font-semibold">
            {content}
          </h2>,
        );
      } else {
        blocks.push(
          <h3 key={key++} className="mt-4 mb-1 text-sm font-semibold">
            {content}
          </h3>,
        );
      }
    } else if (bullet || numbered) {
      flushParagraph();
      const ordered = numbered !== null;
      const item = bullet ? bullet[1] : numbered ? numbered[1] : "";
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [item] };
      } else {
        list.items.push(item);
      }
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  return (
    <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {blocks}
    </div>
  );
}
