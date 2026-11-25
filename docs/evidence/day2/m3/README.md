# m3.material.io evidence captures (Day 2)

Captured **2026-11-25** from this machine with Google Chrome 158.0.8127.38 in headless mode over the Chrome DevTools Protocol. The site is an Angular SPA; each page was rendered, every `expand_all` control was clicked, and the visible text was extracted from the live DOM (excluding `<style>`/`<script>`). The raw captures in this directory are that extracted text. They are evidence of what the public spec page displayed on the capture date, not a substitute for the Compose source.

| File | URL |
|---|---|
| `typography-type-scale-tokens.txt` | https://m3.material.io/styles/typography/type-scale-tokens |
| `color-baseline-light.txt` | https://m3.material.io/styles/color/static/baseline (Light, Default) |
| `color-baseline-dark.txt` | https://m3.material.io/styles/color/static/baseline (Dark, Default) |
| `shape-corner-radius-scale.txt` | https://m3.material.io/styles/shape/corner-radius-scale |
| `elevation-tokens.txt` | https://m3.material.io/styles/elevation/tokens |
| `motion-easing-duration-tokens.txt` | https://m3.material.io/styles/motion/easing-and-duration/tokens-specs |
| `state-layers.txt` | https://m3.material.io/foundations/interaction/states/state-layers |

Notes:

- The dark color table was reached by opening the context selector (`Light, Default`), choosing `Dark`, and applying `Save`.
- Typography tables use `pt`; Compose uses `sp`. Material's type-scale table treats the numeric values as equivalent; this spot-check compares numbers and records the unit mapping.
- The motion page renders cubic-bezier swatches without printing legacy numeric values. The legacy accelerate value in this spot-check was read from the page's embedded resolved token JSON (`md.sys.motion.easing.legacy.accelerate` → `x0 0.4, x1 1, y1 1`, i.e. `(0.4, 0, 1, 1)`).
- The m3 site's own CSS variables are *not* used as spec evidence: they implement the site UI and differ from its token tables (for example, the site's Body Large UI variable uses `0` tracking while the token table correctly says `0.5pt`).
