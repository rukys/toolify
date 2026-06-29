import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <p className="text-sm font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            Toolify
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            100% Free browser-based developer, text, generator, PDF & image utilities.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-[var(--color-text-secondary)]">
          <Link href="/tools" className="hover:text-[var(--color-primary)] transition-colors">
            All Tools
          </Link>
          <span className="text-[var(--color-border)]">|</span>
          <span className="text-[var(--color-text-muted)]">
            Privacy by Design (No uploads, client-side only)
          </span>
          <span className="text-[var(--color-border)]">|</span>
          <span>© {currentYear} Toolify</span>
        </div>
      </div>
    </footer>
  )
}
