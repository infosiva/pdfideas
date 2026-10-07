'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }
const INTRO: Msg = { role: 'assistant', content: 'Ask me about picking a niche, outlining a PDF guide, pricing, or where to sell it.' }

export default function FloatingChatWrapper() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([INTRO])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, open])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const next = [...msgs, { role: 'user' as const, content: text }]
    setMsgs(next); setInput(''); setBusy(true)
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1) }) })
      const d = await r.json().catch(() => ({}))
      const reply = r.status === 429 ? 'Chat limit reached (60 per hour). Please try again later.' : d.reply
      setMsgs(m => [...m, { role: 'assistant', content: reply || 'Sorry, something went wrong. Please try again.' }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally { setBusy(false) }
  }

  return (
    <>
      {open && (
        <div role="dialog" aria-label="PDFIdeas assistant" className="fixed z-[9998] flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
          style={{ right: 16, bottom: 88, width: 'min(340px, calc(100vw - 32px))', height: 'min(460px, calc(100dvh - 120px))', background: '#fff', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}>
            <strong className="text-sm">PDFIdeas assistant</strong>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="w-8 h-8 flex items-center justify-center rounded-lg"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: 'var(--background)' }} aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                <div className="text-sm px-3 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap"
                  style={m.role === 'user' ? { background: 'var(--accent)', color: 'var(--accent-on)' } : { background: '#fff', border: '1px solid var(--border)', color: 'var(--foreground)' }}>{m.content}</div>
              </div>
            ))}
            {busy && <div className="text-xs" style={{ color: 'var(--text-3)' }}>Thinking...</div>}
            <div ref={end} />
          </div>
          <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2 p-3 border-t" style={{ background: '#fff', borderColor: 'var(--border)' }}>
            <input className="form-input" style={{ minHeight: 44 }} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about PDF guides" maxLength={1000} aria-label="Message" />
            <button type="submit" disabled={busy} aria-label="Send" className="btn-accent w-11 h-11 rounded-xl flex items-center justify-center shrink-0"><Send size={16} /></button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-label={open ? 'Close chat' : 'Open chat'} aria-expanded={open}
        className="btn-accent fixed z-[9999] w-14 h-14 rounded-full flex items-center justify-center" style={{ right: 16, bottom: 20 }}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
