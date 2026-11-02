import { Button } from "primereact/button";

import { flowerClass, FluentIcon } from "@/ui";

const TIME_LIMITS = [20, 45];

interface IFilterChipsProps {
  tags: string[];
  selectedTags: string[];
  maxMin: number;
  onToggleTag: (tag: string) => void;
  onTime: (maxMin: number) => void;
}

/** Cooking time and tag filters: one row that scrolls on phones, wraps on desktop. */
const FilterChips = ({
  tags,
  selectedTags,
  maxMin,
  onToggleTag,
  onTime,
}: IFilterChipsProps) => (
  <div className="chips" role="group" aria-label="Фільтри">
    {TIME_LIMITS.map((m, i) => (
      <Button
        key={m}
        unstyled
        className="chip"
        aria-pressed={maxMin === m}
        onClick={() => onTime(maxMin === m ? 0 : m)}
      >
        {i === 0 && <FluentIcon name="Clock" size={18} />}
        До {m} хв
      </Button>
    ))}
    <span className="chip-sep" aria-hidden />
    {tags.map((t) => (
      <Button
        key={t}
        unstyled
        className="chip"
        aria-pressed={selectedTags.includes(t)}
        onClick={() => onToggleTag(t)}
      >
        <i className={`dot ${flowerClass(t)}`} />
        {t}
      </Button>
    ))}
  </div>
);

export default FilterChips;
