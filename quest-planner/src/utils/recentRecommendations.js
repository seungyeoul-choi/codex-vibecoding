import { formatMinutes, formatWon } from './recommendCourse';

const STORAGE_KEY = 'weekend-quest-planner:recent-recommendations';

export function loadRecentRecommendations() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue;
  } catch {
    return [];
  }
}

export function saveRecentRecommendations(records) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function buildRecentRecommendationRecord(recommendation) {
  const savedAt = new Date().toISOString();

  return {
    id: `${recommendation.activity.id}-${savedAt}`,
    activityId: recommendation.activity.id,
    activityTitle: recommendation.activity.title,
    description: recommendation.activity.description,
    timeMinutes: recommendation.activity.maxMinutes,
    costWon: recommendation.activity.costWon,
    timeLabel: formatMinutes(recommendation.activity.maxMinutes),
    costLabel: formatWon(recommendation.activity.costWon),
    matchedCriteria: recommendation.summary,
    savedAt,
  };
}

export function mergeRecentRecommendations(records, nextRecord) {
  const dedupedRecords = records.filter((record) => record.activityId !== nextRecord.activityId);
  return [nextRecord, ...dedupedRecords].slice(0, 3);
}
