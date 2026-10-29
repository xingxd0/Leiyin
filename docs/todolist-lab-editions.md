# Todolist Lab layout studies

V1 is the active layout and the basis for future iterations, restored at the user's request after evaluating V2. The production renderer is `modules/todolist-journal.js`, using `todolist-lab.css`. It retains the dark, two-desk composition, Design Influence lead, full-record search and section-header detail entry points.

The exact pre-experiment V1 renderer remains preserved in `modules/todolist-journal-v1.js` (source baseline: commit `8841ee8`). Iterate in the production module rather than altering this frozen reference.

The rejected Chronicle V2 is archived in `modules/todolist-journal-v2.js` and `todolist-lab-v2.css`. Neither is loaded on the live page. There is no edition switch; old `labEdition=v1` and `labEdition=v2` links resolve to the active V1 layout and remove the obsolete parameter. `labSection` links and browser navigation remain available.

All iterations must preserve the site-wide design system described in `docs/design-system.md`. Do not restore V2 as the default without the user's request. Both snapshots read the same task source and browser-local additions; no data migration or backend deployment is needed.
