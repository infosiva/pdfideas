'use client'
import Link from 'next/link'
import { Search, Sparkles, FileText, DollarSign, ArrowRight, Zap } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Pick a niche',
    desc: 'Choose from 20 proven niches — Parenting, Finance, Fitness, Productivity and more. Or type in your own topic idea.',
    detail: 'We surface niches with real search demand and manageable competition — sweet spots where a $9–$27 guide sells without a big audience.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Generate ideas with AI',
    desc: 'Hit Generate and get up to 20 scored ideas in seconds. Each idea includes title, audience, pain point, chapters, suggested price, and an opportunity score.',
    detail: 'Opportunity score 0–100 weighs search volume, competition level, and trend direction. Focus on 70+ scores first.',
  },
  {
    step: '03',
    icon: FileText,
    title: 'Write the full guide',
    desc: 'Click "Write Guide" on any idea. AI writes a complete, structured guide — introduction, all chapters, conclusion, and a Gumroad-ready description.',
    detail: 'Typical guide: 1,500–3,000 words, 5–8 chapters, ready to paste into Canva or Google Docs. Takes about 30 seconds.',
  },
  {
    step: '04',
    icon: DollarSign,
    title: 'List and sell',
    desc: 'Hit "Gumroad" to open a pre-filled product listing. Set your price ($9–$27), upload the guide as PDF, and you\'re live.',
    detail: 'Gumroad charges 10% + payment fees. No monthly subscription. You keep 85–90% of every sale.',
  },
]

const FAQS = [
  {
    q: 'Do I need to be an expert to write these guides?',
    a: 'No. The AI does the research and writing. Your job is to pick a good niche and add your personal framing. Buyers want concise, actionable guides — not academic papers.',
  },
  {
    q: 'How long does it take from idea to published?',
    a: 'Idea → written guide → Gumroad listing takes about 10 minutes. Building a library of 10–20 guides takes a weekend.',
  },
  {
    q: 'What makes a guide sell vs. sit unsold?',
    a: 'Specificity wins. "The First 30 Days With a New Puppy" outsells "Dog Care Guide" every time. Our opportunity scores and audience fields help you get specific.',
  },
  {
    q: 'Can I sell the same guide on Etsy too?',
    a: 'Yes. Export the text, design a cover in Canva, export as PDF, and list on Etsy Digital Downloads. Many creators list on both platforms.',
  },
  {
    q: 'Is PDFIdeas free?',
    a: 'Yes — generating ideas and writing guides is free. No account required. We make money if you love the tool and tell others about it.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080712' }}>
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20 mb-4">
            <Zap size={12} /> From zero to selling in 10 minutes
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            How PDFIdeas works
          </h1>
          <p className="text-white/45 text-lg max-w-2xl mx-auto">
            AI finds the gap, writes the guide, and pre-fills your Gumroad listing.
            You review, publish, and collect the sales.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-20">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i}
                className="rounded-2xl border border-white/[0.08] p-6 flex gap-5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(124,58,237,0.15)' }}>
                    <Icon size={22} className="text-violet-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-violet-500/60 text-xs font-mono font-bold">{s.step}</span>
                    <h3 className="text-white font-bold text-lg">{s.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-2">{s.desc}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{s.detail}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold text-white mb-6">Common questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i}
                className="rounded-xl border border-white/[0.06] p-5"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-white font-semibold text-sm mb-2">{faq.q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-violet-500/20 p-10"
          style={{ background: 'rgba(124,58,237,0.06)' }}>
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to find your first idea?</h2>
          <p className="text-white/45 mb-6">No account. No credit card. Just ideas that sell.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
          >
            <Zap size={16} /> Generate Ideas Free
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
