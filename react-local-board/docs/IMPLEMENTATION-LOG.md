# 구현 진행 로그

## T001 프로젝트 의존성 설정

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `package.json`
  - `package-lock.json`
  - `vitest.config.ts`
  - `src/test/setup.ts`
  - `src/test/smoke.test.ts`
- 구현 내용:
  - `react-router-dom`을 추가했다.
  - `vitest`, `jsdom`, React Testing Library 관련 패키지를 추가했다.
  - `npm test -- --run`으로 실행 가능한 테스트 스크립트를 추가했다.
  - jsdom 기반 Vitest 설정과 초기 smoke test를 추가했다.
- 검증 결과:
  - `npm test -- --run`: 성공, 테스트 1개 통과
  - `npm run build`: 성공
- 환경 메모:
  - Codex Windows 셸에서 `SystemRoot`, `windir`, `ComSpec`, `APPDATA`, `LOCALAPPDATA` 등 핵심 환경 변수를 명시하지 않으면 Node/npm 실행 시 `ncrypto::CSPRNG(nullptr, 0)` 오류가 발생한다.
  - 검증 명령 실행 전 해당 환경 변수를 현재 셸에 설정해 우회했다.

## T002 Post 타입과 저장소 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/features/posts/postTypes.ts`
  - `src/features/posts/postService.ts`
  - `src/features/posts/postValidation.ts`
  - `src/services/postStorage.ts`
  - `src/features/posts/postService.test.ts`
  - `src/features/posts/postValidation.test.ts`
  - `src/services/postStorage.test.ts`
- 구현 내용:
  - PRD 기준 `Post` 타입과 작성/수정 입력 타입을 추가했다.
  - 게시글 생성, 수정, 삭제, 조회수 증가, 제목 검색, 최신순 정렬 순수 함수를 추가했다.
  - trim 기반 제목/내용 필수 검증과 필드별 오류를 추가했다.
  - `version: 1` payload를 사용하는 `localStorage` 저장소 계층을 `src/services/postStorage.ts`에 구현했다.
  - 깨진 JSON, 잘못된 payload, 버전 불일치, 읽기/쓰기 예외, 저장소 없음 오류를 처리했다.
- 검증 결과:
  - `rg "localStorage" src`: `src/services/postStorage.ts`에서만 참조 확인
  - `npm test -- --run src/features/posts src/services`: 성공, 테스트 20개 통과
  - `npm run build`: 성공

## T003 게시글 상태 Hook 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/features/posts/hooks/usePosts.ts`
  - `src/features/posts/hooks/usePosts.test.tsx`
- 구현 내용:
  - 저장소 초기 로드, 생성, 수정, 삭제, 조회수 증가 액션을 제공하는 `usePosts` 훅을 추가했다.
  - 읽기 오류와 쓰기 오류 상태를 분리해 노출했다.
  - 테스트에서 fake `StorageLike`를 주입할 수 있게 했다.
  - 화면 계층이 저장소 계층을 직접 호출하지 않아도 되도록 도메인 함수와 저장소 함수를 훅 내부에서 조합했다.
- 검증 결과:
  - `rg "localStorage" src`: `src/services/postStorage.ts`에서만 참조 확인
  - `npm test -- --run src/features/posts/hooks`: 성공, 테스트 6개 통과
  - `npm run build`: 성공

## T004 라우터와 레이아웃 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/main.tsx`
  - `src/App.tsx`
  - `src/app/AppRouter.tsx`
  - `src/pages/PostListPage.tsx`
  - `src/pages/PostCreatePage.tsx`
  - `src/pages/PostDetailPage.tsx`
  - `src/pages/PostEditPage.tsx`
  - `src/pages/NotFoundPage.tsx`
  - `src/App.css`
  - `src/index.css`
- 구현 내용:
  - `BrowserRouter`를 적용했다.
  - `/`에서 `/posts`로 리다이렉트하도록 구성했다.
  - `/posts`, `/posts/new`, `/posts/:postId`, `/posts/:postId/edit`, `*` 라우트를 추가했다.
  - 공통 헤더, 내비게이션, 기본 페이지 카드 레이아웃을 구성했다.
