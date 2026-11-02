import { useEffect, useRef } from "react";

import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

import Sheet from "./Sheet";

interface ICopyTextDialogProps {
  text: string;
  onHide: () => void;
}

/** When the browser refuses the clipboard: the text, selected, to copy by hand. */
const CopyTextDialog = ({ text, onHide }: ICopyTextDialogProps) => {
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    area.current?.focus();
    area.current?.select();
  }, []);

  return (
    <Sheet
      title="Скопіюйте текст"
      subtitle="Текст виділено: натисніть «Копіювати» в меню телефона."
      onHide={onHide}
      footer={<Button label="Готово" onClick={onHide} />}
    >
      <InputTextarea
        ref={area}
        value={text}
        readOnly
        rows={10}
        className="w-full"
      />
    </Sheet>
  );
};

export default CopyTextDialog;
