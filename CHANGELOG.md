# Changelog

## 2.0 — Interactive laboratory and course (November 2026)

### Added
- **3D lab** (`lab.html`): free exploration, click-to-inspect with simple and engineering explanations, isolate, explode, part toggles, charge / discharge, busbar electrons, guided electrolyte tour.
- **Charge and discharge simulator** (`simulator.html`): conceptual live-cell animation driven by a quantitative Nernst + resistance model, with SOC, voltage, power and energy charts.
- **Power vs energy lab** (`sizing.html`): linked MW / MWh / hours, stacks, electrolyte, efficiency, worked formulas and four example systems.
- **VRFB vs LFP comparison lab** (`compare.html`): CAPEX, yearly costs, LCOS components, NPV, payback, cash flow, duration sweep, sensitivity, leasing, saved scenarios.
- **Project builder** (`project.html`): seven-step solar-plus-storage design with a one-day simulation, economics, an energy-flow diagram and a schematic 3D site.
- **Course** (`learn.html` and lesson kits in every chapter): 15 lessons at three levels with animated diagrams, clickable equations, worked examples, experiments, quizzes, glossary with tooltips, progress tracking, final assessment and PDF summary.
- **Downloads**: CSV, XLSX and PDF generated in the browser without third-party libraries.
- **Three learning levels** (beginner, intermediate, advanced) across the whole site.
- **Tested model layer** in `js/sim/` and 40 automated tests (`npm test`).
- Shared site chrome with grouped navigation, level control and language switcher on every page.
- New 3D details: level gauges, manways, valves, flow meters, pressure gauges, temperature probes, DC busbars, clear stack enclosure, disc springs, light masts with light shafts, coloured tank halos, an external circuit in the microscopic scene, and a larger site with a solar farm, neighbouring modules, substation and towers.

### Changed
- **Journey** rebuilt as wide shot → fly in → plant (charging) → pipe → explode → flow field → felt → discharge → charge → rebuild → grid (discharging), still a single reversible timeline.
- Positive half on the left and negative on the right in every model and diagram.
- Mid-SOC electrolyte colours use hue interpolation instead of RGB blending.
- Chapter pages share the site chrome and gain lesson kits, provenance labels and five additional sources.

### Fixed
- LCOS: double-counted SOC window, inconsistent lifetimes, single stack refurbishment, missing end-of-life items, electrolyte not sized for discharge losses.
- Engineering calculator: pump power applied to one leg of the round trip only.
- Overstated claims about wear, fire, cycle life and depth of discharge; the Dalian “largest” claim; the vanadium-to-steel share; the OCV sensing statement; the energy equation.
- Horizontal overflow on small phones.

See `docs/AUDIT.md` for the full review.

## 1.1 — Languages (November 2026)
- English, Spanish and Mandarin with a switcher on every page.

## 1.0 — First release (November 2026)
- Scroll-driven 3D documentary, five pillar pages, four calculators.
