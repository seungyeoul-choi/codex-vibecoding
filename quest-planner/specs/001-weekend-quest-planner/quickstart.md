# Quickstart: Weekend Quest Planner

## Goal

Validate the MVP flow end to end in a browser:

1. Enter mood, time, budget, and companionship.
2. Click `추천하기`.
3. Confirm one recommendation appears with time and cost.
4. Confirm empty state appears when no match exists.
5. Confirm recent recommendations are restored on revisit.

## Prerequisites

- A React + Vite project setup is present in the repository.
- The app runs in a modern browser.

## Validation Steps

1. Open the app in a desktop browser.
2. Select a valid combination of mood, time, budget, and companionship.
3. Click `추천하기`.
4. Confirm that exactly one recommendation card appears.
5. Confirm the card shows estimated time and estimated cost.
6. Reload the page and verify the most recent recommendation remains visible in the
   recent section.
7. Change the inputs to a combination with no match.
8. Click `추천하기` again and verify the empty state guidance appears.
9. Repeat the same flow in a mobile viewport and confirm the layout does not break.

## Expected Outcome

- The main flow works without external services.
- Recent recommendations remain available across visits.
- Mobile and desktop layouts remain readable and usable.

## Validation Notes

- Browser verification completed on 2026-07-10 in a local Chromium session.
- Desktop and mobile-style layouts were checked.
- The page loaded without application console errors after the favicon was added.
