import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import config from '@/vertical.config'
import { getMeshStyle, getScrollbarColor, COLOR_MAP } from '@/lib/themeColors'
import Navbar from '@/components/Navbar'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import BackToTop from '@/components/BackToTop'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:       config.metaTitle,
  description: config.metaDescription,
  keywords:    config.keywords,
  metadataBase: new URL(`https://${config.domain}`),
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": config.name,
          "url": `https://${config.domain}`,
          "description": config.metaDescription
        })}} />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col text-white`}
        style={{ background: colors.base }}
      >
        {/* Dynamic mesh gradient bg — changes per vertical */}
        <div style={meshStyle} />

        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-white/[0.06] py-8 px-6">
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
        <BackToTop accentColor="#7c3aed" />
        <Script defer data-site={config.domain} src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
