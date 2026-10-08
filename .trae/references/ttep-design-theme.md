# TTEP Design Theme

## Purpose

TTEP is a reference design theme, not a required visual system for this website.

It should be used as a reusable template for studying, documenting, and adapting a mature design system structure. The goal is to extract design logic, token hierarchy, component thinking, and page-pattern methods from the Figma source without copying its brand expression directly.

## Relationship To Current Website

- TTEP is a reference layer, not the active design system for `leiyin.si`.
- The current website may borrow its documentation structure and token discipline.
- The current website should not directly inherit TTEP's enterprise product tone, component density, or brand-specific visual choices.
- Any future use must be translated through the target product context, audience, content, and brand tone.

## Source

- Figma file: `✅TTEP Design System`
- File key: `5eaVQOpPi4KnWjR1THC43C`
- Read method: Figma MCP / Figma API
- Reliable read pattern: shallow file read and single-node reads
- Unreliable read pattern: full deep file read and multi-node batch reads

## Theme Definition

TTEP presents itself as a structured, product-oriented design system. Its organization suggests a mature internal platform system rather than a campaign site or personal portfolio.

Core characteristics:

- Systematic: organized from foundations to components and patterns.
- Product-facing: suitable for complex product surfaces, dashboards, internal tools, and platform workflows.
- Dense but controlled: supports information-heavy interfaces through typography, spacing, and component hierarchy.
- Neutral and functional: visual decisions support clarity, state expression, and reuse.
- Scalable: tokens and page patterns are designed to support long-term evolution.

## Suitable Scenarios

Use TTEP as a reference when designing:

- Enterprise product systems
- Internal platforms
- AI workflow tools
- Data-heavy dashboards
- Design system documentation
- Component libraries
- Admin or governance tools
- Multi-page product frameworks

## Unsuitable Scenarios

Avoid applying TTEP directly to:

- Personal portfolio websites
- Editorial storytelling pages
- Highly emotional brand campaigns
- Luxury or art-direction-heavy websites
- Lightweight landing pages where system density would feel excessive
- Pages that rely on distinctive personal voice rather than product consistency

## Design System Structure

The Figma file is organized around four major levels:

- Foundation: color, typography, radius, spacing, shadow, iconography, illustration.
- Layout: grid system and page layout rules.
- Component: steps, tags, popup, modal, drawer, side panel, links.
- Key pages and patterns: AI, data visualization, main framework, tables.

This hierarchy is the most important reusable idea from TTEP. It separates primitive tokens, layout rules, reusable components, and higher-order patterns.

## Foundation Tokens

### Typography

TTEP exposes `30` text styles through Figma Styles.

Font families:

- English: `TikTok Sans`
- Chinese: `PingFang SC`

Typography groups:

- Header
- Body
- Longform
- Caption

Recommended interpretation:

- Header styles define hierarchy and section scanning.
- Body styles define default UI readability.
- Longform styles support reading-dense documentation or explanatory text.
- Caption styles support labels, metadata, hints, and helper text.

Extracted scale:

| Role | Size | Line Height | Weight |
| --- | ---: | ---: | --- |
| Header 1 | 40 | 48 | EN Bold / CN Semibold |
| Header 2 | 32 | 40 | EN Bold / CN Semibold |
| Header 3 | 28 | 36 | EN Bold / CN Semibold |
| Header 4 | 20 | 24 | EN Bold / CN Semibold |
| Header 5 | 18 | 22 | EN Bold / CN Semibold |
| Header 6 | 16 | 20 | EN Semibold / CN Semibold |
| Header 7 | 14 | 18 | EN Semibold / CN Semibold |
| Body L | 16 | 20 | Regular |
| Body S | 14 | 18 | Regular / Medium |
| Longform L | 16 | 24 | Regular |
| Longform M | 14 | 20 | Regular |
| Longform S | 12 | 18 | Regular |
| Caption | 12 | 16 | Regular / Medium |

Design guidance:

- Use `Header 1` and `Header 2` sparingly for page-level hierarchy.
- Use `Header 3` to `Header 6` for product sections and component titles.
- Use `Longform` for documentation, empty-state explanation, help content, and long descriptions.
- Use `Caption` for secondary information, not primary reading content.
- Keep letter spacing neutral unless a brand-specific need appears.

### Shadow

TTEP exposes three effect styles:

| Token | Shadow Layers | Use Case |
| --- | --- | --- |
| `shadow-S` | `0 4 6 -1 rgba(17,24,39,0.10)`, `0 2 4 -2 rgba(17,24,39,0.06)` | Low emphasis cards, subtle separation |
| `shadow-M` | `0 4 6 -2 rgba(17,24,39,0.03)`, `0 12 16 -4 rgba(17,24,39,0.08)`, `0 2 2 -1 rgba(17,24,39,0.04)` | Floating panels, dropdowns, active containers |
| `shadow-L` | `0 24 48 -12 rgba(17,24,39,0.18)`, `0 4 4 -2 rgba(17,24,39,0.04)` | High-emphasis overlays, large elevated modules |

Design guidance:

- Use shadows to clarify elevation, not decoration.
- Avoid heavy shadow stacking on dense enterprise surfaces.
- Pair shadows with clear background contrast and border decisions.
- Use `shadow-L` only when a surface needs strong foreground priority.

### Radius

The shallow Figma read confirms large containers using `30px` radius.

Recommended interpretation:

- Large product containers: `24px` to `30px`
- Cards and grouped panels: `16px` to `20px`
- Buttons, tags, and compact controls: `8px` to `12px`
- Inputs and table controls: `6px` to `10px`

