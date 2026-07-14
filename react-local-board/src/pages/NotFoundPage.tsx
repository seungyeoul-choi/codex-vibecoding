import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <section className="page-card">
    <p className="eyebrow">404</p>
    <h1>페이지를 찾을 수 없습니다</h1>
    <p className="muted">요청한 주소가 없거나 이동되었습니다.</p>
    <Link className="button primary" to="/posts">
      게시글 목록으로
    </Link>
  </section>
)
