import type { Post } from '../features/posts/postTypes'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type StorageErrorKind =
  | 'unavailable'
  | 'read-failed'
  | 'write-failed'
  | 'invalid-json'
  | 'invalid-payload'

export type StorageError = {
  kind: StorageErrorKind
  message: string
}

export type StorageReadResult = {
  posts: Post[]
  error: StorageError | null
}

export type StorageWriteResult =
  | {
      ok: true
      error: null
    }
  | {
      ok: false
      error: StorageError
    }

type StoredPostsPayload = {
  version: 1
  posts: Post[]
}

export const POSTS_STORAGE_KEY = 'react-local-board:posts'

const CURRENT_VERSION = 1

const createStorageError = (
  kind: StorageErrorKind,
  message: string,
): StorageError => ({
  kind,
  message,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isPost = (value: unknown): value is Post => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.content === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.viewCount === 'number' &&
    Number.isInteger(value.viewCount) &&
    value.viewCount >= 0
  )
}

const isStoredPostsPayload = (value: unknown): value is StoredPostsPayload => {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.version === CURRENT_VERSION &&
    Array.isArray(value.posts) &&
    value.posts.every(isPost)
  )
}

const getDefaultStorage = (): StorageLike | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

export const loadPosts = (
  storage: StorageLike | null = getDefaultStorage(),
): StorageReadResult => {
  if (!storage) {
    return {
      posts: [],
      error: createStorageError(
        'unavailable',
        '게시글 저장소를 사용할 수 없습니다.',
      ),
    }
  }

  let raw: string | null

  try {
    raw = storage.getItem(POSTS_STORAGE_KEY)
  } catch {
    return {
      posts: [],
      error: createStorageError(
        'read-failed',
        '게시글 저장소를 읽지 못했습니다.',
      ),
    }
  }

  if (raw === null) {
    return {
      posts: [],
      error: null,
    }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      posts: [],
      error: createStorageError(
        'invalid-json',
        '저장된 게시글 데이터가 올바른 JSON이 아닙니다.',
      ),
    }
  }

  if (!isStoredPostsPayload(parsed)) {
    return {
      posts: [],
      error: createStorageError(
        'invalid-payload',
        '저장된 게시글 데이터 구조가 올바르지 않습니다.',
      ),
    }
  }

  return {
    posts: parsed.posts,
    error: null,
  }
}

export const savePosts = (
  posts: readonly Post[],
  storage: StorageLike | null = getDefaultStorage(),
): StorageWriteResult => {
  if (!storage) {
    return {
      ok: false,
      error: createStorageError(
        'unavailable',
        '게시글 저장소를 사용할 수 없습니다.',
      ),
    }
  }

  const payload: StoredPostsPayload = {
    version: CURRENT_VERSION,
    posts: [...posts],
  }

  try {
    storage.setItem(POSTS_STORAGE_KEY, JSON.stringify(payload))
    return {
      ok: true,
      error: null,
    }
  } catch {
    return {
      ok: false,
      error: createStorageError(
        'write-failed',
        '게시글 데이터를 저장하지 못했습니다.',
      ),
    }
  }
}
