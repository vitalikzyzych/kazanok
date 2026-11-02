import FlowerCover from "./FlowerCover";

import { usePhoto } from "@/hooks";

interface IRecipeCoverProps {
  /** Recipe id (or title of a new recipe): picks the flower colour. */
  seed: string;
  photoId: string | null;
  /** A photo not saved yet (editor preview). */
  photoUrl?: string | null;
}

/** The recipe's photo, or its flower cover while there is none. */
const RecipeCover = ({ seed, photoId, photoUrl }: IRecipeCoverProps) => {
  const stored = usePhoto(photoUrl === undefined ? photoId : null);
  const url = photoUrl === undefined ? stored : photoUrl;
  return url ? (
    <img className="cover-img" src={url} alt="" />
  ) : (
    <FlowerCover seed={seed} />
  );
};

export default RecipeCover;
