# Design QA — animated Cases accent

- Source visual truth: `C:\Users\77FE78~1\AppData\Local\Temp\codex-clipboard-fb291954-b2bc-489d-84db-1fe0412a7791.png`
- Desktop implementation: `output/playwright/cases-accent-visible.png`
- Mobile implementation: `output/playwright/cases-accent-mobile.png`
- Post-animation state: `output/playwright/cases-accent-hidden.png`
- Glitch state: `output/playwright/cases-accent-glitch.png`
- Direct `#cases` reload: `output/playwright/accent-direct-reload.png`
- Re-entry state: `output/playwright/accent-reentry.png`
- Combined comparison: `output/playwright/cases-accent-comparison.png`
- Desktop viewport: 1010 × 667 CSS px, device scale factor 1
- Source pixels: 1010 × 667
- Desktop implementation pixels: 1010 × 667
- Mobile viewport and implementation pixels: 512 × 884, device scale factor 1
- State: the Cases section immediately after entering the viewport, plus disappearance and mobile responsive states

## Full-view comparison evidence

The source and desktop implementation were placed side by side in `cases-accent-comparison.png`. The reference is used for the accent-word hierarchy and its placement behind the carousel; the portfolio intentionally preserves its existing carousel dimensions, project order, arrows, typography, and imagery. The final accent is moved lower than the source at the user's request so that a larger portion of the word is occluded by the cards.

## Focused region comparison evidence

The 512 × 884 capture focuses on the annotated carousel state. It confirms that the upper portion of `Cases` remains legible while its lower portion is hidden behind the centered project card. A separate post-animation capture confirms that the accent leaves no residual pixels or layout shift after disappearing.

## Required fidelity surfaces

- Fonts and typography: Object Sans Regular is loaded from the portfolio's existing font face and rendered at weight 400 with responsive display sizing and tight tracking.
- Spacing and layout rhythm: the accent is centered within the existing section, lowered to `clamp(110px, 16vh, 150px)`, and placed behind the cards without changing carousel geometry.
- Colors and visual tokens: the base accent uses `#ededed`; cyan and pink channel offsets appear only during the short glitch phase.
- Image quality and asset fidelity: all existing case images remain unchanged, uncropped beyond the established carousel behavior, and stay above the accent layer.
- Copy and content: the accent copy is exactly `Cases`; it is decorative and hidden from assistive technology.

## Comparison history

1. Earlier position used `clamp(54px, 8.5vh, 92px)` and was reported as too high.
2. The position was changed to `clamp(110px, 16vh, 150px)` so the cards obscure the lower part of the lettering.
3. Desktop and mobile captures confirm the requested overlap; the post-animation capture confirms complete disappearance.
4. The trigger was delayed by 550 ms and re-armed on viewport exit so Pages reloads and repeated visits reliably show the accent.

## Findings

No actionable P0, P1, or P2 mismatches remain for the requested accent treatment. The different side-card project shown in the reference is intentional existing carousel state, not part of this change.

## Primary interactions and runtime checks

- Scroll/navigation into the Cases section triggers the accent after a 550 ms settling delay.
- The word remains clearly visible for roughly 1.8 seconds and exits during a short glitch phase.
- Leaving the section and returning triggers the accent again.
- The carousel remains interactive and on top of the accent.
- Browser console checked: 0 errors and 0 warnings.

## Implementation checklist

- [x] Object Sans Regular accent added behind cards.
- [x] Reliable delayed in-view trigger with re-entry replay added.
- [x] 1–2 second hold and short glitch exit added.
- [x] Reduced-motion fallback added.
- [x] Desktop and mobile states verified.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed

---

# Design QA — mobile spacing and preview CTA

- Source visual truth paths: `conversation://browser-comment/1`, `conversation://browser-comment/2`, `conversation://browser-comment/3`
- Implementation screenshots: `output/playwright/main-spacing-388x884.png`, `output/playwright/preview-full-case-388x884.png`
- Source viewports: 388 × 884 CSS px for spacing annotations; 535 × 884 CSS px for the preview annotation
- Implementation viewport and pixels: 388 × 884 CSS px and 388 × 884 pixels, device scale factor 1
- State: Main page at the About/stacked-carousel region; Citydrive preview scrolled to its bottom; full-case navigation target loaded

## Full-view comparison evidence

The three annotated browser captures were compared with the post-change mobile Main and preview captures in the same task context. The implementation preserves the existing responsive composition and adds only the requested spacing and CTA.

## Focused region comparison evidence

- Computed style for `#about > p`: `margin-top: -1px`, `margin-bottom: 21px`.
- Computed style for `.msc-stack`: `margin-top: 36px`, `margin-bottom: 36px`.
- The preview CTA renders at 190 × 52 px on the 388 px viewport, is horizontally centered, uses the brand yellow `#ffb900`, and remains the final element in the scrollable preview.
- The Citydrive CTA resolved to `./cases.html?case=citydrive`; clicking it loaded the matching full-case heading.

## Required fidelity surfaces

- Fonts and typography: passed. The CTA uses the existing Object Sans heavy weight and preserves all preview typography.
- Spacing and layout rhythm: passed. The exact annotated margins are applied only to the responsive Main elements that own them.
- Colors and visual tokens: passed. The CTA reuses the established yellow/orange pill treatment (`#ffb900` with `#eb7500` shadow).
- Image quality and asset fidelity: passed. No imagery, crop, compression, or media behavior changed.
- Copy and content: passed. The CTA copy is exactly `View full case` and every project link is generated from its catalog ID.

