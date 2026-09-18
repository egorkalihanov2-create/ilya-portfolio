# Design QA

## Evidence

- Source visual truth: `C:/Users/босс77/Downloads/pen.png`, 244 × 217 px with transparency.
- Layout and interaction targets: the latest annotated browser captures at 567 × 698 CSS px and 1005 × 698 CSS px.
- Rendered implementation: `http://127.0.0.1:5173/#main`, captured in the Codex in-app browser as inline task evidence.
- Comparison viewports: 567 × 698 CSS px and 1005 × 698 CSS px, both inspected at 1:1 browser density.
- State: top-of-page navigation, gallery with the second card selected, and manifesto/CTA after scrolling.

## Full-view comparison evidence

- Fonts and typography: the bundled Object Sans, Druk Cyr, and Vasek files still render without fallback changes, truncation, or new line-wrap regressions.
- Spacing and layout rhythm: the navigation remains in its original top position but now leaves the viewport with the document. Gallery overlap, manifesto spacing, CTA spacing, radii, and page width remain intact at both tested sizes.
- Colors and visual tokens: the charcoal navigation/manifesto, white page, orange controls, and muted handwritten copy preserve the supplied palette and contrast.
- Image quality and asset fidelity: the previous cropped raster was replaced by the supplied transparent `pen.png` without CSS cropping, synthetic redraw, or transparency halo. The browser reports the original 244 × 217 natural size.
- Copy and content: visible copy is unchanged, the Telegram CTA remains correct, and each case exposes a descriptive button label.

## Focused region comparison evidence

- The supplied `pen.png` and annotated manifesto captures were compared with the browser-rendered manifesto at both target viewports. At 1005 px the rendered pencil measures about 97 × 87 CSS px; at the mobile breakpoint it uses a smaller clamped width. It stays next to the sentence ending while crossing the dark-block edge as in the target.
- Motion was measured at two animation timestamps: the pencil moved from y=282.15 px to y=286.58 px while retaining its proportions. The percentage-based amplitude scales with the object, and `prefers-reduced-motion` disables the loop.
- Clicking `Show case 2` changed it from `case-position-1` to the front `case-position-2`; the other cards rotated to positions 1 and 0, confirming card-level navigation.
- After using the Cases navigation link at 567 × 698, the header was no longer visible, confirming it scrolls with the page instead of sticking to the viewport.
- The Heinz pill was visually checked in the 1005 × 698 manifesto capture and now sits on the text baseline rather than above it.

## Comparison history

1. Earlier iteration — P2: the award source contained an irrelevant second object and oversized transparent area; navigation and gallery behavior also differed from annotations.
2. Earlier fixes — cropped and resized the award, adjusted navigation spacing, corrected gallery cycling, and exposed the object as an independent annotation target.
3. Latest annotation — P2: navigation still needed to scroll away; cards needed direct selection; the old award needed replacement with the newly supplied transparent PNG; the Heinz pill sat too high.
4. Latest fixes — changed the header from fixed to document-positioned, converted case cards to accessible buttons, replaced the award with `pen.png`, added responsive/reduced-motion behavior, and lowered the Heinz pill to the text baseline.
5. Post-fix evidence — mobile and desktop browser captures show the header leaving the viewport, the selected card reaching the front, the new pencil rendering and moving responsively, and the Heinz pill aligned with the line.

## Interactions and runtime checks

- Tested direct case-card selection and verified DOM position changes after the spring transition.
- Tested navigation from the page top to Cases and confirmed the header is absent after scrolling.
- Verified the supplied pencil source, intrinsic dimensions, responsive rendered size, and animation displacement.
- Browser console errors and warnings: none.
- Production build: passed.
- ESLint: passed.

## Findings

No actionable P0, P1, or P2 findings remain in the annotated scope.

## Open Questions

None for the annotated scope.

## Implementation Checklist

- [x] Non-sticky navigation.
- [x] Clickable case cards.
- [x] Supplied transparent pencil asset.
- [x] Responsive and reduced-motion-aware pencil animation.
- [x] Heinz baseline alignment.
- [x] Desktop and mobile browser checks.
- [x] Console, lint, and production-build checks.

## Follow-up Polish

No P3 follow-up is required for the annotated scope.

final result: passed
