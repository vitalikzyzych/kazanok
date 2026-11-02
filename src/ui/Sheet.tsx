import type { ReactNode } from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import FluentIcon from "./FluentIcon";

import { useMediaQuery, WIDE_DIALOG_QUERY } from "@/hooks";

interface ISheetProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onHide: () => void;
}

/**
 * Bottom sheet on phones, centred dialog from 720px. Mount it only while
 * open. Modal pattern from fc-tournament: no header, title in the body.
 */
const Sheet = ({ title, subtitle, children, footer, onHide }: ISheetProps) => {
  const wide = useMediaQuery(WIDE_DIALOG_QUERY);
  return (
    <Dialog
      visible
      onHide={onHide}
      showHeader={false}
      dismissableMask
      blockScroll
      position={wide ? "center" : "bottom"}
      draggable={false}
      resizable={false}
      focusOnShow={false}
      className="sheet"
      maskClassName="sheet-mask"
      contentClassName="sheet__content"
      aria-label={title}
    >
      <div className="sheet__grab" aria-hidden />
      <div className="sheet__head">
        <div className="min-w-0 flex-1">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Button
          rounded
          text
          icon={<FluentIcon name="Dismiss" />}
          onClick={onHide}
          aria-label="Закрити"
          className="btn-icon"
        />
      </div>
      <div className="sheet__body">{children}</div>
      {footer && <div className="sheet__foot">{footer}</div>}
    </Dialog>
  );
};

export default Sheet;
