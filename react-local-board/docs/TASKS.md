# 작업 현황

이 문서는 최종 검증 결과를 기준으로 실제 구현·검증된 작업 상태를 기록한다.

## 상태 기준

- `완료`: 구현이 끝났고 관련 테스트와 빌드가 통과했다.
- `구현 완료`: 코드 작성은 끝났지만 테스트 또는 빌드 검증이 끝나지 않았다.
- `보류`: 아직 구현하지 않았거나 범위 밖으로 남겨둔 작업이다.
- `차단`: 외부 조건이나 권한 문제로 진행할 수 없는 작업이다.

## 최종 검증 기준

- 최종 기준일: 2026-07-14
- 최종 전체 테스트: `npm test -- --run` 성공, 33개 통과
- 최종 빌드: `npm run build` 성공
- 최종 lint: `npm run lint` 성공
- 수동 확인: `/posts/new`에서 제목/내용 입력 시 흰 화면 없음, Console warning/error 없음
- 알려진 문제 목록: [docs/KNOWN-ISSUES.md](./KNOWN-ISSUES.md)

## Tasks

### T001 프로젝트 의존성 설정

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
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
- 실행한 검증:
  - `npm test -- --run`
  - `npm run build`
- 검증 결과:
  - 초기 테스트 1개 통과
  - 빌드 성공
