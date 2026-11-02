import { formatAmount, type IRecipe } from "@/domain";
import { useCooking } from "@/providers";
import { ServingsStepper } from "@/ui";

/** Ingredients scaled to the servings chosen on this device. */
const IngredientsPane = ({ recipe }: { recipe: IRecipe }) => {
  const { servingsFor, setServings } = useCooking();
  const servings = servingsFor(recipe);
  const factor = servings / recipe.servings;

  return (
    <section>
      <div className="pane-head">
        <h2>Інгредієнти</h2>
        <ServingsStepper
          value={servings}
          onChange={(n) => setServings(recipe.id, n)}
        />
      </div>
      {recipe.ingredients.length ? (
        <ul className="ing-list">
          {recipe.ingredients.map((i) => (
            <li key={i.id} className="ing-row ing-row--plain">
              <span className="ing-name">
                {i.name}
                {i.qty !== null && i.note && <small>{i.note}</small>}
              </span>
              <span className={i.qty === null ? "ing-amt soft" : "ing-amt"}>
                {formatAmount(i, factor)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">Інгредієнтів ще немає.</p>
      )}
    </section>
  );
};

export default IngredientsPane;
