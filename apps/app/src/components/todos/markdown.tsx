import type { ReactNode } from "react";

const inlinePattern =
  /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|<https?:\/\/[^>]+>)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlinePattern)) {
    if (match.index === undefined) continue;
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const value = match[0];
    if (value.startsWith("**")) {
      nodes.push(
        <strong key={`${match.index}-bold`}>{value.slice(2, -2)}</strong>,
      );
    } else if (value.startsWith("*")) {
      nodes.push(<em key={`${match.index}-italic`}>{value.slice(1, -1)}</em>);
    } else if (value.startsWith("[")) {
      const [, label, href] =
        value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/) ?? [];
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={href}
          target="_blank"
          rel="noreferrer">
          {label}
        </a>,
      );
    } else if (value.startsWith("<")) {
      const href = value.slice(1, -1);
      nodes.push(
        <a
          key={`${match.index}-autolink`}
          href={href}
          target="_blank"
          rel="noreferrer">
          {href}
        </a>,
      );
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownText({ value }: { value: string }) {
  const lines = value.split(/\r?\n/);

  return (
    <>
      {lines.map((line, index) => {
        const key = `${index}-${line}`;
        if (line.trim() === "---") {
          return <hr key={key} className="border-border my-2" />;
        }
        if (line.startsWith("# ")) {
          return (
            <strong key={key} className="text-foreground mt-2 block">
              {renderInline(line.slice(2))}
            </strong>
          );
        }
        return (
          <span key={key} className="block">
            {renderInline(line)}
          </span>
        );
      })}
    </>
  );
}
