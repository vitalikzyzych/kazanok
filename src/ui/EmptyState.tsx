import type { ReactNode } from "react";

import FluentIcon, { type IconName } from "./FluentIcon";

interface IEmptyStateProps {
  icon?: IconName;
  title: string;
  children?: ReactNode;
}

const EmptyState = ({ icon = "Bowl", title, children }: IEmptyStateProps) => (
  <div className="empty">
    <FluentIcon name={icon} size={44} />
    <b>{title}</b>
    {children}
  </div>
);

export default EmptyState;
