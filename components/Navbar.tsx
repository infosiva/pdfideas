'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: 'rgba(8,7,18,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            PDFIdeas
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="/"            className="hover:text-white transition-colors">Ideas</Link>
          <Link href="/generate"    className="hover:text-white transition-colors">Write Guide</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://gumroad.com"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
          >
            <Zap size={14} /> Sell on Gumroad
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/"             className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>Ideas</Link>
          <Link href="/generate"     className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>Write Guide</Link>
          <Link href="/how-it-works" className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>How it works</Link>
          <a
            href="https://gumroad.com"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white text-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
            onClick={() => setOpen(false)}
          >
            <Zap size={14} /> Sell on Gumroad
          </a>
        </div>
      )}
    </nav>
  )
}
