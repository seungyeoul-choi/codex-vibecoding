import { describe, expect, it } from 'vitest'

import {
  createPost,
  deletePost,
  findPostById,
  incrementViewCount,
  searchPostsByTitle,
  selectVisiblePosts,
  sortPostsByNewest,
  updatePost,
} from './postService'
import type { Post } from './postTypes'

const makePost = (overrides: Partial<Post>): Post => ({
  id: 'post-1',
  title: '첫 번째 글',
  content: '내용',
  createdAt: '2026-07-14T01:00:00.000Z',
  updatedAt: '2026-07-14T01:00:00.000Z',
  viewCount: 0,
  ...overrides,
})

describe('postService', () => {
  it('게시글을 생성할 때 날짜와 조회수 기본값을 설정한다', () => {
    const post = createPost(
      {
        title: '  제목  ',
        content: '  내용  ',
      },
      {
        clock: () => '2026-07-14T02:00:00.000Z',
        idFactory: () => 'new-post',
      },
    )

    expect(post).toEqual({
      id: 'new-post',
      title: '제목',
      content: '내용',
      createdAt: '2026-07-14T02:00:00.000Z',
      updatedAt: '2026-07-14T02:00:00.000Z',
      viewCount: 0,
    })
  })

  it('게시글을 수정할 때 createdAt과 viewCount를 유지하고 updatedAt을 갱신한다', () => {
    const original = makePost({
      viewCount: 7,
      createdAt: '2026-07-13T01:00:00.000Z',
    })

    const updated = updatePost(
      [original],
      'post-1',
      {
        title: ' 수정 제목 ',
        content: ' 수정 내용 ',
      },
      () => '2026-07-14T03:00:00.000Z',
    )

    expect(updated[0]).toEqual({
      ...original,
      title: '수정 제목',
      content: '수정 내용',
      updatedAt: '2026-07-14T03:00:00.000Z',
    })
  })

  it('게시글을 삭제할 때 대상 게시글만 제거한다', () => {
    const posts = [makePost({ id: 'post-1' }), makePost({ id: 'post-2' })]

    expect(deletePost(posts, 'post-1')).toEqual([posts[1]])
  })

  it('게시글 id로 대상을 찾는다', () => {
    const post = makePost({ id: 'target' })

    expect(findPostById([makePost({ id: 'other' }), post], 'target')).toBe(post)
  })

  it('조회수를 1 증가시키고 원본 배열은 변경하지 않는다', () => {
    const post = makePost({ viewCount: 2 })
    const result = incrementViewCount([post], 'post-1')

    expect(result[0]?.viewCount).toBe(3)
    expect(post.viewCount).toBe(2)
  })

  it('제목 검색은 대소문자를 구분하지 않고 포함 여부로 찾는다', () => {
    const posts = [
      makePost({ id: 'react', title: 'React 게시판' }),
      makePost({ id: 'typescript', title: 'TypeScript 메모' }),
    ]

    expect(searchPostsByTitle(posts, 'react')).toEqual([posts[0]])
  })

  it('createdAt 내림차순으로 최신순 정렬한다', () => {
    const oldPost = makePost({
      id: 'old',
      createdAt: '2026-07-13T01:00:00.000Z',
    })
    const newPost = makePost({
      id: 'new',
      createdAt: '2026-07-14T01:00:00.000Z',
    })

    expect(sortPostsByNewest([oldPost, newPost])).toEqual([newPost, oldPost])
  })

  it('검색 결과를 최신순으로 반환한다', () => {
    const oldPost = makePost({
      id: 'old',
      title: 'React 오래된 글',
      createdAt: '2026-07-13T01:00:00.000Z',
    })
    const newPost = makePost({
      id: 'new',
      title: 'React 최신 글',
      createdAt: '2026-07-14T01:00:00.000Z',
    })
    const otherPost = makePost({
      id: 'other',
      title: '다른 글',
      createdAt: '2026-07-15T01:00:00.000Z',
    })

    expect(selectVisiblePosts([oldPost, otherPost, newPost], 'react')).toEqual([
      newPost,
      oldPost,
    ])
  })
})
