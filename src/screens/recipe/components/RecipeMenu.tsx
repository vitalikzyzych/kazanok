import { Button } from "primereact/button";

import { FluentIcon, type IconName, Sheet } from "@/ui";

interface IRecipeMenuProps {
  title: string;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onHide: () => void;
}

const RecipeMenu = ({
  title,
  onEdit,
  onCopy,
  onDelete,
  onHide,
}: IRecipeMenuProps) => {
  const item = (
    icon: IconName,
    label: string,
    action: () => void,
    danger = false
  ) => (
    <Button
      unstyled
      className={danger ? "danger" : undefined}
      onClick={() => {
        onHide();
        action();
      }}
    >
      <FluentIcon name={icon} />
      {label}
    </Button>
  );

  return (
    <Sheet title={title} onHide={onHide}>
      <div className="menu-list">
        {item("Edit", "Редагувати", onEdit)}
        {item("Copy", "Скопіювати як текст", onCopy)}
        {item("Delete", "Видалити рецепт", onDelete, true)}
      </div>
    </Sheet>
  );
};

export default RecipeMenu;