- 남은 문제:
  - Codex Windows 셸에서 Node/npm 실행 시 핵심 환경 변수가 누락되면 CSPRNG 오류가 발생할 수 있다. 자세한 내용은 [KI-003](./KNOWN-ISSUES.md#ki-003-codex-windows-셸-nodenpm-환경-변수-이슈)을 참고한다.
- 변경 이유:
  - 원래 계획의 `vite.config.ts 또는 vitest.config.ts` 중 테스트 설정 분리를 위해 `vitest.config.ts`를 사용했다.

### T002 Post 타입과 저장소 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
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
  - `version: 1` payload를 사용하는 `localStorage` 저장소 계층을 구현했다.
  - 깨진 JSON, 잘못된 payload, 버전 불일치, 읽기/쓰기 예외, 저장소 없음 오류를 처리했다.
- 실행한 검증:
  - `rg "localStorage" src`
  - `npm test -- --run src/features/posts src/services`
  - `npm run build`
- 검증 결과:
  - `localStorage` 직접 참조는 `src/services/postStorage.ts`에서만 확인
  - 관련 테스트 20개 통과
  - 빌드 성공
- 남은 문제:
  - 깨진 저장 데이터는 복구를 위해 빈 배열로 대체된다. 자세한 내용은 [KI-002](./KNOWN-ISSUES.md#ki-002-깨진-localstorage-데이터는-빈-목록으로-복구됨)을 참고한다.
- 변경 이유:
  - 원래 계획은 `src/storage/postStorage.ts`였으나, 사용자 최신 규칙에 따라 `localStorage` 접근 위치를 `src/services/postStorage.ts`로 고정했다.

### T003 게시글 상태 Hook 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `src/features/posts/hooks/usePosts.ts`
  - `src/features/posts/hooks/usePosts.test.tsx`
- 구현 내용:
  - 저장소 초기 로드, 생성, 수정, 삭제, 조회수 증가 액션을 제공하는 `usePosts` 훅을 추가했다.
  - 읽기 오류와 쓰기 오류 상태를 분리해 노출했다.
  - 테스트에서 fake `StorageLike`를 주입할 수 있게 했다.
  - 화면 계층이 저장소 계층을 직접 호출하지 않도록 도메인 함수와 저장소 함수를 훅 내부에서 조합했다.
- 실행한 검증:
  - `rg "localStorage" src`
  - `npm test -- --run src/features/posts/hooks`
  - `npm run build`
- 검증 결과:
  - `localStorage` 직접 참조는 `src/services/postStorage.ts`에서만 확인
  - 훅 테스트 6개 통과
  - 빌드 성공
- 남은 문제:
  - 없음
- 변경 이유:
  - 원래 계획의 저장소 경로를 `src/services/postStorage.ts`로 변경했다.

### T004 라우터와 레이아웃 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
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
- 실행한 검증:
  - `npm test -- --run`
  - `npm run build`
- 검증 결과:
  - 당시 전체 테스트 27개 통과
  - 빌드 성공
- 남은 문제:
  - 없음
- 변경 이유:
  - 없음

### T005 게시글 목록과 검색 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
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
- 실행한 검증:
  - `npm test -- --run src/features/posts/postService.test.ts`
  - `npm run build`
- 검증 결과:
  - postService 테스트 8개 통과
  - 빌드 성공
- 남은 문제:
  - 없음
- 변경 이유:
  - 없음

### T006 게시글 상세 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `src/pages/PostDetailPage.tsx`
  - `src/features/posts/components/PostDetail.tsx`
  - `src/App.css`
- 구현 내용:
  - 상세 화면에 제목, 내용, 작성일, 수정일, 조회수를 표시했다.
  - 상세 진입 시 조회수를 1 증가하도록 연결했다.
  - React StrictMode effect 중복 실행에 대비해 `postId`별 1회 증가 guard를 추가했다.
  - 존재하지 않는 게시글 ID 접근 시 목록으로 돌아가는 안내를 표시했다.
  - 상세 화면에서 수정 화면으로 이동할 수 있게 했다.
- 실행한 검증:
  - `npm test -- --run src/features/posts/postService.test.ts src/features/posts/hooks`
  - `npm run build`
- 검증 결과:
  - 관련 테스트 14개 통과
  - 빌드 성공
- 남은 문제:
  - 없음
- 변경 이유:
  - React StrictMode에서 effect가 중복 실행될 수 있어 조회수 중복 증가 방지 guard를 추가했다.

### T007 작성과 수정 폼 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `src/pages/PostCreatePage.tsx`
  - `src/pages/PostEditPage.tsx`
  - `src/features/posts/components/PostForm.tsx`
  - `src/App.css`
- 구현 내용:
  - 작성/수정 공통 `PostForm` 컴포넌트를 추가했다.
  - 제목/내용 trim 필수 검증과 필드별 오류 표시를 연결했다.
  - 작성 성공 후 새 게시글 상세 화면으로 이동하도록 구현했다.
  - 수정 성공 후 기존 게시글 상세 화면으로 이동하도록 구현했다.
  - 수정 화면에서 기존 제목/내용을 초기값으로 표시했다.
  - 존재하지 않는 수정 대상은 안내 상태로 처리했다.
- 실행한 검증:
  - `npm test -- --run src/features/posts/postValidation.test.ts src/features/posts`
  - `npm run build`
- 검증 결과:
  - 관련 테스트 17개 통과
  - 빌드 성공
- 남은 문제:
  - BUG-001로 작성 폼 입력 중 흰 화면 오류가 이후 발견되었고 수정 완료했다.
- 변경 이유:
  - PRD의 “작성 성공 후 상세 또는 목록 이동” 중 상세 화면 이동으로 정책을 고정했다.

### T008 삭제와 예외 처리 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
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
- 실행한 검증:
  - `rg "localStorage" src`
  - `npm test -- --run src/services src/features/posts`
  - `npm run build`
- 검증 결과:
  - `localStorage` 직접 참조는 `src/services/postStorage.ts`에서만 확인
  - 관련 테스트 26개 통과
  - 빌드 성공
- 남은 문제:
  - 없음
- 변경 이유:
  - 없음

### T009 테스트 구현

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `src/pages/pages.test.tsx`
- 구현 내용:
  - 목록 화면 최신순 표시와 제목 검색 smoke 테스트를 추가했다.
  - 작성 폼 검증 오류 표시 테스트를 추가했다.
  - 존재하지 않는 게시글 상세 안내 테스트를 추가했다.
  - React StrictMode에서도 상세 진입 조회수가 한 번만 증가하는 회귀 테스트를 추가했다.
  - NotFound 라우트 smoke 테스트를 추가했다.
- 실행한 검증:
  - `rg "localStorage" src`
  - `npm test -- --run`
  - `npm run build`
- 검증 결과:
  - `localStorage` 직접 참조는 `src/services/postStorage.ts`에서만 확인
  - 당시 전체 테스트 32개 통과(BUG-001 수정 이전 기준)
  - 빌드 성공
- 남은 문제:
  - BUG-001 수정 후 전체 테스트는 33개 통과로 갱신되었다.
- 변경 이유:
  - 없음

### T010 문서와 최종 검증

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `README.md`
  - `docs/TASKS.md`
  - `docs/TEST-PLAN.md`
  - `docs/ARCHITECTURE.md`
  - `docs/IMPLEMENTATION-LOG.md`
- 구현 내용:
  - README에 설치, 실행, 테스트, 빌드, 구조, 라우팅, 테스트 범위를 기록했다.
  - 작업 목록과 테스트 계획을 구현 결과에 맞게 정리했다.
  - `localStorage` 접근 전용 파일 경계를 명시했다.
- 실행한 검증:
  - `rg "\bany\b" src`
  - `rg "localStorage" src`
  - `npm test -- --run`
  - `npm run build`
  - `npm run lint`
- 검증 결과:
  - `any` 타입 사용 없음
  - `localStorage` 직접 참조는 `src/services/postStorage.ts`에서만 확인
  - 당시 전체 테스트 32개 통과(BUG-001 수정 이전 기준)
  - 빌드 성공
  - lint 성공
- 남은 문제:
  - 단일 브라우저 `localStorage` 기반 저장의 한계는 [KI-001](./KNOWN-ISSUES.md#ki-001-localstorage-단일-브라우저-저장-한계)를 참고한다.
  - 깨진 저장 데이터 복구 방식은 [KI-002](./KNOWN-ISSUES.md#ki-002-깨진-localstorage-데이터는-빈-목록으로-복구됨)을 참고한다.
- 변경 이유:
  - 없음

### BUG-001 게시글 작성/수정 폼 입력 시 흰 화면 오류

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `src/features/posts/components/PostForm.tsx`
  - `src/pages/pages.test.tsx`
  - `docs/DEBUG-LOG.md`
  - `docs/TASKS.md`
  - `docs/TEST-PLAN.md`
  - `docs/ARCHITECTURE.md`
  - `docs/PRD.md`
  - `docs/IMPLEMENTATION-LOG.md`
- 구현 내용:
  - `PostForm.tsx`의 제목/내용 `onChange`에서 `event.currentTarget.value`를 핸들러 시작 시점에 지역 변수로 저장하도록 수정했다.
  - state updater 내부에서는 React 이벤트 객체를 직접 참조하지 않도록 했다.
  - 작성 폼에서 제목/내용을 키보드로 입력하고 제출하는 회귀 테스트를 추가했다.
  - 테스트 간 DOM 잔존 방지를 위해 `cleanup()`을 추가했다.
  - 관련 문서에 원인, 수정 결과, 검증 결과를 반영했다.
- 실행한 검증:
  - RED 확인: `npm test -- --run src/pages/pages.test.tsx`
  - `npm test -- --run src/pages/pages.test.tsx`
  - `npm test -- --run`
  - `npm run build`
  - `npm run lint`
  - 브라우저 수동 확인: `/posts/new`에서 제목/내용 입력
- 검증 결과:
  - 수정 전 회귀 테스트가 `Cannot read properties of null (reading 'value')` 오류로 실패함을 확인했다.
  - 수정 후 `src/pages/pages.test.tsx` 6개 통과
  - 수정 후 전체 테스트 33개 통과
  - 빌드 성공
  - lint 성공
  - 수동 확인에서 흰 화면 없음, Console warning/error 없음
- 남은 문제:
  - 없음
- 변경 이유:
  - 사용자 재현 요청으로 새롭게 발견된 버그라 `BUG-001`로 추가했다.

## 새롭게 발견된 작업

### DOC-001 알려진 문제 목록 문서화

- 상태: 완료
- 완료일: 2026-07-14
- 구현 파일:
  - `docs/KNOWN-ISSUES.md`
  - `docs/TASKS.md`
- 구현 내용:
  - 현재 범위에서 남아 있는 제품/환경 한계를 알려진 문제로 분리했다.
  - 각 Task의 남은 문제에서 `docs/KNOWN-ISSUES.md`로 연결했다.
- 실행한 검증:
  - 문서 링크와 항목 존재 여부를 수동 확인했다.
- 검증 결과:
  - `KI-001`, `KI-002`, `KI-003` 항목을 추가했다.
- 남은 문제:
  - 없음
- 변경 이유:
  - 사용자 요청 규칙 8번에 따라 알려진 문제를 별도 문서로 연결해야 했다.

## 요약

- 전체 Task 수: 12
  - 구현 Task: 10
  - 버그 수정 Task: 1
  - 문서화 Task: 1
- 완료 Task 수: 12
- 보류 Task 수: 0
- 차단된 Task 수: 0
- 다음 작업 후보:
  - `NEXT-001`: 작성/수정 폼 회귀 테스트를 수정 페이지까지 확장
  - `NEXT-002`: 저장 데이터 복구 시 사용자 안내 UX 개선
  - `NEXT-003`: 기본 샘플 데이터 제공 여부 결정
  - `NEXT-004`: 브라우저 간 동기화가 필요할 경우 백엔드 저장소 요구사항 재정의
