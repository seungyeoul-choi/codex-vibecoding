import { Link, Navigate, Route, Routes } from 'react-router-dom'

import { NotFoundPage } from '../pages/NotFoundPage'
import { PostCreatePage } from '../pages/PostCreatePage'
import { PostDetailPage } from '../pages/PostDetailPage'
import { PostEditPage } from '../pages/PostEditPage'
import { PostListPage } from '../pages/PostListPage'

export const AppRouter = () => (
  <div className="app-shell">
    <header className="app-header">
      <Link className="app-logo" to="/posts">
        Local Board
      </Link>
      <nav aria-label="주요 메뉴" className="app-nav">
        <Link to="/posts">게시글 목록</Link>
        <Link to="/posts/new">글쓰기</Link>
      </nav>
    </header>
    <main className="app-main">
      <Routes>
        <Route element={<Navigate to="/posts" replace />} path="/" />
        <Route element={<PostListPage />} path="/posts" />
        <Route element={<PostCreatePage />} path="/posts/new" />
        <Route element={<PostDetailPage />} path="/posts/:postId" />
        <Route element={<PostEditPage />} path="/posts/:postId/edit" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </main>
  </div>
)
