import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const styles = [
  { value: "google", label: "Google Style" },
  { value: "numpy", label: "NumPy Style" },
  { value: "restructuredtext", label: "reStructuredText" },
];

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground">
        <SelectValue placeholder="Docstring Style" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {styles.map((s) => (
          <SelectItem key={s.value} value={s.value} className="text-foreground">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
