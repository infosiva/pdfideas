/**
 * vertical.config.ts — THE ONLY FILE THAT CHANGES PER DEPLOYMENT
 *
 * Copy this file, fill in your vertical, deploy to Vercel.
 * All other code reads from this config at runtime.
 */

export type PricingModel = 'hourly' | 'fixed' | 'session' | 'quote'
export type BookingFlow  = 'instant' | 'quote_first' | 'consult_first'

export interface VerticalConfig {
  // ── Identity ────────────────────────────────────────────
  id:          string
  name:        string
  tagline:     string
  domain:      string
  themeColor:  string

  // ── Provider terminology ─────────────────────────────────
  providerLabel:  string
  providerPlural: string
  consumerLabel:  string

  // ── Service categories ───────────────────────────────────
  categories: Category[]

  // ── Booking ──────────────────────────────────────────────
  pricingModel:   PricingModel
  bookingFlow:    BookingFlow
  minPrice:       number
  maxPrice:       number
  sessionMinutes: number
  platformFeePercent: number

  // ── AI context ───────────────────────────────────────────
  aiSystemPrompt: string
  aiMatchHints:   string[]

  // ── Features (toggle) ───────────────────────────────────
  features: {
    backgroundCheck:  boolean
    portfolioPhotos:  boolean
    videoIntro:       boolean
    instantBook:      boolean
    recurringBook:    boolean
    homeVisit:        boolean
    remoteSession:    boolean
    groupSession:     boolean
    insuranceBadge:   boolean
    aiDiagnosis:      boolean
    careJournal:      boolean
  }

  // ── SEO / meta ───────────────────────────────────────────
  metaTitle:       string
  metaDescription: string
  keywords:        string[]
}

export interface Category {
  id:    string
  label: string
  icon:  string
  desc:  string
}

// ════════════════════════════════════════════════════════════
// ACTIVE VERTICAL — PDFIdeas
// ════════════════════════════════════════════════════════════

const config: VerticalConfig = {
  id:         'pdfideas',
  name:       'PDFIdeas',
  tagline:    'AI-powered PDF guide ideas you can sell on Gumroad today',
  domain:     'pdfideas.app',
  themeColor: 'violet',

  providerLabel:  'Guide',
  providerPlural: 'Guides',
  consumerLabel:  'Creator',

  categories: [
    { id: 'parenting',      label: 'Parenting',          icon: '👶', desc: 'Baby sleep, toddler routines, school readiness' },
    { id: 'health',         label: 'Health & Wellness',  icon: '💚', desc: 'Meal prep, habit stacks, stress management' },
    { id: 'finance',        label: 'Personal Finance',   icon: '💰', desc: 'Budgeting, debt payoff, side income tracking' },
    { id: 'productivity',   label: 'Productivity',       icon: '⚡', desc: 'Time blocking, deep work, inbox zero' },
    { id: 'fitness',        label: 'Fitness',            icon: '🏋️', desc: 'Home workouts, running plans, nutrition guides' },
    { id: 'side-hustles',   label: 'Side Hustles',       icon: '🚀', desc: 'Freelancing, digital products, passive income' },
    { id: 'mental-health',  label: 'Mental Health',      icon: '🧠', desc: 'Anxiety tools, journaling, mindfulness' },
    { id: 'relationships',  label: 'Relationships',      icon: '❤️', desc: 'Dating guides, communication, boundaries' },
  ],

  pricingModel:        'fixed',
  bookingFlow:         'instant',
  minPrice:            9,
  maxPrice:            27,
  sessionMinutes:      0,
  platformFeePercent:  0,

  aiSystemPrompt: `You are a PDF guide creation assistant for PDFIdeas.
Help creators find trending niches, write compelling guide titles, and identify
profitable gaps in digital product markets. You specialise in guides sold on
Gumroad, Etsy, and Ko-fi for $9–$27.
When asked for ideas, return structured JSON with title, audience, pain point,
chapter outline, suggested price, and opportunity score.
Be specific, actionable, and commercially minded — creators need ideas that sell,
not vague concepts.`,

  aiMatchHints: [
    'trending search volume', 'low competition niche', 'impulse-buy price point',
    'evergreen topic', 'emotional pain point', 'quick-win promise',
  ],

  features: {
    backgroundCheck:  false,
    portfolioPhotos:  false,
    videoIntro:       false,
    instantBook:      true,
    recurringBook:    false,
    homeVisit:        false,
    remoteSession:    true,
    groupSession:     false,
    insuranceBadge:   false,
    aiDiagnosis:      true,
    careJournal:      false,
  },

  metaTitle:       'PDFIdeas — AI PDF Guide Ideas to Sell on Gumroad',
  metaDescription: 'Generate trending PDF guide ideas with AI. Find profitable niches, get chapter outlines, and publish to Gumroad in minutes. Free to use.',
  keywords:        ['pdf guide ideas', 'gumroad ideas', 'digital products to sell', 'passive income pdf', 'ai content ideas', 'etsy digital download ideas'],
}

