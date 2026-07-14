import type { Clock, IdFactory, Post, PostInput } from './postTypes'
import { normalizePostInput } from './postValidation'

const defaultClock: Clock = () => new Date().toISOString()

const defaultIdFactory: IdFactory = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const createPost = (
  input: PostInput,
  options: {
    clock?: Clock
    idFactory?: IdFactory
  } = {},
): Post => {
  const now = options.clock?.() ?? defaultClock()
  const normalized = normalizePostInput(input)

  return {
    id: options.idFactory?.() ?? defaultIdFactory(),
    title: normalized.title,
    content: normalized.content,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
  }
}

export const prependCreatedPost = (
  posts: readonly Post[],
  input: PostInput,
  options: {
    clock?: Clock
    idFactory?: IdFactory
  } = {},
): Post[] => [createPost(input, options), ...posts]

export const updatePost = (
  posts: readonly Post[],
  postId: string,
  input: PostInput,
  clock: Clock = defaultClock,
): Post[] =>
  posts.map((post) => {
    if (post.id !== postId) {
      return post
    }

    const normalized = normalizePostInput(input)

    return {
      ...post,
      title: normalized.title,
      content: normalized.content,
      updatedAt: clock(),
    }
  })

export const deletePost = (posts: readonly Post[], postId: string): Post[] =>
  posts.filter((post) => post.id !== postId)

export const findPostById = (
  posts: readonly Post[],
  postId: string,
): Post | undefined => posts.find((post) => post.id === postId)

export const incrementViewCount = (
  posts: readonly Post[],
  postId: string,
): Post[] =>
  posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          viewCount: post.viewCount + 1,
        }
      : post,
  )

export const searchPostsByTitle = (
  posts: readonly Post[],
  query: string,
): Post[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) {
    return [...posts]
  }

  return posts.filter((post) =>
    post.title.toLocaleLowerCase().includes(normalizedQuery),
  )
}

export const sortPostsByNewest = (posts: readonly Post[]): Post[] =>
  [...posts].sort((left, right) => {
    const byCreatedAt =
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()

    if (byCreatedAt !== 0) {
      return byCreatedAt
    }

    return right.id.localeCompare(left.id)
  })

export const selectVisiblePosts = (
  posts: readonly Post[],
  query: string,
): Post[] => sortPostsByNewest(searchPostsByTitle(posts, query))
