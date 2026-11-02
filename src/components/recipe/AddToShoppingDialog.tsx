import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "primereact/button";

import {
  defaultShoppingSelection,
  formatAmount,
  type IRecipe,
  isInShoppingList,
  isStaple,
  shoppingItemsFrom,
} from "@/domain";
import { useCooking, useRecipeData, useToast } from "@/providers";
import { addShoppingItems } from "@/source/RecipeSource";
import { CheckRow, Sheet } from "@/ui";
import { countLabel, SERVINGS } from "@/utils";

interface IAddToShoppingDialogProps {
  recipe: IRecipe;
  onHide: () => void;
}

/**
 * "До покупок": the recipe's ingredients for the servings chosen, with
 * staples, garnish and what is already on the list left unticked.
 */
const AddToShoppingDialog = ({ recipe, onHide }: IAddToShoppingDialogProps) => {
  const { shopping } = useRecipeData();
  const { servingsFor } = useCooking();
  const toast = useToast();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() =>
    defaultShoppingSelection(recipe, shopping)
  );

  const servings = servingsFor(recipe);
  const factor = servings / recipe.servings;

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  const add = () => {
    const chosen = recipe.ingredients.filter((i) => selected.includes(i.id));
    const items = shoppingItemsFrom(
      chosen,
      recipe,
      factor,
      new Date().toISOString()
    );
    addShoppingItems(items).catch((e: Error) =>
      toast.show("error", "Не вдалося додати", e.message)
    );
    toast.show("success", `Додано до покупок: ${items.length}`, undefined, {
      label: "Відкрити",
      onClick: () => navigate("/shopping"),
    });
    onHide();
  };

  return (
    <Sheet
      title="До списку покупок"
      subtitle={`${recipe.title}, ${countLabel(servings, SERVINGS)}`}
      onHide={onHide}
      footer={
        <>
          <Button
            label="Скасувати"
            outlined
            severity="secondary"
            onClick={onHide}
          />
          <Button
            label={`Додати: ${selected.length}`}
            disabled={!selected.length}
            onClick={add}
          />
        </>
      }
    >
      <ul className="ing-list">
        {recipe.ingredients.map((i) => {
          const hint = isStaple(i.name) ? (
            <span className="tag">завжди є</span>
          ) : isInShoppingList(i, shopping) ? (
            <span className="tag tag-warn">вже в списку</span>
          ) : null;
          return (
            <li key={i.id}>
              <CheckRow
                checked={selected.includes(i.id)}
                onToggle={() => toggle(i.id)}
                name={i.name}
                sub={hint}
                amount={formatAmount(i, factor)}
                softAmount={i.qty === null}
              />
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
};

export default AddToShoppingDialog;
