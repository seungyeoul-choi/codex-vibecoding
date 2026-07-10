export default function EmptyState({ selection, tips }) {
  return (
    <article className="panel result-card empty-state">
      <div className="panel__header">
        <p className="eyebrow">결과 없음</p>
        <h2>조건에 맞는 코스를 찾지 못했습니다</h2>
        <p className="panel__description">
          선택한 조건을 조금 넓히면 더 많은 미니 코스를 확인할 수 있습니다.
        </p>
      </div>

      <div className="criteria-block">
        <h3>현재 선택 조건</h3>
        <ul className="summary-list">
          {selection.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.value || '미선택'}</span>
            </li>
          ))}
        </ul>
      </div>

      {tips.length > 0 ? (
        <div className="criteria-block">
          <h3>조건 완화 팁</h3>
          <ul className="tip-list">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
