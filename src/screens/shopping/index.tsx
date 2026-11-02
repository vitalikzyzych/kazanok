import { type FormEvent, useState } from "react";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { useCopyText } from "@/components";
import {
  formatGroupAmount,
  type IShoppingGroup,
  parseIngredient,
  shoppingAsText,
  shoppingItemsFrom,
  shoppingRows,
} from "@/domain";
import { useDocumentTitle } from "@/hooks";
import { useRecipeData, useToast } from "@/providers";
import {
  addShoppingItems,
  deleteShoppingItems,
  setShoppingChecked,
} from "@/source/RecipeSource";
import { CheckRow, EmptyState, FluentIcon } from "@/ui";

/**
 * One list of what to buy: tap to tick, "Прибрати куплене" clears the ticked
 * ones. The same product from several recipes is one row with the amounts
 * added up.
 */
const Shopping = () => {
  const { shopping } = useRecipeData();
  const toast = useToast();
  const { copy, dialog: copyDialog } = useCopyText();
  const [input, setInput] = useState("");
  useDocumentTitle("Покупки");

  const rows = shoppingRows(shopping);
  const toBuy = shopping.filter((i) => !i.checked).length;
  const bought = shopping.filter((i) => i.checked);

  const onError = (e: Error) =>
    toast.show("error", "Не вдалося зберегти", e.message);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const ing = parseIngredient(input);
    if (!ing) return;
    addShoppingItems(
      shoppingItemsFrom([ing], null, 1, new Date().toISOString())
    ).catch(onError);
    setInput("");
  };

  const toggle = (g: IShoppingGroup) =>
    setShoppingChecked(g.ids, !g.checked).catch(onError);

  const clearBought = () => {
    deleteShoppingItems(bought.map((i) => i.id)).catch(onError);
    toast.show("info", "Куплене прибрано", undefined, {
      label: "Повернути",
      onClick: () => void addShoppingItems(bought).catch(onError),
    });
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-row">
          <div className="grow">
            <h1 className="h-display">Покупки</h1>
          </div>
          {toBuy > 0 && (
            <Button
              rounded
              text
              icon={<FluentIcon name="Copy" />}
              onClick={() =>
                copy(shoppingAsText(shopping), "Список скопійовано")
              }
              aria-label="Скопіювати список"
              title="Скопіювати список"
              className="btn-icon"
            />
          )}
        </div>
        <form className="add-row" autoComplete="off" onSubmit={add}>
          <InputText
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напр.: 2 л молока"
            enterKeyHint="done"
            aria-label="Новий продукт"
          />
          <Button
            type="submit"
            icon={<FluentIcon name="Add" />}
            aria-label="Додати"
            disabled={!input.trim()}
          >
            <span className="hide-mob">Додати</span>
          </Button>
        </form>
      </header>

      {rows.length ? (
        <section className="flex flex-column gap-2">
          <div className="results-head">
            <span className="count">
              {toBuy ? `Купити: ${toBuy}` : "Усе куплено"}
            </span>
            {bought.length > 0 && (
              <Button
                text
                severity="secondary"
                icon={<FluentIcon name="Delete" size={20} />}
                label="Прибрати куплене"
                onClick={clearBought}
              />
            )}
          </div>
          <div className="list-card">
            {rows.map((g) => (
              <div key={g.ids.join(",")} className="shop-item">
                <CheckRow
                  checked={g.checked}
                  onToggle={() => toggle(g)}
                  name={g.name}
                  amount={formatGroupAmount(g)}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState icon="Cart" title="Список порожній">
          <span>
            Додайте продукт вище або натисніть «До покупок» на сторінці рецепта.
          </span>
        </EmptyState>
      )}
      {copyDialog}
    </div>
  );
};

export default Shopping;
