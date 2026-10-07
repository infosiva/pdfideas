'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ThumbsUp } from 'lucide-react'

export default function FeedbackWidget({ siteName = 'pdfideas' }: { siteName?: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const page = usePathname()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() && !rating) return
    setState('sending')
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general', rating: rating || undefined, message, email: email || undefined, page, site: siteName }) })
      if (!r.ok) throw new Error()
      setState('done'); setMessage(''); setEmail(''); setRating(0)
      setTimeout(() => { setOpen(false); setState('idle') }, 1800)
    } catch { setState('error') }
  }

  return (
    <div className="fixed z-[9997]" style={{ left: 16, bottom: 20 }}>
      {open && (
        <form onSubmit={submit} className="mb-2 p-4 rounded-2xl border shadow-xl flex flex-col gap-2" style={{ width: 'min(300px, calc(100vw - 32px))', background: '#fff', borderColor: 'var(--border)' }}>
          <strong className="text-sm" style={{ color: 'var(--foreground)' }}>How is PDFIdeas working for you?</strong>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map(n => (
              <button type="button" key={n} role="radio" aria-checked={rating === n} onClick={() => setRating(n)}
                className="w-11 h-11 rounded-lg text-sm font-bold border" style={{ borderColor: 'var(--border)', background: rating === n ? 'var(--accent)' : '#fff', color: 'var(--foreground)' }}>{n}</button>
            ))}
          </div>
          <textarea className="form-input" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="What should be better?" maxLength={2000} aria-label="Feedback" />
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" aria-label="Email (optional)" />
          <button type="submit" disabled={state === 'sending'} className="btn-accent rounded-xl min-h-11 text-sm">{state === 'sending' ? 'Sending...' : 'Send feedback'}</button>
          {state === 'done' && <p className="text-xs" style={{ color: 'var(--accent-ink)' }} role="status">Thanks, got it.</p>}
          {state === 'error' && <p className="text-xs" style={{ color: '#b91c1c' }} role="alert">Could not send. Try again.</p>}
        </form>
      )}
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex items-center gap-2 px-4 rounded-full border text-sm font-semibold shadow-md"
        style={{ minHeight: 44, background: '#fff', color: 'var(--foreground)', borderColor: 'var(--border)' }}>
        <ThumbsUp size={15} /> Feedback
      </button>
    </div>
  )
}
