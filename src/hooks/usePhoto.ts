import { useEffect, useState } from "react";

import { getPhoto } from "@/source/RecipeSource";

/** Photos loaded in this session; Firestore's cache keeps them after a reload. */
const cache = new Map<string, string | null>();

export const rememberPhoto = (photoId: string, dataUrl: string | null) =>
  cache.set(photoId, dataUrl);

/** A recipe photo, loaded only when something shows it. */
export const usePhoto = (photoId: string | null): string | null => {
  const [loaded, setLoaded] = useState<{ id: string; url: string | null }>();

  useEffect(() => {
    if (!photoId || cache.has(photoId)) return;
    let live = true;
    getPhoto(photoId)
      .then((url) => {
        cache.set(photoId, url);
        if (live) setLoaded({ id: photoId, url });
      })
      .catch(() => cache.set(photoId, null));
    return () => {
      live = false;
    };
  }, [photoId]);

  if (!photoId) return null;
  if (cache.has(photoId)) return cache.get(photoId) ?? null;
  return loaded?.id === photoId ? loaded.url : null;
};
