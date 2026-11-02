import { Link, useMatch } from "react-router-dom";

import { Button } from "primereact/button";

import { formatCountdown } from "@/domain";
import { timerLeftMs, useCooking } from "@/providers";
import { FluentIcon } from "@/ui";

/**
 * Running timers of recipes that are not on screen. The open recipe shows its
 * timers next to the steps instead.
 */
const TimerDock = () => {
  const { timers, now, toggleTimer, stopTimer } = useCooking();
  const openRecipe = useMatch("/recipes/:id")?.params.id;
  const list = timers.filter((t) => t.recipeId !== openRecipe);
  if (!list.length) return null;

  return (
    <div className="dock" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={t.done ? "dock-item done" : "dock-item"}>
          <Link
            to={`/recipes/${t.recipeId}`}
            state={{ step: t.stepIndex }}
            className="dock-item__link"
          >
            <FluentIcon name="Timer" size={20} />
            <span>{t.label}</span>
            <b>{t.done ? "Час!" : formatCountdown(timerLeftMs(t, now))}</b>
          </Link>
          {!t.done && (
            <Button
              unstyled
              onClick={() => toggleTimer(t.id)}
              aria-label={t.running ? "Пауза" : "Продовжити"}
            >
              <FluentIcon name={t.running ? "Pause" : "Play"} size={20} />
            </Button>
          )}
          <Button
            unstyled
            onClick={() => stopTimer(t.id)}
            aria-label="Прибрати таймер"
          >
            <FluentIcon name="Dismiss" size={20} />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TimerDock;