export default config

// ════════════════════════════════════════════════════════════
// OTHER VERTICALS (copy + swap the export above)
// ════════════════════════════════════════════════════════════

export const PRESETS: Record<string, Partial<VerticalConfig>> = {
  eldercare: {
    id: 'eldercare', name: 'ElderCare+', themeColor: 'violet',
    tagline: 'Trusted carers for your loved ones — found in minutes, not days',
    domain: 'eldercare.plus',
    providerLabel: 'Carer', providerPlural: 'Carers', consumerLabel: 'Family',
    pricingModel: 'hourly', bookingFlow: 'consult_first',
    features: { backgroundCheck:true, portfolioPhotos:true, videoIntro:true,
      instantBook:false, recurringBook:true, homeVisit:true, remoteSession:false,
      groupSession:false, insuranceBadge:true, aiDiagnosis:false, careJournal:true },
  },
  mechanics: {
    id: 'mechanics', name: 'MechFix', themeColor: 'orange',
    tagline: 'Find a trusted local mechanic — AI pre-diagnosis included',
    providerLabel: 'Mechanic', providerPlural: 'Mechanics', consumerLabel: 'Driver',
    pricingModel: 'quote', bookingFlow: 'quote_first',
    features: { backgroundCheck:false, portfolioPhotos:true, videoIntro:false,
      instantBook:false, recurringBook:false, homeVisit:true, remoteSession:false,
      groupSession:false, insuranceBadge:true, aiDiagnosis:true, careJournal:false },
  },
  music: {
    id: 'music', name: 'TuneUp', themeColor: 'indigo',
    tagline: 'Learn any instrument from verified local tutors',
    providerLabel: 'Tutor', providerPlural: 'Tutors', consumerLabel: 'Student',
    pricingModel: 'session', bookingFlow: 'instant',
    features: { backgroundCheck:true, portfolioPhotos:true, videoIntro:true,
      instantBook:true, recurringBook:true, homeVisit:true, remoteSession:true,
      groupSession:true, insuranceBadge:false, aiDiagnosis:false, careJournal:false },
  },
  wedding: {
    id: 'wedding', name: 'WedFlow', themeColor: 'rose',
    tagline: 'Every wedding vendor you need — curated, reviewed, instantly bookable',
    providerLabel: 'Vendor', providerPlural: 'Vendors', consumerLabel: 'Couple',
    pricingModel: 'fixed', bookingFlow: 'quote_first',
    features: { backgroundCheck:false, portfolioPhotos:true, videoIntro:true,
      instantBook:false, recurringBook:false, homeVisit:false, remoteSession:false,
      groupSession:false, insuranceBadge:false, aiDiagnosis:false, careJournal:false },
  },
  nutrition: {
    id: 'nutrition', name: 'NutriCoach', themeColor: 'green',
    tagline: 'Personalised nutrition coaching — AI-matched to your goals',
    providerLabel: 'Nutritionist', providerPlural: 'Nutritionists', consumerLabel: 'Client',
    pricingModel: 'session', bookingFlow: 'consult_first',
    features: { backgroundCheck:false, portfolioPhotos:false, videoIntro:true,
      instantBook:false, recurringBook:true, homeVisit:false, remoteSession:true,
      groupSession:true, insuranceBadge:true, aiDiagnosis:false, careJournal:true },
  },
}