Design guidance:

- Use radius to communicate surface grouping and product friendliness.
- Avoid mixing too many unrelated radius values on the same page.
- Reserve the largest radius for major content containers or hero-like product modules.

### Spacing

The Spacing canvas contains marker components and spacing documentation. The output is large, so this document records the usable principle rather than claiming a complete extracted scale.

Recommended spacing model:

| Level | Suggested Values | Use Case |
| --- | --- | --- |
| Micro | `4`, `6`, `8` | Icon gaps, compact metadata, small controls |
| Component | `12`, `16`, `20` | Button padding, card inner spacing, form rows |
| Group | `24`, `32` | Section groups, card clusters, panel content |
| Layout | `40`, `48`, `64`, `80` | Page sections, major layout separation |

Design guidance:

- Use spacing as hierarchy, not only as empty area.
- Keep internal component spacing tighter than page-level spacing.
- Avoid uniform spacing everywhere; product systems need rhythm between dense and open zones.

### Color

The Figma Styles API did not expose Paint styles for this file. Color information appears to exist inside the Color canvas but was not normalized as public Figma Paint styles in the current read.

Current status:

- Do not infer a complete TTEP color palette without deeper color extraction.
- Do not copy visible colors from screenshots or partial node data as formal tokens.
- Treat color as pending until the Color canvas is parsed intentionally.

Recommended future extraction:

- Read node `230:3391` in controlled chunks.
- Extract fills from named swatches or token tables.
- Separate primitive colors, semantic colors, and usage examples.
- Validate accessibility contrast before documenting tokens.

## Layout Principles

TTEP includes a Layout section and a Grid system page. The file structure suggests that layout is treated as a system-level rule, not a per-page decision.

Reusable principles:

- Define page shell, content width, and responsive breakpoints before component styling.
- Separate navigation, content, operation area, and supporting panels.
- Use grid rules to stabilize dense information.
- Use clear vertical rhythm for documentation and product pages.
- Avoid designing each page as a one-off composition.

Suggested layout template:

- Page shell: global navigation and page-level container.
- Header zone: title, description, metadata, and primary action.
- Content zone: main content grid or stacked sections.
- Supporting zone: filters, context panels, status, or secondary information.
- Feedback zone: empty states, loading states, errors, and success confirmation.

## Component Language

The component layer includes:

- Steps
- Tag
- Popup
- Modal
- Drawer
- Side panel
- Link

Reusable component principles:

- Components should define state, density, size, and usage boundaries.
- Overlay components should have clear hierarchy: popup < modal < drawer < side panel.
- Tags should be semantic and compact, not decorative badges only.
- Links should be visually distinct from buttons and preserve navigation meaning.
- Steps should clarify process state, not merely decorate onboarding flows.

Required states:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Error
- Selected

Accessibility requirements:

- Interactive components require visible focus states.
- Overlays require keyboard dismissal and focus management.
- Links must remain identifiable without relying only on color.
- Status tags need text labels, not color-only meaning.
- Modal and drawer patterns require correct `aria-modal`, `role`, and focus trap behavior when implemented.

## Page Patterns

The file includes higher-order patterns:

- AI
- Data Visualization
- Main framework
- Table

Interpretation:

- TTEP is intended to support complex product workflows, not only isolated components.
- Pattern documentation should explain composition, data density, edge states, and interaction rules.
- AI and data visualization patterns should have stronger guidance than normal marketing sections because they carry trust and decision-making risk.

Pattern documentation should include:

- Use case
- Layout anatomy
- Core components
- States
- Empty and error handling
- Accessibility notes
- Data density rules
- Do and do not examples

## Motion Principles

No complete motion token set has been extracted from the Figma file yet.

Recommended theme-level motion guidance:

- Motion should clarify hierarchy, state changes, and progressive disclosure.
- Avoid decorative motion in enterprise product surfaces.
- Use short durations for component interactions.
- Use slightly longer durations for page-level transitions or large panel entrances.

Suggested motion ranges:

| Type | Duration | Easing |
| --- | ---: | --- |
| Micro interaction | `120ms` to `180ms` | ease-out |
| State transition | `180ms` to `240ms` | ease-out |
| Overlay entrance | `240ms` to `320ms` | cubic-bezier style ease |
| Page transition | `320ms` to `480ms` | soft ease-out |

## Adaptation Rules

When adapting TTEP to another project:

- Keep the structure before borrowing the style.
- Re-map typography to the target language, brand tone, and content density.
- Re-map colors to the target brand and accessibility requirements.
- Preserve spacing hierarchy, but adjust density by product type.
- Use component logic, not component appearance, as the reusable asset.
- Document what was borrowed, what was changed, and why.

## Difference From A Personal Portfolio System

TTEP is useful for discipline and structure, but a personal portfolio needs different priorities.

TTEP emphasizes:

- Product consistency
- Component reuse
- Dense information control
- Internal system scalability

A personal portfolio emphasizes:

- Narrative rhythm
- Evidence hierarchy
- Editorial pacing
- Personality and credibility
- Selective visual memorability

Therefore, a personal site may borrow TTEP's documentation method, but should not inherit its full product-system density.

## Open Items

- Extract Color canvas in a controlled way.
- Confirm complete radius scale through deeper Radius node parsing.
- Extract spacing values from marker components instead of inferring from examples.
- Inspect Grid system for breakpoint and column rules.
- Inspect Table and Data Visualization patterns for complex data rules.
- Decide whether this reference should become a visible internal page or remain a private Markdown document.

