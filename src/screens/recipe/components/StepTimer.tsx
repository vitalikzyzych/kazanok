import { Button } from "primereact/button";

import { formatCountdown, formatMinutes, type IRecipe } from "@/domain";
import { timerLeftMs, useCooking } from "@/providers";
import { FluentIcon } from "@/ui";

interface IStepTimerProps {
  recipe: IRecipe;
  stepIndex: number;
}

/** "Таймер 10 хв" under a step; running: countdown, pause, +1 хв, reset. */
const StepTimer = ({ recipe, stepIndex }: IStepTimerProps) => {
  const { timerFor, now, startTimer, toggleTimer, addMinute, stopTimer } =
    useCooking();
  const minutes = recipe.steps[stepIndex].timerMin;
  if (!minutes) return null;
  const t = timerFor(recipe.id, stepIndex);

  if (!t)
    return (
      <Button
        unstyled
        className="timer-chip"
        onClick={() => startTimer(recipe, stepIndex)}
      >
        <FluentIcon name="Timer" size={20} />
        Таймер {formatMinutes(minutes)}
      </Button>
    );

  if (t.done)
    return (
      <span className="timer-row">
        <Button
          unstyled
          className="timer-chip done"
          onClick={() => stopTimer(t.id)}
        >
          <FluentIcon name="Checkmark" size={20} />
          Час вийшов, вимкнути
        </Button>
      </span>
    );

  return (
    <span className="timer-row">
      <Button
        unstyled
        className="timer-chip run"
        onClick={() => toggleTimer(t.id)}
        aria-label={t.running ? "Пауза" : "Продовжити"}
      >
        <FluentIcon name={t.running ? "Pause" : "Play"} size={20} />
        <span>{formatCountdown(timerLeftMs(t, now))}</span>
      </Button>
      <Button unstyled className="timer-chip" onClick={() => addMinute(t.id)}>
        +1 хв
      </Button>
      <Button
        unstyled
        className="timer-chip ghost"
        onClick={() => stopTimer(t.id)}
        aria-label="Скинути таймер"
      >
        <FluentIcon name="Dismiss" size={20} />
      </Button>
    </span>
  );
};

export default StepTimer;
