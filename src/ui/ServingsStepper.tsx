import { Button } from "primereact/button";

import FluentIcon from "./FluentIcon";

import { LIMITS } from "@/domain";
import { countLabel, SERVINGS } from "@/utils";

interface IServingsStepperProps {
  value: number;
  onChange: (value: number) => void;
}

const ServingsStepper = ({ value, onChange }: IServingsStepperProps) => (
  <div className="stepper" role="group" aria-label="Кількість порцій">
    <Button
      unstyled
      onClick={() => onChange(Math.max(1, value - 1))}
      disabled={value <= 1}
      aria-label="Менше порцій"
    >
      <FluentIcon name="Subtract" size={20} />
    </Button>
    <output aria-live="polite">{countLabel(value, SERVINGS)}</output>
    <Button
      unstyled
      onClick={() => onChange(Math.min(LIMITS.servings, value + 1))}
      disabled={value >= LIMITS.servings}
      aria-label="Більше порцій"
    >
      <FluentIcon name="Add" size={20} />
    </Button>
  </div>
);

export default ServingsStepper;
