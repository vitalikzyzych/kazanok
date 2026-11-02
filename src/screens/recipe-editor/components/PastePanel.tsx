import { useState } from "react";

import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

import { useCopyText } from "@/components";
import { CHATGPT_PROMPT, RECIPE_FORMAT_EXAMPLE } from "@/domain";
import { FluentIcon } from "@/ui";

interface IPastePanelProps {
  /** Fill the form from the text; auto: right after a paste into an empty form. */
  onParse: (text: string, auto: boolean) => void;
  formEmpty: boolean;
}

/**
 * The fastest way to add a recipe: paste its text. For a photo of a cookbook
 * page, "Запит для ChatGPT" copies a request that makes ChatGPT answer in
 * exactly the format the parser reads.
 */
const PastePanel = ({ onParse, formEmpty }: IPastePanelProps) => {
  const [text, setText] = useState("");
  const { copy, dialog } = useCopyText();

  return (
    <section className="paste-card">
      <div>
        <h2 className="h2">Найшвидше: вставте текст</h2>
        <p className="h-sub">
          Скопіюйте рецепт із сайту, нотаток чи повідомлення, і застосунок
          розкладе його на назву, інгредієнти й кроки. Рецепт на фото? Скопіюйте
          запит для ChatGPT, надішліть його разом із фото, а відповідь вставте
          сюди.
        </p>
      </div>
      <InputTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (formEmpty && pasted.trim())
            // After the browser has put the text into the field.
            setTimeout(() => onParse(pasted, true), 0);
        }}
        rows={5}
        aria-label="Текст рецепта"
        placeholder={RECIPE_FORMAT_EXAMPLE}
        className="w-full"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          icon={<FluentIcon name="ClipboardPaste" size={20} />}
          label="Розібрати текст"
          onClick={() => onParse(text, false)}
        />
        <Button
          outlined
          severity="secondary"
          icon={<FluentIcon name="Copy" size={20} />}
          label="Запит для ChatGPT"
          onClick={() => copy(CHATGPT_PROMPT, "Запит скопійовано")}
        />
        <Button
          text
          severity="secondary"
          label="Вставити приклад"
          onClick={() => {
            setText(RECIPE_FORMAT_EXAMPLE);
            onParse(RECIPE_FORMAT_EXAMPLE, false);
          }}
        />
      </div>
      {dialog}
    </section>
  );
};

export default PastePanel;
