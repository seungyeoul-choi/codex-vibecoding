export type Post = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  viewCount: number
}

export type PostInput = {
  title: string
  content: string
}

export type PostFormErrors = {
  title?: string
  content?: string
}

export type Clock = () => string

export type IdFactory = () => string
