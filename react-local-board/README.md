# React Local Board

React와 TypeScript로 만든 브라우저 `localStorage` 기반 게시판입니다. 백엔드와 로그인 없이 게시글 목록, 상세, 작성, 수정, 삭제를 사용할 수 있고 새로고침 후에도 데이터가 유지됩니다.

## 주요 기능

- 게시글 목록, 상세, 작성, 수정, 삭제
- 제목 검색
- `createdAt` 기준 최신순 정렬
- 상세 진입 시 조회수 증가
- 새로고침 후 데이터 유지
- 제목/내용 필수 검증
- 깨진 저장 데이터와 저장소 읽기/쓰기 오류 처리
- React Router 기반 페이지 분리

## 설치와 실행

```powershell
npm install
npm run dev
```

개발 서버가 출력하는 로컬 주소로 접속합니다. 기본 라우트(`/`)는 `/posts`로 이동합니다.

## 검증 명령

```powershell
npm test -- --run
npm run build
```

Windows Codex 셸에서 Node/npm이 `ncrypto::CSPRNG(nullptr, 0)` 오류를 내면 현재 셸에 다음 환경 변수를 먼저 설정한 뒤 명령을 실행합니다.

```powershell
$env:SystemRoot='C:\windows'
$env:windir='C:\windows'
$env:ComSpec='C:\windows\System32\cmd.exe'
$env:ProgramData='C:\ProgramData'
$env:APPDATA='C:\Users\user\AppData\Roaming'
$env:LOCALAPPDATA='C:\Users\user\AppData\Local'
$env:HOMEDRIVE='C:'
$env:HOMEPATH='\Users\user'
```

## 프로젝트 구조

```text
src/
  app/
    AppRouter.tsx              # 라우팅 구성
  features/posts/
    components/                # 게시글 UI 컴포넌트
    hooks/usePosts.ts          # 화면과 저장소/도메인 로직을 연결하는 훅
    postService.ts             # CRUD, 검색, 정렬, 조회수 순수 함수
    postTypes.ts               # Post 타입
    postValidation.ts          # 입력값 검증
  pages/                       # 라우트별 페이지
  services/postStorage.ts      # localStorage 접근 전용 계층
  test/setup.ts                # Vitest setup
```

`localStorage` 직접 접근은 `src/services/postStorage.ts`로 제한합니다. 화면과 훅은 `loadPosts`, `savePosts`를 통해서만 저장소를 사용합니다.

## 라우팅

- `/` → `/posts`
- `/posts`: 게시글 목록
- `/posts/new`: 게시글 작성
- `/posts/:postId`: 게시글 상세
- `/posts/:postId/edit`: 게시글 수정
- `*`: NotFound

## 테스트 범위

- 도메인 로직: 생성, 수정, 삭제, 검색, 최신순 정렬, 조회수 증가
- 검증 로직: 제목/내용 공백 입력 거부
- 저장소 로직: 정상 읽기/쓰기, 손상 JSON, 잘못된 payload, 버전 불일치, 읽기/쓰기 예외
- 훅: 초기 로드, CRUD 반영, 저장 실패 오류
- 화면 smoke: 목록 검색, 작성 폼 검증, 없는 게시글 안내, StrictMode 조회수 중복 방지, NotFound
