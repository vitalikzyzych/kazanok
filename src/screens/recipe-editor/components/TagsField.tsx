import { Button } from "primereact/button";
import { Chips } from "primereact/chips";

import { capitalize, LIMITS } from "@/domain";
import { FluentIcon } from "@/ui";

interface ITagsFieldProps {
  value: string[];
  known: string[];
  onChange: (tags: string[]) => void;
}

/** Typed tags (Enter or comma) plus one-tap suggestions from other recipes. */
const TagsField = ({ value, known, onChange }: ITagsFieldProps) => {
  const add = (tag: string) => {
    const t = capitalize(tag).slice(0, LIMITS.tag);
    if (t && !value.includes(t) && value.length < LIMITS.tags)
      onChange([...value, t]);
  };
  const suggestions = known.filter((t) => !value.includes(t));

  return (
    <div className="flex flex-column gap-2">
      <Chips
        value={value}
        onChange={(e) => {
          const next: string[] = [];
          for (const raw of e.value ?? []) {
            const t = capitalize(raw).slice(0, LIMITS.tag);
            if (t && !next.includes(t)) next.push(t);
          }
          onChange(next.slice(0, LIMITS.tags));
        }}
        separator=","
        allowDuplicate={false}
        addOnBlur
        placeholder={value.length ? "" : "Новий тег"}
        aria-label="Теги"
        className="tags-input"
      />
      {suggestions.length > 0 && (
        <div className="suggest">
          {suggestions.map((t) => (
            <Button key={t} unstyled className="chip" onClick={() => add(t)}>
              <FluentIcon name="Add" size={18} />
              {t}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsField;
