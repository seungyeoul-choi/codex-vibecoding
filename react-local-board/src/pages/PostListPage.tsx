import { Link } from 'react-router-dom'
import { useState } from 'react'

import { EmptyState } from '../features/posts/components/EmptyState'
import { ErrorMessage } from '../features/posts/components/ErrorMessage'
import { PostList } from '../features/posts/components/PostList'
import { PostSearchBox } from '../features/posts/components/PostSearchBox'
import { usePosts } from '../features/posts/hooks/usePosts'

export const PostListPage = () => {
  const [query, setQuery] = useState('')
  const { posts, readError, getVisiblePosts } = usePosts()
  const visiblePosts = getVisiblePosts(query)

  return (
    <section className="page-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">게시판</p>
          <h1>게시글 목록</h1>
        </div>
        <Link className="button primary" to="/posts/new">
          새 글 작성
        </Link>
      </div>

      {readError ? <ErrorMessage message={readError.message} /> : null}

      <PostSearchBox onChange={setQuery} value={query} />

      {posts.length === 0 ? (
        <EmptyState
          actionLabel="첫 글 작성하기"
          actionTo="/posts/new"
          description="아직 작성된 게시글이 없습니다."
          title="게시글이 비어 있습니다"
        />
      ) : visiblePosts.length === 0 ? (
        <EmptyState
          description="검색어와 일치하는 제목의 게시글이 없습니다."
          title="검색 결과가 없습니다"
        />
      ) : (
        <PostList posts={visiblePosts} />
      )}
    </section>
  )
}
