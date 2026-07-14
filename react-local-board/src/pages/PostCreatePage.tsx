import { Link, useNavigate } from 'react-router-dom'

import { ErrorMessage } from '../features/posts/components/ErrorMessage'
import { PostForm } from '../features/posts/components/PostForm'
import { usePosts } from '../features/posts/hooks/usePosts'
import type { PostInput } from '../features/posts/postTypes'

export const PostCreatePage = () => {
  const navigate = useNavigate()
  const { createPost, writeError } = usePosts()

  const handleSubmit = (input: PostInput): boolean => {
    const post = createPost(input)

    if (!post) {
      return false
    }

    navigate(`/posts/${post.id}`)
    return true
  }

  return (
    <section className="page-card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">작성</p>
          <h1>새 게시글 작성</h1>
        </div>
      </div>
      {writeError ? <ErrorMessage danger message={writeError.message} /> : null}
      <PostForm onSubmit={handleSubmit} submitLabel="게시글 작성" />
      <Link className="button" to="/posts">
        목록으로
      </Link>
    </section>
  )
}
