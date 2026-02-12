import { useRef, useEffect } from "react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  label: string;
}

export default function CodeEditor({ value, onChange, readOnly = false, placeholder, label }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);

  const lines = value ? value.split("\n") : [""];

  useEffect(() => {
    const ta = textareaRef.current;
    const lc = lineCountRef.current;
    if (!ta || !lc) return;
    const sync = () => {
      lc.scrollTop = ta.scrollTop;
    };
    ta.addEventListener("scroll", sync);
    return () => ta.removeEventListener("scroll", sync);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50 rounded-t-lg">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs text-muted-foreground font-mono">{lines.length} lines</span>
      </div>
      <div className="flex flex-1 min-h-0 rounded-b-lg overflow-hidden bg-code-bg border border-border border-t-0">
        <div
          ref={lineCountRef}
          className="select-none py-3 px-3 text-right text-code-comment text-xs font-mono leading-[1.625rem] overflow-hidden min-w-[3rem] bg-code-line/30"
          aria-hidden
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 resize-none bg-transparent py-3 px-4 text-sm font-mono leading-[1.625rem] text-foreground outline-none placeholder:text-muted-foreground/40 scrollbar-thin"
          style={{ tabSize: 4 }}
        />
      </div>
    </div>
  );
}
