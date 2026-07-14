# 디버그 로그

## 2026-07-14 게시글 작성 페이지 흰 화면 오류 재현

### 요청 증상

- URL: `http://127.0.0.1:5173/posts`
- 증상: 게시글 작성 시 빈 화면으로 변함
- 재현 절차:
  1. 개발 서버 실행
  2. 게시글 작성 페이지 이동
  3. 제목/내용 작성 중 키보드 입력 시 하얀 페이지로 변함

### 수행 범위

- 코드 수정 없음
- 오류 재현 여부 확인
- 브라우저 Console 오류 확인
- 터미널/Vite 로그 확인

### 개발 서버 상태

`http://127.0.0.1:5173/posts`에 대해 HTTP 응답을 확인했다.

```text
HTTP/1.1 200 OK
Content-Type: text/html
```

Vite 개발 서버 로그:

```text
VITE v8.1.4 ready
Local: http://127.0.0.1:5173/
```

### 재현 결과

오류가 재현됐다.

재현한 경로:

1. 브라우저에서 `http://127.0.0.1:5173/posts/new`로 이동
2. 작성 페이지가 정상 표시됨
   - 제목 입력칸
   - 내용 입력칸
   - `게시글 작성` 버튼
3. 제목 입력칸에 키보드 입력 수행
4. 페이지 접근성 스냅샷이 빈 트리로 바뀜
5. 화면이 하얀 페이지 상태가 됨

확인용 스크린샷:

- `.playwright-mcp/debug-white-screen.png`
- `.playwright-mcp/debug-white-screen-confirmed.png`

### 브라우저 Console 오류

Console에서 다음 오류가 확인됐다.

```text
TypeError: Cannot read properties of null (reading 'value')
    at http://127.0.0.1:5173/src/features/posts/components/PostForm.tsx:41:35
    at basicStateReducer
    at updateReducerImpl
    at updateReducer
    at Object.useState
    at exports.useState
    at PostForm
    at Object.react_stack_bottom_frame
    at renderWithHooks
    at updateFunctionComponent
```

React 경고도 함께 확인됐다.

```text
An error occurred in the <PostForm> component.
Consider adding an error boundary to your tree to customize error handling behavior.
```

### 터미널/Vite 로그

Vite 로그에서도 동일한 클라이언트 오류가 확인됐다.

```text
[vite] (client) [Unhandled error] TypeError: Cannot read properties of null (reading 'value')
> src/features/posts/components/PostForm.tsx:48:41
  46 |              setInput((current) => ({
  47 |                ...current,
  48 |                title: event.currentTarget.value,
     |                                           ^
  49 |              }))
  50 |            }
```

동일한 React 경고도 Vite 로그에 기록됐다.

```text
[vite] (client) [console.warn] An error occurred in the <PostForm> component.
```

### 관찰된 오류 위치

오류는 `src/features/posts/components/PostForm.tsx`의 제목 입력 `onChange` 처리 중 발생한다.

확인된 문제 지점:

```text
title: event.currentTarget.value
```

내용 입력칸도 같은 패턴을 사용하고 있어 추가 확인이 필요하다.

### 추가 확인 항목

- `PostForm.tsx`의 제목 입력과 내용 입력 `onChange`에서 이벤트 값을 state updater 내부에서 읽는 구조가 안전한지 확인해야 한다.
- 같은 문제가 수정 페이지(`/posts/:postId/edit`)에서도 발생하는지 확인해야 한다.
- 작성 폼 테스트에 실제 키보드 입력 시나리오가 누락되어 있는지 확인해야 한다.
- 수정 전에는 추측으로 코드를 변경하지 않고, 위 오류를 재현하는 실패 테스트를 먼저 추가하는 것이 적절하다.

## BUG-001 수정 Task — 완료

### 오류 제목

`PostForm` 입력 이벤트 처리 중 `event.currentTarget.value` 접근 오류

### 현재 증상

- 수정 전 `/posts/new` 작성 페이지에서 제목 입력칸에 키보드 입력을 시작하면 화면이 빈 화면으로 변했다.
- 수정 전 브라우저 Console과 Vite 로그에 다음 오류가 기록됐다.

```text
TypeError: Cannot read properties of null (reading 'value')
```

- 수정 후 작성 페이지에서 제목/내용 키보드 입력 시 화면이 유지된다.
- 수정 후 브라우저 Console warning/error가 발생하지 않는다.

### 기대 동작

- 사용자가 제목과 내용을 입력해도 화면이 유지된다.
- 입력값이 React state에 정상 반영된다.
- 작성/수정 폼 검증과 제출 흐름이 기존처럼 동작한다.

