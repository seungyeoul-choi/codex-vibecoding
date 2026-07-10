import { SELECT_FIELDS } from '../data/recommendationRules';

function SelectField({ field, value, onChange }) {
  const selectedOption = field.options.find((option) => option.value === value);

  return (
    <label className="field">
      <span className="field__label">{field.label}</span>
      <select
        className="field__control"
        name={field.name}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
      >
        <option value="">{field.placeholder}</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="field__hint">{selectedOption?.hint ?? field.placeholder}</span>
    </label>
  );
}

export default function PreferenceForm({ selection, onChange, onSubmit }) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel__header">
        <p className="eyebrow">추천 조건</p>
        <h2>오늘의 미니 코스 찾기</h2>
        <p className="panel__description">
          기분, 시간, 예산, 동행 여부를 선택한 뒤 추천하기를 누르면 조건에 맞는 코스를 보여줍니다.
        </p>
      </div>

      <div className="form-grid">
        {SELECT_FIELDS.map((field) => (
          <SelectField key={field.name} field={field} value={selection[field.name]} onChange={onChange} />
        ))}
      </div>

      <button className="primary-button" type="submit">
        추천하기
      </button>
    </form>
  );
}
