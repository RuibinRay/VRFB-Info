# Audit of the original site and what was changed

This is the record of the review carried out before the upgrade: what was wrong
or weak in the first version, and how each point was resolved. Calculation
fixes are covered by automated tests (`npm test`).

## Calculation errors

| # | Where | Problem | Fix |
|---|-------|---------|-----|
| 1 | `js/calc/economics.js` | The usable SOC window was applied twice to the VRFB: once when sizing the electrolyte and again when counting discharged energy, understating VRFB energy by 20 %. | Rated energy is now defined once, as usable AC energy, for both technologies (`js/sim/finance.js`). |
| 2 | `js/calc/economics.js` | VRFB and lithium-ion were each evaluated over their own lifetime (25 vs 15 years), so the two LCOS figures described different jobs. | One shared project horizon. LFP is replaced when it reaches its end-of-life state of health or calendar life; unused life at the horizon is credited as straight-line salvage. |
| 3 | `js/calc/economics.js` | Stack refurbishment was charged once, in a single named year, even for 40-year projects. | Refurbishment recurs at a fixed interval and is never charged in the final year. |
| 4 | `js/calc/economics.js` | No end-of-life costs; lithium-ion degradation ignored cycling. | Decommissioning and recycling terms added; LFP fade is calendar + cycle. |
| 5 | `js/calc/economics.js` | Electrolyte was sized for AC energy, ignoring discharge losses. | Electrolyte is sized for the DC energy behind the one-way losses (about 7.4 kg V₂O₅ per usable kWh at the defaults, not 6.3). |
| 6 | `js/calc/engineering.js` | Pump power was subtracted from one leg of the round trip only. | Pumps run while charging and discharging: factor (1 − f) / (1 + f). |
| 7 | `js/calc/engineering.js` | The flow factor was not defined against a reference. | Documented as referenced to total vanadium concentration; `stoichFlowLps()` accepts the reactant fraction. |
| 8 | `js/calc/chemistry.js` | Physical constants were duplicated in several files with slightly different values. | Single source in `js/sim/constants.js`. |

## Scientific statements corrected

| Statement in the first version | Why it was a problem | Now |
|---|---|---|
| “The electrolyte itself never wears out”, “never wears out its fuel”, “cycles every day for decades without wearing out” | Overclaim. Crossover and side reactions cause capacity fade that must be corrected by rebalancing, which has a cost. | “The vanadium is not consumed, and most of the capacity lost this way can be recovered.” |
| “cannot catch fire” | Absolute claim. | “its water-based electrolyte does not burn” (and it is corrosive). |
| “Depth of discharge: 100 % without damage” | Misleading next to an 80 % usable window. | “Deep discharge does not damage the cell; 80 % window typical.” |
| Cycle life “> 15 000–20 000”, calendar life “20–25 years” stated as facts | These are largely manufacturer claims with limited long-term field data. | Labelled as claims or expectations. |
| “A flow field cuts pumping losses by 30–50 %” | Specific figure without a source. | Qualitative statement. |
| “OCV is a useful SOC sensor in the middle of the range but a poor one at the extremes” | Backwards: the Nernst curve is flattest at 50 % (about 2 mV per percent) and steepest at the ends. | Rewritten with the sensitivity stated. |
| Dalian “largest flow battery in the world” | True at commissioning in 2022, not a permanent fact. | “the largest … when commissioned”. |
| “About 85 % of vanadium goes into steel” | Understated. | “Roughly 90 %”. |
| Energy equation `E ≈ 2·V·c·F·ΔSOC·V/2` | Confusing cancelling factors. | `E ≈ V_tank · c · F · ΔSOC · V_cell`, with the two-tank explanation. |
| “VRFB vendors target 6–12 h while lithium-ion dominates 1–4 h” presented as an outcome of the model | The crossover depends on the inputs. | The comparison lab shows the break-even moving, and a test asserts that neither technology wins at every duration. |
| Tank colours “green-to-violet on the left” | No longer matched the model. | Positive (blue → yellow) on the left, negative (green → violet) on the right, everywhere: tanks, stack, microscopic scene, diagrams. |

## Incomplete or weak features

- Two reading levels only → three levels across the whole site, one shared control.
- No way to explore the 3D model freely → `lab.html`.
- Charging was never shown at the microscopic scale → the journey now shows discharge, then the current reversing.
- No electron path outside the cell → external circuit added to the microscopic scene and the 2D simulator, with conventional current drawn separately.
- No knowledge checks, worked examples, glossary or progress → course layer (`learn.html`, lesson kits).
- No downloads → CSV, XLSX and PDF written in the browser.
- No tests → 40 tests of the models, the exporters, the translations and the generated pages.
- Mid-SOC electrolyte colours were grey (RGB interpolation) → hue interpolation, so a half-charged positive electrolyte is green, as a real blue + yellow mixture is.

## Performance and accessibility

- Mobile: lower pixel ratio, no shadows, fewer instances and particles; no page is wider than a 375 px screen.
- Reduced motion: the scroll timeline loses its smoothing, camera sway stops, SVG diagrams render as still pictures, the 3D site view stops rotating.
- No WebGL: the journey falls back to a still image behind the same captions; the lab keeps its component guide; the project builder draws a 2D schematic.
- Charts get an accessible name from their heading; a skip link is added to every page; all controls are real buttons, inputs or links.

## Known limits (not fixed)

- The models are first-order by design: no shunt-current network, no thermal model, no crossover dynamics, one clear-sky day in the project builder.
- Default costs are illustrative values inside published ranges, not quotes, and battery prices move quickly.
- 3D geometry is procedural and schematic, not a CAD model of a specific product.
- Frame rate was not measured on low-end hardware.
