import { formatMinutes, formatWon } from '../utils/recommendCourse';

export default function RecommendationCard({ recommendation }) {
  return (
    <article className="panel result-card">
      <div className="panel__header">
        <p className="eyebrow">추천 결과</p>
        <h2>{recommendation.activity.title}</h2>
        <p className="panel__description">{recommendation.activity.description}</p>
      </div>

      <div className="result-metrics">
        <div className="metric">
          <span className="metric__label">예상 시간</span>
          <strong className="metric__value">{formatMinutes(recommendation.activity.maxMinutes)}</strong>
        </div>
        <div className="metric">
          <span className="metric__label">예상 비용</span>
          <strong className="metric__value">{formatWon(recommendation.activity.costWon)}</strong>
        </div>
      </div>

      <div className="criteria-block">
        <h3>일치한 조건</h3>
        <div className="criteria-tags">
          {recommendation.summary.map((item) => (
            <span className="criteria-tag" key={item.label}>
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
