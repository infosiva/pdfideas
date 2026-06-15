import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import config from '@/vertical.config'
import { getMeshStyle, getScrollbarColor, COLOR_MAP } from '@/lib/themeColors'
import Navbar from '@/components/Navbar'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import BackToTop from '@/components/BackToTop'
import FeedbackWidget from '@/components/FeedbackWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:       config.metaTitle,
  description: config.metaDescription,
  keywords:    config.keywords,
  metadataBase: new URL(`https://${config.domain}`),
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
}

// Derive CSS custom properties from vertical theme at build time
const colors   = COLOR_MAP[config.themeColor] ?? COLOR_MAP['violet']
const meshStyle = getMeshStyle(config.themeColor)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
      style={{
        // CSS vars consumed by globals.css animations and scrollbar
        '--theme-primary':   colors.primary,
        '--theme-secondary': colors.secondary,
        '--theme-base':      colors.base,
        '--scrollbar-color': getScrollbarColor(config.themeColor),
      } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": config.name,
          "url": `https://${config.domain}`,
          "description": config.metaDescription
        })}} />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col text-[#f3e8ff]`}
        style={{ background: '#1e1b2e' }}
      >
        {/* Subtle top border accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #e879f9, #f0abfc, #c026d3)', flexShrink: 0 }} />

        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-white/[0.08] py-8 px-6 bg-[#1e1b2e]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
            <span>© {new Date().getFullYear()} {config.name}. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white/70 transition-colors">Privacy</a>
              <a href="/terms"   className="hover:text-white/70 transition-colors">Terms</a>
              <a href="/contact" className="hover:text-white/70 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
        <FloatingChatWrapper />
        <BackToTop accentColor="#e879f9" />
        <FeedbackWidget siteName="PDFIdeas" />
        <Script defer data-site={config.domain} src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
