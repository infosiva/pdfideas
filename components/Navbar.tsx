'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#1e1b2e]/90"
      style={{ backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-xl text-[#f3e8ff]">
            PDF<span className="text-[#e879f9]">Ideas</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <Link href="/"             className="hover:text-[#f3e8ff] transition-colors duration-150">Ideas</Link>
          <Link href="/generate"     className="hover:text-[#f3e8ff] transition-colors duration-150">Write Guide</Link>
          <Link href="/how-it-works" className="hover:text-[#f3e8ff] transition-colors duration-150">How it works</Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://gumroad.com"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#1e1b2e] bg-[#e879f9] hover:bg-[#f0abfc] active:scale-[0.97]"
            style={{ transition: 'background-color 150ms, transform 100ms' }}
          >
            <Zap size={14} /> Sell on Gumroad
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-white/50 hover:text-[#f3e8ff]" onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.08] px-6 py-4 flex flex-col gap-4 text-sm bg-[#1e1b2e]">
          <Link href="/"             className="text-white/60 hover:text-[#f3e8ff]" onClick={() => setOpen(false)}>Ideas</Link>
          <Link href="/generate"     className="text-white/60 hover:text-[#f3e8ff]" onClick={() => setOpen(false)}>Write Guide</Link>
          <Link href="/how-it-works" className="text-white/60 hover:text-[#f3e8ff]" onClick={() => setOpen(false)}>How it works</Link>
          <a
            href="https://gumroad.com"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#1e1b2e] text-center justify-center bg-[#e879f9] hover:bg-[#f0abfc] active:scale-[0.97]"
            style={{ transition: 'background-color 150ms, transform 100ms' }}
            onClick={() => setOpen(false)}
          >
            <Zap size={14} /> Sell on Gumroad
          </a>
        </div>
      )}
    </nav>
  )
}
