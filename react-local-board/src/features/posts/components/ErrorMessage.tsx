type ErrorMessageProps = {
  message: string
  danger?: boolean
}

export const ErrorMessage = ({ message, danger = false }: ErrorMessageProps) => (
  <p className={danger ? 'notice danger' : 'notice'} role="alert">
    {message}
  </p>
)
