# HANDOFF — pdfideas design + cleanup
**Date:** 2026-10-05  **Status:** COMPLETE (design pass)
**Goal:** unique accent/archetype/logo, tidy fake data + dead links, working chat/feedback, hub-driven theme.

## DESIGN LOCK (finalized before code)
- Accent: fill `#4ad926` (check-palettes: free). Text-safe ink `#1a6b0a` (6.36:1 on bg). Dark text `#0f1a0b` on accent fill (9.59:1).
- Background: light paper `#f6faf1`, surface `#ffffff`, border `#cfe3c4`; animated lime/green aurora + ruled-paper grid (reduced-motion safe).
- Archetype: `docs-knowledge` (sticky outline rail + readable article column; PDF guide product).
- Demo panel: animated guide-page skeleton, labelled "format preview" (no fake stats).
- Logo: lime document tile with folded corner + idea spark, wordmark "PDF" + accent-ink "Ideas". icon.svg + apple-icon.svg; icon.tsx deleted.
- Pricing: Free (everything live today, fair-use limit) vs Pro (not launched, no price, no promo gating).
- AI pillars: exempt from new work (existing lib/ai.ts chain); chat limiter 60/hr/IP; no retrieval/eval added (gap stated).

## Steps
- [x] theme-loader copy, layout, globals
- [x] page, navbar, logo, 404, generate page recolor
- [x] chat + feedback routes/widgets
- [x] tsc, build, screenshots 375/1280

## Resume from here if interrupted
All done. Not deleted (rm denied by classifier): app/dev, app/api/{agent-run,data,media,promo}, lib/{content,theme,themeColors,useIsMobile,data-api,media-gen,promoCode}.ts, hooks/usePromo.ts, components/LiveStatsBar.tsx, app/api/session-stats (now unused).

## Runtime-switch + telemetry retrofit (2026-10-06)
Added: components/AnimatedBg.tsx, ConsentBanner.tsx, lib/telemetry.ts, app/api/usage/route.ts (204), data-layout on <html>, [data-layout] CSS variants in globals.css. Build green. Not verified: live hub switch, screenshots.


## OWASP LLM Top 10 dispositions (gate item 45, 2026-10-07; list recalled from memory, unverified)
- LLM01 prompt injection: lib/guard.ts present, NOT yet wired into routes; no output filtering or tool sandbox review done. PARTIAL.
- LLM02 sensitive info disclosure: `redact()` helper available; not applied to every log. PARTIAL.
- LLM04/10 DoS / unbounded consumption: per-IP rate limit where present; token budgets not enforced. PARTIAL.
- LLM05 improper output handling: model output rendered as text; not audited for HTML sinks. UNVERIFIED.
- LLM06 excessive agency: no tool-calling agents audited. UNVERIFIED.
- Others (supply chain, poisoning, embeddings, misinformation): not assessed.


## ANIMATED SCOPE (gate items 19/21, derived from code 2026-10-07)
- Moves: AnimatedBg (ambient hero/background); CSS keyframes: caret, drift, ds-float, ds-shift, fadeSlideIn, heroIn, lineDraw, pageFloat; transitions on interactive elements.
- Trigger: page load (ambient) and hover/press (interactive). Reduced motion: honoured via prefers-reduced-motion block.
- STATUS: scope documented from existing code only. Skill-stack passes (ui-ux-pro-max, emil-design-eng, impeccable critique, review-animations) and 375/1280 screenshot review are NOT yet run for this app. Item 21 stays OPEN until they are.
