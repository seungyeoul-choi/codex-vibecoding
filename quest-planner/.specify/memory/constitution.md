<!--
Sync Impact Report
Version change: template → 1.0.0
Modified principles:
- Beginner-Friendly Structure
- Local-First Recommendation Data
- Transparent Result Cards
- Responsive and Accessible UI
- Minimal Dependency Surface
Added sections:
- Project Constraints
- Development Workflow and Quality Gates
Removed sections:
- None
Templates requiring updates:
- .specify/templates/plan-template.md ✅ reviewed and aligned
- .specify/templates/spec-template.md ✅ reviewed and aligned
- .specify/templates/tasks-template.md ✅ reviewed and aligned
Deferred items:
- None
-->

# Quest Planner Constitution

## Core Principles

### Beginner-Friendly Structure
The codebase MUST stay easy for an entry-level React learner to read. Keep the file
structure shallow, group code by feature or screen, and avoid extra layers such as
unnecessary service classes, repositories, or abstract base components.
Each file MUST have a clear purpose, and shared code MUST only be extracted when it is
used in more than one place or clearly reduces duplication.

### Local-First Recommendation Data
The first version MUST run entirely in the browser with mock data and `localStorage`.
No external API, login flow, or server integration is allowed in the initial release.
Recommendation logic MUST be deterministic, inspectable in source, and driven by data
that includes mood, available time, budget, and companionship options.

### Transparent Result Cards
Every recommendation result MUST show the estimated time and estimated cost alongside
the recommendation itself. If time or cost varies, the UI MUST show a range or clear
label instead of hiding the uncertainty.
Result language and filter language MUST stay aligned with the mock data so users can
understand why a course was selected.

### Responsive and Accessible UI
The app MUST render correctly on mobile and desktop without horizontal scrolling,
clipped content, or unusable controls. The primary user flow MUST remain usable with a
keyboard, and contrast and touch-target size MUST remain readable on common screens.
Any UI change MUST be verified in a browser before the work is considered complete.

### Minimal Dependency Surface
New libraries MUST be added only when the same result is impractical with React and
browser APIs already available in the project. If a dependency is introduced, the
implementation MUST record the reason it was needed and the simpler alternative that
was rejected.
Prefer small, explicit utility code over extra state, form, date, or storage libraries
unless they remove genuine complexity.

## Project Constraints

This project is a beginner practice React app. The first version MUST remain client-side
only, using mock data and `localStorage` for persistence. The codebase MUST avoid
introducing backend services, auth providers, or data-fetching layers until the project
explicitly grows beyond the initial scope.

## Development Workflow and Quality Gates

Every feature plan MUST include a constitution check before implementation starts, and
any exception MUST be documented in the plan's complexity tracking section.
Before a feature is marked complete, the implementation MUST be verified in a browser on
at least one mobile viewport and one desktop viewport.
When recommendation rules change, the mock data and any related tests or fixtures MUST
be updated in the same change so behavior stays deterministic.

## Governance

This constitution takes precedence over informal habits or conflicting guidance.
Amendments MUST include a written rationale, a semantic version bump, and a review of
any dependent templates or guidance files that encode project workflow.
Versioning policy:
- MAJOR for principle removals or redefinitions that break prior governance.
- MINOR for adding a principle or materially expanding a section.
- PATCH for wording changes, clarifications, or non-semantic refinements.
Compliance review expectations:
- Plans, specs, and tasks MUST be checked against this constitution before work starts.
- Implementation SHOULD surface any intentional deviation explicitly in the plan.
- Completed UI work MUST include browser verification evidence in the implementation notes
  or review summary.

**Version**: 1.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
