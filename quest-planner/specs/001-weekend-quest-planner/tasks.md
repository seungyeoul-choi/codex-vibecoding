# Tasks: Weekend Quest Planner

**Input**: Design documents from `/specs/001-weekend-quest-planner/`

**Prerequisites**: spec.md (required), prompt/plan-prompt.md (project direction)

**Tests**: 별도 테스트 요청이 없으므로, 이 작업 목록에는 구현 중심 태스크만 포함합니다.

**Organization**: 태스크는 사용자 스토리별로 분리하여, 각 스토리를 독립적으로 구현하고 확인할 수
있도록 구성합니다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 다른 파일과의 의존성이 없어 병렬로 진행 가능
- **[Story]**: 어떤 사용자 스토리에 속하는지 표시
- 각 설명에는 정확한 파일 경로를 포함

## Phase 1: Setup (공통 준비)

**Purpose**: React + Vite 앱의 기본 구조와 파일 배치를 준비한다.

- [X] T001 React + Vite 프로젝트 기본 구조를 생성하고 `src/`, `public/`, `index.html`의 시작 파일을 준비한다.
- [X] T002 [P] 공통 스타일과 기능별 폴더 구조를 만들고 `src/styles/`, `src/components/`, `src/data/`,
  `src/utils/` 디렉터리를 준비한다.
- [X] T003 [P] 앱 진입점과 루트 렌더링을 연결한다: `src/main.jsx`, `src/App.jsx`

---

## Phase 2: Foundational (공통 기반)

**Purpose**: 모든 사용자 스토리가 의존하는 추천 데이터, 조건, 저장소, 계산 로직을 만든다.

- [X] T004 [P] 추천에 사용할 mock activity 데이터를 정의한다: `src/data/mockActivities.js`
- [X] T005 [P] 추천에 필요한 조건 규칙과 매칭 기준을 정리한다: `src/data/recommendationRules.js`
- [X] T006 최근 추천 결과 최대 3개를 저장하고 불러오는 `localStorage` 헬퍼를 만든다:
  `src/utils/recentRecommendations.js`
- [X] T007 기분, 시간, 예산, 동행 여부를 기반으로 가장 적합한 코스를 고르는 계산 함수를 만든다:
  `src/utils/recommendCourse.js`
- [X] T008 공통 UI 레이아웃과 반응형 기준 스타일을 정리한다: `src/styles/global.css`

**Checkpoint**: 추천 계산과 저장/복원 기반이 준비되어 사용자 스토리를 독립적으로 붙일 수 있다.

---

## Phase 3: User Story 1 - 조건에 맞는 코스 찾기 (Priority: P1)

**Goal**: 사용자가 조건을 입력하고 `추천하기` 버튼을 눌러 1개의 미니 코스를 확인한다.

**Independent Test**: 조건을 선택한 뒤 `추천하기`를 눌렀을 때, 추천 결과 1개가 표시되면
독립적으로 완료된다.

### Implementation for User Story 1

- [X] T009 [US1] 입력 폼 컴포넌트를 만든다: `src/components/PreferenceForm.jsx`
- [X] T010 [US1] 추천 실행 버튼과 폼 제출 흐름을 연결한다: `src/App.jsx`
- [X] T011 [US1] 선택 조건 상태를 화면에 반영하는 기본 상호작용을 연결한다: `src/App.jsx`

**Checkpoint**: 조건 입력 후 추천하기 버튼으로 1개 결과를 받을 수 있다.

---

## Phase 4: User Story 2 - 추천 정보 확인하기 (Priority: P2)

**Goal**: 추천 결과에서 각 활동의 예상 시간과 예상 비용을 함께 확인한다.

**Independent Test**: 결과 카드에 시간과 비용이 함께 보이면 독립적으로 완료된다.

### Implementation for User Story 2

- [X] T012 [US2] 추천 결과 카드 컴포넌트를 만든다: `src/components/RecommendationCard.jsx`
- [X] T013 [US2] 추천 결과에 예상 시간, 예상 비용, 일치 조건 요약을 표시한다:
  `src/components/RecommendationCard.jsx`
- [X] T014 [US2] 추천 결과가 표시되는 영역과 빈 상태 전환을 App에 연결한다: `src/App.jsx`

**Checkpoint**: 추천 결과 1개가 시간과 비용 정보와 함께 읽기 쉽게 표시된다.

---

## Phase 5: User Story 3 - 결과가 없을 때 안내 받기 (Priority: P3)

**Goal**: 조건에 맞는 코스가 없을 때 빈 상태와 조건 완화 안내를 보여준다.

**Independent Test**: 조건을 좁게 선택해 결과가 없을 때, 안내 메시지가 보이면 독립적으로
완료된다.

### Implementation for User Story 3

- [X] T015 [US3] 결과 없음 상태 컴포넌트를 만든다: `src/components/EmptyState.jsx`
- [X] T016 [US3] 조건을 완화해 다시 시도할 수 있는 안내 문구를 연결한다:
  `src/components/EmptyState.jsx`
