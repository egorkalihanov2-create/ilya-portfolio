# Design QA

## Evidence

- Source visual truth: `C:/Users/77FE78~1/AppData/Local/Temp/codex-clipboard-8cd39f01-cf74-4985-a505-5729e963dbae.png`
- Source pixels: 741 × 607 px.
- Secondary before-state evidence: `C:/Users/77FE78~1/AppData/Local/Temp/codex-clipboard-1084b28d-05d5-433c-9965-71c3121b03d9.png`.
- Latest source annotations: inline browser captures for navigation spacing and the original D&AD object scale at a 1278 × 912 viewport.
- Rendered implementation: `http://127.0.0.1:5173/#cases`, captured in the Codex in-app browser as inline task evidence.
- Desktop comparison viewport and screenshot: 1278 × 912 CSS px / 1278 × 912 px, 1:1 density. A 1051 × 912 breakpoint was measured separately.
- Mobile validation viewport and screenshot: 390 × 844 CSS px / 390 × 844 px, 1:1 density.
- State: gallery section visible, then manifesto and CTA visible after one page scroll; the next-gallery action was also captured after its spring transition settled.

## Full-view comparison evidence

- Typography: Object Sans, Druk Cyr, and Vasek render from the bundled font files; the manifesto hierarchy and handwritten line match the supplied visual direction. No unintended wrapping or truncation appeared at either tested viewport.
- Spacing and layout: navigation padding is fluid: 15.392 px at 1051 px and 20.142 px at 1278 px; its height is 60 px at both desktop checks. Section rhythm, card overlap, manifesto overflow, and CTA spacing remain intact on desktop and mobile.
- Colors and tokens: the charcoal manifesto/header, white page, orange controls, and muted handwritten copy preserve the source palette and opacity hierarchy.
- Image quality: the original D&AD raster is used. Its CSS crop removes the irrelevant second object and empty source area without introducing a replacement or synthetic approximation.
- Copy and content: the visible copy is unchanged. The primary CTA resolves to `https://t.me/wilyam_the_originator`.

## Focused region comparison evidence

- The supplied close-up and latest browser annotation were compared against the browser-rendered manifesto region at 1278 × 912. The D&AD pencil is smaller than the previous revision, starts at the period after `that.`, points down-right, crosses the dark-block boundary, and moves only three pixels vertically so it reads as a hovering punctuation mark. It is now a standalone selectable object rather than a child of the text span.
- The gallery was checked by DOM position before and after clicking Next. Before: `case-3` occupied `case-position-2`; after: `case-3` occupied `case-position-0`, while the other cards advanced. The returning card therefore travels behind the other two into the leftmost slot.
- A separate mobile capture confirmed that the award, gallery arrows, header, and CTA remain within the page width.

## Comparison history

1. Initial comparison — P2: the award was visually too small and its transparent crop left a large gap after the period. It also read as detached from the sentence.
2. Fix — recropped the original source image, enlarged its inline-relative wrapper, reversed the incorrect 180° orientation, and anchored it to the `manifesto-ending` span.
3. Post-fix comparison — the tip begins beside the period, the body follows the source direction and scale, and no P0/P1/P2 mismatch remains in the focused region.
4. Latest annotation — P2: the award had become too large at 1278 px and the header reverted to percentage padding above the old 1200 px breakpoint.
5. Latest fix — restored the award wrapper to its original responsive scale while preserving the improved crop and anchor; replaced the breakpoint jump with a fluid padding expression matching both annotated widths.
6. Latest post-fix comparison — the 1278 px capture shows the smaller award beside the period and measured navigation padding of 20.142 px. The 1051 px check measured 15.392 px; mobile stayed within the page width.
7. Final annotation refinement — reduced the award to a responsive 13.5% wrapper, moved it into an independent `motion.div`, exposed a named image target for annotations, and enabled its own pointer hit-target. The final 1278 px capture shows the standalone object without overlap or clipping.

## Interactions and runtime checks

- Tested desktop Next gallery button and verified the full card order change.
- Verified the left arrow orientation and mobile swipe-compatible layout.
- Verified the primary CTA Telegram URL without navigating away from the local preview.
- Browser console errors: none.
- Production build: passed.
- ESLint: passed.

## Findings

No actionable P0, P1, or P2 findings remain.

## Open Questions

None for the annotated scope.

## Implementation Checklist

- [x] Telegram CTA URL.
- [x] 1051 px navigation padding and reduced height.
- [x] Gallery cycle and rear-layer return.
- [x] Award crop, scale, orientation, anchor, and subtle motion.
- [x] Desktop and mobile responsive checks.
- [x] Console, lint, and build checks.

## Follow-up Polish

No P3 follow-up is required for the annotated scope.

final result: passed