- 검증 결과:
  - `npm test -- --run`: 성공, 테스트 27개 통과
  - `npm run build`: 성공

## T005 게시글 목록과 검색 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/pages/PostListPage.tsx`
  - `src/features/posts/components/PostList.tsx`
  - `src/features/posts/components/PostListItem.tsx`
  - `src/features/posts/components/PostSearchBox.tsx`
  - `src/features/posts/components/EmptyState.tsx`
  - `src/App.css`
- 구현 내용:
  - 게시글 목록 화면을 `usePosts` 훅과 연결했다.
  - 제목 검색 입력을 추가했다.
  - `createdAt` 내림차순 최신순 정렬과 제목 포함 검색을 적용했다.
  - 제목, 작성일, 수정일, 조회수를 목록에 표시했다.
  - 게시글 없음과 검색 결과 없음 상태를 분리했다.
- 검증 결과:
  - `npm test -- --run src/features/posts/postService.test.ts`: 성공, 테스트 8개 통과
  - `npm run build`: 성공

## T006 게시글 상세 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/pages/PostDetailPage.tsx`
  - `src/features/posts/components/PostDetail.tsx`
  - `src/App.css`
- 구현 내용:
  - 상세 화면에 제목, 내용, 작성일, 수정일, 조회수를 표시했다.
  - 상세 진입 시 조회수를 1 증가하도록 연결했다.
  - React StrictMode effect 중복 실행에 대비해 `postId`별 1회 증가 guard를 추가했다.
  - 존재하지 않는 게시글 ID 접근 시 목록으로 돌아가는 안내를 표시했다.
  - 상세 화면에서 수정 화면으로 이동할 수 있게 했다.
- 검증 결과:
  - `npm test -- --run src/features/posts/postService.test.ts src/features/posts/hooks`: 성공, 테스트 14개 통과
  - `npm run build`: 성공

## T007 작성과 수정 폼 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/pages/PostCreatePage.tsx`
  - `src/pages/PostEditPage.tsx`
  - `src/features/posts/components/PostForm.tsx`
  - `src/App.css`
- 구현 내용:
  - 작성/수정 공통 `PostForm` 컴포넌트를 추가했다.
  - 제목/내용 trim 필수 검증과 필드별 오류 표시를 연결했다.
  - 작성 성공 후 새 게시글 상세 화면으로 이동하도록 구현했다.
  - 수정 성공 후 기존 게시글 상세 화면으로 이동하도록 구현했다.
  - 수정 화면에서 기존 제목/내용을 초기값으로 표시한다.
  - 존재하지 않는 수정 대상은 안내 상태로 처리한다.
- 검증 결과:
  - `npm test -- --run src/features/posts/postValidation.test.ts src/features/posts`: 성공, 테스트 17개 통과
  - `npm run build`: 성공

## T008 삭제와 예외 처리 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/pages/PostDetailPage.tsx`
  - `src/pages/PostCreatePage.tsx`
  - `src/pages/PostEditPage.tsx`
  - `src/pages/PostListPage.tsx`
  - `src/features/posts/components/ErrorMessage.tsx`
  - `src/App.css`
- 구현 내용:
  - 상세 화면에 삭제 버튼과 삭제 전 확인 절차를 추가했다.
  - 삭제 성공 후 `/posts`로 이동하도록 구현했다.
  - 읽기/쓰기 저장소 오류를 사용자에게 보이는 오류 메시지로 표시했다.
  - 존재하지 않는 게시글 상세/수정 접근은 목록 이동 안내로 처리했다.
  - `localStorage` 접근은 계속 `src/services/postStorage.ts`에만 유지했다.
- 검증 결과:
  - `rg "localStorage" src`: `src/services/postStorage.ts`에서만 참조 확인
  - `npm test -- --run src/services src/features/posts`: 성공, 테스트 26개 통과
  - `npm run build`: 성공

