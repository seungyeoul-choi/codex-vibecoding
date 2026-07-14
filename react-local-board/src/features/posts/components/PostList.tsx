import type { Post } from '../postTypes'
import { PostListItem } from './PostListItem'

type PostListProps = {
  posts: Post[]
}

export const PostList = ({ posts }: PostListProps) => (
  <ul className="post-list">
    {posts.map((post) => (
      <PostListItem key={post.id} post={post} />
    ))}
  </ul>
)
