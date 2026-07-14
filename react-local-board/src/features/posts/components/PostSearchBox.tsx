type PostSearchBoxProps = {
  value: string
  onChange: (value: string) => void
}

export const PostSearchBox = ({ value, onChange }: PostSearchBoxProps) => (
  <label className="search-box">
    <span>제목 검색</span>
    <input
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder="검색어를 입력하세요"
      type="search"
      value={value}
    />
  </label>
)
