export const MOOD_OPTIONS = [
  { value: 'calm', label: '차분한 기분', hint: '조용하고 느긋한 활동' },
  { value: 'fresh', label: '리프레시가 필요한 기분', hint: '기분 전환이 쉬운 활동' },
  { value: 'social', label: '사람들과 어울리고 싶은 기분', hint: '함께하면 좋은 활동' },
  { value: 'creative', label: '무언가 만들고 싶은 기분', hint: '직접 손을 쓰는 활동' },
  { value: 'adventurous', label: '조금 색다른 기분', hint: '새로운 경험이 있는 활동' },
];

export const TIME_OPTIONS = [
  { value: 'under-60', label: '1시간 이내', maxMinutes: 60, hint: '짧고 가볍게 끝나는 일정' },
  { value: 'under-120', label: '2시간 이내', maxMinutes: 120, hint: '가볍게 다녀오기 좋은 일정' },
  { value: 'under-180', label: '3시간 이내', maxMinutes: 180, hint: '조금 여유 있는 일정' },
  { value: 'half-day', label: '반나절 가능', maxMinutes: 240, hint: '여유 있게 즐기는 일정' },
];

export const BUDGET_OPTIONS = [
  { value: 'free', label: '무료', maxWon: 0, hint: '돈을 거의 쓰지 않는 활동' },
  { value: 'under-10000', label: '1만원 이하', maxWon: 10000, hint: '가벼운 간식 정도까지' },
  { value: 'under-30000', label: '3만원 이하', maxWon: 30000, hint: '밥 한 끼와 여유 있는 활동' },
  { value: 'under-50000', label: '5만원 이하', maxWon: 50000, hint: '선택 폭이 넓은 활동' },
];

export const COMPANIONSHIP_OPTIONS = [
  { value: 'alone', label: '혼자', hint: '나만의 속도로 즐기는 활동' },
  { value: 'with-someone', label: '동행 있음', hint: '함께하면 더 좋은 활동' },
];

export const SELECT_FIELDS = [
  {
    name: 'mood',
    label: '오늘의 기분',
    placeholder: '기분을 선택하세요',
    options: MOOD_OPTIONS,
  },
  {
    name: 'availableTime',
    label: '사용 가능 시간',
    placeholder: '시간을 선택하세요',
    options: TIME_OPTIONS,
  },
  {
    name: 'budget',
    label: '예산',
    placeholder: '예산을 선택하세요',
    options: BUDGET_OPTIONS,
  },
  {
    name: 'companionship',
    label: '동행 여부',
    placeholder: '동행 여부를 선택하세요',
    options: COMPANIONSHIP_OPTIONS,
  },
];

export const INITIAL_SELECTION = {
  mood: '',
  availableTime: '',
  budget: '',
  companionship: '',
};

export const RULE_LOOKUP = {
  mood: MOOD_OPTIONS,
  availableTime: TIME_OPTIONS,
  budget: BUDGET_OPTIONS,
  companionship: COMPANIONSHIP_OPTIONS,
};
