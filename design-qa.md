# Design QA

## Evidence

- Primary source visual truth: Figma file `I8tmNVbEWb2l0cUkAoIg5T`, node `0:3` (`3 block`), natural size 1835 × 593 px.
- Secondary source truth: `C:/Users/босс77/Downloads/pen.png`, 244 × 217 px with transparency, plus the latest annotated manifesto captures at 1005 × 1081 and 851 × 912 CSS px.
- Rendered implementation: `http://127.0.0.1:5174/#main`, captured in the Codex in-app browser as inline task evidence.
- Comparison viewports: 1005 × 1081, 851 × 912, and 567 × 698 CSS px, inspected at 1:1 browser density.
- State: 3 block aligned below About, then manifesto/CTA after navigating to Cases and paging down.

## Full-view comparison evidence

- Fonts and typography: Druk Cyr scales from the Figma 113 px master size and Object Sans from 48 px using container-relative units. At a 767 px block width the measured sizes are 47.23 px and 20.06 px, exactly proportional to 767/1835. Line height, tracking, underline, and two-line wrapping match the node.
- Spacing and layout rhythm: the 3 block retains the 1835:593 frame ratio, 1273:523 column ratio, and 39 px master gap. Text starts at the proportional equivalent of x=50/y=100; the mobile render preserves the same composition rather than switching to an unrelated breakpoint layout.
- Colors and visual tokens: the charcoal navigation/manifesto, white page, orange controls, and muted handwritten copy preserve the supplied palette and contrast.
- Image quality and asset fidelity: the existing `portrait.png` is byte-identical to the exact Figma asset export, and the CSS reproduces Figma's crop coordinates. The supplied transparent `pen.png` remains unmodified and reports its original 244 × 217 natural size.
- Copy and content: visible copy is unchanged, the Telegram CTA remains correct, and each case exposes a descriptive button label.

## Focused region comparison evidence

- The Figma node screenshot and browser-rendered 3 block were compared at desktop and mobile sizes. The heading, body copy, highlight angle, photo crop, grid proportions, and rounded corners retain the same relative placement.
- The supplied `pen.png` and annotated manifesto captures were compared with the browser-rendered manifesto at 1005 × 1081 and 851 × 912. The pencil is now absolutely positioned inside `.manifesto-ending`, so its left edge derives from the final period instead of from a percentage of the whole section.
- At 851 px the ending span measures x=595.03, width=30.34 and the animated pencil begins at x=618.93; this places its left edge over the period's final glyph area. Its base y position is calculated from the span line height, so it stays attached across responsive sizes.
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
6. New Figma comparison — P2: the 3 block used smaller breakpoint-specific type and an approximate photo crop, so its hierarchy did not scale proportionally to node `0:3`; the pencil was positioned from the manifesto section rather than the final period.
7. Fix — rebuilt the block around its 1835 × 593 master geometry using container units, exact grid ratios, master typography, and Figma crop coordinates; moved the animated pencil into the `that.` anchor span.
8. Post-fix comparison — the 1005 × 1081 and 567 × 698 captures preserve the Figma composition, and the 851 × 912 measurements confirm the pencil follows the period rather than a viewport percentage.

## Interactions and runtime checks

- Tested direct case-card selection and verified DOM position changes after the spring transition.
- Tested navigation from the page top to Cases and confirmed the header is absent after scrolling.
- Verified the supplied pencil source, intrinsic dimensions, responsive rendered size, and animation displacement.
- Verified Figma-derived typography and grid measurements at desktop and mobile widths.
- Verified the final-period anchor numerically at 851 × 912 and visually at 1005 × 1081.
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
- [x] Figma node `0:3` geometry, typography, highlight, and image crop.
- [x] Pencil anchored to the final period instead of the section viewport.
- [x] Desktop and mobile browser checks.
- [x] Console, lint, and production-build checks.

## Follow-up Polish

No P3 follow-up is required for the annotated scope.

final result: passed
