# Personal Finance Hub design direction

## North star

Personal Finance Hub is a **clear coach**: it helps a person orient themselves immediately, then take one thoughtful next step. Its calm clarity takes inspiration from Monarch, but the visual identity is original: warmer, more editorial, and anchored in a deep forest green.

The product should never resemble an AI-generated generic fintech dashboard. It earns trust through restraint, useful hierarchy, honest copy, and generous breathing room.

## Visual foundations

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F6F4EE` | Warm paper page background |
| Surface | `#FFFDF8` | Cards and navigation rail |
| Muted surface | `#EEE9DF` | Quiet fills and inactive icon tiles |
| Ink | `#1F2B24` | Primary text |
| Muted ink | `#687268` | Supporting text |
| Forest | `#276749` | Primary action, selection, positive focus |
| Deep forest | `#1D4E38` | Hover states and strong emphasis |
| Soft forest | `#E2EEE7` | Selected navigation and focus rings |
| Rose | `#B55042` | Destructive/error states only |
| Gold | `#A56B22` | Caution states only |

Use green with intent. It should not flood the interface: on light pages it is reserved for primary actions, selected navigation, progress, and the one data series the user should notice first.

## Type and numbers

- Use a restrained editorial serif (currently Georgia as a system-safe prototype choice) for page titles, net worth, and meaningful goal names.
- Use the interface sans-serif for all navigation, labels, controls, tables, and descriptions.
- Financial amounts use tabular figures wherever values need comparison or alignment.
- Titles should be sentence-like and useful, not promotional: “Your money, in focus.” is preferable to “Financial dashboard.”

## Layout

Desktop uses a 248px warm-paper left rail: PF monogram, five primary destinations, user identity, and sign-out. Mobile swaps this for a compact fixed bottom navigation.

The dashboard is balanced, with the first row ordered by the questions people ask on opening the app:

1. **Where do I stand?** Net worth and its monthly change.
2. **What is available?** Cash after planned bills and goals.
3. **What am I moving toward?** One visible goal.
4. **What should I notice?** Account holdings, budget pace, and recent activity.

Cards are softly rounded (roughly 16px), bordered rather than heavily shadowed, and separated by space. Avoid grids made of equally weighted widgets.

## Data visualisation

Charts are quiet guidance. Prefer direct labels, minimal gridlines, one forest-green focus series, and muted comparison data. A chart must answer a question at a glance; complex filtering and multi-series analysis belong on detailed report pages, not the overview.

## Authentication

Login and sign-up share an editorial split-screen composition: a deep-forest story panel with abstract growth geometry on large screens, paired with a focused form on a warm canvas. The supporting message is privacy and control, not a feature checklist.

The current sign-up page is a visual prototype only because the API exposes login but no registration endpoint. Do not wire it to fake account creation.

## Interaction and accessibility

- Use short, quiet transitions (about 160ms) for hover, focus, and orientation changes.
- Respect `prefers-reduced-motion`; no essential state relies on animation.
- Keyboard focus is visibly forest-tinted.
- Never communicate money status with colour alone: include sign, label, or explanatory copy.
- Keep body text and form controls high contrast on warm surfaces.

## Responsive rules

The system is adaptive rather than simply shrunken. The desktop rail becomes bottom navigation below 760px. The net-worth card remains first; supporting cards stack by priority. Forms remove the illustration panel on smaller screens, retaining the focused task and privacy message.

## Reference boundary

Use Monarch as a reference for calm usability and modular financial orientation. Do not copy its visual assets, component geometry, copy, or palette. The forest-green mark, warm-paper surfaces, editorial type moments, and direct privacy-first language are the Personal Finance Hub signature.
