import { Link } from 'react-router-dom'

import type { Post } from '../postTypes'

type PostListItemProps = {
  post: Post
}

const formatDateTime = (isoDate: string): string =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate))

export const PostListItem = ({ post }: PostListItemProps) => (
  <li className="post-list-item">
    <Link className="post-title-link" to={`/posts/${post.id}`}>
      {post.title}
    </Link>
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
  </li>
)
