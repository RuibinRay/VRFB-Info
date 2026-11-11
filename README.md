# VRFB — The Science of Flow Energy

An interactive 3D laboratory and course on vanadium redox flow batteries (VRFBs), built to make the
hard ideas easy: you can see them, move them, calculate them and check that you understood.

Live site: <https://ruibinray.github.io/VRFB-Info/> · Repository: <https://github.com/RuibinRay/VRFB-Info>

Available in **English, Spanish and Mandarin (Simplified Chinese)**, at three learning levels
(**beginner, intermediate, advanced**). No build step, no server, no secrets: plain HTML, CSS and
ES modules that run on GitHub Pages. Three.js and GSAP load from CDNs.

## What is on the site

| Page | What it does |
|---|---|
| `index.html` | **The journey.** One scroll-driven, fully reversible documentary: a wide shot of an installation → fly in → tanks, pumps and pipes charging → follow the electrolyte into the stack → explode the stack → flow field → into a carbon-felt pore → discharge → charge → pull back and rebuild → solar farm and grid. |
| `lab.html` | **3D lab.** Free orbit and zoom; click any component to read what it is, why it exists, how it works, what happens if it fails and its specifications (simple or engineering depth); isolate it; explode the stack; hide the enclosure, tanks, pumps, membranes or electrodes; run charge or discharge; follow the electrolyte on a guided tour. |
| `simulator.html` | **Charge and discharge.** A live cell with Charge, Discharge, Pause, Reverse and Reset. Electrons, conventional current, protons and electrolyte flow are drawn separately. A quantitative model plots SOC, voltage, power and energy. |
| `sizing.html` | **Power vs energy.** MW, MWh, C-rate and duration with linked controls, stacks, tank volume, round-trip efficiency and usable SOC range, the four example systems, and every formula worked through with your numbers. |
| `compare.html` | **VRFB vs LFP.** Both technologies over one project lifetime: CAPEX, yearly costs, LCOS and its components, NPV, payback, cumulative cash flow, LCOS against duration, a sensitivity tornado, electrolyte leasing, saved scenarios and the full cash-flow table. |
| `project.html` | **Build a project.** Seven steps: application, demand and solar, technology, configuration, a simulated day, economics, and a summary with a schematic 3D installation and an energy-flow diagram. |
| `learn.html` | **The course.** Fifteen lessons, each with a three-level explanation, an animated diagram, clickable equations, a worked example, an experiment and a three-question check; saved progress and history; an illustrated glossary; a final assessment and a PDF summary. |
| `pillars/*.html` | **Five chapters** (chemistry, anatomy, engineering, economics, applications) plus the sources page. Each section ends with its lesson. Static pages per language: `pillars/`, `pillars/es/`, `pillars/zh/`. |

Every lab downloads its inputs and results as **Excel (.xlsx), CSV and PDF**, generated in the browser.

## Run locally

Browsers refuse to load ES modules from `file://`, so serve the folder:

```bash
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

## Tests

```bash
npm test
```

Forty tests, no dependencies (Node's built-in runner). They cover:

* **Electrochemistry:** constants, atom and charge balance of both half-reactions, the Nernst open-circuit voltage, half-cell potentials, polarisation, coulomb counting and efficiency in the cell simulation.
* **Sizing:** duration and C-rate, energy scaling with electrolyte and power with stacks, vanadium inventory from first principles, stoichiometric flow and pump power.
* **Dispatch:** energy conservation at every step and over the day.
* **Finance:** capital cost totals, LCOS against a hand calculation, NPV = 0 when energy is sold at the LCOS, replacement schedules, salvage, leasing, sensitivities, and that neither technology wins at every duration.
* **Exports:** CSV quoting, CRC-32, a valid XLSX package (also opened with an independent zip reader), PDF cross-reference offsets.
* **Translations and content:** identical keys and placeholders in all three languages, every lesson complete, quiz answers consistent across languages, every diagram renders, every generated chapter page carries its lessons.

## Project structure

```
index.html  lab.html  simulator.html  sizing.html  compare.html  project.html  learn.html
css/
  main.css      tokens, top bar, chapter-page layout, tools, tables
  kit.css       shared kit: grouped nav, learning levels, lesson blocks, quiz, equations, glossary
  home.css      the journey: fixed 3D stage, chapters, captions, labels
  labs.css      labs, wizard and course layouts
  i18n.css      language switcher and CJK typography
