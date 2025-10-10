import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface DifficultyTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export const DifficultyTags = ({ tags, onChange }: DifficultyTagsProps) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const moveTag = (fromIndex: number, toIndex: number) => {
    const newTags = [...tags];
    const [movedTag] = newTags.splice(fromIndex, 1);
    newTags.splice(toIndex, 0, movedTag);
    onChange(newTags);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Digite uma dificuldade e pressione Enter"
          className="rounded-xl font-light"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addTag}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-2 text-sm font-light flex items-center gap-2 cursor-move"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", index.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
              moveTag(fromIndex, index);
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-xs text-muted-foreground font-light italic">
          Nenhuma dificuldade adicionada. Digite acima para adicionar.
        </p>
      )}
    </div>
  );
};
