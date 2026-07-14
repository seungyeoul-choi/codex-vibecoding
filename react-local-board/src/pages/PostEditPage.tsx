import { Link, useNavigate, useParams } from 'react-router-dom'

import { EmptyState } from '../features/posts/components/EmptyState'
import { ErrorMessage } from '../features/posts/components/ErrorMessage'
import { PostForm } from '../features/posts/components/PostForm'
import { usePosts } from '../features/posts/hooks/usePosts'
import type { PostInput } from '../features/posts/postTypes'

export const PostEditPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { getPost, updatePost, readError, writeError } = usePosts()
  const post = postId ? getPost(postId) : undefined

  const handleSubmit = (input: PostInput): boolean => {
    if (!postId || !updatePost(postId, input)) {
      return false
    }

    navigate(`/posts/${postId}`)
    return true
  }

  return (
    <section className="page-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">수정</p>
          <h1>게시글 수정</h1>
        </div>
      </div>
      {readError ? <ErrorMessage message={readError.message} /> : null}
      {writeError ? <ErrorMessage danger message={writeError.message} /> : null}
      {post ? (
        <>
          <PostForm
            initialValue={{
              title: post.title,
              content: post.content,
            }}
            onSubmit={handleSubmit}
            submitLabel="수정 완료"
          />
          <Link className="button" to={`/posts/${post.id}`}>
            상세로 돌아가기
          </Link>
        </>
      ) : (
        <EmptyState
          actionLabel="목록으로 돌아가기"
          actionTo="/posts"
          description="수정하려는 게시글이 없거나 삭제되었습니다."
          title="게시글을 찾을 수 없습니다"
        />
      )}
    </section>
  )
}
