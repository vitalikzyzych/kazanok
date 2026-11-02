import { type ChangeEvent, useState } from "react";

import { Button } from "primereact/button";

import type { DraftPhoto } from "../draft";

import { LIMITS } from "@/domain";
import { useToast } from "@/providers";
import { FluentIcon, RecipeCover } from "@/ui";
import { resizePhoto } from "@/utils";

interface IPhotoPickerProps {
  seed: string;
  storedPhotoId: string | null;
  photo: DraftPhoto;
  onChange: (photo: DraftPhoto) => void;
}

/** The browser shrinks the photo before it is stored (utils/image.ts). */
const PhotoPicker = ({
  seed,
  storedPhotoId,
  photo,
  onChange,
}: IPhotoPickerProps) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const hasPhoto =
    photo.kind === "new" || (photo.kind === "keep" && storedPhotoId);

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    resizePhoto(file)
      .then((dataUrl) => {
        if (dataUrl.length > LIMITS.photo)
          throw new Error("Фото завелике навіть після стиснення");
        onChange({ kind: "new", dataUrl });
      })
      .catch((err: Error) =>
        toast.show(
          "error",
          "Не вдалося додати фото",
          `${err.message}. Спробуйте JPG або PNG.`
        )
      )
      .finally(() => setBusy(false));
  };

  return (
    <div className="photo-pick">
      <div className="media">
        <RecipeCover
          seed={seed}
          photoId={photo.kind === "keep" ? storedPhotoId : null}
          photoUrl={
            photo.kind === "new"
              ? photo.dataUrl
              : photo.kind === "none"
                ? null
                : undefined
          }
        />
      </div>
      <div className="flex flex-wrap align-items-center gap-2">
        <label
          className={`p-button p-button-outlined p-button-secondary file-btn${busy ? " p-disabled" : ""}`}
        >
          <FluentIcon name="Image" size={20} />
          {busy ? "Обробляємо…" : hasPhoto ? "Змінити фото" : "Додати фото"}
          <input type="file" accept="image/*" onChange={pick} disabled={busy} />
        </label>
        {hasPhoto ? (
          <Button
            text
            severity="secondary"
            label="Прибрати"
            onClick={() => onChange({ kind: "none" })}
          />
        ) : (
          <small className="text-muted">
            Без фото рецепт отримає кольорову обкладинку.
          </small>
        )}
      </div>
    </div>
  );
};

export default PhotoPicker;
