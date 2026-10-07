import Link from 'next/link'

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#4ad926" />
      <path d="M19 12h19l9 9v31a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z" fill="#f6faf1" />
      <path d="M38 12v9h9" fill="#cfe3c4" />
      <path d="M22 30h20M22 37h14M22 44h9" stroke="#0f1a0b" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 6l1.8 4.2L54 12l-4.2 1.8L48 18l-1.8-4.2L42 12l4.2-1.8z" fill="#0f1a0b" />
    </svg>
  )
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ background: 'rgba(246,250,241,0.88)', borderColor: 'var(--border)' }}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg min-h-11" style={{ color: 'var(--foreground)' }}>
          <Logo /><span>PDF<span style={{ color: 'var(--accent-ink)' }}>Ideas</span></span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          <Link href="/how-it-works" className="hidden sm:inline-flex items-center min-h-11 hover:underline">How it works</Link>
          <Link href="/#pricing" className="hidden sm:inline-flex items-center min-h-11 hover:underline">Pricing</Link>
          <Link href="/#generate" className="btn-accent inline-flex items-center px-4 rounded-xl min-h-11 text-sm">Generate ideas</Link>
        </div>
      </nav>
    </header>
  )
}
