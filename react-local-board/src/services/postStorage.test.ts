import { describe, expect, it } from 'vitest'

import type { Post } from '../features/posts/postTypes'
import {
  loadPosts,
  POSTS_STORAGE_KEY,
  savePosts,
  type StorageLike,
} from './postStorage'

const post: Post = {
  id: 'post-1',
  title: '제목',
  content: '내용',
  createdAt: '2026-07-14T01:00:00.000Z',
  updatedAt: '2026-07-14T01:00:00.000Z',
  viewCount: 0,
}

const createMemoryStorage = (initialValue?: string): StorageLike => {
  const values = new Map<string, string>()

  if (initialValue !== undefined) {
    values.set(POSTS_STORAGE_KEY, initialValue)
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

describe('postStorage', () => {
  it('저장된 게시글 payload를 읽는다', () => {
    const storage = createMemoryStorage(
      JSON.stringify({
        version: 1,
        posts: [post],
      }),
    )

    expect(loadPosts(storage)).toEqual({
      posts: [post],
      error: null,
    })
  })

  it('저장된 데이터가 없으면 빈 배열을 반환한다', () => {
    expect(loadPosts(createMemoryStorage())).toEqual({
      posts: [],
      error: null,
    })
  })

  it('깨진 JSON을 빈 배열과 오류로 복구한다', () => {
    const result = loadPosts(createMemoryStorage('{broken'))

    expect(result.posts).toEqual([])
    expect(result.error?.kind).toBe('invalid-json')
  })

  it('payload 구조가 다르면 빈 배열과 오류로 복구한다', () => {
    const result = loadPosts(
      createMemoryStorage(
        JSON.stringify({
          version: 1,
          posts: [{ ...post, viewCount: -1 }],
        }),
      ),
    )

    expect(result.posts).toEqual([])
    expect(result.error?.kind).toBe('invalid-payload')
  })

  it('버전이 다르면 빈 배열과 오류로 복구한다', () => {
    const result = loadPosts(
      createMemoryStorage(
        JSON.stringify({
          version: 2,
          posts: [post],
        }),
      ),
    )

    expect(result.posts).toEqual([])
    expect(result.error?.kind).toBe('invalid-payload')
  })

  it('getItem 예외를 읽기 실패로 반환한다', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('security')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }

    const result = loadPosts(storage)

    expect(result.posts).toEqual([])
    expect(result.error?.kind).toBe('read-failed')
  })

  it('게시글을 version 1 payload로 저장한다', () => {
    const storage = createMemoryStorage()

    expect(savePosts([post], storage)).toEqual({
      ok: true,
      error: null,
    })
    expect(loadPosts(storage)).toEqual({
      posts: [post],
      error: null,
    })
  })

  it('setItem 예외를 쓰기 실패로 반환한다', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => undefined,
    }

    const result = savePosts([post], storage)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('write-failed')
    }
  })

  it('저장소가 없으면 unavailable 오류를 반환한다', () => {
    expect(loadPosts(null).error?.kind).toBe('unavailable')
    const result = savePosts([post], null)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('unavailable')
    }
  })
})
