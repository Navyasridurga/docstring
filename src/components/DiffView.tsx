import { useMemo } from "react";
import { diffLines, Change } from "diff";

interface DiffViewProps {
  original: string;
  modified: string;
}

export default function DiffView({ original, modified }: DiffViewProps) {
  const changes = useMemo(() => diffLines(original, modified), [original, modified]);

  let lineNum = 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50 rounded-t-lg">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Diff — Changes Highlighted
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-[hsl(160_70%_50%/0.15)] border border-[hsl(160_70%_50%/0.3)]" />
            Added
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-[hsl(0_72%_55%/0.15)] border border-[hsl(0_72%_55%/0.3)]" />
            Removed
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0 rounded-b-lg overflow-auto bg-code-bg border border-border border-t-0 scrollbar-thin">
        <div className="py-3 font-mono text-sm leading-[1.625rem]">
          {changes.map((change: Change, i: number) => {
            const lines = change.value.replace(/\n$/, "").split("\n");
            return lines.map((line, j) => {
              if (!change.removed) lineNum++;
              const num = change.removed ? "" : lineNum;

              let bgClass = "";
              let textClass = "text-foreground";
              let gutterText = "text-code-comment";

              if (change.added) {
                bgClass = "bg-[hsl(160_70%_50%/0.08)]";
                textClass = "text-[hsl(160_70%_60%)]";
                gutterText = "text-[hsl(160_70%_40%)]";
              } else if (change.removed) {
                bgClass = "bg-[hsl(0_72%_55%/0.08)]";
                textClass = "text-[hsl(0_72%_65%)]";
                gutterText = "text-[hsl(0_72%_45%)]";
              }

              return (
                <div key={`${i}-${j}`} className={`flex ${bgClass}`}>
                  <span
                    className={`select-none px-3 text-right text-xs ${gutterText} min-w-[3rem] shrink-0`}
                  >
                    {change.added ? "+" : change.removed ? "−" : " "}
                  </span>
                  <span
                    className={`select-none px-1 text-right text-xs text-code-comment min-w-[2.5rem] shrink-0`}
                  >
                    {num}
                  </span>
                  <span className={`px-4 ${textClass} whitespace-pre`}>
                    {line || " "}
                  </span>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