## Comparison history

1. Source state: About copy and the mobile stack had zero element margins; preview content ended without a route to the full case.
2. Fix: added the annotated mobile margins and one shared, centered CTA in `ProjectModal`.
3. Post-fix evidence: computed styles match the annotations, the CTA appears at the bottom, navigation reaches the correct Cases detail, and the browser console reports zero errors or warnings.

## Findings

No actionable P0, P1, or P2 mismatches remain. The wider source viewport for the preview is an annotation-context difference, not a component mismatch; the CTA was verified within the same mobile breakpoint at 388 px.

## Primary interactions and runtime checks

- Opened the active Citydrive preview from the mobile stacked carousel.
- Scrolled the modal to the bottom and verified the centered CTA.
- Activated `View full case` and verified the Citydrive detail page.
- Browser console checked: 0 errors and 0 warnings.
- Production build and ESLint completed successfully.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed

---

# Design QA — mobile Main hero “This is”

- Source visual truth: `C:\Users\77FE78~1\AppData\Local\Temp\codex-clipboard-05034524-1fae-49cd-9e58-632a398f570d.png`
- Implementation screenshot: `C:\Users\босс77\AppData\Local\Packages\sandbox.{51fb17c0-d913-4bcc-98b9-bb8a70367727}\AC\Temp\codex-qa-mobile-this-is.png`
- Viewport: 393 × 884 CSS px, mobile breakpoint (`max-width: 480px`)
- State: Main page, top of page, fixed navigation visible
- Full-view evidence: source and implementation were reviewed side by side after the CSS change.
- Focused evidence: the “This is” label, its spacing below the fixed navigation, and the transition into the yellow hero panel.

## Findings

- Layout and spacing: passed. The label is now fully visible above the first image and no longer sits beneath the navigation mask.
- Typography: passed. The label remains part of the supplied mobile hero artwork, preserving the reference styling exactly.
- Colors and imagery: passed. The hero artwork is unchanged; only its mobile positioning and container ratio were adjusted.
- Responsive behavior: passed. The change is scoped to the existing mobile media query, so desktop presentation remains unchanged.
- Interaction and console: passed. No interaction changes were introduced by this presentational adjustment.

## Comparison history

1. Initial state: the top of the mobile artwork, including “This is”, was hidden behind the fixed navigation and a white masking pseudo-element.
2. Adjustment: expanded the mobile hero aspect ratio, shifted the picture down, and disabled the obsolete mask.
3. Verification: captured the 393 × 884 implementation and received explicit visual approval.

final result: passed

---

# Design QA — Contacts links, CV download, and Main CTA weight

- Source visual truth path: `conversation://browser-comment/1`
- Implementation screenshots: `output/playwright/main-cta-heavy-494x884.png`, `output/playwright/contacts-links-494x884.png`
- Source and implementation viewport: 494 × 884 CSS px
- Implementation pixels: 494 × 884 pixels, device scale factor 1
- State: Main page at the CTA section; Contacts page at the hero/contact controls

## Full-view comparison evidence

The annotated Main capture and the post-change Main capture were compared at the same 494 × 884 viewport. The final sentence now carries the requested heavier hierarchy without changing its placement, copy, CTA controls, or surrounding imagery. The Contacts capture confirms that the existing composition remains unchanged after converting the four relevant pills into functional links.

## Focused region comparison evidence

- `.cta-intro h2` computes to `font-family: "Object Sans", Arial, sans-serif` and `font-weight: 800`.
- `View CV` resolves to `./assets/documents/Ilya_Novik_CV_EN.pdf`, includes `download="Ilya_Novik_CV_EN.pdf"`, and produced a browser download at `C:\Users\босс77\Downloads\Ilya_Novik_CV_EN.pdf`.
- `Send me an email` resolves to `mailto:novik.brand@gmail.com`.
- `PlayStation account` resolves to `https://psnprofiles.com/McLover`.
- `Chess.com account` resolves to `https://www.chess.com/member/McLover_from_Minsk`.

## Required fidelity surfaces

- Fonts and typography: passed. The annotated sentence uses the loaded Object Sans Heavy face through weight 800; all other text styling is preserved.
- Spacing and layout rhythm: passed. The Main CTA and Contacts pill positions, sizes, rotations, and responsive flow are unchanged.
- Colors and visual tokens: passed. Existing CTA and Contacts colors remain untouched.
- Image quality and asset fidelity: passed. Existing imagery is unchanged; the supplied one-page A4 CV renders legibly with no clipping or overlap.
- Copy and content: passed. Visible button labels are unchanged and their targets match the supplied CV, email, and account names.

## Comparison history

1. Source state: the Main CTA sentence used Object Sans Regular, while the Contacts CV, PlayStation, and Chess pills were non-interactive.
2. Fix: applied Object Sans Heavy, added the supplied PDF as a downloadable asset, and connected all requested account links.
3. Post-fix evidence: visual captures preserve the layouts, computed typography matches the request, the PDF downloads successfully, and both browser consoles report zero errors or warnings.

## Primary interactions and runtime checks

- Downloaded the CV through `View CV` and verified the saved filename.
- Verified the email, PlayStation, and Chess profile destinations from the live DOM.
- Confirmed the production build contains the exact PDF bytes by SHA-256 comparison.
- Production build and ESLint completed successfully.

## Findings

No actionable P0, P1, or P2 mismatches remain.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed
