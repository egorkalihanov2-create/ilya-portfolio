# Mobile Design QA

## Evidence

- Source visual truth: Figma file `ec3iV5MVkpyzwRXnxoJO0o`, node `1:2` (`402 × 2555` px).
- Source screenshot: `qa/figma-mobile-source.png`.
- Rendered implementation: `http://127.0.0.1:5174/`, captured in the Codex in-app browser at a `402 × 850` CSS px viewport with a full-page capture.
- Density normalization: source and implementation were inspected at a 402 CSS-pixel width (1:1 design width); no device bezel or browser chrome was included.
- State: page loaded at `#main`, entrance animations settled. Case-stack entrance, navigation anchors, and responsive desktop preservation were checked separately.

## Full-view comparison evidence

The rendered page uses the same eight-section order and measured widths/heights as the Figma frame:

| Section | Rendered size |
| --- | --- |
| Hero | 402 × 696 |
| Intro | 384 × 80 |
| Statement | 373 × 354 |
| Work folders | 372 × 263 |
| Cases | 384 × 521 |
| Manifesto | 372 × 92 |
| CTA | 384 × 222 |
| Contacts | 306.6 × 7.8 |

The source and browser capture were both opened and inspected. A temporary side-by-side browser page could not be created because the browser blocked a `data:` URL; comparison was therefore performed against the same-width source and implementation captures already open in the session.

## Focused region evidence

- Typography: Object Sans Regular/Heavy, Druk Cyr Medium, and Vasek Italic load from the project assets. The statement display type, intro copy, compact navigation, and footer match the measured Figma sizes and line heights.
- Spacing/layout: section sizes, 43 px rhythm (10.6965vw at 402 px), two-column folder grid, and three-card diagonal case layout match the source measurements.
- Colors/tokens: white canvas, translucent charcoal header, orange `#ffb900`, light folder surface, dark statement gradient, and dark manifesto surface match the source palette.
- Image quality: the exact Figma hero and statement raster assets are used at mobile width; existing campaign, logo, hand, head, and pen assets are retained without CSS or SVG substitutes.
- Copy/content: all visible labels and portfolio copy match the supplied design/content.

## Interaction and accessibility checks

- Header remains in normal page flow/absolute placement and scrolls away rather than sticking.
- Intro fades in; statement reveals photo, shade, then copy/highlight; case cards spread from a vertically offset stack; CTA reuses the paired desktop motion.
- `prefers-reduced-motion` disables entrance/infinite movement while preserving content.
- Case cards remain buttons and swipeable; folder cards and CTA links retain semantic controls and focus states.
- Browser console: no warnings or errors.
- Desktop regression check: 1278 × 912 viewport; statement grid, folders, carousel, manifesto, and CTA remain intact.

## Findings

- No actionable P0/P1/P2 mismatch remains in the checked mobile or desktop states.
- P3: browser raster previews soften small text slightly compared with the Figma canvas, but the production font files, sizes, and source assets are correct.

## Comparison history

- Initial implementation: desktop DOM order changed when the mobile statement layers were introduced.
- Fix: desktop grid columns were explicitly assigned and the mobile shade was hidden outside the mobile breakpoint.
- Post-fix evidence: desktop 1278 × 912 browser capture shows the original copy-left/portrait-right composition restored; mobile captures retain the layered photo treatment.
- First visual comparison: the source hero hides the raster asset's embedded “This is” label beneath the translucent navigation, while a few pixels remained visible in the initial browser capture (P2 above-the-fold mismatch).
- Fix: a proportional white crop mask now covers only the label's residual pixels between the navigation and orange image surface.
- Post-fix evidence: the 402 px browser capture now begins with the compact navigation followed by a clean white gutter and the orange hero surface, matching the Figma source.

## Final result

final result: passed