### 재현 절차

1. 개발 서버를 실행한다.
2. `http://127.0.0.1:5173/posts/new`로 이동한다.
3. 제목 입력칸에 키보드로 텍스트를 입력한다.
4. 화면이 빈 화면으로 바뀌고 Console 오류가 발생하는지 확인한다.

### 확인된 근본 원인

- `src/features/posts/components/PostForm.tsx`의 `onChange` 핸들러에서 React 이벤트 객체의 `event.currentTarget.value`를 `setInput((current) => ...)` updater 함수 내부에서 읽고 있다.
- updater가 실행되는 시점에는 `event.currentTarget`이 더 이상 안전하지 않아 `null`이 되고, `value` 접근 시 런타임 오류가 발생한다.
- 제목 입력과 내용 입력이 같은 패턴을 사용하므로 두 입력 모두 같은 방식으로 수정해야 한다.

### 수정 대상 파일

- `src/features/posts/components/PostForm.tsx`
- `src/pages/pages.test.tsx`

### 수정하지 않을 파일

- `src/services/postStorage.ts`
- `src/features/posts/postService.ts`
- `src/features/posts/postValidation.ts`
- `src/features/posts/hooks/usePosts.ts`
- 라우터/페이지 구조 파일 전반
- 문서 파일은 수정 결과 기록이 필요할 때만 최소 갱신

### 최소 수정 방법

1. 각 `onChange` 핸들러 시작 지점에서 `const value = event.currentTarget.value`로 값을 먼저 지역 변수에 저장한다.
2. `setInput((current) => ({ ...current, title: value }))`와 `setInput((current) => ({ ...current, content: value }))`처럼 updater 내부에서는 이벤트 객체를 참조하지 않는다.
3. 폼 구조, 검증 메시지, 제출 흐름은 변경하지 않는다.

### 영향받을 가능성이 있는 기능

- 게시글 작성 폼 제목/내용 입력
- 게시글 수정 폼 제목/내용 입력
- 작성/수정 폼의 trim 기반 검증
- 작성 성공 후 상세 이동
- 수정 성공 후 상세 이동

### 추가할 회귀 테스트

- 완료: `/posts/new`에서 제목과 내용을 실제 키보드 입력으로 작성해도 화면이 유지되는지 확인한다.
- 완료: 입력 후 작성 버튼을 눌렀을 때 새 게시글 상세 화면으로 이동하는지 확인한다.
- 테스트 위치: `src/pages/pages.test.tsx`

### 검증 명령

```powershell
npm test -- --run src/pages/pages.test.tsx
npm test -- --run
npm run build
```

필요 시 수동 확인:

```text
http://127.0.0.1:5173/posts/new
```

### 완료 조건

- 완료: 작성 페이지에서 제목/내용 키보드 입력 시 흰 화면으로 변하지 않는다.
- 완료: 브라우저 Console에 `Cannot read properties of null (reading 'value')` 오류가 더 이상 발생하지 않는다.
- 완료: 추가한 회귀 테스트가 실패 후 수정으로 통과한다.
- 완료: 전체 테스트와 빌드가 통과한다.
- 완료: 수정 범위가 `PostForm` 입력 처리와 회귀 테스트로 제한된다.

### 롤백 방법

- `src/features/posts/components/PostForm.tsx`의 `onChange` 변경분을 이전 구현으로 되돌린다.
- BUG-001용으로 추가한 회귀 테스트 변경분을 되돌린다.
- 롤백 후 `npm test -- --run`과 `npm run build`로 기존 상태를 확인한다.

### 수정 결과

- `PostForm.tsx`의 제목/내용 `onChange` 핸들러에서 `event.currentTarget.value`를 먼저 지역 변수 `value`에 저장하도록 수정했다.
- `setInput((current) => ...)` updater 내부에서는 이벤트 객체를 직접 참조하지 않는다.
- `src/pages/pages.test.tsx`에 작성 폼 키보드 입력 후 제출 회귀 테스트를 추가했다.
- 테스트 간 DOM 잔존 방지를 위해 `cleanup()`을 추가했다.

### 검증 결과

```text
npm test -- --run src/pages/pages.test.tsx
결과: 성공, 6개 통과

npm test -- --run
결과: 성공, 33개 통과

npm run build
결과: 성공

npm run lint
결과: 성공
```

브라우저 수동 확인:

- `/posts/new`에서 제목 입력 성공
- `/posts/new`에서 내용 입력 성공
- 화면이 빈 화면으로 변하지 않음
- Console warning/error 없음
