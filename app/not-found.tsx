import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-4">
      <h1 className="text-5xl font-extrabold" style={{ color: 'var(--foreground)' }}>404</h1>
      <p style={{ color: 'var(--text-2)' }}>That page does not exist.</p>
      <Link href="/" className="btn-accent px-6 rounded-xl min-h-11 inline-flex items-center">Back to PDFIdeas</Link>
    </div>
  )
}
