# Test Plan

## 목표

핵심 게시글 로직, 유효성 검사, 저장소 오류 처리를 테스트로 고정한다.

## 도구

- Vitest
- jsdom
- React Testing Library
- fake `StorageLike`

## 단위 테스트

- 게시글 생성: `viewCount` 0, ISO 날짜 생성
- 게시글 수정: `createdAt`과 `viewCount` 유지, `updatedAt` 갱신
- 게시글 삭제: 대상 게시글만 제거
- 제목 검색: 대소문자에 과도하게 의존하지 않음
- 최신순 정렬: `createdAt` 내림차순
- 조회수 증가: 1씩 증가
- 유효성 검사: 제목/내용 공백 입력 거부

## 저장소 테스트

- 정상 저장 데이터 읽기
- 저장 데이터 없음
- 손상된 JSON
- 배열이 아닌 데이터
- `version` 불일치
- 필드가 잘못된 게시글 데이터
- `setItem` quota 예외
- `getItem` security 예외

## 화면 테스트

- `/posts` 목록 표시
- 제목 검색 결과 표시
- 작성 폼 검증 오류 표시
- 작성 폼에서 제목/내용을 실제 키보드 입력으로 작성하고 제출
- 상세 화면 조회수 표시
- 존재하지 않는 게시글 안내
- 삭제 확인 후 `/posts` 이동
- React StrictMode에서 상세 진입 조회수 중복 증가 방지
- NotFound 라우트 표시

## 최종 검증 명령

```powershell
npm test -- --run
npm run build
```

## 현재 검증 결과

- 전체 테스트: 33개 통과
- 빌드: 성공
- lint: 성공
- BUG-001 회귀 테스트:
  - 수정 전 `Cannot read properties of null (reading 'value')` 오류로 실패 확인
  - 수정 후 `src/pages/pages.test.tsx` 6개 통과
  - 브라우저 수동 확인에서 `/posts/new` 제목/내용 입력 시 Console warning/error 없음
