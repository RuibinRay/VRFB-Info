# VRFB — The Science of Flow Energy

An interactive, scientifically sourced educational website about vanadium redox flow batteries (VRFBs).
The homepage is a scroll-driven 3D documentary built with Three.js and GSAP ScrollTrigger: it zooms into a
VRFB system, takes the stack apart layer by layer, dives into the electrode to show the electrochemistry,
follows the electrolyte through the flow field, rebuilds the stack, charges the tanks and finally reveals the
system's place between a solar farm and the grid. Five pillar pages (chemistry, anatomy, engineering,
economics, applications) go deeper with beginner/advanced text, interactive simulators and financial
calculators, and every figure links to a cited source.

Available in **English, Spanish and Mandarin (Simplified Chinese)**. The switcher in the top bar changes
language everywhere; the choice is remembered in the browser. The homepage translates at runtime
(`js/i18n/*.js`), while the pillar pages are generated as static copies per language
(`pillars/`, `pillars/es/`, `pillars/zh/`) so each is a plain, indexable HTML page.

No build step. Plain HTML, CSS and ES modules; libraries load from CDNs.

## Run locally

Browsers refuse to load ES modules from `file://`, so serve the folder:

```bash
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

## Deploy to GitHub Pages

1. Repository: <https://github.com/RuibinRay/VRFB-Info>. Live site: <https://ruibinray.github.io/VRFB-Info/>. To fork: push this folder as the repository root (keep `.nojekyll`).
2. In **Settings → Pages**, choose *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. The site is served at `https://<your-user>.github.io/VRFB-Info/`. All links are relative, so it works
   under that sub-path without changes.

## Project structure

```
VRFB-Info/
├── index.html                 Scroll-driven 3D journey + pillar index
├── css/
│   ├── main.css               Design tokens, nav, pillar-page layout, tools, tables
│   └── home.css               Fixed 3D stage, chapters, captions, labels, pillar cards
├── js/
│   ├── main.js                Entry point: builds the world, wires UI, render loop
│   ├── core/
│   │   ├── state.js           Single state object driven by the scroll timeline
│   │   ├── scene.js           Renderer, lights, environment, camera
│   │   ├── rig.js             Camera rig (sway, parallax, portrait framing)
│   │   └── timeline.js        GSAP ScrollTrigger timeline: one tween set per chapter
│   ├── models/
│   │   ├── stack.js           Procedural stack: end plates, collectors, frames, bipolar plates, felts, membranes
│   │   ├── system.js          Tanks, pumps, pipes, skid, cabinet, pipe-flow particles
│   │   ├── micro.js           Microscopic cell cross-section: fibres, ions, protons, electrons
│   │   ├── grid.js            Solar array, transmission towers, energy-flow particles
│   │   ├── shapes.js          Rounded plates with holes, rods, nuts, rounded polylines
│   │   ├── textures.js        Procedural canvas textures (brushed steel, serpentine, felt…)
│   │   └── materials.js       PBR materials and vanadium oxidation-state colours
│   ├── ui/                    Labels, info panel, captions/chapter nav, picking, nav
│   ├── data/components.js     Component specifications shown in the panel
│   ├── calc/                  Chart helper and the four calculators (Nernst, sizing, LCOS, dispatch)
│   └── pillar.js              Shared pillar-page behaviour (level toggle, TOC, nav)
│   ├── i18n/                  Homepage dictionaries: en.js, es.js, zh.js + index.js (detection, DOM apply)
├── pillars/                   Generated pages (English); pillars/es/ and pillars/zh/ hold the translations
├── tools/gen_pages.py         Regenerates every pillars/**/*.html from one template (python3 tools/gen_pages.py)
├── tools/content_<lang>.py    Page content per language (en, es, zh); tools/helpers.py holds shared HTML helpers
└── assets/img/                Reference renders used on the anatomy page
```

## How the scroll animation works

`js/core/timeline.js` builds one GSAP timeline whose tweens write into `state` (camera pose, explode
fraction, iris opacity, reaction progress, state of charge, grid reveal…). ScrollTrigger scrubs that timeline
against the `#scroll-track` element, so scrolling backwards replays everything in reverse. The models read
`state` every frame and never keep their own progress, which is what makes the journey reversible. Chapter
lengths are the `--vh` custom properties on each `.chapter` section in `index.html`; change them and the
timeline rescales automatically.

Transitions between the macro scene and the microscopic scene use a dark "iris" overlay with a `set()` at the
midpoint, so the camera jump is never visible in either direction.

## Editing the science

* Component text and sources: `js/data/components.js` (English), translated in `js/i18n/es.js` and `js/i18n/zh.js`,
  and `ANAT_ITEMS` in each `tools/content_<lang>.py`.
* Calculator formulas and defaults: `js/calc/*.js`; input labels in the `field()` calls of each content module;
  chart labels in `js/calc/strings.js`.
* References: the `REFS` list in `tools/content_en.py` (shared by all languages). Citation numbers refer to that list.
* Adding a language: copy `tools/content_en.py` and `js/i18n/en.js`, translate, register the code in
  `tools/gen_pages.py` (LANGS, SWITCHER) and `js/i18n/index.js` (LANGS), then run the generator.

## Credits

Standard potentials and electrolyte data from Skyllas-Kazacos et al.; cost ranges from PNNL/DOE and Lazard;
full list on the references page. Reference renders provided by the project owner.
