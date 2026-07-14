import { useCallback, useMemo, useState } from 'react'

import {
  createPost as createPostEntity,
  deletePost as deletePostEntity,
  findPostById,
  incrementViewCount as incrementPostViewCount,
  selectVisiblePosts,
  updatePost as updatePostEntity,
} from '../postService'
import type { Clock, IdFactory, Post, PostInput } from '../postTypes'
import {
  loadPosts,
  savePosts,
  type StorageError,
  type StorageLike,
} from '../../../services/postStorage'

export type UsePostsOptions = {
  storage?: StorageLike | null
  clock?: Clock
  idFactory?: IdFactory
}

export type UsePostsResult = {
  posts: Post[]
  readError: StorageError | null
  writeError: StorageError | null
  getPost: (postId: string) => Post | undefined
  getVisiblePosts: (query: string) => Post[]
  createPost: (input: PostInput) => Post | null
  updatePost: (postId: string, input: PostInput) => boolean
  deletePost: (postId: string) => boolean
  incrementViewCount: (postId: string) => boolean
  clearWriteError: () => void
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsResult => {
  const storage = options.storage
  const clock = options.clock
  const idFactory = options.idFactory

  const initialRead = useMemo(() => loadPosts(storage), [storage])
  const [posts, setPosts] = useState<Post[]>(initialRead.posts)
  const [readError] = useState<StorageError | null>(initialRead.error)
  const [writeError, setWriteError] = useState<StorageError | null>(null)

  const persistPosts = useCallback(
    (nextPosts: Post[]): boolean => {
      const result = savePosts(nextPosts, storage)

      if (!result.ok) {
        setWriteError(result.error)
        return false
      }

      setPosts(nextPosts)
      setWriteError(null)
      return true
    },
    [storage],
  )

  const getPost = useCallback(
    (postId: string): Post | undefined => findPostById(posts, postId),
    [posts],
  )

  const getVisiblePosts = useCallback(
    (query: string): Post[] => selectVisiblePosts(posts, query),
    [posts],
  )

  const createPost = useCallback(
    (input: PostInput): Post | null => {
      const post = createPostEntity(input, { clock, idFactory })
      const nextPosts = [post, ...posts]

      return persistPosts(nextPosts) ? post : null
    },
    [clock, idFactory, persistPosts, posts],
  )

  const updatePost = useCallback(
    (postId: string, input: PostInput): boolean => {
      if (!findPostById(posts, postId)) {
        return false
      }

      return persistPosts(updatePostEntity(posts, postId, input, clock))
    },
    [clock, persistPosts, posts],
  )

  const deletePost = useCallback(
    (postId: string): boolean => {
      if (!findPostById(posts, postId)) {
        return false
      }

      return persistPosts(deletePostEntity(posts, postId))
    },
    [persistPosts, posts],
  )

  const incrementViewCount = useCallback(
    (postId: string): boolean => {
      if (!findPostById(posts, postId)) {
        return false
      }

      return persistPosts(incrementPostViewCount(posts, postId))
    },
    [persistPosts, posts],
  )

  const clearWriteError = useCallback(() => {
    setWriteError(null)
  }, [])

  return {
    posts,
    readError,
    writeError,
    getPost,
    getVisiblePosts,
    createPost,
    updatePost,
    deletePost,
    incrementViewCount,
    clearWriteError,
  }
}
