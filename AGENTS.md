# Site design constraints

Read `docs/design-system.md` before making UI changes.

- Preserve the existing site-wide design system for every page and layout experiment. Reuse shared theme tokens and component rules. A visual reference does not authorize a different page theme or palette; change the design system only when the user explicitly requests it.
- Newspaper layouts must gain their character from typography, columns, hierarchy and density while retaining the site's colors.
- Use single/double rules only to separate distinct content. Avoid duplicate adjacent borders, empty bands between lines and decorative frames around headings that already have a section separator.
- Todolist Lab V1 is the active layout and the basis for future iterations. Its frozen reference is `modules/todolist-journal-v1.js`; iterate in `modules/todolist-journal.js`. V2 is archived and must not become the default unless the user requests it.