js/
  main.js                 the journey: builds the world, wires the UI, render loop
  core/                   state.js (single scroll-driven state) · scene.js · rig.js · timeline.js
  models/                 stack.js · system.js · micro.js · grid.js · shapes.js · textures.js · materials.js
  sim/                    PURE, TESTED MODELS (also run in Node)
    constants.js          physical constants, reaction definitions, oxidation-state colours
    electrochem.js        Nernst OCV, half-cell potentials, polarisation, energy density
    cell.js               time-stepping charge / discharge model
    sizing.js             power, energy, electrolyte, tanks, flow, pump power, efficiency chain
    finance.js            capital cost, cash flows, LCOS, NPV, payback, tornado, duration sweep
    dispatch.js           one-day solar + load + battery dispatch
    exporters.js          CSV, XLSX (own zip writer) and PDF builders
  lab/main.js             3D exploration lab
  labs/                   simulator.js · sizing.js · compare.js · project.js · site3d.js · common.js
  learn/                  course.js (structure) · kit.js (lesson block) · diagrams.js · equations.js
                          icons.js · progress.js · main.js (course hub)
  ui/                     chrome.js (top bar + footer) · level.js · glossary.js · equation.js · quiz.js
                          report.js (PDF layout) · labels.js · panel.js · captions.js · picker.js
  calc/                   chart.js (line, bar, tornado) and the four chapter calculators
  data/components.js      component specifications (English)
  i18n/                   index.js (runtime) · en/es/zh.js (journey + navigation)
                          labs.<lang>.js · learn.<lang>.js · components.<lang>.js
  pillar.js               behaviour of the generated chapter pages
pillars/                  generated chapter pages (English; es/ and zh/ hold the translations)
tools/                    gen_pages.py · content_<lang>.py · helpers.py
tests/                    *.test.mjs
docs/AUDIT.md             what the review found and what was changed
CHANGELOG.md
```

## How the pieces fit

**One state, one timeline.** `js/core/timeline.js` builds a single GSAP timeline whose tweens write into
`state` (camera pose, explode fraction, iris, reaction progress, current direction, state of charge, site
visibility…). ScrollTrigger scrubs it against `#scroll-track`, so scrolling backwards replays everything in
reverse. Models read `state` every frame and keep no progress of their own. Chapter lengths are the `--vh`
custom properties on each `.chapter` in `index.html`. From the console, `__vrfb.seek('plant', 0.5)` jumps to
the middle of a chapter.

**Models are separate from pages.** Everything numerical lives in `js/sim/` as pure functions. Pages read
inputs, call the model and draw. That is what makes the calculations testable and reusable: the chapter
calculators, the labs, the lesson diagrams and the tests all call the same code.

**Three levels.** The level is stored in `localStorage('vrfb-level')` and mirrored on `<body data-level>`.
Stylesheets reveal `.lv-i` from intermediate up and `.lv-a` at advanced. Any `<select data-level-select>` or
`[data-level-set]` button is wired automatically by `js/ui/level.js`.

**Languages.** Root pages translate at runtime: `init({ extra: ['labs', 'learn'] })` loads the bundles and
fills `[data-i18n]` elements. Chapter pages are generated per language by `tools/gen_pages.py` and load the
`learn` bundle for their lessons. `tests/i18n.test.mjs` fails if a key or placeholder is missing anywhere.

**Positive on the left.** Everywhere on the site (tanks, stack layers, microscopic scene, 2D diagrams) the
positive half is on the left (blue VO²⁺ → yellow VO₂⁺) and the negative half on the right (green V³⁺ →
violet V²⁺).

## Editing

* **A number or formula:** change it in `js/sim/`, then run `npm test`.
* **A default cost:** `VRFB_DEFAULTS`, `LFP_DEFAULTS`, `PROJECT_DEFAULTS` in `js/sim/finance.js`.
* **Chapter text:** `tools/content_<lang>.py`, then `python3 tools/gen_pages.py`.
* **A lesson:** text in `js/i18n/learn.<lang>.js` (`lessons.<id>`); structure (pillar, section, diagram,
  equations, experiment) in `js/learn/course.js`; if it moves to another section, mirror it in `LESSON_AT`
  in `tools/gen_pages.py`.
* **A glossary term:** `glossary.<id>` in each `learn.<lang>.js` plus an icon in `js/learn/icons.js`.
* **A component:** `js/data/components.js`, `js/i18n/components.<lang>.js` and `lab.parts.<id>` in each
  `labs.<lang>.js`.
* **References:** the `REFS` list in `tools/content_en.py`, shared by all languages.
* **A new language:** copy the `en` files in `js/i18n/` and `tools/content_en.py`, translate, add the code to
  `LANGS` in `js/i18n/index.js` and `tools/gen_pages.py`, regenerate, and run the tests.

## Deploy to GitHub Pages

Settings → Pages → *Deploy from a branch*, branch `main`, folder `/ (root)`. Keep `.nojekyll`. All links
are relative, so the site works under `https://<user>.github.io/VRFB-Info/` unchanged.

## Sources and honesty

Standard potentials, concentrations and efficiencies come from peer-reviewed papers; cost ranges from the
U.S. Department of Energy, Pacific Northwest National Laboratory, NREL and Lazard. The full list, with
DOIs, is on the sources page. Numbers are labelled as measured data, model results, illustrative defaults
or manufacturer claims. Calculator defaults are illustrative and editable, not quotes; the site is
educational and is not engineering or investment advice. See `docs/AUDIT.md` for what was corrected.

3D geometry is procedural. Reference renders on the anatomy page were provided by the project owner.
