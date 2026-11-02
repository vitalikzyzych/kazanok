import { describe, expect, it } from "vitest";

import doc from "../../docs/chatgpt-recipe-prompt.md?raw";

import { CHATGPT_PROMPT } from "./chatgptPrompt";

describe("docs/chatgpt-recipe-prompt.md", () => {
  it("shows exactly the request the app copies", () => {
    expect(doc).toContain(`\`\`\`\`text\n${CHATGPT_PROMPT}\n\`\`\`\``);
  });
});
