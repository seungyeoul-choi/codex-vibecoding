import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Post } from '../postTypes'
import { usePosts } from './usePosts'
import {
  POSTS_STORAGE_KEY,
  type StorageLike,
} from '../../../services/postStorage'

const post: Post = {
  id: 'post-1',
  title: '기존 글',
  content: '기존 내용',
  createdAt: '2026-07-14T01:00:00.000Z',
  updatedAt: '2026-07-14T01:00:00.000Z',
  viewCount: 0,
}

const createMemoryStorage = (posts: Post[] = []): StorageLike => {
  const values = new Map<string, string>()

  values.set(
    POSTS_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      posts,
    }),
  )

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

describe('usePosts', () => {
  it('초기 로드에서 저장소 게시글을 상태로 가져온다', () => {
    const { result } = renderHook(() =>
      usePosts({
        storage: createMemoryStorage([post]),
      }),
    )

    expect(result.current.posts).toEqual([post])
    expect(result.current.readError).toBeNull()
  })

  it('게시글을 생성하고 저장소에 반영한다', () => {
    const storage = createMemoryStorage([])
    const { result } = renderHook(() =>
      usePosts({
        storage,
        clock: () => '2026-07-14T02:00:00.000Z',
        idFactory: () => 'created-post',
      }),
    )

    act(() => {
      const created = result.current.createPost({
        title: ' 새 글 ',
        content: ' 새 내용 ',
      })

      expect(created?.id).toBe('created-post')
    })

    expect(result.current.posts).toHaveLength(1)
    expect(result.current.posts[0]?.title).toBe('새 글')
    expect(storage.getItem(POSTS_STORAGE_KEY)).toContain('created-post')
  })

  it('게시글을 수정하고 삭제한다', () => {
    const storage = createMemoryStorage([post])
    const { result } = renderHook(() =>
      usePosts({
        storage,
        clock: () => '2026-07-14T03:00:00.000Z',
      }),
    )

    act(() => {
      expect(
        result.current.updatePost('post-1', {
          title: '수정 글',
          content: '수정 내용',
        }),
      ).toBe(true)
    })

    expect(result.current.posts[0]).toMatchObject({
      title: '수정 글',
      content: '수정 내용',
      createdAt: post.createdAt,
      updatedAt: '2026-07-14T03:00:00.000Z',
      viewCount: 0,
    })

    act(() => {
      expect(result.current.deletePost('post-1')).toBe(true)
    })

    expect(result.current.posts).toEqual([])
  })

  it('조회수를 증가시키고 파생 목록을 조회한다', () => {
    const storage = createMemoryStorage([post])
    const { result } = renderHook(() =>
      usePosts({
        storage,
      }),
    )

    act(() => {
      expect(result.current.incrementViewCount('post-1')).toBe(true)
    })

    expect(result.current.getPost('post-1')?.viewCount).toBe(1)
    expect(result.current.getVisiblePosts('기존')).toHaveLength(1)
  })

  it('저장소 읽기 실패를 readError로 노출한다', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('security')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }

    const { result } = renderHook(() =>
      usePosts({
        storage,
      }),
    )

    expect(result.current.posts).toEqual([])
    expect(result.current.readError?.kind).toBe('read-failed')
  })

  it('저장 실패를 writeError로 노출하고 상태를 유지한다', () => {
    const storage: StorageLike = {
      getItem: () =>
        JSON.stringify({
          version: 1,
          posts: [post],
        }),
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => undefined,
    }

    const { result } = renderHook(() =>
      usePosts({
        storage,
        idFactory: () => 'created-post',
      }),
    )

    act(() => {
      expect(
        result.current.createPost({
          title: '새 글',
          content: '새 내용',
        }),
      ).toBeNull()
    })

    expect(result.current.posts).toEqual([post])
    expect(result.current.writeError?.kind).toBe('write-failed')

    act(() => {
      result.current.clearWriteError()
    })

    expect(result.current.writeError).toBeNull()
  })
})
