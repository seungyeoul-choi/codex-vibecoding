import type { Post } from '../postTypes'

type PostDetailProps = {
  post: Post
}

const formatDateTime = (isoDate: string): string =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate))

export const PostDetail = ({ post }: PostDetailProps) => (
  <article className="post-detail">
    <header className="post-detail-header">
      <h2>{post.title}</h2>
      <dl className="post-meta">
        <div>
          <dt>작성일</dt>
          <dd>{formatDateTime(post.createdAt)}</dd>
        </div>
        <div>
          <dt>수정일</dt>
          <dd>{formatDateTime(post.updatedAt)}</dd>
        </div>
        <div>
          <dt>조회수</dt>
          <dd>{post.viewCount}</dd>
        </div>
      </dl>
    </header>
    <p className="post-content">{post.content}</p>
  </article>
)
