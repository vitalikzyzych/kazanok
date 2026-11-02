import { Button } from "primereact/button";
import { classNames } from "primereact/utils";

import type { IRecipe } from "@/domain";
import { useToast } from "@/providers";
import { setFavorite } from "@/source/RecipeSource";
import { FluentIcon } from "@/ui";

interface IFavoriteButtonProps {
  recipe: IRecipe;
  /** "act": the small action under a list post; "bar": over the recipe photo. */
  variant: "act" | "bar";
}

const FavoriteButton = ({ recipe, variant }: IFavoriteButtonProps) => {
  const toast = useToast();
  const on = recipe.favorite;
  const toggle = () =>
    setFavorite(recipe.id, !on).catch((e: Error) =>
      toast.show("error", "Не вдалося зберегти", e.message)
    );

  return (
    <Button
      unstyled
      className={classNames(variant === "act" ? "act" : "bar-btn", { on })}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Прибрати з улюблених" : "Додати в улюблені"}
    >
      <FluentIcon
        name={on ? "HeartFilled" : "Heart"}
        size={variant === "act" ? 22 : 24}
      />
    </Button>
  );
};

export default FavoriteButton;
