import { StrictMode } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppRouter } from '../app/AppRouter'
import type { Post } from '../features/posts/postTypes'
import { loadPosts, savePosts } from '../services/postStorage'

const oldPost: Post = {
  id: 'old-post',
  title: 'React 오래된 글',
  content: '오래된 내용',
  createdAt: '2026-07-13T01:00:00.000Z',
  updatedAt: '2026-07-13T01:00:00.000Z',
  viewCount: 2,
}

const newPost: Post = {
  id: 'new-post',
  title: 'TypeScript 최신 글',
  content: '최신 내용',
  createdAt: '2026-07-14T01:00:00.000Z',
  updatedAt: '2026-07-14T01:00:00.000Z',
  viewCount: 0,
}

const renderRoute = (route: string, strict = false) => {
  const tree = (
    <MemoryRouter initialEntries={[route]}>
      <AppRouter />
    </MemoryRouter>
  )

  return render(strict ? <StrictMode>{tree}</StrictMode> : tree)
}

describe('pages', () => {
  beforeEach(() => {
    cleanup()
    savePosts([])
  })

  it('게시글 목록을 최신순으로 표시하고 제목 검색을 적용한다', async () => {
    const user = userEvent.setup()
    savePosts([oldPost, newPost])

    renderRoute('/posts')

    const newestLink = screen.getByRole('link', {
      name: 'TypeScript 최신 글',
    })
    const oldLink = screen.getByRole('link', {
      name: 'React 오래된 글',
    })

    expect(
      newestLink.compareDocumentPosition(oldLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    await user.type(screen.getByLabelText('제목 검색'), 'react')

    expect(screen.getByText('React 오래된 글')).toBeInTheDocument()
    expect(screen.queryByText('TypeScript 최신 글')).not.toBeInTheDocument()
  })

  it('작성 폼에서 공백 입력 검증 오류를 표시한다', async () => {
    const user = userEvent.setup()

    renderRoute('/posts/new')

    await user.click(screen.getByRole('button', { name: '게시글 작성' }))

    expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument()
    expect(screen.getByText('내용을 입력해주세요.')).toBeInTheDocument()
  })

  it('작성 폼에서 제목과 내용을 키보드로 입력하고 게시글을 작성한다', async () => {
    const user = userEvent.setup()

    renderRoute('/posts/new')

    await user.type(screen.getByLabelText('제목'), 'BUG-001 제목')
    await user.type(screen.getByLabelText('내용'), 'BUG-001 내용')
    await user.click(screen.getByRole('button', { name: '게시글 작성' }))

    expect(await screen.findByText('BUG-001 제목')).toBeInTheDocument()
    expect(screen.getByText('BUG-001 내용')).toBeInTheDocument()
  })

  it('존재하지 않는 게시글 상세 접근 시 안내를 표시한다', () => {
    renderRoute('/posts/missing-post')

    expect(screen.getByText('게시글을 찾을 수 없습니다')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '목록으로 돌아가기' })).toHaveAttribute(
      'href',
      '/posts',
    )
  })

  it('StrictMode에서도 상세 진입 조회수를 한 번만 증가시킨다', async () => {
    savePosts([oldPost])

    renderRoute('/posts/old-post', true)

    await waitFor(() => {
      expect(loadPosts().posts[0]?.viewCount).toBe(3)
    })
  })

  it('알 수 없는 경로는 NotFound 화면을 표시한다', () => {
    renderRoute('/unknown')

    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument()
  })
})
