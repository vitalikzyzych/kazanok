import { type ReactNode, useCallback, useState } from "react";

import { useToast } from "@/providers";
import { CopyTextDialog } from "@/ui";

/** Copies to the clipboard, or opens the text to copy by hand when refused. */
export const useCopyText = (): {
  copy: (text: string, doneMessage: string) => void;
  dialog: ReactNode;
} => {
  const toast = useToast();
  const [fallback, setFallback] = useState<string | null>(null);

  const copy = useCallback(
    (text: string, doneMessage: string) => {
      if (!navigator.clipboard) {
        setFallback(text);
        return;
      }
      navigator.clipboard.writeText(text).then(
        () => toast.show("success", doneMessage),
        () => setFallback(text)
      );
    },
    [toast]
  );

  return {
    copy,
    dialog:
      fallback === null ? null : (
        <CopyTextDialog text={fallback} onHide={() => setFallback(null)} />
      ),
  };
};
