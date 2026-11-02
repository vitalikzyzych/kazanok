import { describe, expect, it } from "vitest";

import doc from "../../docs/chatgpt-recipe-prompt.md?raw";

import {
  CHATGPT_PROMPT_TEMPLATE,
  chatgptPrompt,
  TAGS_PLACEHOLDER,
} from "./chatgptPrompt";

describe("docs/chatgpt-recipe-prompt.md", () => {
  it("shows exactly the request the app copies", () => {
    expect(doc).toContain(`\`\`\`\`text\n${CHATGPT_PROMPT_TEMPLATE}\n\`\`\`\``);
  });

  it("puts the app's tags into the request", () => {
    const prompt = chatgptPrompt(["Суп", "Сніданок"]);
    expect(prompt).toContain("Бери теги з цього списку: Суп, Сніданок.");
    expect(prompt).not.toContain(TAGS_PLACEHOLDER);
    expect(chatgptPrompt([])).toContain("Сніданок, Обід, Вечеря");
  });
});
