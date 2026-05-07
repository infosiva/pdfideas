'use client'
import { useState } from 'react'
import { Zap, TrendingUp, DollarSign, BookOpen, ArrowRight, Download } from 'lucide-react'

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

const BADGE: Record<string, string> = {
  high:    'bg-green-500/20 text-green-400',
  medium:  'bg-amber-500/20 text-amber-400',
  low:     'bg-red-500/20 text-red-400',
  rising:  'bg-violet-500/20 text-violet-400',
  stable:  'bg-blue-500/20 text-blue-400',
  falling: 'bg-red-500/20 text-red-400',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex flex-col items-center">
      <span className={`text-2xl font-extrabold ${color}`}>{score}</span>
      <span className="text-white/30 text-[10px]">opportunity</span>
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
  const [saved, setSaved]     = useState<Set<number>>(new Set())

  async function generate() {
    if (!niche) { setError('Select a niche'); return }
    setError('')
    setLoading(true)
    setIdeas([])
    try {
      const res  = await fetch('/api/ideas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ niche, topic, count }),
      })
      const data = await res.json() as { ideas?: Idea[]; error?: string }
      if (!res.ok || !data.ideas) { setError(data.error ?? 'Failed to generate ideas'); return }
      setIdeas(data.ideas)
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  function toggleSave(i: number) {
    setSaved(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  return (
    <div className="min-h-screen" style={{ background: '#080712' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,7,18,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-extrabold text-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            PDFIdeas
          </span>
          <div className="flex items-center gap-3 text-sm">
            <a href="/generate" className="text-white/50 hover:text-white transition-colors">My Guides</a>
            <a href="#"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium">
              Sell on Gumroad →
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20 mb-4">
            <Zap size={12} /> Find trending PDF ideas · AI writes the full guide · Sell for $9–$27
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Generate PDF Guide Ideas
          </h1>
          <p className="text-white/45 text-lg">Find trending PDF guide ideas based on real search data</p>
        </div>

        {/* Generator card */}
        <div className="rounded-2xl border border-white/[0.08] p-6 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)' }}>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Topic */}
            <div className="md:col-span-1">
              <label className="text-white/40 text-xs mb-1.5 block">Topic or Problem (Optional)</label>
              <input
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border border-white/10 outline-none focus:border-violet-500/50 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
                placeholder="e.g. healthy meal planning for busy parents..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
            </div>

            {/* Niche */}
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Niche <span className="text-red-400">*</span></label>
              <select
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border border-white/10 outline-none focus:border-violet-500/50 transition-colors"
                style={{ background: 'rgba(15,12,30,0.9)' }}
                value={niche}
                onChange={e => setNiche(e.target.value)}
              >
                <option value="">Select niche...</option>
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">
                Number of Ideas: <span className="text-white font-bold">{count}</span>
              </label>
              <input type="range" min={3} max={20} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-violet-500 mt-2" />
              <div className="flex justify-between text-white/25 text-xs mt-1">
                <span>3</span><span>10</span><span>20</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
          >
            <Zap size={16} />
            {loading ? 'Generating ideas...' : 'Generate Ideas'}
          </button>
        </div>

        {/* Results */}
        {ideas.length > 0 && (
          <>
            <p className="text-white/40 text-sm mb-4">
              Generated <strong className="text-white">{ideas.length}</strong> ideas for <strong className="text-violet-400">{niche}</strong>
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {ideas.map((idea, i) => (
                <div key={i}
                  className="rounded-2xl border border-white/[0.08] p-5 flex flex-col gap-3 hover:border-violet-500/30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm leading-snug mb-1">{idea.title}</h3>
                      <p className="text-white/45 text-xs leading-snug">{idea.subtitle}</p>
                    </div>
                    <ScoreBadge score={idea.opportunityScore} />
                  </div>

                  {/* Audience */}
                  <p className="text-white/35 text-xs flex items-center gap-1.5">
                    <BookOpen size={11} /> {idea.audience}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[idea.searchVolume]}`}>
                      {idea.searchVolume === 'high' ? 'High' : idea.searchVolume === 'medium' ? 'Med' : 'Low'} Interest
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[idea.competition]}`}>
                      {idea.competition === 'high' ? 'High' : idea.competition === 'medium' ? 'Med' : 'Low'} Competition
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[idea.trend]}`}>
                      {idea.trend.charAt(0).toUpperCase() + idea.trend.slice(1)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <DollarSign size={9}/>${idea.suggestedPrice}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-1">
                    <a
                      href={`/generate?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&audience=${encodeURIComponent(idea.audience)}&painPoint=${encodeURIComponent(idea.painPoint)}&chapters=${encodeURIComponent(JSON.stringify(idea.chapters))}`}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-white text-center flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                    >
                      <ArrowRight size={12}/> Write Full Guide
                    </a>
                    <button
                      onClick={() => toggleSave(i)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        saved.has(i)
                          ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                          : 'border-white/10 text-white/40 hover:border-white/25'
                      }`}
                    >
                      {saved.has(i) ? '✓ Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && ideas.length === 0 && (
          <div className="text-center py-16 text-white/25">
            <TrendingUp size={40} className="mx-auto mb-4 opacity-30" />
            <p>Select a niche and hit Generate Ideas</p>
          </div>
        )}
      </div>
    </div>
  )
}
