import type { PostFormErrors, PostInput } from './postTypes'

export type ValidationResult =
  | {
      valid: true
      value: PostInput
      errors: PostFormErrors
    }
  | {
      valid: false
      value: null
      errors: PostFormErrors
    }

export const normalizePostInput = (input: PostInput): PostInput => ({
  title: input.title.trim(),
  content: input.content.trim(),
})

export const validatePostInput = (input: PostInput): ValidationResult => {
  const value = normalizePostInput(input)
  const errors: PostFormErrors = {}

  if (!value.title) {
    errors.title = '제목을 입력해주세요.'
  }

  if (!value.content) {
    errors.content = '내용을 입력해주세요.'
  }

  if (errors.title || errors.content) {
    return {
      valid: false,
      value: null,
      errors,
    }
  }

  return {
    valid: true,
    value,
    errors,
  }
}
