import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

type Severity = "success" | "info" | "warn" | "error";

interface IToastAction {
  label: string;
  onClick: () => void;
}

interface IToastApi {
  /** One toast at a time: a new one replaces the one shown. */
  show: (
    severity: Severity,
    summary: string,
    detail?: string,
    action?: IToastAction
  ) => void;
}

const ToastContext = createContext<IToastApi | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toast = useRef<Toast>(null);

  const show = useCallback(
    (
      severity: Severity,
      summary: string,
      detail?: string,
      action?: IToastAction
    ) => {
      toast.current?.replace({
        severity,
        summary,
        detail,
        life: severity === "error" ? 6000 : action ? 6000 : 3200,
        content: (
          <div className="app-toast">
            <div className="app-toast__text">
              <span>{summary}</span>
              {detail && <small>{detail}</small>}
            </div>
            {action && (
              <Button
                unstyled
                className="app-toast__action"
                onClick={() => {
                  toast.current?.clear();
                  action.onClick();
                }}
              >
                {action.label}
              </Button>
            )}
          </div>
        ),
      });
    },
    []
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      <Toast ref={toast} position="bottom-center" />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): IToastApi => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
};
