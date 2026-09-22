import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  className = '',
}) => {
  return (
    <div
      className={`prose-eating-helper text-xs leading-relaxed text-neutral-300 font-sans break-words ${className}`}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm font-bold text-neutral-100 mt-2.5 mb-1.5 flex items-center gap-1.5 border-b border-neutral-800 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-emerald-400 mt-2.5 mb-1 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-neutral-200 mt-2 mb-1 flex items-center gap-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[11px] font-semibold text-neutral-300 mt-1.5 mb-0.5 uppercase tracking-wider">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-neutral-300">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-neutral-200">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 mb-2 text-neutral-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 mb-2 text-neutral-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500/60 pl-3 py-1 my-2 bg-emerald-950/20 rounded-r-lg text-neutral-300 italic text-xs">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = codeClass && codeClass.includes('language-');
            if (isBlock) {
              return (
                <code className="block bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto my-2">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-neutral-800/80 text-emerald-300 px-1 py-0.5 rounded text-[11px] font-mono">
                {children}
              </code>
            );
          },
          hr: () => <hr className="border-neutral-800 my-2.5" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="w-full text-[11px] border border-neutral-800 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-neutral-900 border-b border-neutral-800 px-2 py-1 text-left font-semibold text-neutral-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-neutral-800/60 px-2 py-1 text-neutral-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
