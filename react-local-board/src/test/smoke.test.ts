import { describe, expect, it } from 'vitest'

describe('test environment', () => {
  it('runs Vitest with jsdom', () => {
    const element = document.createElement('div')

    element.textContent = 'React local board'

    expect(element).toHaveTextContent('React local board')
  })
})
