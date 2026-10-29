# Todolist Lab layout studies

V1 is the layout approved before the Chronicle experiment (source baseline: commit `8841ee8`). Its renderer is preserved in `modules/todolist-journal-v1.js`, with the existing `todolist-lab.css` base styles. It retains the dark, two-desk composition. Keep changes for the experiment scoped to `.journal-v2` rather than altering that base.

V2 is the default experiment, rendered by `modules/todolist-journal.js` and styled by `todolist-lab-v2.css`. It studies the supplied historical newspaper reference: light paper, dark print, a strong masthead, narrow side columns around the wider Design Influence desk, continuous vertical rules and compact setting. The site navigation remains unchanged. One font family, section-header detail links, real progress and full-record search are retained.

Use `?labEdition=v1#/tdl-lab` and `?labEdition=v2#/tdl-lab` to compare editions. The visible edition switch reloads the chosen renderer. `labSection` links and browser navigation continue to work in either edition. This is a layout comparison, not a second copy of the task data: both renderers read `growth-roadmap.js` and the same browser-local additions.

Check editions at desktop, tablet and 320px mobile widths; verify section details, search, browser Back and deep-link reload. No data migration or backend deployment is required.
