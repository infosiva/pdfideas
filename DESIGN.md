# PDFIdeas design

Source of truth: `design-system/` (MASTER.md, tokens, `components/AnimatedBg.tsx`). This file only records project choices.

- Accent: `#4ad926` (lime green on pale green); palette checked with `design-system/scripts/check-palettes.mjs`.
- Hub override: Edge Config `theme_pdfideas.design` (dials, brief, palette, `layout.bgAnimation`/`bgSpeed`) wins over these values; loaded by `lib/theme-loader.ts` and applied in `app/layout.tsx`.
- Background: `components/AnimatedBg.tsx` (hub-driven, reduced-motion safe).
- Logo: `components/Logo.tsx` (PDFIdeas, accent on the second word), used in the navbar/header; favicon is `app/icon.svg` (same mark).
- ai-core: planned: PDF upload and grounded answers must use ai-core (upload-token + RAG). BLOCKED on an ai-core tenant key (owner-queued); until then no document storage or ad-hoc embeddings exist here.
