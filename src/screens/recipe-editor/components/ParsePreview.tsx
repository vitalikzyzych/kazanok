import {
  formatMinutes,
  formatQty,
  type IIngredient,
  type IStep,
} from "@/domain";
import { FluentIcon } from "@/ui";
import { countLabel, INGREDIENTS, STEPS } from "@/utils";

/** How the ingredient lines were understood. */
export const IngredientsPreview = ({ list }: { list: IIngredient[] }) => (
  <div className="preview" aria-live="polite">
    {list.length ? (
      <>
        <div className="preview__head">
          <FluentIcon name="Checkmark" size={20} />
          Розпізнано {countLabel(list.length, INGREDIENTS)}
        </div>
        {list.map((i) => (
          <div key={i.id} className="preview__row">
            <span>
              {i.qty === null ? "—" : `${formatQty(i.qty, i.unit)} ${i.unit}`}
            </span>
            <span>
              {i.name}
              {i.note && <i className="text-muted"> ({i.note})</i>}
            </span>
          </div>
        ))}
      </>
    ) : (
      <span className="text-muted">Тут з’явиться, як зрозуміли список.</span>
    )}
  </div>
);

/** Steps found, and which of them got a timer. */
export const StepsPreview = ({ list }: { list: IStep[] }) => {
  const timed = list.filter((s) => s.timerMin).length;
  return (
    <div className="preview" aria-live="polite">
      {list.length ? (
        <>
          <div className="preview__head">
            <FluentIcon name="Checkmark" size={20} />
            {countLabel(list.length, STEPS)}
            {timed > 0 && `, з таймером: ${timed}`}
          </div>
          {list.map((s, i) => (
            <div key={s.id} className="preview__row">
              <span>
                {i + 1}
                {s.timerMin ? `, ${formatMinutes(s.timerMin)}` : ""}
              </span>
              <span className="preview__clamp">{s.text}</span>
            </div>
          ))}
        </>
      ) : (
        <span className="text-muted">
          Кожен рядок стане окремим кроком. Час «10 хвилин» у тексті стане
          таймером.
        </span>
      )}
    </div>
  );
};
