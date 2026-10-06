# Design QA — animated Cases accent

- Source visual truth: `C:\Users\77FE78~1\AppData\Local\Temp\codex-clipboard-fb291954-b2bc-489d-84db-1fe0412a7791.png`
- Desktop implementation: `output/playwright/cases-accent-visible.png`
- Mobile implementation: `output/playwright/cases-accent-mobile.png`
- Post-animation state: `output/playwright/cases-accent-hidden.png`
- Glitch state: `output/playwright/cases-accent-glitch.png`
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

## Findings

No actionable P0, P1, or P2 mismatches remain for the requested accent treatment. The different side-card project shown in the reference is intentional existing carousel state, not part of this change.

## Primary interactions and runtime checks

- Scroll/navigation into the Cases section triggers the accent once.
- The word remains visible for roughly 1.5 seconds and exits during a short glitch phase.
- The carousel remains interactive and on top of the accent.
- Browser console checked: 0 errors and 0 warnings.

## Implementation checklist

- [x] Object Sans Regular accent added behind cards.
- [x] One-time in-view trigger added.
- [x] 1–2 second hold and short glitch exit added.
- [x] Reduced-motion fallback added.
- [x] Desktop and mobile states verified.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed
