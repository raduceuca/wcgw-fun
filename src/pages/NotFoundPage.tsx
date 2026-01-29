import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-base-100 text-base-content flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-base-content/70 mb-8 text-pretty">
          This page doesn't exist. It may have been moved or deleted.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  )
}