- [X] T017 [US3] 추천 결과가 없을 때 결과 영역이 깨지지 않도록 App 상태 분기를 정리한다:
  `src/App.jsx`

**Checkpoint**: 조건에 맞는 코스가 없을 때도 사용자가 다음 행동을 이해할 수 있다.

---

## Phase 6: User Story 4 - 최근 추천 다시 보기 (Priority: P3)

**Goal**: 최근 추천 결과 최대 3개를 저장하고, 다시 방문했을 때 확인할 수 있다.

**Independent Test**: 추천을 몇 번 실행한 뒤 다시 열었을 때 최근 추천 3개가 보이면 독립적으로
완료된다.

### Implementation for User Story 4

- [X] T018 [US4] 최근 추천 결과 섹션 컴포넌트를 만든다: `src/components/RecentRecommendations.jsx`
- [X] T019 [US4] 최근 추천 결과를 localStorage에 최대 3개 저장하고 불러오도록 연결한다:
  `src/utils/recentRecommendations.js`
- [X] T020 [US4] 앱이 시작될 때 최근 추천 결과를 복원해 화면에 표시한다: `src/App.jsx`

**Checkpoint**: 최근 추천 결과가 다음 방문에서도 유지된다.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 여러 사용자 스토리에 걸친 마무리 작업을 정리한다.

- [X] T021 전체 화면의 반응형 레이아웃과 간격을 정리한다: `src/styles/global.css`
- [X] T022 모바일과 데스크톱에서 입력 폼, 결과 카드, 최근 추천 섹션이 깨지지 않는지 확인하고
  필요한 스타일을 조정한다: `src/components/PreferenceForm.jsx`, `src/components/RecommendationCard.jsx`,
  `src/components/EmptyState.jsx`, `src/components/RecentRecommendations.jsx`, `src/styles/global.css`
- [X] T023 문서와 주석 중 불필요한 설명을 정리하고, 실제 파일 구조와 일치하는지 확인한다:
  `src/App.jsx`, `src/components/PreferenceForm.jsx`, `src/components/RecommendationCard.jsx`,
  `src/components/EmptyState.jsx`, `src/components/RecentRecommendations.jsx`, `src/utils/recommendCourse.js`,
  `src/utils/recentRecommendations.js`, `src/data/mockActivities.js`, `src/data/recommendationRules.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 시작
- **User Stories (Phase 3+)**: Foundational 완료 후 시작
  - User Story 1은 MVP 핵심이므로 가장 먼저 구현
  - User Story 2, 3, 4는 User Story 1 이후 순차 또는 병렬로 진행 가능
- **Polish (Final Phase)**: 원하는 사용자 스토리 완료 후 진행

### User Story Dependencies

- **User Story 1 (P1)**: 다른 스토리에 의존하지 않음
- **User Story 2 (P2)**: User Story 1의 결과 표시 흐름을 사용
- **User Story 3 (P3)**: User Story 1의 추천 흐름과 결과 분기 로직을 사용
- **User Story 4 (P3)**: User Story 1의 추천 실행과 Foundational 저장 로직을 사용

### Within Each User Story

- 공통 기반이 먼저 완성되어야 한다.
- 결과 표시 컴포넌트와 상태 컴포넌트는 서로 독립적으로 작성한다.
- 저장 로직은 UI와 분리해 유지한다.
- 각 스토리는 단독으로 확인 가능한 상태여야 한다.

### Parallel Opportunities

- T002, T003는 병렬 가능
- T004, T005, T006, T007, T008은 서로 다른 파일이므로 병렬 가능
- T011은 T010 완료 후 진행하는 것이 안전하지만, 화면 분기 작업은 다른 파일과 병렬 가능
- T012, T013은 병렬 가능
- T015, T016은 병렬 가능
- T018, T019는 병렬 가능
- T021, T022는 병렬 가능

---

## Parallel Example: User Story 1

```bash
Task: "입력 폼 컴포넌트를 만든다: src/components/PreferenceForm.jsx"
Task: "선택 조건 상태를 화면에 반영하는 기본 상호작용을 연결한다: src/App.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료
3. Phase 3: User Story 1 완료
4. 조건 입력 후 `추천하기` 버튼으로 1개 결과가 나오는지 확인
5. 필요하면 여기서 멈추고 MVP를 먼저 보여준다

### Incremental Delivery

1. Setup + Foundational 완료
2. User Story 1로 추천 핵심 기능 완성
3. User Story 2로 결과 정보 강화
4. User Story 3으로 결과 없음 상태 보강
5. User Story 4로 최근 추천 복원 기능 추가

### Parallel Team Strategy

여러 명이 함께 작업한다면:

1. 한 명은 입력 폼과 App 연결
2. 한 명은 추천 계산과 데이터 구조
3. 한 명은 결과 카드와 빈 상태
4. 한 명은 최근 추천 저장/복원
