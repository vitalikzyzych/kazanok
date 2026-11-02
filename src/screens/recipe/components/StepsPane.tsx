import { Button } from "primereact/button";
import { classNames } from "primereact/utils";

import StepTimer from "./StepTimer";

import type { IRecipe } from "@/domain";
import { useCooking } from "@/providers";
import { FluentIcon } from "@/ui";
import { countLabel, STEPS } from "@/utils";

interface IStepsPaneProps {
  recipe: IRecipe;
  onCooked: () => void;
}

/** Steps as a thread: tap the number to mark a step done. */
const StepsPane = ({ recipe, onCooked }: IStepsPaneProps) => {
  const { doneSteps, toggleStep } = useCooking();
  const done = doneSteps(recipe.id);
  const total = recipe.steps.length;

  return (
    <section>
      <div className="pane-head">
        <h2>Приготування</h2>
        <span className="count">
          {done.size
            ? `${done.size} з ${total} готово`
            : countLabel(total, STEPS)}
        </span>
      </div>
      {total === 0 && <p className="text-muted">Кроків ще немає.</p>}
      <ol className="steps">
        {recipe.steps.map((s, i) => {
          const on = done.has(i);
          return (
            <li
              key={s.id}
              id={`step-${i}`}
              className={classNames("step", { done: on })}
            >
              <Button
                unstyled
                className="step-n"
                onClick={() => toggleStep(recipe.id, i)}
                aria-pressed={on}
                aria-label={`Крок ${i + 1}, ${on ? "виконано" : "позначити виконаним"}`}
              >
                {on ? <FluentIcon name="Checkmark" size={20} /> : i + 1}
              </Button>
              <div className="min-w-0">
                <p>{s.text}</p>
                <StepTimer recipe={recipe} stepIndex={i} />
              </div>
            </li>
          );
        })}
      </ol>
      {recipe.notes && (
        <div className="notes">
          <b>Нотатки.</b> {recipe.notes}
        </div>
      )}
      {total > 0 && (
        <Button
          size="large"
          className="w-full"
          icon={<FluentIcon name="Checkmark" />}
          label="Приготовано"
          onClick={onCooked}
        />
      )}
    </section>
  );
};

export default StepsPane;
