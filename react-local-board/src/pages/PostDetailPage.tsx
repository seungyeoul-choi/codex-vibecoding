import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { EmptyState } from '../features/posts/components/EmptyState'
import { ErrorMessage } from '../features/posts/components/ErrorMessage'
import { PostDetail } from '../features/posts/components/PostDetail'
import { usePosts } from '../features/posts/hooks/usePosts'

export const PostDetailPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { deletePost, getPost, incrementViewCount, readError, writeError } =
    usePosts()
  const incrementedPostIdsRef = useRef(new Set<string>())
  const post = postId ? getPost(postId) : undefined

  useEffect(() => {
    if (!postId || !post || incrementedPostIdsRef.current.has(postId)) {
      return
    }

    incrementedPostIdsRef.current.add(postId)
    incrementViewCount(postId)
  }, [incrementViewCount, post, postId])

  const handleDelete = () => {
    if (!post || !window.confirm('정말 이 게시글을 삭제할까요?')) {
      return
    }

    if (deletePost(post.id)) {
      navigate('/posts')
    }
  }

  return (
    <section className="page-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">상세</p>
          <h1>게시글 상세</h1>
        </div>
      </div>

      {readError ? <ErrorMessage message={readError.message} /> : null}
      {writeError ? <ErrorMessage danger message={writeError.message} /> : null}

      {post ? (
        <>
          <PostDetail post={post} />
          <div className="button-row">
            <Link className="button" to="/posts">
              목록으로
            </Link>
            <Link className="button primary" to={`/posts/${post.id}/edit`}>
              수정하기
            </Link>
            <button className="button danger" onClick={handleDelete} type="button">
              삭제하기
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          actionLabel="목록으로 돌아가기"
          actionTo="/posts"
          description="요청한 게시글이 없거나 삭제되었습니다."
          title="게시글을 찾을 수 없습니다"
        />
      )}
    </section>
  )
}
