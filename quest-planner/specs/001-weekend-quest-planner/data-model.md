# Data Model: Weekend Quest Planner

## User Selection

- `mood`: The user's current mood choice.
- `availableTime`: The amount of time the user can spend.
- `budget`: The amount of money the user wants to spend.
- `companionship`: Whether the user is going alone or with someone.

### Rules

- All four fields are required before recommendation.
- The selection is submitted as one request when the user presses `추천하기`.

## Activity

- `id`: Stable identifier for the activity.
- `title`: Display name.
- `moods`: Supported mood tags.
- `timeEstimate`: Estimated duration or range.
- `costEstimate`: Estimated cost or range.
- `companionship`: Supported companionship condition.
- `description`: Short explanation shown in the result.

### Rules

- Activity entries live in a local mock dataset.
- Each activity must expose enough information to explain why it matched.

## Recommendation Result

- `activity`: The chosen activity.
- `matchedCriteria`: Short list of the selected conditions that matched.
- `generatedAt`: Timestamp used for recent history display.

### Rules

- Only one recommendation is returned for the current feature flow.
- The result must include time and cost details.

## Recent Recommendation Record

- `id`: Stable history entry identifier.
- `activityTitle`: Name of the recommended activity.
- `timeEstimate`: Time shown to the user.
- `costEstimate`: Cost shown to the user.
- `matchedCriteria`: Brief explanation of the match.
- `savedAt`: Timestamp for recent ordering.

### Rules

- Store up to 3 records.
- New recommendations are added to the front of the history list.
- When a fourth record is created, drop the oldest record.