## T009 테스트 구현

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/pages/pages.test.tsx`
- 구현 내용:
  - 목록 화면 최신순 표시와 제목 검색 smoke 테스트를 추가했다.
  - 작성 폼 검증 오류 표시 테스트를 추가했다.
  - 존재하지 않는 게시글 상세 안내 테스트를 추가했다.
  - React StrictMode에서도 상세 진입 조회수가 한 번만 증가하는 회귀 테스트를 추가했다.
  - NotFound 라우트 smoke 테스트를 추가했다.
- 검증 결과:
  - `rg "localStorage" src`: `src/services/postStorage.ts`에서만 참조 확인
  - `npm test -- --run`: 성공, 테스트 32개 통과(BUG-001 수정 이전 기준)
  - `npm run build`: 성공

## T010 문서와 최종 검증

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `README.md`
  - `docs/TASKS.md`
  - `docs/TEST-PLAN.md`
  - `docs/ARCHITECTURE.md`
  - `docs/IMPLEMENTATION-LOG.md`
- 구현 내용:
  - README에 설치, 실행, 테스트, 빌드, 구조, 라우팅, 테스트 범위를 기록했다.
  - `docs/TASKS.md`에 T001~T010 완료 상태와 최종 검증 명령을 기록했다.
  - `docs/TEST-PLAN.md`에 화면 smoke와 StrictMode 조회수 중복 방지 테스트를 반영했다.
  - `docs/ARCHITECTURE.md`에 `localStorage` 접근 전용 파일 경계를 명시했다.
- 최종 검증 결과:
  - `rg "\bany\b" src`: 결과 없음
  - `rg "localStorage" src`: `src/services/postStorage.ts`에서만 참조 확인
  - `npm test -- --run`: 성공, 테스트 32개 통과(BUG-001 수정 이전 기준)
  - `npm run build`: 성공
  - `npm run lint`: 성공
- 남은 리스크:
  - 데이터는 브라우저 단일 사용자 `localStorage`에 저장되므로 브라우저/기기 간 동기화는 지원하지 않는다.
  - 깨진 저장 데이터는 빈 배열로 복구하고 오류 메시지를 표시한다.

## BUG-001 게시글 작성/수정 폼 입력 시 흰 화면 오류

- 상태: 완료
- 완료 시각: 2026-07-14
- 변경 파일:
  - `src/features/posts/components/PostForm.tsx`
  - `src/pages/pages.test.tsx`
  - `docs/PRD.md`
  - `docs/TASKS.md`
  - `docs/TEST-PLAN.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DEBUG-LOG.md`
  - `docs/IMPLEMENTATION-LOG.md`
- 원인:
  - `PostForm.tsx`의 `onChange`에서 `event.currentTarget.value`를 state updater 내부에서 읽어 입력 중 `currentTarget`이 `null`이 되는 런타임 오류가 발생했다.
- 구현 내용:
  - 제목/내용 `onChange` 핸들러 시작 시점에 `const value = event.currentTarget.value`로 값을 보관하도록 수정했다.
  - state updater 내부에서는 이벤트 객체를 직접 참조하지 않도록 했다.
  - 작성 폼에서 제목/내용을 키보드로 입력하고 제출하는 회귀 테스트를 추가했다.
  - 테스트 간 DOM 잔존 방지를 위해 `cleanup()`을 추가했다.
- 검증 결과:
  - RED: 회귀 테스트가 수정 전 `Cannot read properties of null (reading 'value')` 오류로 실패함을 확인했다.
  - `npm test -- --run src/pages/pages.test.tsx`: 성공, 테스트 6개 통과
  - `npm test -- --run`: 성공, 테스트 33개 통과
  - `npm run build`: 성공
  - `npm run lint`: 성공
  - 브라우저 수동 확인: `/posts/new`에서 제목/내용 입력 시 흰 화면 없음, Console warning/error 없음
