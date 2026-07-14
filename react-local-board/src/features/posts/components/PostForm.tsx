import { useState, type FormEvent } from 'react'

import type { PostFormErrors, PostInput } from '../postTypes'
import { validatePostInput } from '../postValidation'

type PostFormProps = {
  initialValue?: PostInput
  submitLabel: string
  onSubmit: (input: PostInput) => boolean
}

const emptyInput: PostInput = {
  title: '',
  content: '',
}

export const PostForm = ({
  initialValue = emptyInput,
  submitLabel,
  onSubmit,
}: PostFormProps) => {
  const [input, setInput] = useState<PostInput>(initialValue)
  const [errors, setErrors] = useState<PostFormErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = validatePostInput(input)
    setErrors(result.errors)

    if (!result.valid) {
      return
    }

    onSubmit(result.value)
  }

  return (
    <form className="post-form" noValidate onSubmit={handleSubmit}>
      <label className="form-field">
        <span>제목</span>
        <input
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={Boolean(errors.title)}
          onChange={(event) => {
            const value = event.currentTarget.value

            setInput((current) => ({
              ...current,
              title: value,
            }))
          }}
          placeholder="제목을 입력하세요"
          value={input.title}
        />
        {errors.title ? (
          <span className="field-error" id="title-error">
            {errors.title}
          </span>
        ) : null}
      </label>

      <label className="form-field">
        <span>내용</span>
        <textarea
          aria-describedby={errors.content ? 'content-error' : undefined}
          aria-invalid={Boolean(errors.content)}
          onChange={(event) => {
            const value = event.currentTarget.value

            setInput((current) => ({
              ...current,
              content: value,
            }))
          }}
          placeholder="내용을 입력하세요"
          rows={10}
          value={input.content}
        />
        {errors.content ? (
          <span className="field-error" id="content-error">
            {errors.content}
          </span>
        ) : null}
      </label>

      <button className="button primary" type="submit">
        {submitLabel}
      </button>
    </form>
  )
}
