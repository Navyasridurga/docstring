import { FileCode2, Zap, Braces } from "lucide-react";

const features = [
  {
    icon: FileCode2,
    title: "Paste or Upload",
    description: "Paste Python code or upload .py files directly",
  },
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Generates accurate docstrings in seconds",
  },
  {
    icon: Braces,
    title: "3 Styles",
    description: "Google, NumPy, and reStructuredText formats",
  },
];

export default function FeatureBar() {
  return (
    <div className="flex flex-wrap justify-center gap-6 mb-8">
      {features.map((f) => (
        <div
          key={f.title}
          className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 animate-slide-up"
        >
          <f.icon className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
