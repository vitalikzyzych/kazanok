import { useEffect } from "react";

/** "Борщ · Казанок"; the home screen is just "Казанок". */
export const useDocumentTitle = (title: string | null) => {
  useEffect(() => {
    document.title = title ? `${title} · Казанок` : "Казанок";
  }, [title]);
};
