# Personal Finance Hub — UI and prototype brief

## Why this exists

This is the record of the UI discussion that shaped the first Personal Finance Hub prototype. It is a decision brief, not an implementation checklist. Use it to preserve the intent behind the interface as the product grows.

## The problem we are solving

The project needed to move away from the familiar “AI-looking” finance dashboard: dark backgrounds, blue gradients, generic cards, and an interface that signals technology before it signals trust.

The chosen direction is a calm, personal finance home that makes people feel: **“I know exactly where my money stands.”** It should guide rather than overwhelm.

## Reference and originality

The closest reference is [Monarch](https://www.monarch.com/homepage), specifically its composed, understandable approach to personal-finance information. The goal is not to reproduce Monarch. Personal Finance Hub should be its own visual sibling:

- warmer and more editorial;
- recognisably forest-green rather than blue or black;
- disciplined about information density;
- practical and private rather than overly playful or luxury-coded.

## Chosen visual direction

### Personality

The product is a **clear coach**. It is calm, encouraging, practical, and capable. It avoids both the sterile “modern operator” style of an enterprise finance console and the overly celebratory feel of a gamified savings app.

### Colour

`#276749` is the brand anchor. It is used with restraint: primary actions, selected navigation, progress, positive focus, and the one chart series that matters most.

The canvas is warm paper rather than bright white or cool blue-gray. Light surfaces, quiet borders, muted ink, and pale sage support the green. This keeps the interface personal and avoids the generic all-green-fintech look.

### Typography

Meaningful financial moments use an editorial serif: page titles, net worth, and goal names. The operating interface—navigation, forms, labels, and transaction rows—uses a legible sans-serif. Financial values align cleanly with tabular figures where comparison matters.

The editorial type is a deliberate anti-generic signal: it gives the product a point of view without interfering with everyday scanning.

### Data and density

The dashboard is a **balanced workspace**, not a sparse landing page or a dense analyst terminal. It leads with net worth, then answers supporting questions:

1. What is available to spend?
2. What bills are approaching?
3. What goal is moving forward?
4. What accounts, spending patterns, and transactions deserve attention?

Charts are quiet guidance. They should use direct labels, limited gridlines, and one forest-green focus. Detailed reports may later support exploration, filters, and multiple series; the home screen should not.

## Navigation and responsiveness

Desktop uses a slim left rail with a PF monogram and clear destinations: Overview, Accounts, Transactions, Budget, and Goals. Small screens replace the rail with compact bottom navigation.

The system is adaptive, not just shrunken. On mobile, the most important financial orientation remains first and supporting cards stack in priority order.

## Authentication experience

Login and sign-up use an editorial split screen on larger displays:

- a focused form on a warm canvas;
- a forest-green companion panel with an abstract financial-growth composition;
- privacy-first reassurance: the user’s financial picture is private and under their control.

The prototype intentionally avoids stock photography, literal rising-arrow symbols, and generic fintech illustrations. The PF monogram and abstract goal-progress rings create the signature visual moment instead.

## Interaction principles

- Motion is purposeful and quiet: subtle hover and orientation transitions, not spectacle.
- Reduced-motion preferences are respected.
- Keyboard focus remains conspicuous.
- Money status is never communicated with colour alone; it includes a sign, label, or explanatory sentence.
- Light mode is the only prototype theme. A dark theme is not a current design objective.

## Prototype scope agreed in this session

The first prototype includes:

- a high-fidelity dashboard shell using representative sample figures;
- a working login page, retaining the existing authentication flow;
- a visual sign-up page to establish the full entry experience.

The sign-up screen is intentionally non-functional until a registration API is designed. The dashboard is temporarily public so the prototype can be viewed directly; it should be protected again before real financial data is connected.

## Guardrails for future UI work

Do not add visual complexity merely to make the app feel more “financial.” The product should earn confidence through hierarchy, plain language, and useful progress—not dense charts, decorations, gradients, or dashboard-card repetition.

When new views are added, apply the shared tokens and the clear-coach role defined in [DESIGN.md](./DESIGN.md). If a design choice weakens the feeling of calm orientation, reconsider it.
