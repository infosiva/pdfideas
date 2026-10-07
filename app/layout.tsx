import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import config from '@/vertical.config'
import { loadSiteTheme, buildThemeStyleTag, buildGa4Snippet } from '@/lib/theme-loader'
import { AnimatedBg } from '@/components/AnimatedBg'
import ConsentBanner from '@/components/ConsentBanner'
import Navbar from '@/components/Navbar'
import FloatingChatWrapper from '@/components/FloatingChatWrapper'
import { getSiteFlags } from '@/lib/flags'
import FeedbackWidget from '@/components/FeedbackWidget'

import { MotionProvider } from "@infosiva/shared-ui/modern";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [flags, theme] = await Promise.all([getSiteFlags('pdfideas'), loadSiteTheme('pdfideas')])
  const ga4 = buildGa4Snippet(theme)
  return (
    <html
      lang="en"
      data-layout={theme?.layout?.archetype ?? 'docs-knowledge'}
      className="h-full"
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: buildThemeStyleTag(theme) }} />
        <meta name="google-adsense-account" content="ca-pub-4237294630161176" />
        <Script
                  async
                  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4237294630161176"
                  crossOrigin="anonymous"
                  strategy="afterInteractive"
                />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": config.name,
          "url": `https://${config.domain}`,
          "description": config.metaDescription
        })}} />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <AnimatedBg theme={theme} fallback="none" />
        <Navbar />

        <main className="flex-1">
          <MotionProvider>{children}</MotionProvider>
        </main>

        <footer className="border-t py-8 px-6" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-3)' }}>
            <span>© {new Date().getFullYear()} {config.name}. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-2)' }}>Privacy</a>
              <a href="/terms"   className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-2)' }}>Terms</a>
            </div>
          </div>
        </footer>
        {flags.chatbot && <FloatingChatWrapper />}
        <FeedbackWidget siteName="PDFIdeas" />
        {ga4 && <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${theme?.analytics?.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{ga4}</Script>
        </>}
        <ConsentBanner />
      </body>
    </html>
  )
}
