import { Button } from "primereact/button";
import { Chips } from "primereact/chips";

import { cleanTags, isNewTag } from "@/domain";
import { FluentIcon } from "@/ui";

interface ITagsFieldProps {
  value: string[];
  known: string[];
  onChange: (tags: string[]) => void;
}

/**
 * Typed tags (Enter or comma) plus one-tap suggestions from other recipes.
 * A typed or pasted tag that already exists takes its spelling; a tag no
 * recipe uses yet is marked "нова", so a stray one from ChatGPT stands out.
 */
const TagsField = ({ value, known, onChange }: ITagsFieldProps) => {
  const suggestions = known.filter((t) => !value.includes(t));

  return (
    <div className="flex flex-column gap-2">
      <Chips
        value={value}
        onChange={(e) => onChange(cleanTags(e.value ?? [], known))}
        itemTemplate={(tag: string) =>
          isNewTag(tag, known) ? (
            <>
              {tag}
              <span className="tag-new">нова</span>
            </>
          ) : (
            tag
          )
        }
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
            <Button
              key={t}
              unstyled
              className="chip"
              onClick={() => onChange(cleanTags([...value, t], known))}
            >
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
