'use client'
import { useState, useEffect, useRef } from 'react'
import { Zap, TrendingUp, DollarSign, BookOpen, ArrowRight, Download, Share2, Bookmark, BookmarkCheck, Store, Sparkles, Target, BarChart3, Star } from 'lucide-react'

const NICHES = [
  'Parenting', 'Health & Wellness', 'Personal Finance', 'Productivity',
  'Relationships', 'Fitness', 'Anxiety & Mental Health', 'Side Hustles',
  'Home Organisation', 'Sleep', 'Nutrition & Diet', 'Career & Job Search',
  'Small Business', 'Social Media', 'Travel Hacking', 'Pet Care',
  'Pregnancy & Baby', 'Minimalism', 'Dating', 'Study & Learning',
]

interface Idea {
  title:            string
  subtitle:         string
  audience:         string
  painPoint:        string
  searchVolume:     'high' | 'medium' | 'low'
  competition:      'high' | 'medium' | 'low'
  trend:            'rising' | 'stable' | 'falling'
  opportunityScore: number
  suggestedPrice:   number
  gumroadTitle:     string
  chapters:         string[]
}

const LS_KEY = 'pdfideas:saved'
function loadSaved(): Idea[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function storeSaved(ideas: Idea[]) { localStorage.setItem(LS_KEY, JSON.stringify(ideas)) }

// Animated background orbs
function AnimatedBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <style>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,-60px) scale(1.1)} 66%{transform:translate(-40px,80px) scale(0.95)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-100px,40px) scale(1.08)} 66%{transform:translate(60px,-80px) scale(1.05)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,60px) scale(1.12)} }
        @keyframes grid { 0%{opacity:0.04} 50%{opacity:0.07} 100%{opacity:0.04} }
        @keyframes float1 { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-20px) rotate(180deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-14px) rotate(-180deg)} }
      `}</style>
      {/* Deep dark base */}
      <div className="absolute inset-0" style={{ background: '#050510' }} />
      {/* Animated colour orbs */}
      <div className="absolute" style={{
        top: '-10%', left: '20%', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        animation: 'orb1 18s ease-in-out infinite',
      }} />
      <div className="absolute" style={{
        top: '30%', right: '-5%', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        animation: 'orb2 22s ease-in-out infinite',
      }} />
      <div className="absolute" style={{
        bottom: '-10%', left: '10%', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
        animation: 'orb3 26s ease-in-out infinite',
      }} />
      {/* Subtle grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'grid 8s ease-in-out infinite',
      }} />
      {/* Floating particles */}
      {[
        { top: '15%', left: '8%', delay: '0s', dur: '6s' },
        { top: '40%', left: '85%', delay: '1s', dur: '8s' },
        { top: '70%', left: '15%', delay: '2s', dur: '7s' },
        { top: '25%', left: '60%', delay: '0.5s', dur: '9s' },
        { top: '80%', left: '70%', delay: '3s', dur: '5s' },
      ].map((p, i) => (
        <div key={i} className="absolute" style={{
          top: p.top, left: p.left,
          width: i % 2 === 0 ? 6 : 4, height: i % 2 === 0 ? 6 : 4,
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(167,139,250,0.6)' : i % 3 === 1 ? 'rgba(236,72,153,0.5)' : 'rgba(6,182,212,0.5)',
          animation: `${i % 2 === 0 ? 'float1' : 'float2'} ${p.dur} ease-in-out infinite`,
          animationDelay: p.delay,
          boxShadow: `0 0 8px currentColor`,
        }} />
      ))}
    </div>
  )
}

// Animated preview card shown in hero right panel
const DEMO_IDEAS = [
  { title: '30-Day Budget Reset', score: 91, price: 19, niche: 'Personal Finance', trend: '↑ Rising' },
  { title: 'Sleep Protocol for Shift Workers', score: 84, price: 14, niche: 'Health', trend: '↑ Rising' },
  { title: 'Toddler Meal Prep Blueprint', score: 88, price: 17, niche: 'Parenting', trend: '→ Stable' },
]

function DemoPanel() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % DEMO_IDEAS.length), 2800)
    return () => clearInterval(t)
  }, [])
  const idea = DEMO_IDEAS[active]
  return (
    <div className="relative w-full h-full flex flex-col gap-4">
      <style>{`
        @keyframes cardIn { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.08);opacity:0.8} }
      `}</style>

      {/* Live status bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
        </span>
        <span className="text-violet-300 text-[11px] font-semibold tracking-wide">AI generating live ideas</span>
      </div>

      {/* Main idea card */}
      <div key={active} className="rounded-2xl p-5 flex flex-col gap-3"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          animation: 'cardIn 0.4s cubic-bezier(0.23,1,0.32,1) both',
          boxShadow: '0 8px 40px rgba(124,58,237,0.15)',
        }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">{idea.niche}</div>
            <div className="text-white font-bold text-base leading-snug">{idea.title}</div>
          </div>
          <div className="flex flex-col items-center shrink-0 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="text-green-400 font-black text-xl leading-none">{idea.score}</span>
            <span className="text-green-400/60 text-[9px] mt-0.5">score</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}>
            ${idea.price} suggested
          </span>
          <span className="text-white/40 text-[10px]">{idea.trend}</span>
        </div>
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-white/30 mb-1">
            <span>Opportunity score</span><span>{idea.score}/100</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${idea.score}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)' }} />
          </div>
        </div>
        {/* Action row */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            Write Full Guide →
          </div>
          <div className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#ff90e8', color: '#000' }}>
            Gumroad
          </div>
        </div>
      </div>

      {/* Dots navigation */}
      <div className="flex gap-1.5 justify-center">
        {DEMO_IDEAS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === active ? 20 : 6, height: 6,
              background: i === active ? '#7c3aed' : 'rgba(255,255,255,0.15)',
            }} />
        ))}
      </div>

      {/* Stats row below */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg. revenue', value: '$847/mo', icon: '💰' },
          { label: 'Ideas generated', value: '14,200+', icon: '⚡' },
          { label: 'Guides sold', value: '3,100+', icon: '📄' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-white font-bold text-sm">{s.value}</div>
            <div className="text-white/35 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex flex-col items-center px-2 py-1.5 rounded-xl shrink-0"
      style={{ background: score >= 75 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)' }}>
      <span className={`text-xl font-extrabold leading-none ${color}`}>{score}</span>
      <span className="text-white/30 text-[9px] mt-0.5">score</span>
    </div>
  )
}

function IdeaCard({ idea, index, savedIds, onToggleSave }: {
  idea: Idea; index: number; savedIds: Set<string>; onToggleSave: (idea: Idea) => void
}) {
  const isSaved = savedIds.has(idea.title)
  const BADGE: Record<string, string> = {
    high: 'bg-green-500/15 text-green-400 border border-green-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    low: 'bg-red-500/15 text-red-400 border border-red-500/20',
    rising: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
    stable: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    falling: 'bg-red-500/15 text-red-400 border border-red-500/20',
  }
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        animationDelay: `${index * 55}ms`,
        animation: 'fadeSlideIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
      }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm leading-snug mb-1">{idea.title}</h3>
          <p className="text-white/45 text-xs leading-snug">{idea.subtitle}</p>
        </div>
        <ScoreBadge score={idea.opportunityScore} />
      </div>

      <p className="text-white/35 text-xs flex items-center gap-1.5">
        <BookOpen size={11} /> {idea.audience}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: `${idea.searchVolume === 'high' ? 'High' : idea.searchVolume === 'medium' ? 'Med' : 'Low'} Interest`, key: idea.searchVolume },
          { label: `${idea.competition === 'high' ? 'High' : idea.competition === 'medium' ? 'Med' : 'Low'} Competition`, key: idea.competition },
          { label: idea.trend.charAt(0).toUpperCase() + idea.trend.slice(1), key: idea.trend },
        ].map(b => (
          <span key={b.label} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[b.key]}`}>{b.label}</span>
        ))}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <DollarSign size={9}/>${idea.suggestedPrice}
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${idea.opportunityScore}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #10b981)' }} />
        </div>
      </div>

      <div className="flex gap-2 mt-auto flex-wrap">
        <a href={`/generate?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&audience=${encodeURIComponent(idea.audience)}&painPoint=${encodeURIComponent(idea.painPoint)}&chapters=${encodeURIComponent(JSON.stringify(idea.chapters))}`}
          className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
          <ArrowRight size={12}/> Write Guide
        </a>
        <a href={`https://app.gumroad.com/products/new?name=${encodeURIComponent(idea.gumroadTitle || idea.title)}&price=${idea.suggestedPrice * 100}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] flex items-center gap-1"
          style={{ background: '#ff90e8', color: '#000' }}>
          <DollarSign size={10}/> Gumroad
        </a>
        <a href="https://www.etsy.com/sell/digital" target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs font-bold border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all active:scale-[0.97] flex items-center gap-1">
          <Store size={10}/> Etsy
        </a>
        <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just found a 🔥 PDF idea: "${idea.title}" — selling at $${idea.suggestedPrice}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs border border-white/10 text-white/40 hover:text-white transition-all active:scale-[0.97]">
          <Share2 size={11}/>
        </a>
        <button onClick={() => onToggleSave(idea)}
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.97] border ${isSaved ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'border-white/10 text-white/40 hover:border-white/25'}`}>
          {isSaved ? <BookmarkCheck size={13}/> : <Bookmark size={13}/>}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [niche, setNiche]     = useState('')
  const [topic, setTopic]     = useState('')
  const [count, setCount]     = useState(10)
  const [ideas, setIdeas]     = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([])
  const [tab, setTab]         = useState<'generate' | 'saved'>('generate')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = loadSaved()
    setSavedIdeas(stored)
    setSavedIds(new Set(stored.map(i => i.title)))
  }, [])

  async function generate() {
    if (!niche) { setError('Select a niche first'); return }
    setError(''); setLoading(true); setIdeas([]); setTab('generate')
    try {
      const res  = await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ niche, topic, count }) })
      const data = await res.json() as { ideas?: Idea[]; error?: string }
      if (!res.ok || !data.ideas) { setError(data.error ?? 'Failed to generate ideas'); return }
      setIdeas(data.ideas)
    } catch { setError('Network error — try again') }
    finally { setLoading(false) }
  }

  function toggleSave(idea: Idea) {
    setSavedIdeas(prev => {
      const exists = prev.some(i => i.title === idea.title)
      const next   = exists ? prev.filter(i => i.title !== idea.title) : [...prev, idea]
      storeSaved(next); setSavedIds(new Set(next.map(i => i.title))); return next
    })
  }

  const displayIdeas = tab === 'saved' ? savedIdeas : ideas
  const hasResults = ideas.length > 0 || savedIdeas.length > 0

  return (
    <div className="min-h-screen relative" style={{ color: '#f0eeff' }}>
      <AnimatedBg />

      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes panelIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        .glass-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f0eeff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .glass-input:focus {
          outline: none;
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .glass-input::placeholder { color: rgba(255,255,255,0.25); }
        select.glass-input option { background: #0d0920; }
      `}</style>

      <div className="relative z-10">

        {/* ── HERO SECTION — split layout ── */}
        <section className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT — headline + generator */}
            <div style={{ animation: mounted ? 'heroIn 0.6s cubic-bezier(0.23,1,0.32,1) both' : undefined }}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', backdropFilter: 'blur(12px)' }}>
                <Sparkles size={11} className="text-violet-400" />
                <span className="text-violet-300 text-[11px] font-bold uppercase tracking-widest">
                  AI-powered · Sell for $9–$27
                </span>
              </div>

              <h1 className="font-black text-white mb-5 leading-[0.95]"
                style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', letterSpacing: '-0.04em' }}>
                Find trending<br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)' }}>
                  PDF ideas
                </span>{' '}that<br />
                actually sell.
              </h1>

              <p className="text-white/50 mb-8 leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: 460 }}>
                AI scans real search demand, scores each opportunity, then writes the full guide — ready to list on Gumroad, Etsy, or Ko-fi.
              </p>

              {/* Generator card */}
              <div className="rounded-2xl p-5 mb-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)' }}>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block font-medium">Topic (optional)</label>
                    <input className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                      placeholder="e.g. meal prep for busy mums..."
                      value={topic} onChange={e => setTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generate()} />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block font-medium">
                      Niche <span className="text-pink-400">*</span>
                    </label>
                    <select className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
                      value={niche} onChange={e => setNiche(e.target.value)}>
                      <option value="">Select niche...</option>
                      {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-white/40 text-xs mb-2 block font-medium">
                    Ideas to generate: <span className="text-white font-bold">{count}</span>
                  </label>
                  <input type="range" min={3} max={20} value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    className="w-full accent-violet-500" />
                  <div className="flex justify-between text-white/20 text-[10px] mt-1"><span>3</span><span>10</span><span>20</span></div>
                </div>

                {error && <p className="text-pink-400 text-xs mb-3 flex items-center gap-1.5">⚠ {error}</p>}

                <button onClick={generate} disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)', boxShadow: loading ? 'none' : '0 4px 24px rgba(124,58,237,0.35)' }}>
                  {loading
                    ? <><span className="animate-spin">⟳</span> Generating ideas...</>
                    : <><Zap size={16}/> Generate Ideas</>}
                </button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-4 text-xs text-white/35">
                {['No account needed', 'Free to start', 'Instant results'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="text-green-400">✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — animated demo panel */}
            <div className="lg:block hidden" style={{ animation: mounted ? 'panelIn 0.7s 0.15s cubic-bezier(0.23,1,0.32,1) both' : undefined }}>
              <DemoPanel />
            </div>
          </div>

          {/* Mobile: mini stats strip */}
          <div className="lg:hidden mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Ideas/month', value: '14k+', icon: '⚡' },
              { label: 'Avg price', value: '$17', icon: '💰' },
              { label: 'Guides sold', value: '3.1k', icon: '📄' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-white font-bold text-sm">{s.value}</div>
                <div className="text-white/35 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="px-6 py-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white font-black text-3xl mb-3" style={{ letterSpacing: '-0.03em' }}>From idea to income in 3 steps</h2>
            <p className="text-white/40 max-w-md mx-auto text-sm">No writing experience needed. AI handles research, structure, and content.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: <Target size={22}/>, title: 'Pick your niche', desc: 'Choose from 20 proven niches. AI scores each idea by real search demand and competition gap.', color: '#7c3aed' },
              { n: '02', icon: <Sparkles size={22}/>, title: 'AI writes the guide', desc: 'Full chapter outline, hooks, and body content generated in under 60 seconds. Export as PDF.', color: '#a855f7' },
              { n: '03', icon: <DollarSign size={22}/>, title: 'Publish and earn', desc: 'One-click listing to Gumroad, Etsy, or Ko-fi. Guides sell at $9–$27 — passive income from day one.', color: '#ec4899' },
            ].map(s => (
              <div key={s.n} className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black text-white/20 font-mono">{s.n}</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}30`, color: s.color }}>
                    {s.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RESULTS SECTION ── */}
        {hasResults && (
          <section className="px-6 pb-20 max-w-7xl mx-auto">
            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-6 p-1 rounded-xl border border-white/[0.06] w-fit"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              {(['generate', 'saved'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === t ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  style={tab === t ? { background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.3)' } : {}}>
                  {t === 'generate' ? `Ideas (${ideas.length})` : `Saved (${savedIdeas.length})`}
                </button>
              ))}
            </div>

            {displayIdeas.length === 0
              ? <div className="text-center py-16 text-white/25 text-sm">
                  {tab === 'saved' ? 'No saved ideas yet — generate some above' : 'Generate ideas above'}
                </div>
              : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayIdeas.map((idea, i) => (
                    <IdeaCard key={idea.title} idea={idea} index={i} savedIds={savedIds} onToggleSave={toggleSave} />
                  ))}
                </div>
            }
          </section>
        )}

        {/* ── EMPTY STATE — before generating ── */}
        {!hasResults && (
          <section className="px-6 pb-20 max-w-7xl mx-auto">
            <div className="rounded-2xl p-12 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-white font-bold text-lg mb-2">Ready to find your next bestseller?</h3>
              <p className="text-white/35 text-sm max-w-sm mx-auto">Pick a niche above and hit Generate — AI will surface 10 high-opportunity PDF ideas with scores, pricing, and full chapter outlines.</p>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
