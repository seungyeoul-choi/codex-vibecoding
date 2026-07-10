import { RULE_LOOKUP } from '../data/recommendationRules';

export function formatWon(value) {
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
}

export function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? '';
}

export function buildSelectionSummary(selection) {
  return [
    {
      label: '기분',
      value: getOptionLabel(RULE_LOOKUP.mood, selection.mood),
    },
    {
      label: '시간',
      value: getOptionLabel(RULE_LOOKUP.availableTime, selection.availableTime),
    },
    {
      label: '예산',
      value: getOptionLabel(RULE_LOOKUP.budget, selection.budget),
    },
    {
      label: '동행',
      value: getOptionLabel(RULE_LOOKUP.companionship, selection.companionship),
    },
  ];
}

function scoreActivity(activity, selection) {
  const moodMatch = activity.moodTags.includes(selection.mood);
  const timeOption = RULE_LOOKUP.availableTime.find((option) => option.value === selection.availableTime);
  const budgetOption = RULE_LOOKUP.budget.find((option) => option.value === selection.budget);
  const companionshipOption = RULE_LOOKUP.companionship.find(
    (option) => option.value === selection.companionship,
  );

  if (!timeOption || !budgetOption || !companionshipOption || !selection.mood) {
    return null;
  }

  const timeFits = activity.maxMinutes <= timeOption.maxMinutes;
  const budgetFits = activity.costWon <= budgetOption.maxWon;
  const companionshipFits = activity.companionship.includes(selection.companionship);

  if (!moodMatch || !timeFits || !budgetFits || !companionshipFits) {
    return null;
  }

  const timeScore = Math.max(0, timeOption.maxMinutes - activity.maxMinutes);
  const budgetScore = Math.max(0, budgetOption.maxWon - activity.costWon) / 1000;
  const companionshipScore = selection.companionship === 'with-someone' ? 8 : 5;
  const moodScore = 20;

  return moodScore + timeScore + budgetScore + companionshipScore;
}

export function recommendCourse(selection, activities) {
  const scoredActivities = activities
    .map((activity) => {
      const score = scoreActivity(activity, selection);

      if (score === null) {
        return null;
      }

      return {
        activity,
        score,
        summary: buildSelectionSummary(selection),
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.activity.maxMinutes !== right.activity.maxMinutes) {
        return left.activity.maxMinutes - right.activity.maxMinutes;
      }

      if (left.activity.costWon !== right.activity.costWon) {
        return left.activity.costWon - right.activity.costWon;
      }

      return left.activity.title.localeCompare(right.activity.title);
    });

  return scoredActivities[0] ?? null;
}
