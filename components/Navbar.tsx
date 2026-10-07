import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ background: 'rgba(246,250,241,0.88)', borderColor: 'var(--border)' }}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg min-h-11" style={{ color: 'var(--foreground)' }}>
          <Logo />
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
