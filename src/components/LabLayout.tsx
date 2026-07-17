import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type LabLayoutProps = {
  title: string
  description?: string
  children: ReactNode
  /** Immersive pages hide the chrome chrome padding */
  immersive?: boolean
}

export function LabLayout({
  title,
  description,
  children,
  immersive = false,
}: LabLayoutProps) {
  return (
    <div
      className={
        immersive
          ? 'relative min-h-screen bg-background'
          : 'min-h-screen bg-background px-6 py-8 sm:px-8'
      }
    >
      <div
        className={
          immersive
            ? 'pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-5 sm:p-6'
            : 'mx-auto mb-8 flex max-w-5xl items-start justify-between gap-4'
        }
      >
        <div className="pointer-events-auto">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Home
          </Link>
          <h1
            className={
              immersive
                ? 'mt-3 text-xl font-semibold tracking-tight text-foreground drop-shadow'
                : 'mt-3 text-2xl font-semibold tracking-tight text-foreground'
            }
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <Link
          to="/#playground"
          className="pointer-events-auto shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Lab
        </Link>
      </div>

      {immersive ? children : (
        <div className="mx-auto max-w-5xl">{children}</div>
      )}
    </div>
  )
}
