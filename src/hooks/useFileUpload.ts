import { useCallback, useRef } from "react";

interface UseFileUploadOptions {
  onFileContent: (content: string, filename: string) => void;
  onError: (message: string) => void;
}

export function useFileUpload({ onFileContent, onError }: UseFileUploadOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = useCallback(() => {
    if (!inputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".py,.pyw,.pyi";
      input.style.display = "none";
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".py") && !file.name.endsWith(".pyw") && !file.name.endsWith(".pyi")) {
          onError("Please upload a Python file (.py)");
          return;
        }

        if (file.size > 1024 * 1024) {
          onError("File too large. Max 1MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          onFileContent(reader.result as string, file.name);
        };
        reader.onerror = () => onError("Failed to read file");
        reader.readAsText(file);
        input.value = "";
      });
      document.body.appendChild(input);
      inputRef.current = input;
    }
    inputRef.current.click();
  }, [onFileContent, onError]);

  return { openFilePicker };
}
