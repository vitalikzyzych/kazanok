import { Link } from "react-router-dom";

import { Button } from "primereact/button";

import { FavoriteButton } from "@/components";
import { formatMinutes, type IRecipe } from "@/domain";
import { DishCover, FluentIcon, RecipeCover, tintClass } from "@/ui";
import { countLabel, SERVINGS, TIMES } from "@/utils";

interface IRecipePostProps {
  recipe: IRecipe;
  onShop: (recipe: IRecipe) => void;
}

/** A recipe in the feed: dish avatar, title, time, text, tags, photo, actions. */
const RecipePost = ({ recipe: r, onShop }: IRecipePostProps) => {
  const cooked = r.cookCount
    ? `Готували ${countLabel(r.cookCount, TIMES)}`
    : "Ще не готували";

  return (
    <article className="post">
      <span className="ava">
        <DishCover dish={r} />
      </span>
      <div className="post-body">
        <div className="post-head">
          <h3>
            <Link to={`/recipes/${r.id}`}>{r.title}</Link>
          </h3>
          <span className="t">{formatMinutes(r.totalMin)}</span>
        </div>
        {r.description && <p className="post-text">{r.description}</p>}
        {r.tags.length > 0 && (
          <p className="post-tags">
            {r.tags.map((t) => (
              <span key={t}>
                <i className={`dot ${tintClass(t)}`} />
                {t}
              </span>
            ))}
          </p>
        )}
        {r.photoId && (
          <span className="post-media">
            <RecipeCover dish={r} photoId={r.photoId} />
          </span>
        )}
        <div className="post-actions">
          <FavoriteButton recipe={r} variant="act" />
          <Button
            unstyled
            className="act"
            onClick={() => onShop(r)}
            aria-label="До покупок"
            title="До покупок"
          >
            <FluentIcon name="Cart" size={22} />
          </Button>
          <span className="act-meta">
            {cooked}, {countLabel(r.servings, SERVINGS)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default RecipePost;
