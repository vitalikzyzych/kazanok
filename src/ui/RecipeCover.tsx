import DishCover, { type DishInfo } from "./DishCover";

import { usePhoto } from "@/hooks";

interface IRecipeCoverProps {
  dish: DishInfo;
  photoId: string | null;
  /** A photo not saved yet (editor preview); null shows the cover. */
  photoUrl?: string | null;
}

/** The recipe's photo, or its dish cover while there is none. */
const RecipeCover = ({ dish, photoId, photoUrl }: IRecipeCoverProps) => {
  const stored = usePhoto(photoUrl === undefined ? photoId : null);
  const url = photoUrl === undefined ? stored : photoUrl;
  return url ? (
    <img className="cover-img" src={url} alt="" />
  ) : (
    <DishCover dish={dish} />
  );
};

export default RecipeCover;
