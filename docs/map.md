# MAP

The third tab uses `#/map` with the internal view key `map`. Legacy aliases are intentionally unsupported. Map is curated content, with visual studies explicitly marked as demos.

`modules/map.js` defines ME at axial coordinate (0, 0) and the content nodes. `modules/hex-map.js` generates the union of the nodes' two-ring neighborhoods. Outside this territory, only the dotted background is shown. Titles and region labels are canvas background annotations; content tiles have their own higher layer.

All geometry uses radius 76, width `sqrt(3) * 76`, height 152 and row step 114. Fills extend to the cell boundary without inset borders. A pointer-transparent SVG above the fills draws each shared edge exactly once, keyed by integer lattice vertices rather than rounded pixel coordinates. Edge priority is completed solid accent, pending dashed, origin, region boundary, then empty land. Region boundaries join this same edge layer rather than adding a second outline. Round line caps close vertex junctions; pending dashes start and finish at the endpoints. Hover and keyboard focus never move tiles out of the grid. During dragging the original cell becomes empty and the floating tile gets a temporary outline; drop, cancellation and keyboard moves rebuild the shared grid.

Drag blank land to pan and use the wheel or controls to zoom. Click a filled tile for details. Drag a content tile to snap to an empty cell; ME cannot move. A destination must be within hex distance two of another node, excluding the dragged node. The final graph, with edges between nodes within distance two, must remain connected to ME. Invalid drops and pointer cancellations restore the old position. Alt + arrow keys provide keyboard tile movement with the same validation.

Positions are saved only in this browser at `leiyin.map.positions.v1`. Restored positions must have integer coordinates, no collisions and valid connectivity. Node identity and exceptions come from code, never browser storage. A deliberately isolated code-defined node may use `allowDisconnected: true` to seed an independent component; drag operations still require an occupied neighbor within distance two and must preserve connectivity to the defined roots.

Run `node scripts/test-hex-map.mjs` and `node scripts/check-site.mjs`. Browser checks cover valid and invalid drags, click suppression, persistence, modal details, panning, zoom, mobile layout and route cleanup. No Playground API or database changes are needed.

## Content from Todolist

`modules/map-content.js` derives 20 curated nodes from `growth-roadmap.js`, covering all 33 source records once across Craft, Influence, People and AI. Browser-local task additions appear in their corresponding group. Six award programs and three applications each have a separate node using their source award Logo, including exact win counts. Award wins and award applications are split, so applications are never labeled achievements. A node is completed only if all its source tasks are done; other nodes retain pending styling. No progress is inferred. Completed nodes use solid accent borders and a checkmark; pending nodes use dashed outlines and a to-do count. Details expose source titles, status, supplied progress, context and next steps, with a link to the full journal section. The map refreshes its content when mounted, while drag positions remain local to the browser.

Run `node scripts/test-map-content.mjs` to verify complete source coverage, status classification, exact award counts, local additions and initial connectivity.
