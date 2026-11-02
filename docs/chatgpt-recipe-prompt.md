# ChatGPT request: a recipe from a photo

Use this to add a recipe from a photo (a cookbook page, a screenshot, a handwritten note) or from any messy text. ChatGPT rewrites it in the exact format the app reads, and the app fills in the form from that text.

## How to use it

1. In the app, open "Додати рецепт" and tap "Запит для ChatGPT". The request below is copied.
2. In ChatGPT, paste the request and attach the photo or the text of the recipe.
3. Copy the answer and paste it into the text box at the top of the add screen. If the form is still empty, it fills in by itself; otherwise tap "Розібрати текст".
4. Check the fields, then save. The photo and notes are added by hand. Tags that no recipe uses yet are marked "нова"; remove any you do not want.

If the answer comes back with stars, hashes or bold text, ask ChatGPT to return plain text only, as the request says.

## The request

The app copies exactly this text, with one difference: `[теги з застосунку]` is replaced with the tags your recipes already use, so ChatGPT picks from them. While there are no recipes yet, a starter list is used instead (Сніданок, Обід, Вечеря, Суп, Салат, Основна страва, Десерт, Випічка, Українська кухня, Вегетаріанське). The text is kept in `src/domain/chatgptPrompt.ts`, and a unit test fails when this document and that file differ, so change both together.

````text
Перепиши рецепт з фото або тексту, який я надішлю, точно у формат нижче, українською мовою. Поверни лише сам рецепт одним блоком тексту, без пояснень і без Markdown (без зірочок, решіток і жирного шрифту).

Формат:

Сирники зі сметаною
Ніжні всередині, з рум’яною скоринкою.
Порцій: 3
Час: 25 хв
Розділ: Страви
Теги: Сніданок, Українська кухня, Вегетаріанське

Інгредієнти:
- Кисломолочний сир — 500 г
- Яйце — 1 шт
- Цукор — 2 ст. л.
- Борошно — 4 ст. л.
- Цибуля — 1 шт (дрібно нарізана)
- Сіль (за смаком)
- Сметана (для подачі)

Приготування:
1. Розімніть сир виделкою, додайте яйце, цукор і сіль.
2. Сформуйте сирники і обваляйте в борошні.
3. Смажте по 3 хвилини з кожного боку.

Правила:
1. Перший рядок: назва страви. Далі, за бажанням, короткий опис в одному реченні.
2. Рядки «Порцій: число» і «Час: число хв» (загальний час приготування). Якщо в джерелі цього немає, пропусти рядок.
3. Рядок «Розділ:» зі словом Страви або Випічка. Випічка: торти, пироги, печиво, булочки, хліб і десерти. Страви: усе інше.
4. Рядок «Теги:» з 1 до 5 тегами через кому: тип страви, прийом їжі, кухня, особливості. Бери теги з цього списку: [теги з застосунку]. Новий тег додавай, лише якщо жоден зі списку не підходить; пиши його коротко, з великої літери, як у списку.
5. Заголовки «Інгредієнти:» і «Приготування:» пиши саме так, кожен в окремому рядку.
6. Один інгредієнт в рядку: назва в називному відмінку, потім « — », число і одиниця.
7. Одиниці лише такі: г, кг, мл, л, шт, ст. л., ч. л., склянка, зубч., пучок, щіпка, банка, уп.
8. Кількість цифрами: 200, 1,5 або дроби ½, ¼, ¾, ⅓, ⅔. Для діапазону пиши одне число.
9. Якщо кількості немає, пиши в дужках: (за смаком), (для подачі) або (за бажанням).
10. Уточнення до інгредієнта пиши в дужках у кінці рядка, наприклад: Цибуля — 1 шт (дрібно нарізана).
11. Один крок в рядку, з номером. Час у кроці пиши цифрами, наприклад «10 хвилин» або «1,5 години», щоб застосунок створив таймер.
12. Не додавай посилань, приміток від себе і нічого, чого немає в джерелі (крім розділу і тегів).
````

## What the app reads

The example in the request is the format. The parser (`parseRecipeText` in `src/domain/parse.ts`) reads it like this:

- **First line:** the title. Lines after it and before "Інгредієнти:" form the description.
- **"Порцій: 3" and "Час: 25 хв":** servings and total time. Both are optional. The time can also be "2 год" or "1 год 15 хв".
- **"Розділ: Страви" or "Розділ: Випічка":** the section in the bottom bar. Випічка is for cakes, pies, cookies, buns, bread and desserts; Страви for everything else. Without this line the editor picks the section from the dish type, and the switch in the form can change it.
- **"Теги: Сніданок, Українська кухня":** tags, separated by commas. A tag that matches an existing one, ignoring capital letters, takes the existing spelling, so the same tag is never stored twice. Tags no recipe uses yet are added too and marked "нова" in the form.
- **"Інгредієнти:" and "Приготування:":** section headings. When the text has them, the parser follows them and guesses nothing.
- **Ingredient lines:** "Назва — кількість одиниця", optionally with a note in brackets at the end. A line with no amount takes its note from the brackets: (за смаком), (для подачі), (за бажанням).
- **Units the app knows:** г, кг, мл, л, шт, ст. л., ч. л., склянка, зубч., пучок, щіпка, банка, уп. Anything else becomes part of the name.
- **Step lines:** one per line, numbered or not. A time written as a number ("10 хвилин", "1,5 години") gives the step a timer.
- **Links:** skipped. Recipes have no source link.
- **Photo and notes:** not read from the text; they are added in the form.

Copying a recipe as text (the "..." menu on a recipe, "Скопіювати як текст") gives the same format, tags included, so a copied recipe pastes back in full.
