# Architecture

## 개요

서버 없이 브라우저 `localStorage`에 게시글을 저장하는 단일 사용자 게시판이다.

## Post 타입

```ts
export type Post = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  viewCount: number
}
```

`createdAt`과 `updatedAt`은 ISO 문자열이다. `createdAt`은 생성 후 유지하고, `updatedAt`은 수정 시 갱신한다.

## localStorage 저장소 계층

구현 파일은 `src/services/postStorage.ts`이며, 애플리케이션 코드에서 `localStorage`를 직접 참조할 수 있는 유일한 위치다.

```ts
export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

type StoredPostsPayload = {
  version: 1
  posts: Post[]
}
```

저장소 계층은 손상된 JSON, 배열이 아닌 데이터, 스키마 버전 불일치, quota/security 예외를 처리한다. 현재 버전에서 사용할 수 없는 데이터는 빈 배열로 복구하고 오류 상태를 남긴다.

## 상태 관리

전역 상태 라이브러리는 사용하지 않는다. `usePosts` 훅이 저장소 계층과 화면 사이의 조합 계층이 된다. CRUD, 검색, 정렬, 조회수 증가는 `postService.ts` 순수 함수로 분리한다.

## 유효성 검사

```ts
export type PostFormErrors = {
  title?: string
  content?: string
}
```

제목과 내용은 trim 후 필수다. 공백만 있는 입력은 허용하지 않는다.

## 폼 입력 이벤트 처리

작성/수정 공통 폼은 `src/features/posts/components/PostForm.tsx`에서 관리한다. 입력 이벤트의 값은 이벤트 핸들러가 실행되는 즉시 지역 변수에 저장한 뒤 React state updater에 전달한다.

```ts
const value = event.currentTarget.value
setInput((current) => ({ ...current, title: value }))
```

state updater 내부에서 `event.currentTarget.value`를 직접 읽지 않는다. 이벤트 객체를 updater 내부에서 참조하면 렌더링 시점에 `currentTarget`이 안전하지 않아 입력 중 런타임 오류와 빈 화면이 발생할 수 있다.

## 오류 처리

- 읽기 실패: 빈 배열과 오류 상태로 복구한다.
- 쓰기 실패: 사용자에게 저장 실패 메시지를 보여준다.
- 존재하지 않는 게시글 ID: 안내 화면으로 처리한다.
- 작성/수정 폼 입력 오류: BUG-001 회귀 테스트로 키보드 입력 중 화면이 유지되는지 검증한다.
