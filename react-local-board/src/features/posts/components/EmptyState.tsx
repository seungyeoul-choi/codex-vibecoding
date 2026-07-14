import { Link } from 'react-router-dom'

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) => (
  <div className="empty-state">
    <h2>{title}</h2>
    <p>{description}</p>
    {actionLabel && actionTo ? (
      <Link className="button primary" to={actionTo}>
        {actionLabel}
      </Link>
    ) : null}
  </div>
)
