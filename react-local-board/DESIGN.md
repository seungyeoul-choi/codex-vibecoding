# React Local Board Design

## 설계 목표

`docs/PRD.md`를 기준으로 React, TypeScript, React Router, `localStorage` 기반 게시판을 설계한다.

## 페이지 및 라우팅 구조

| 경로 | 페이지 | 역할 |
| --- | --- | --- |
| `/` | Redirect | `/posts`로 이동 |
| `/posts` | `PostListPage` | 목록, 제목 검색, 최신순 정렬 |
| `/posts/new` | `PostCreatePage` | 게시글 작성 |
| `/posts/:postId` | `PostDetailPage` | 상세, 조회수 증가, 수정/삭제 진입 |
| `/posts/:postId/edit` | `PostEditPage` | 게시글 수정 |
| `*` | `NotFoundPage` | 존재하지 않는 경로 안내 |

## 컴포넌트 구조

```text
src/
  app/AppRouter.tsx
  pages/PostListPage.tsx
  pages/PostDetailPage.tsx
  pages/PostCreatePage.tsx
  pages/PostEditPage.tsx
  pages/NotFoundPage.tsx
  features/posts/components/
  features/posts/hooks/usePosts.ts
  features/posts/postService.ts
  features/posts/postValidation.ts
  features/posts/postTypes.ts
  storage/postStorage.ts
  storage/storageTypes.ts
```

## 설계 원칙

- 화면 컴포넌트는 `localStorage`를 직접 호출하지 않는다.
- 검색과 정렬은 저장 데이터를 변경하지 않는 파생 데이터로 처리한다.
- 상세 진입 시 조회수를 1 증가시키되, StrictMode 중복 실행은 `useRef` 등으로 방지한다.
- 삭제 전 확인 UI를 제공하고 삭제 후 `/posts`로 이동한다.

