import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

/**
 * Markdown renderer for agent-produced lesson text.
 *
 * Wraps `react-markdown`, which never renders raw HTML by default, so LLM
 * output is safe to display without sanitizing. The component overrides map
 * each element onto the app's Tailwind type scale so a rendered lesson matches
 * the surrounding operator UI.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 text-xl font-semibold tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-base font-semibold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1 text-sm font-semibold">{children}</h3>
  ),
  p: ({ children }) => <p className="my-2">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-slate-800">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-700 underline hover:text-sky-800 dark:text-sky-400"
    >
      {children}
    </a>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
