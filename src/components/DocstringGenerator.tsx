import { useState, useCallback } from "react";
import { Upload, Wand2, Copy, Download, RotateCcw, GitCompare, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CodeEditor from "@/components/CodeEditor";
import DiffView from "@/components/DiffView";
import StyleSelector from "@/components/StyleSelector";
import FeatureBar from "@/components/FeatureBar";
import { useFileUpload } from "@/hooks/useFileUpload";
import { streamDocstrings } from "@/lib/streamDocstrings";

const SAMPLE_CODE = `def add_numbers(a, b):
    return a + b

def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count

class Calculator:
    def __init__(self):
        self.history = []

    def multiply(self, x, y):
        result = x * y
        self.history.append(result)
        return result

    def get_history(self):
        return self.history`;

export default function DocstringGenerator() {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [style, setStyle] = useState("google");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const { openFilePicker } = useFileUpload({
    onFileContent: (content, name) => {
      setInputCode(content);
      setFileName(name);
      setOutputCode("");
      toast.success(`Loaded ${name}`);
    },
    onError: (msg) => toast.error(msg),
  });

  const handleGenerate = useCallback(async () => {
    const code = inputCode.trim();
    if (!code) {
      toast.error("Please paste or upload Python code first");
      return;
    }

    setIsGenerating(true);
    setOutputCode("");

    let accumulated = "";

    await streamDocstrings({
      code,
      style,
      onDelta: (text) => {
        accumulated += text;
        // Strip markdown code fences if the model wraps output
        let clean = accumulated;
        if (clean.startsWith("```python\n")) {
          clean = clean.slice(10);
        } else if (clean.startsWith("```\n")) {
          clean = clean.slice(4);
        }
        if (clean.endsWith("\n```")) {
          clean = clean.slice(0, -4);
        } else if (clean.endsWith("```")) {
          clean = clean.slice(0, -3);
        }
        setOutputCode(clean);
      },
      onDone: () => {
        setIsGenerating(false);
        toast.success("Docstrings generated!");
      },
      onError: (err) => {
        setIsGenerating(false);
        toast.error(err);
      },
    });
  }, [inputCode, style]);

  const handleCopy = useCallback(() => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    toast.success("Copied to clipboard");
  }, [outputCode]);

  const handleDownload = useCallback(() => {
    if (!outputCode) return;
    const blob = new Blob([outputCode], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? `documented_${fileName}` : "documented_code.py";
    a.click();
    URL.revokeObjectURL(url);
  }, [outputCode, fileName]);

  const handleReset = useCallback(() => {
    setInputCode("");
    setOutputCode("");
    setFileName(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    setInputCode(SAMPLE_CODE);
    setOutputCode("");
    setFileName(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 glow-primary flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Py<span className="text-gradient">DocGen</span>
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Docstring Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StyleSelector value={style} onChange={setStyle} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
        <FeatureBar />

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={openFilePicker}
            variant="outline"
            size="sm"
            className="gap-2 border-border text-foreground hover:bg-secondary"
          >
            <Upload className="h-4 w-4" /> Upload .py
          </Button>
          <Button
            onClick={handleLoadSample}
            variant="outline"
            size="sm"
            className="gap-2 border-border text-foreground hover:bg-secondary"
          >
            Load Sample
          </Button>
          <div className="flex-1" />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !inputCode.trim()}
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold px-6"
          >
            <Wand2 className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Docstrings"}
          </Button>
        </div>

        {/* Code panels */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
          <CodeEditor
            label="Input — Python Code"
            value={inputCode}
            onChange={setInputCode}
            placeholder="Paste your Python code here or upload a .py file..."
          />
          <div className="flex flex-col flex-1 min-h-0">
            {showDiff && outputCode && inputCode ? (
              <DiffView original={inputCode} modified={outputCode} />
            ) : (
              <CodeEditor
                label="Output — With Docstrings"
                value={outputCode}
                readOnly
                placeholder="Generated docstrings will appear here..."
              />
            )}
            {outputCode && (
              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  onClick={() => setShowDiff((d) => !d)}
                  variant={showDiff ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${showDiff ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-secondary"}`}
                >
                  {showDiff ? <Code className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
                  {showDiff ? "Output" : "Diff"}
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border text-foreground hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border text-foreground hover:bg-secondary"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border text-foreground hover:bg-secondary"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        Supports Google, NumPy & reStructuredText docstring styles
      </footer>
    </div>
  );
}
