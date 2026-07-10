import { useEffect, useState } from 'react';
import PreferenceForm from './components/PreferenceForm';
import RecommendationCard from './components/RecommendationCard';
import EmptyState from './components/EmptyState';
import RecentRecommendations from './components/RecentRecommendations';
import { INITIAL_SELECTION } from './data/recommendationRules';
import { mockActivities } from './data/mockActivities';
import { buildSelectionSummary, recommendCourse } from './utils/recommendCourse';
import {
  buildRecentRecommendationRecord,
  loadRecentRecommendations,
  mergeRecentRecommendations,
  saveRecentRecommendations,
} from './utils/recentRecommendations';

function buildRelaxationTips(selectionSummary) {
  const tips = [];

  const timeSummary = selectionSummary.find((item) => item.label === '시간')?.value;
  const budgetSummary = selectionSummary.find((item) => item.label === '예산')?.value;
  const moodSummary = selectionSummary.find((item) => item.label === '기분')?.value;

  if (timeSummary?.includes('1시간')) {
    tips.push('시간을 2시간 이내로 넓히면 선택지가 더 많아집니다.');
  }

  if (budgetSummary === '무료') {
    tips.push('예산을 1만원 이하로 늘리면 가벼운 실내 활동이 더 많이 보입니다.');
  }

  if (moodSummary === '차분한 기분') {
    tips.push('다른 분위기의 기분 조건도 함께 시도해보세요.');
  }

  if (tips.length === 0) {
    tips.push('시간 또는 예산 조건을 하나씩 넓혀보면 결과가 생길 수 있습니다.');
  }

  return tips.slice(0, 2);
}

function IdleState() {
  return (
    <article className="panel result-card empty-state">
      <div className="panel__header">
        <p className="eyebrow">시작 전</p>
        <h2>조건을 선택하면 추천을 시작할 수 있습니다</h2>
        <p className="panel__description">
          기분, 시간, 예산, 동행 여부를 입력한 뒤 추천하기를 눌러보세요.
        </p>
      </div>
    </article>
  );
}

export default function App() {
  const [selection, setSelection] = useState(INITIAL_SELECTION);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [recentRecommendations, setRecentRecommendations] = useState(() => loadRecentRecommendations());

  useEffect(() => {
    saveRecentRecommendations(recentRecommendations);
  }, [recentRecommendations]);

  function handleChange(field, value) {
    setSelection((currentSelection) => ({
      ...currentSelection,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setHasSubmitted(true);

    const recommendation = recommendCourse(selection, mockActivities);

    if (!recommendation) {
      setCurrentRecommendation(null);
      return;
    }

    setCurrentRecommendation(recommendation);
    const recentRecord = buildRecentRecommendationRecord(recommendation);

    setRecentRecommendations((currentRecords) => mergeRecentRecommendations(currentRecords, recentRecord));
  }

  const selectionSummary = buildSelectionSummary(selection);
  const emptyStateTips = buildRelaxationTips(selectionSummary);

  return (
    <main className="app-shell">
      <section className="hero panel">
        <p className="eyebrow">Weekend Quest Planner</p>
        <h1>주말이나 퇴근 후에 바로 실행할 수 있는 미니 코스를 추천합니다</h1>
        <p className="hero__description">
          외부 API 없이 mock data만 사용해, 오늘의 기분과 여유 시간에 맞는 한 가지 추천을 보여줍니다.
        </p>
      </section>

      <section className="workspace">
        <PreferenceForm selection={selection} onChange={handleChange} onSubmit={handleSubmit} />

        <div className="result-column">
          {!hasSubmitted ? (
            <IdleState />
          ) : currentRecommendation ? (
            <RecommendationCard recommendation={currentRecommendation} />
          ) : (
            <EmptyState selection={selectionSummary} tips={emptyStateTips} />
          )}
        </div>
      </section>

      <RecentRecommendations items={recentRecommendations} />
    </main>
  );
}
