import type { ReactNode } from "react";

import { Button } from "primereact/button";

import FluentIcon from "./FluentIcon";

interface ICheckRowProps {
  checked: boolean;
  onToggle: () => void;
  name: ReactNode;
  /** Small line under the name. */
  sub?: ReactNode;
  amount?: ReactNode;
  softAmount?: boolean;
}

/** A whole row that ticks on tap: shopping list and "До покупок". */
const CheckRow = ({
  checked,
  onToggle,
  name,
  sub,
  amount,
  softAmount,
}: ICheckRowProps) => (
  <Button
    unstyled
    className="ing-row check-row"
    role="checkbox"
    aria-checked={checked}
    onClick={onToggle}
  >
    <span className="box">
      <FluentIcon name="Checkmark" size={16} />
    </span>
    <span className="ing-name">
      {name}
      {sub && <small>{sub}</small>}
    </span>
    <span className={softAmount ? "ing-amt soft" : "ing-amt"}>{amount}</span>
  </Button>
);

export default CheckRow;
