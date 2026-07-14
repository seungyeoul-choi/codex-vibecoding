import { describe, expect, it } from 'vitest'

import { normalizePostInput, validatePostInput } from './postValidation'

describe('postValidation', () => {
  it('제목과 내용을 trim한다', () => {
    expect(
      normalizePostInput({
        title: '  제목  ',
        content: '  내용  ',
      }),
    ).toEqual({
      title: '제목',
      content: '내용',
    })
  })

  it('공백 제목과 공백 내용을 거부한다', () => {
    const result = validatePostInput({
      title: '   ',
      content: '\n',
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual({
      title: '제목을 입력해주세요.',
      content: '내용을 입력해주세요.',
    })
  })

  it('유효한 입력은 정규화된 값을 반환한다', () => {
    const result = validatePostInput({
      title: '  제목  ',
      content: '  내용  ',
    })

    expect(result).toEqual({
      valid: true,
      value: {
        title: '제목',
        content: '내용',
      },
      errors: {},
    })
  })
})
