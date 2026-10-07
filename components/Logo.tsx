// Brand logo: mark + wordmark. Same mark as app/icon.svg.
export function Logo({ size = 28, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="PDFIdeas">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#4ad926" />
        <path d="M19 12h19l9 9v31a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z" fill="#f6faf1" />
        <path d="M38 12v9h9" fill="#cfe3c4" />
        <path d="M22 30h20M22 37h14M22 44h9" stroke="#0f1a0b" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 6l1.8 4.2L54 12l-4.2 1.8L48 18l-1.8-4.2L42 12l4.2-1.8z" fill="#0f1a0b" />
      </svg>
      {showText && (
        <span style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          PDF<span style={{ color: "var(--accent-ink)" }}>Ideas</span>
        </span>
      )}
    </span>
  );
}
export default Logo;
