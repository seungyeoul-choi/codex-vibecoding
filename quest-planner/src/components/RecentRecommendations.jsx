import { formatMinutes, formatWon } from '../utils/recommendCourse';

function formatSavedDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function RecentRecommendations({ items }) {
  return (
    <section className="panel recent-panel">
      <div className="panel__header">
        <p className="eyebrow">최근 추천</p>
        <h2>최근 추천 결과</h2>
        <p className="panel__description">최근 확인한 추천 결과 최대 3개를 저장해 다시 보여줍니다.</p>
      </div>

      {items.length === 0 ? (
        <p className="empty-copy">아직 저장된 추천이 없습니다. 조건을 선택하고 추천하기를 눌러보세요.</p>
      ) : (
        <ul className="recent-list">
          {items.map((item) => (
            <li className="recent-item" key={item.id}>
              <div className="recent-item__body">
                <strong>{item.activityTitle}</strong>
                <span>{item.description}</span>
                <p className="recent-item__meta">
                  {formatMinutes(item.timeMinutes)} · {formatWon(item.costWon)}
                </p>
                <div className="criteria-tags criteria-tags--compact">
                  {item.matchedCriteria.map((criteria) => (
                    <span className="criteria-tag" key={`${item.id}-${criteria.label}`}>
                      {criteria.label}: {criteria.value}
                    </span>
                  ))}
                </div>
              </div>
              <time className="recent-item__time" dateTime={item.savedAt}>
                {formatSavedDate(item.savedAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
