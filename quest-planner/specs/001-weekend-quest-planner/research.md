# Research: Weekend Quest Planner

## Decision 1: React + Vite single-page app

- Decision: Use React with Vite for a single-page application.
- Rationale: The project prompt already sets this direction, and it keeps the setup
  simple for a beginner.
- Alternatives considered: Next.js or a multi-page architecture, but those add
  structure that is unnecessary for this MVP.

## Decision 2: Internal mock data only

- Decision: Keep all recommendation data in project files under `src/data/`.
- Rationale: The MVP must stay offline-friendly, deterministic, and easy to inspect.
- Alternatives considered: External API-backed data, but that conflicts with the MVP
  scope and would add avoidable complexity.

## Decision 3: localStorage for recent recommendations

- Decision: Store the most recent recommendation history in `localStorage`, limited to
  the latest 3 items.
- Rationale: This matches the spec, supports revisit behavior, and avoids introducing a
  database or server.
- Alternatives considered: Session storage or server persistence; both are outside the
  MVP scope.

## Decision 4: Submit-to-recommend interaction

- Decision: Require the user to fill the inputs and press `추천하기` to see results.
- Rationale: This is simpler to understand and easier to verify than live-updating
  recommendations.
- Alternatives considered: Auto-refresh on every input change, but that would make the
  flow harder to reason about in a beginner project.

## Decision 5: Manual browser verification

- Decision: Verify the app in a browser on mobile and desktop viewports.
- Rationale: The constitution requires browser verification for UI changes, and this
  MVP has no automated test requirement in the current spec.
- Alternatives considered: Automated end-to-end testing, but it is not needed for this
  first-pass plan.
