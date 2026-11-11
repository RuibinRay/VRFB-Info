"""English content for the pillar pages. Mirrored by content_es.py and content_zh.py."""
from helpers import cite, field, stat

# links from pillars/ to the root-level laboratories
LAB, SIZING, COMPARE, PROJECT = '../lab.html', '../sizing.html', '../compare.html', '../project.html'

LANG = 'en'
HTML_LANG = 'en'
UI = {
    'nav': {'home': 'Journey', 'chemistry': 'Chemistry', 'anatomy': 'Anatomy', 'engineering': 'Engineering', 'economics': 'Economics', 'applications': 'Applications', 'references': 'Sources'},
    'on_this_page': 'On this page', 'reading_level': 'Learning level', 'beginner': 'Beginner', 'intermediate': 'Intermediate', 'advanced': 'Advanced',
    'level_note': 'Intermediate adds the engineering numbers; advanced adds the equations and modelling notes. Most sections end with a lesson: an explanation at your level, a moving diagram, a worked example, an experiment and a quick check.',
    'pillar': 'Pillar', 'other_pillars': 'Other pillars', 'language': 'Language',
    'footer_tag': 'VRFB — The Science of Flow Energy · Educational, non-commercial.', 'footer_sources': 'Sources &amp; citations', 'footer_back': 'Back to the journey',
    'site_title': 'VRFB: The Science of Flow Energy', 'brand_sub': 'Science of Flow Energy',
}
PILLARS = [('chemistry', '01', 'Chemistry', '#a36bff'), ('anatomy', '02', 'Battery anatomy', '#26d9e3'), ('engineering', '03', 'Engineering', '#5ee37a'), ('economics', '04', 'Economics', '#ff9b2f'), ('applications', '05', 'Applications', '#ffd23f')]

# ---------------------------------------------------------------------------
CHEM = f'''
<section id="why-vanadium">
  <h2>One element, four oxidation states</h2>
  <p>Most batteries use two different materials for their two sides. The vanadium flow battery uses the same element on both, in two different pairs of oxidation states. The negative tank holds V²⁺ and V³⁺; the positive tank holds VO²⁺ (vanadium +4) and VO₂⁺ (vanadium +5), all dissolved in sulfuric acid.{cite(1, 2)}</p>
  <p>This is the single idea that makes the VRFB practical. Every other flow chemistry suffers when a little of one electrolyte leaks through the membrane into the other, poisoning it for good. In a VRFB the leaked ion is still vanadium; it just needs a periodic <em>rebalancing</em> to restore the two tanks to the same state of charge. The vanadium is not consumed, and most of the capacity lost this way can be recovered.{cite(2, 16)}</p>
  <div class="table-wrap"><table><thead><tr><th>Species</th><th>Vanadium oxidation state</th><th>Colour</th><th>Where</th></tr></thead><tbody>
  <tr><td>V²⁺</td><td class="num">+2</td><td><span class="panel__swatch" style="background:#7c3aed"></span>Violet</td><td>Negative tank, charged</td></tr>
  <tr><td>V³⁺</td><td class="num">+3</td><td><span class="panel__swatch" style="background:#1fae45"></span>Green</td><td>Negative tank, discharged</td></tr>
  <tr><td>VO²⁺ (vanadyl)</td><td class="num">+4</td><td><span class="panel__swatch" style="background:#1d63f0"></span>Blue</td><td>Positive tank, discharged</td></tr>
  <tr><td>VO₂⁺ (dioxovanadium)</td><td class="num">+5</td><td><span class="panel__swatch" style="background:#f2c21a"></span>Yellow</td><td>Positive tank, charged</td></tr>
  </tbody></table></div>
  <p class="beginner-only">In the homepage journey the tanks change colour exactly this way as the battery charges: blue to yellow in the positive tank on the left, green to violet in the negative tank on the right.</p>
</section>
<section id="half-reactions">
  <h2>The half-reactions</h2>
  <p>During discharge, the negative electrode gives up electrons and the positive electrode takes them in. Written in the discharge direction:{cite(1, 9)}</p>
  <div class="equation">Negative electrode:&nbsp; V²⁺ → V³⁺ + e⁻ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E° = −0.255 V vs SHE<br>
Positive electrode:&nbsp;&nbsp; VO₂⁺ + 2H⁺ + e⁻ → VO²⁺ + H₂O &nbsp;&nbsp;&nbsp;E° = +1.004 V vs SHE<br>
Overall:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; V²⁺ + VO₂⁺ + 2H⁺ → V³⁺ + VO²⁺ + H₂O &nbsp;&nbsp;E°<sub>cell</sub> = 1.259 V
<small>Standard reduction potentials for the vanadium couples; charging runs every arrow backwards.</small></div>
  <p>Notice the protons. Two H⁺ are consumed on the positive side every time an electron is delivered, so protons must cross the membrane from the negative side to keep both electrolytes electrically neutral. That is the membrane's whole job: let H⁺ (and some water) through, keep vanadium out.{cite(4)}</p>
  <div class="callout adv"><div class="eyebrow">Advanced · why the electrons move</div><p>The driving force is the difference in the two couples' electrode potentials. Each is set by the Gibbs free energy of its reduction, ΔG = −nFE. With n = 1 for both vanadium couples, the cell delivers 1.259 V × 96 485 C/mol ≈ 121 kJ per mole of electrons, or about 34 Wh per mole of vanadium transferred. Kinetically the V²⁺/V³⁺ couple is a simple outer-sphere electron transfer; the VO²⁺/VO₂⁺ couple requires an oxygen transfer and has the slower kinetics, which is why most electrode-activation research targets the positive side.{cite(10)}</p></div>
</section>
<section id="nernst">
  <h2>Voltage depends on state of charge: the Nernst equation</h2>
  <p>A fully charged VRFB sits at a higher voltage than a nearly empty one. The relationship is the Nernst equation, which adds a concentration-dependent term to the standard potential. For the overall cell, writing the state of charge as SOC (the fraction of vanadium in the charged form on each side):{cite(9, 15)}</p>
  <div class="equation">E = E° + (RT/F) · ln [ (c<sub>V²⁺</sub> · c<sub>VO₂⁺</sub> · c<sub>H⁺</sub>²) / (c<sub>V³⁺</sub> · c<sub>VO²⁺</sub>) ]<br>
&nbsp;&nbsp;= E° + (RT/F) · [ 2 ln( SOC / (1 − SOC) ) + 2 ln c<sub>H⁺</sub> ]
<small>R = 8.314 J mol⁻¹ K⁻¹, F = 96 485 C mol⁻¹, T in kelvin. RT/F = 25.7 mV at 25 °C.</small></div>
  <p>Measured open-circuit voltages are consistently about 50–60 mV higher than this equation predicts at 50 % SOC (≈ 1.40 V rather than ≈ 1.34 V). Knehr and Kumbur showed the gap comes from proton activity and the Donnan potential at the membrane, which the simple form ignores.{cite(15)} The explorer below lets you add that empirical offset.</p>
  <div class="tool" id="tool-nernst">
    <div class="tool__head"><h3>Open-circuit voltage explorer</h3><span class="muted mono">Nernst model · interactive</span></div>
    <div class="tool__grid">
      {field('soc', 'State of charge', 50, ' %', 1, 99, 1, 'range')}
      {field('T', 'Temperature', 25, ' °C', 5, 50, 1, 'range')}
      {field('cH', 'Proton concentration c<sub>H⁺</sub>', 5, ' M', 1, 8, 0.1, 'range')}
      {field('N', 'Cells in series', 40, '', 1, 120, 1, 'range')}
      <label class="field"><span>Donnan / activity offset</span><span><input type="checkbox" data-k="donnan" checked> add +60 mV (empirical)</span></label>
    </div>
    <div class="stats">{stat('ocv', 'Cell open-circuit voltage', True)}{stat('stack', 'Stack open-circuit voltage')}{stat('ratio', 'Charged : discharged vanadium')}{stat('nernst', 'RT/F at this temperature')}</div>
    <div class="stats"><div class="stat"><b style="display:block;height:26px;border-radius:6px" data-out="negtank"></b><span>Negative tank colour (V³⁺ → V²⁺)</span></div><div class="stat"><b style="display:block;height:26px;border-radius:6px" data-out="postank"></b><span>Positive tank colour (VO²⁺ → VO₂⁺)</span></div></div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Open-circuit voltage against state of charge"></div>
    <p class="note">The curve is steep near 0 % and 100 % SOC, which is one reason battery-management systems keep the operating window at roughly 10–90 %. In the flat middle the voltage moves only about 2 mV per percent of SOC, so a reference cell has to be read to the millivolt to serve as a fuel gauge.</p>
  </div>
</section>
<section id="electrolyte">
  <h2>The electrolyte</h2>
  <p>Commercial electrolyte is roughly 1.5–2 mol/L of vanadium in 2–5 mol/L sulfuric acid. The vanadium concentration sets how much energy a litre can hold; the acid supplies the protons, keeps the vanadium dissolved and makes the solution conductive.{cite(2)}</p>
  <p>Energy density is modest: around 25 Wh per litre of total electrolyte at 1.6 M, roughly a tenth of a lithium-ion cell. That is acceptable for stationary storage, where the tanks simply get bigger, but it rules out vehicles.{cite(2, 5)}</p>
  <div class="callout adv"><div class="eyebrow">Advanced · solubility and temperature</div><p>Vanadium concentration is capped by solubility. V²⁺ and V³⁺ sulfates precipitate at low temperature (below ≈ 10 °C for ~2 M solutions), while VO₂⁺ forms solid V₂O₅ above ≈ 40 °C when the battery is highly charged. Practical systems therefore run between 10 and 40 °C and avoid parking the positive electrolyte at very high SOC in hot weather.{cite(2, 11)} The mixed-acid electrolyte developed at PNNL (sulfate + chloride) raises the usable concentration to about 2.5 M and widens the window to −5 to 50 °C, a 70 % energy-density gain.{cite(3)} Roe et al. pushed sulfate electrolyte to 3 M with phosphate stabilisers.{cite(18)}</p></div>
  <div class="table-wrap"><table><thead><tr><th>Parameter</th><th class="num">Typical value</th><th>Source</th></tr></thead><tbody>
  <tr><td>Vanadium concentration</td><td class="num">1.5–2.0 M (2.5 M mixed acid)</td><td>{cite(2, 3)}</td></tr>
  <tr><td>Supporting acid</td><td class="num">2–5 M H₂SO₄</td><td>{cite(2)}</td></tr>
  <tr><td>Energy density (total electrolyte)</td><td class="num">20–35 Wh/L</td><td>{cite(2, 5)}</td></tr>
  <tr><td>Operating temperature</td><td class="num">10–40 °C</td><td>{cite(2, 11)}</td></tr>
  <tr><td>Standard cell potential</td><td class="num">1.259 V</td><td>{cite(1, 9)}</td></tr>
  <tr><td>Open-circuit voltage at 50 % SOC</td><td class="num">≈ 1.40 V</td><td>{cite(15)}</td></tr>
  </tbody></table></div>
</section>
<section id="side-reactions">
  <h2>What can go wrong chemically</h2>
  <ul>
    <li><strong>Hydrogen evolution.</strong> At the negative electrode near full charge, some current splits water into H₂ instead of reducing V³⁺. It wastes charge and slowly unbalances the tanks.{cite(2, 16)}</li>
    <li><strong>Air oxidation.</strong> V²⁺ reacts with oxygen, so the negative tank is blanketed with nitrogen or kept sealed.{cite(2)}</li>
    <li><strong>Crossover.</strong> Vanadium ions diffuse through the membrane, self-discharging the cell and moving volume from one tank to the other. Unlike other chemistries this is reversible by remixing or electrochemical rebalancing.{cite(4, 16)}</li>
    <li><strong>Carbon corrosion.</strong> VO₂⁺ at high SOC can oxidise the positive felt and the bipolar plate, so stacks are rarely charged past about 95 %.{cite(10)}</li>
  </ul>
</section>
'''

ANAT_ITEMS = [
 ('endplate', 'End plate', 'endplate-negative.webp', 'Stainless steel or aluminium plate, 10–30 mm, that carries the clamping load and hosts the hose-barb ports. In the 3D model the orange O-rings mark the positive loop and the cyan ones on the opposite plate mark the negative loop.', [('Material', 'Stainless steel · aluminium · GFRP'), ('Clamping pressure', '0.5–1.5 MPa on the felt'), ('Insulation', 'Polymer sheet to the copper collector')], (4, 14)),
 ('collector', 'Current collector', 'current-collector.png', 'A copper sheet with a terminal tab that gathers current from the full electrode area. It sits dry, behind the first bipolar plate, because copper corrodes rapidly in the acid electrolyte.', [('Material', 'Copper, 1–3 mm, sometimes plated'), ('Resistivity', '1.7 × 10⁻⁸ Ω·m'), ('Count', 'Two per stack (terminals)')], (4,)),
 ('gasket', 'Flow frame & gasket', 'gasket-frame.png', 'A polymer frame holds the felt in its window and routes electrolyte from the manifold holes in the corners into the electrode. Elastomer gaskets on each face seal the cell. Long, narrow channels deliberately add resistance to limit shunt currents through the shared manifold.', [('Frame', 'PVC · PP · PVDF'), ('Gasket', 'EPDM · Viton® · PTFE'), ('Thickness', 'Sets felt compression, 20–30 %')], (4, 14)),
 ('bipolar', 'Bipolar plate', 'bipolar-plate.webp', 'A graphite–polymer composite plate shared by neighbouring cells: positive face of one, negative face of the next. Electrons pass through it so cells connect in series. The serpentine flow field spreads electrolyte across the felt and lowers the pressure drop compared with forcing all of it through a thick felt.', [('Material', 'Graphite-filled PP / PE / PVDF, 2–6 mm'), ('Resistivity', '10⁻³–10⁻² Ω·cm'), ('Flow field', 'Serpentine · interdigitated · flow-through')], (4, 10, 14)),
 ('felt_neg', 'Negative electrode (carbon felt)', 'carbon-felt.webp', 'A porous mat of 8–12 µm carbon fibres, 90–95 % porosity, where V²⁺/V³⁺ exchange electrons with the fibre surface. Felts are activated by heating in air or acid treatment, which adds oxygen groups that accelerate the reaction.', [('Material', 'PAN- or rayon-based carbon felt'), ('Thickness', '3–6 mm, compressed 20–30 %'), ('Fibre diameter', '≈ 10 µm'), ('Side reaction', 'H₂ evolution near full charge')], (2, 10)),
 ('membrane', 'Ion-exchange membrane', 'membrane.png', 'A 25–200 µm polymer film that conducts protons and blocks vanadium. Perfluorosulfonic-acid membranes (Nafion®) are the benchmark; cheaper hydrocarbon and anion-exchange membranes trade some selectivity or conductivity for cost. It is usually the most expensive single component of the stack.', [('Material', 'PFSA (Nafion® 115/212) · hydrocarbon · AEM'), ('Area resistance', '0.5–2 Ω·cm²'), ('Crossover', 'Causes self-discharge; corrected by rebalancing')], (2, 4, 14)),
 ('felt_pos', 'Positive electrode (carbon felt)', 'carbon-felt-2.webp', 'The mirror of the negative felt, hosting VO²⁺/VO₂⁺. Kinetics are slower here, so catalysts (bismuth, metal oxides) and surface functionalisation are active research areas. At high SOC the strongly oxidising VO₂⁺ can corrode the carbon itself.', [('Material', 'Carbon or graphite felt, O-functionalised'), ('Limit', 'Keep below ≈ 95 % SOC')], (2, 10)),
 ('tierod', 'Tie rods and clamp brackets', 'stack-assembled.webp', 'Threaded rods through the corner holes pull the end plates together; external brackets keep the plates flat. Tightened in a star pattern, like a wheel, to seal evenly.', [('Material', 'Stainless steel with insulating sleeves'), ('Count', '4–12 per stack')], (4,)),
]

ANAT = f'''
<section id="overview">
  <h2>From a single cell to a power station</h2>
  <p>A VRFB is three things bolted together: a <strong>stack</strong> that converts chemistry to current, <strong>tanks</strong> that store the chemistry, and a <strong>balance of plant</strong> (pumps, pipes, power electronics and controls) that moves liquid and electrons between them. The stack decides power in kilowatts; the tanks decide energy in kilowatt-hours; the two can be sized independently.{cite(2, 4)}</p>
  <figure class="figure"><img src="../assets/img/stack-exploded.webp" alt="Exploded view of a single VRFB cell between its end plates" loading="lazy"><figcaption>One cell exploded: end plate, copper collector, flow frame, bipolar plate, felt, membrane, felt, bipolar plate, flow frame, collector, end plate. The same layers are modelled in the homepage journey.</figcaption></figure>
  <p>Inside the stack, every cell is a sandwich: a membrane between two carbon-felt electrodes, each backed by a bipolar plate. Cells are stacked electrically in series and hydraulically in parallel, fed from manifolds that run the length of the stack.{cite(4)}</p>
</section>
<section id="components">
  <h2>The stack, layer by layer</h2>
  <p>Click any component on the homepage, or open the <a href="{LAB}">3D lab</a> to isolate it and see what happens when it fails. Figures are typical values from the reviews cited; specific products vary.</p>
''' + ''.join(f'''
  <article id="{cid}" class="component">
    <h3>{name}</h3>
    <div class="figure" style="display:grid;grid-template-columns:140px 1fr;gap:0;align-items:start"><img src="../assets/img/{img}" alt="{name}" loading="lazy" style="width:140px;aspect-ratio:1;object-fit:cover"><div style="padding:14px 18px"><p style="margin-bottom:8px">{desc}</p><dl style="display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0;font-size:0.88rem">{''.join(f'<dt class="muted">{k}</dt><dd style="margin:0">{v}</dd>' for k, v in specs)}</dl><p class="muted" style="margin:8px 0 0;font-size:0.8rem">Sources {cite(*refs)}</p></div></div>
  </article>''' for cid, name, img, desc, specs, refs in ANAT_ITEMS) + f'''
</section>
<section id="balance-of-plant">
  <h2>Balance of plant</h2>
  <figure class="figure"><img src="../assets/img/system-cabinet.webp" alt="VRFB system on a skid with tanks, pumps, stack and power-conversion cabinet" loading="lazy"><figcaption>A complete system: electrolyte tanks left and right, pumps beneath them, the stack in the centre, inverter cabinet and control panel behind.</figcaption></figure>
  <div class="table-wrap"><table><thead><tr><th>Item</th><th>What it does</th><th>Typical specification</th></tr></thead><tbody>
  <tr><td>Electrolyte tanks</td><td>Store energy; volume sets duration</td><td>HDPE/PP or lined steel; nitrogen blanket on the negative tank; ≈ 40 L per kWh total{cite(2, 5)}</td></tr>
  <tr><td>Pumps (one per loop)</td><td>Circulate electrolyte at 5–10× stoichiometric flow</td><td>Magnetic-drive centrifugal, PP/PVDF wetted parts; 2–5 % of throughput as parasitic load{cite(14)}</td></tr>
  <tr><td>Piping and valves</td><td>Connect tanks, pumps and stack manifolds</td><td>PVC/PP/PVDF; colour-coded loops so they cannot be swapped</td></tr>
  <tr><td>Power conversion system</td><td>DC ⇄ AC conversion, grid synchronisation</td><td>Bidirectional inverter, 96–98 % efficient each way{cite(5)}</td></tr>
  <tr><td>Battery management system</td><td>SOC estimation, pump scheduling, protection, rebalancing</td><td>Reference OCV cell, temperature and level sensors{cite(14, 16)}</td></tr>
  <tr><td>Heat exchanger</td><td>Keep electrolyte in the 10–40 °C window</td><td>Required in hot climates; often liquid-to-air{cite(11)}</td></tr>
  </tbody></table></div>
  <div class="callout adv"><div class="eyebrow">Advanced · shunt currents</div><p>Because every cell shares the same conductive electrolyte through the manifolds, a parallel electrical path exists around each cell. The resulting shunt currents waste charge and corrode plates near the ends of the stack. Designers lengthen the inlet channels in each flow frame, limit the number of cells per manifold and sometimes split long stacks into hydraulically separate modules to keep this loss to a few percent.{cite(4, 14)}</p></div>
</section>
<section id="failure-modes">
  <h2>How stacks fail, and how they are maintained</h2>
  <ul>
    <li><strong>Leaks</strong> from gasket creep or uneven clamping: the most common field fault; fixed by re-torquing or gasket replacement.{cite(14)}</li>
    <li><strong>Membrane fouling or degradation</strong> after years of service raises resistance; membranes are replaced during a stack rebuild, typically after 10–15 years.{cite(5, 14)}</li>
    <li><strong>Capacity fade</strong> from crossover and side reactions is corrected by rebalancing the electrolytes, not by replacing them.{cite(16)}</li>
    <li><strong>Pump and seal wear</strong> on the balance of plant is ordinary industrial maintenance.</li>
  </ul>
  <p>Because the vanadium electrolyte can be recovered and reused at end of life, a VRFB installation can retain residual value; how much depends on the vanadium market at the time. That matters for the economics, covered in the next pillar.</p>
</section>
'''

ENG = f'''
<section id="power-vs-energy">
  <h2>Decoupling power from energy</h2>
  <p>In a conventional battery, power and energy scale together: more cells means more of both. In a flow battery they are separate purchases. <strong>Power</strong> (kW) is set by the total electrode area in the stacks, since current scales with area at a chosen current density. <strong>Energy</strong> (kWh) is set by how much vanadium is dissolved in the tanks.{cite(2, 4)}</p>
  <div class="equation">P ≈ N<sub>cells</sub> · A · j · V<sub>cell</sub>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E ≈ V<sub>tank</sub> · c<sub>V</sub> · F · ΔSOC · V<sub>cell</sub>
<small>A: active area per cell · j: current density · V<sub>tank</sub>: volume of one tank · c<sub>V</sub>: vanadium concentration · ΔSOC: usable window. Each electron needs one vanadium ion in <em>each</em> tank, so both tanks hold this capacity.</small></div>
  <p>The practical consequence: a 4-hour system and a 10-hour system can share identical stacks and differ only in tank size. Longer durations get cheaper per kWh, which is the VRFB's commercial niche.{cite(5)} The <a href="{SIZING}">power vs energy lab</a> lets you move MW and MWh separately and see every step of the calculation.</p>
</section>
<section id="sizing-tool">
  <h2>Design a system</h2>
  <div class="tool" id="tool-sizing">
    <div class="tool__head"><h3>Stack, tank and pump sizing calculator</h3><span class="muted mono">first-order model · editable assumptions</span></div>
    <div class="tool__grid">
      {field('P', 'Rated power', 250, 'kW', 1, 100000, 1)}
      {field('E', 'Energy capacity', 1000, 'kWh', 1, 1000000, 1)}
      {field('Vcell', 'Cell voltage under load', 1.30, 'V', 1.0, 1.6, 0.01)}
      {field('j', 'Current density', 80, 'mA/cm²', 10, 300, 5)}
      {field('A', 'Active area per cell', 2500, 'cm²', 100, 20000, 50)}
      {field('N', 'Cells per stack', 40, '', 1, 200, 1)}
      {field('c', 'Vanadium concentration', 1.6, 'mol/L', 0.5, 3, 0.1)}
      {field('dod', 'Usable SOC window', 0.8, 'fraction', 0.3, 1, 0.05)}
      {field('lambda', 'Flow factor λ (× stoichiometric)', 8, '', 1, 20, 0.5)}
      {field('dp', 'Stack pressure drop', 0.6, 'bar', 0.1, 3, 0.1)}
      {field('eta', 'Pump efficiency', 0.55, 'fraction', 0.2, 0.9, 0.05)}
      {field('asr', 'Area-specific resistance', 1.2, 'Ω·cm²', 0.3, 4, 0.1)}
      {field('ce', 'Coulombic efficiency', 96, '%', 80, 100, 0.5)}
      {field('inv', 'Inverter efficiency (one way)', 97, '%', 90, 99.5, 0.5)}
    </div>
    <h4 class="eyebrow">Stack</h4>
    <div class="stats">{stat('stackI', 'Stack current')}{stat('stackV', 'Stack voltage under load')}{stat('stackP', 'Power per stack')}{stat('nStacks', 'Stacks required', True)}</div>
    <h4 class="eyebrow">Electrolyte and tanks</h4>
    <div class="stats">{stat('litres', 'Total electrolyte (both tanks)', True)}{stat('whL', 'Energy density, total electrolyte')}{stat('tank', 'Each tank (cylinder, H = 1.5 D)')}</div>
    <h4 class="eyebrow">Pumping</h4>
    <div class="stats">{stat('flow', 'Flow per stack, per loop')}{stat('pump', 'Total pump power')}{stat('pumpFrac', 'Pump share of rated power', True)}</div>
    <h4 class="eyebrow">Efficiency at the chosen current density</h4>
    <div class="stats">{stat('ve', 'Voltage efficiency')}{stat('cell', 'Cell energy efficiency')}{stat('sys', 'System AC-to-AC efficiency', True)}</div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Efficiency against current density"></div>
    <details><summary>Model notes and formulas</summary><p>Stack current I = j·A. Electrolyte per side = E / (c · 26.8 Ah/mol · ΔSOC · V<sub>cell</sub>). Stoichiometric flow per stack = N·I / (F·c); the pump delivers λ times that. Pump power = Q·Δp / η for two loops per stack. Voltage efficiency uses a lumped area-specific resistance around an open-circuit voltage of 1.40 V: VE = (OCV − j·ASR)/(OCV + j·ASR). System efficiency multiplies cell efficiency by the inverter efficiency twice and by (1 − f)/(1 + f) for a pump fraction f, because the pumps run during both charging and discharging. The flow factor λ is referenced to the total vanadium concentration; relative to the reactant still available at 50 % SOC the same flow corresponds to λ/2. Shunt currents, thermal management and the SOC-dependence of ASR are neglected; published system values of 65–80 % AC-AC are consistent with this model at 60–100 mA/cm².{cite(5, 14)}</p></details>
  </div>
</section>
<section id="efficiency">
  <h2>Where the energy goes</h2>
  <p>Three efficiencies multiply to give the battery's round-trip figure.{cite(4, 14)}</p>
  <ul>
    <li><strong>Coulombic efficiency</strong> (95–98 %): charge lost to crossover, shunt currents and hydrogen evolution.</li>
    <li><strong>Voltage efficiency</strong> (80–92 %): the voltage gap between charging and discharging caused by resistance and reaction kinetics. It falls as current density rises, so running harder trades efficiency for a smaller, cheaper stack.</li>
    <li><strong>System losses</strong>: pumps (2–5 %) and the inverter (2–4 % each way).</li>
  </ul>
  <p>Put together, cells reach 80–90 % DC and complete systems 65–80 % AC-to-AC, lower than lithium-ion's 85–90 % but stable over tens of thousands of cycles.{cite(5)}</p>
  <div class="callout adv"><div class="eyebrow">Advanced · polarisation</div><p>Cell voltage under load is V = OCV ± (η<sub>act</sub> + η<sub>ohm</sub> + η<sub>conc</sub>). Activation overpotential follows Butler–Volmer kinetics and is dominated by the positive electrode; ohmic loss is the membrane plus electrolyte plus contact resistance (together ≈ 1–2 Ω·cm² in commercial cells); concentration overpotential appears when the flow factor is too low to replenish vanadium at the fibre surface, especially near the ends of the SOC window. Flow-field plates and thinner, compressed felts reduce all three.{cite(10, 14)}</p></div>
</section>
<section id="thermal">
  <h2>Thermal and flow management</h2>
  <p>Resistive heating and pump work warm the electrolyte. Because VO₂⁺ precipitates above about 40 °C and V²⁺/V³⁺ sulfates below about 10 °C, large systems add a heat exchanger and keep the pumps running during idle periods in hot weather to stop the stack from cooking.{cite(2, 11)}</p>
  <p>Variable-speed pumps scheduled against state of charge are a cheap efficiency win: high flow is needed only near the ends of the SOC window, where vanadium concentration at the electrode runs low.{cite(14)}</p>
</section>
<section id="scaling">
  <h2>Scaling up</h2>
  <p>Commercial stacks run from a few kilowatts to roughly 30–40 kW each, with cell areas of 0.1–0.4 m² and 20–100 cells per stack. Megawatt systems connect many stacks in series–parallel to reach a DC bus voltage of several hundred volts, then share tanks that hold hundreds of cubic metres of electrolyte.{cite(14, 16)} The Dalian station reaches 100 MW and 400 MWh this way, using containerised stacks fed from a tank farm.{cite(7)}</p>
</section>
'''

ECON = f'''
<section id="cost-structure">
  <h2>What a VRFB costs, and why</h2>
  <p>A lithium-ion system is mostly cells. A VRFB splits between stacks, electrolyte and everything else, and the split moves with duration: at 2 hours the stacks are the largest item; at 10 hours the electrolyte is.{cite(5, 14)}</p>
  <ul>
    <li><strong>Stacks and power electronics</strong> scale with kilowatts. Membrane and bipolar plates are the costliest stack parts.{cite(14)}</li>
    <li><strong>Electrolyte</strong> scales with kilowatt-hours and tracks the vanadium pentoxide (V₂O₅) price, which has swung from about $5 to over $25 per pound within a decade.{cite(17)}</li>
    <li><strong>Tanks, pumps, piping, controls, installation</strong> scale with both.</li>
  </ul>
  <p>The U.S. Department of Energy's 2022 assessment puts installed costs for utility-scale vanadium flow systems in the low hundreds of dollars per kWh for 10-hour durations, with electrolyte the largest single line item; the exact figures depend on year, size and vanadium price, so use the calculator's inputs as editable assumptions rather than quotes.{cite(5)}</p>
</section>
<section id="lcos-tool">
  <h2>Levelised cost of storage calculator</h2>
  <p>The levelised cost of storage (LCOS) spreads every lifetime cost over every megawatt-hour the battery will ever discharge, discounted to today. It is the fairest single number for comparing technologies with different lifetimes.{cite(6, 13)}</p>
  <div class="equation">LCOS = [ CAPEX + Σ<sub>t</sub> (O&amp;M<sub>t</sub> + charging<sub>t</sub> + replacements<sub>t</sub>) / (1+r)<sup>t</sup> − residual / (1+r)<sup>N</sup> ] / Σ<sub>t</sub> E<sub>discharged,t</sub> / (1+r)<sup>t</sup></div>
  <div class="tool" id="tool-lcos">
    <div class="tool__head"><h3>VRFB vs LFP: levelised cost of storage</h3><span class="muted mono">all inputs editable · defaults are illustrative</span></div>
    <h4 class="eyebrow">Project</h4>
    <div class="tool__grid">
      {field('P', 'Power', 10, 'MW', 0.1, 1000, 0.1)}
      {field('h', 'Duration', 8, 'hours', 1, 24, 0.5)}
      {field('cycles', 'Full cycles per year', 330, '', 1, 730, 1)}
      {field('life', 'Project life (both technologies)', 25, 'years', 5, 40, 1)}
      {field('disc', 'Discount rate', 7, '%', 0, 20, 0.5)}
      {field('chg', 'Charging electricity price', 30, '$/MWh', 0, 200, 1)}
    </div>
    <h4 class="eyebrow">VRFB costs</h4>
    <div class="tool__grid">
      {field('v2o5', 'V₂O₅ price', 18, '$/kg', 5, 60, 0.5)}
      {field('c', 'Vanadium concentration', 1.6, 'mol/L', 0.8, 3, 0.1)}
      {field('dod', 'Usable SOC window', 0.8, 'fraction', 0.4, 1, 0.05)}
      {field('acidProc', 'Acid, water, processing', 15, '$/kWh', 0, 100, 1)}
      {field('stackCost', 'Stacks', 450, '$/kW', 100, 3000, 10)}
      {field('pcsCost', 'Power conversion system', 100, '$/kW', 0, 500, 5)}
      {field('bosE', 'Tanks and BOS (energy part)', 60, '$/kWh', 0, 300, 5)}
      {field('bosP', 'Pumps and BOS (power part)', 150, '$/kW', 0, 1000, 10)}
      {field('epc', 'EPC and installation', 20, '% of equipment', 0, 60, 1)}
      {field('om', 'Operations and maintenance', 15, '$/kW·yr', 0, 100, 1)}
      {field('rte', 'Round-trip efficiency (AC)', 72, '%', 50, 90, 1)}
      {field('deg', 'Unrecovered capacity fade per year', 0.3, '%', 0, 5, 0.1)}
      {field('stackYear', 'Stack refurbishment interval', 12, 'years', 1, 40, 1)}
      {field('stackRepl', 'Refurbishment cost', 50, '% of stack cost', 0, 100, 5)}
      {field('resid', 'Electrolyte residual value', 60, '% of electrolyte cost', 0, 100, 5)}
    </div>
    <h4 class="eyebrow">LFP comparator</h4>
    <div class="tool__grid">
      {field('liCapex', 'Installed cost (per nameplate kWh)', 250, '$/kWh', 50, 1500, 5)}
      {field('liDod', 'Depth of discharge', 90, '%', 50, 100, 1)}
      {field('liRte', 'Round-trip efficiency (AC)', 86, '%', 60, 95, 1)}
      {field('liLife', 'Maximum calendar life', 15, 'years', 3, 30, 1)}
      {field('liDeg', 'Calendar fade per year', 1.5, '%', 0, 10, 0.1)}
      {field('liRepl', 'Replacement cost', 60, '% of first cost', 10, 120, 5)}
      {field('liOm', 'Operations and maintenance', 10, '$/kW·yr', 0, 100, 1)}
    </div>
    <div class="stats">{stat('lcos', 'VRFB LCOS', True)}{stat('lcosLi', 'LFP LCOS')}{stat('capex', 'VRFB total capital cost')}{stat('perKwh', 'VRFB installed cost')}{stat('liPerKwh', 'LFP installed cost')}{stat('kg', 'V₂O₅ per usable kWh')}{stat('elecShare', 'Electrolyte share of capex')}{stat('vRepl', 'Stack refurbishment in year')}{stat('liRepl', 'LFP replaced in year')}</div>
    <div class="costbar" style="display:flex;height:22px;border-radius:8px;overflow:hidden;gap:2px;background:var(--bg-2)"></div>
    <div class="legend costbar-legend"></div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Levelised cost of storage against vanadium pentoxide price"></div>
    <p class="note">Both technologies are evaluated over the same project life. LFP is replaced when its capacity reaches 70 % or its calendar life ends, and whatever life is left at the end is credited as salvage. Vanadium per kWh is derived from the concentration and SOC window at 1.35 V and sized for the DC energy behind the discharge losses: about 7.4 kg of V₂O₅ per usable kWh at 1.6 M, an 80 % window and 72 % round-trip efficiency. Residual value reflects that vanadium electrolyte can be recovered or re-leased at end of life.{cite(14, 17, 21)} For every input, including electrolyte leasing, cycle fade, net present value, payback and sensitivity charts, open the <a href="{COMPARE}">comparison lab</a>.</p>
  </div>
</section>
<section id="vanadium-market">
  <h2>The vanadium question</h2>
  <p>Roughly 90 % of vanadium goes into steel as a strengthening additive, so its price follows the steel cycle rather than the battery market. The 2018 spike to above $25 per pound of V₂O₅ nearly doubled electrolyte costs; prices in the mid-2020s have been in the single digits per pound.{cite(17)}</p>
  <p>Two responses have emerged. <strong>Electrolyte leasing</strong> moves the vanadium off the project's balance sheet: the supplier retains ownership and recovers the metal at end of life, converting a capital cost into an operating fee.{cite(14)} <strong>Alternative electrolytes</strong> (mixed-acid, higher concentration) squeeze more energy from each kilogram.{cite(3, 18)}</p>
  <div class="callout adv"><div class="eyebrow">Advanced · sensitivity</div><p>Because electrolyte is proportional to energy, LCOS sensitivity to vanadium price grows with duration. Doubling V₂O₅ from $10 to $20 per kg raises the calculator's default 8-hour LCOS by roughly a sixth; at 4 hours the effect is smaller, about an eighth. Stack cost sensitivity works the other way. This is why VRFB vendors target 6–12 hour applications while lithium-ion dominates 1–4 hours.{cite(5)}</p></div>
</section>
<section id="comparison">
  <h2>How the technologies compare</h2>
  <div class="table-wrap"><table><thead><tr><th>Metric</th><th>Vanadium flow</th><th>Lithium-ion (LFP)</th><th>Source</th></tr></thead><tbody>
  <tr><td>Round-trip efficiency (AC)</td><td class="num">65–80 %</td><td class="num">85–90 %</td><td>{cite(5)}</td></tr>
  <tr><td>Cycle life</td><td class="num">&gt; 10 000; makers claim 15 000–20 000; electrolyte capacity recoverable</td><td class="num">3 000–10 000 to 70–80 % capacity</td><td>{cite(5, 16)}</td></tr>
  <tr><td>Calendar life</td><td class="num">20–25 years expected, stacks refurbished after 10–15</td><td class="num">10–20 years</td><td>{cite(5)}</td></tr>
  <tr><td>Energy density</td><td class="num">20–35 Wh/L</td><td class="num">250–400 Wh/L</td><td>{cite(2)}</td></tr>
  <tr><td>Depth of discharge</td><td class="num">Deep discharge does not damage the cell; 80 % window typical</td><td class="num">80–95 %</td><td>{cite(16)}</td></tr>
  <tr><td>Fire behaviour</td><td>Water-based electrolyte does not burn; it is corrosive</td><td>Thermal runaway possible; managed by design and spacing</td><td>{cite(16)}</td></tr>
  <tr><td>Footprint</td><td>Large (tanks)</td><td>Compact</td><td>{cite(2)}</td></tr>
  <tr><td>End of life</td><td>Electrolyte can be recovered and reused</td><td>Recycling exists and is scaling up</td><td>{cite(14)}</td></tr>
  </tbody></table></div>
  <p class="note">Ranges combine published assessments with manufacturer claims, labelled where they apply. Neither technology yet has decades of field data at grid scale, and neither is cheaper in every case: test your own assumptions in the <a href="{COMPARE}">comparison lab</a>.</p>
</section>
'''

APPS = f'''
<section id="why-flow">
  <h2>What flow batteries are for</h2>
  <p>A VRFB is slow to build, heavy, and about 70–75 % efficient, so it is not a phone battery or a car battery. It is a <strong>stationary, long-duration</strong> battery: it is designed to cycle daily for decades with little permanent loss of capacity, its water-based electrolyte does not burn, and it gets cheaper per kilowatt-hour the longer it is asked to run. Those properties match three jobs.{cite(5, 16)}</p>
  <ul>
    <li><strong>Solar shifting.</strong> Store the midday surplus and deliver it over the evening peak, four to twelve hours later.</li>
    <li><strong>Grid services.</strong> Frequency regulation, peak shaving, deferring transmission upgrades, and black-start support.</li>
    <li><strong>Microgrids and off-grid sites.</strong> Islands, mines and campuses that want renewables plus firm overnight supply.</li>
  </ul>
</section>
<section id="dispatch-tool">
  <h2>Simulate a solar-plus-storage day</h2>
  <div class="tool" id="tool-dispatch">
    <div class="tool__head"><h3>24-hour dispatch simulator</h3><span class="muted mono">15-minute steps · idealised profiles</span></div>
    <div class="tool__grid">
      {field('solar', 'Solar farm peak output', 50, ' MW', 5, 500, 5, 'range')}
      {field('Pbat', 'Battery power', 20, ' MW', 1, 300, 1, 'range')}
      {field('Ecap', 'Battery energy', 160, ' MWh', 5, 3000, 5, 'range')}
      {field('base', 'Base load', 20, ' MW', 1, 300, 1, 'range')}
      {field('peak', 'Evening peak on top of base', 25, ' MW', 0, 300, 1, 'range')}
      {field('rte', 'Round-trip efficiency', 72, ' %', 50, 95, 1, 'range')}
      {field('soc0', 'State of charge at midnight', 20, ' %', 0, 100, 5, 'range')}
    </div>
    <div class="stats">{stat('solarE', 'Solar energy generated')}{stat('shifted', 'Delivered from the battery', True)}{stat('exported', 'Surplus exported or curtailed')}{stat('imported', 'Imported from the grid')}{stat('self', 'Load met by solar + battery', True)}{stat('hours', 'Battery duration')}</div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Solar output, load and battery power over a day"></div>
    <div class="chart chart--soc" role="img" aria-label="Battery state of charge over a day" style="aspect-ratio:16/5;min-height:140px;margin-top:10px"></div>
    <p class="note">Solar follows a clear-sky curve from 06:00 to 19:00; load is a base with a morning bump and an evening peak around 19:30. The battery charges only from solar surplus and discharges only into a deficit, with losses split evenly between charging and discharging. Try doubling the energy while keeping the power fixed: that is the VRFB's cheapest upgrade. To design a whole project step by step, with economics and downloads, open the <a href="{PROJECT}">project builder</a>.</p>
  </div>
</section>
<section id="case-studies">
  <h2>Flagship installations</h2>
  <div class="table-wrap"><table><thead><tr><th>Project</th><th class="num">Power / energy</th><th>Year</th><th>Role</th><th>Source</th></tr></thead><tbody>
  <tr><td>Dalian Flow Battery Energy Storage Peak-shaving Power Station, China (Rongke Power / DICP)</td><td class="num">100 MW / 400 MWh (phase 1)</td><td>2022</td><td>Peak shaving and renewable integration for the Dalian grid; the largest flow battery in the world when commissioned</td><td>{cite(7)}</td></tr>
  <tr><td>Hokkaido Electric Power Network, Minami-Hayakita substation, Japan (Sumitomo Electric)</td><td class="num">15 MW / 60 MWh, then 17 MW / 51 MWh</td><td>2015, 2022</td><td>Smoothing wind and solar output; frequency and voltage support</td><td>{cite(8)}</td></tr>
  <tr><td>Energy Superhub Oxford, UK (Invinity)</td><td class="num">2 MW / 5 MWh (hybrid with Li-ion)</td><td>2022</td><td>Grid services alongside EV charging in a hybrid battery</td><td>{cite(12)}</td></tr>
  <tr><td>San Diego Gas &amp; Electric, Escondido, USA (Sumitomo Electric)</td><td class="num">2 MW / 8 MWh</td><td>2017</td><td>Four-hour distribution-level demonstration</td><td>{cite(12)}</td></tr>
  </tbody></table></div>
  <p>The Dalian project is the clearest signal of where the technology sits: a utility-scale, four-hour (and later eight-hour) asset built around a tank farm, in a market that values safety and cycle life over footprint.{cite(7)}</p>
</section>
<section id="integration">
  <h2>How a VRFB connects to a solar farm and the grid</h2>
  <p>Electrically the battery is just another inverter-based resource. DC from the stacks goes to a bidirectional inverter and a step-up transformer, then to the same point of interconnection as the solar farm. The energy-management system decides when to charge (negative prices, curtailment, midday surplus) and when to discharge (evening peak, ancillary-service calls).{cite(5, 13)}</p>
  <div class="callout adv"><div class="eyebrow">Advanced · sizing rule of thumb</div><p>For evening solar shifting, battery energy should cover the evening deficit: roughly (peak load − overnight solar, which is zero) × 4–6 hours. Battery power only needs to match the deficit's peak, which is often a third to a half of the solar farm's rating. That asymmetry (modest power, long duration) is precisely the shape a flow battery produces cheaply. The dispatch simulator above lets you test it.{cite(5)}</p></div>
</section>
<section id="outlook">
  <h2>Outlook</h2>
  <p>Vanadium flow batteries remain a small share of grid storage, but the market for 8-hour-plus duration is growing fastest, and flow chemistry's fire safety is increasingly valued near population centres. Cost declines will come less from the chemistry, which is mature, than from manufacturing scale, cheaper membranes and vanadium leasing.{cite(5, 13, 14)}</p>
</section>
'''

REFS = [
 ('Skyllas-Kazacos, M., Rychcik, M., Robins, R. G., Fane, A. G., Green, M. A. (1986). New All-Vanadium Redox Flow Cell. <em>Journal of The Electrochemical Society</em>, 133(5), 1057–1058.', 'https://doi.org/10.1149/1.2108706'),
 ('Skyllas-Kazacos, M., Chakrabarti, M. H., Hajimolana, S. A., Mjalli, F. S., Saleem, M. (2011). Progress in Flow Battery Research and Development. <em>Journal of The Electrochemical Society</em>, 158(8), R55–R79.', 'https://doi.org/10.1149/1.3599565'),
 ('Li, L., Kim, S., Wang, W., Vijayakumar, M., Nie, Z., Chen, B., Zhang, J., Xia, G., Hu, J., Graff, G., Liu, J., Yang, Z. (2011). A Stable Vanadium Redox-Flow Battery with High Energy Density for Large-Scale Energy Storage. <em>Advanced Energy Materials</em>, 1(3), 394–400.', 'https://doi.org/10.1002/aenm.201100008'),
 ('Weber, A. Z., Mench, M. M., Meyers, J. P., Ross, P. N., Gostick, J. T., Liu, Q. (2011). Redox flow batteries: a review. <em>Journal of Applied Electrochemistry</em>, 41, 1137–1164.', 'https://doi.org/10.1007/s10800-011-0348-2'),
 ('Viswanathan, V., Mongird, K., Franks, R., Li, X., Sprenkle, V., Baxter, R. (2022). 2022 Grid Energy Storage Technology Cost and Performance Assessment. PNNL-33283, U.S. Department of Energy.', 'https://www.energy.gov/eere/analysis/2022-grid-energy-storage-technology-cost-and-performance-assessment'),
 ('Lazard (2024). Levelized Cost of Energy+ (LCOE+), including the Levelized Cost of Storage analysis.', 'https://www.lazard.com/research-insights/levelized-cost-of-energyplus/'),
 ('Dalian Institute of Chemical Physics, Chinese Academy of Sciences / Rongke Power (2022). Dalian Flow Battery Energy Storage Peak-shaving Power Station, 100 MW / 400 MWh, connected to the grid. Press materials.', 'https://www.rongkepower.com/'),
 ('Sumitomo Electric Industries. Redox flow battery systems and projects, including the Hokkaido Electric Power Network installations at Minami-Hayakita (15 MW / 60 MWh, 2015; 17 MW / 51 MWh, 2022).', 'https://sumitomoelectric.com/products/redox'),
 ('Bard, A. J., Faulkner, L. R., White, H. S. (2022). <em>Electrochemical Methods: Fundamentals and Applications</em>, 3rd ed. Wiley.', 'https://www.wiley.com/en-us/Electrochemical+Methods%3A+Fundamentals+and+Applications%2C+3rd+Edition-p-9781119334064'),
 ('Ulaganathan, M., Aravindan, V., Yan, Q., Madhavi, S., Skyllas-Kazacos, M., Lim, T. M. (2016). Recent Advancements in All-Vanadium Redox Flow Batteries. <em>Advanced Materials Interfaces</em>, 3(1), 1500309.', 'https://doi.org/10.1002/admi.201500309'),
 ('Rahman, F., Skyllas-Kazacos, M. (1998). Solubility of vanadyl sulfate in concentrated sulfuric acid solutions. <em>Journal of Power Sources</em>, 72(2), 105–110.', 'https://doi.org/10.1016/S0378-7753(97)02692-X'),
 ('U.S. Department of Energy, Office of Electricity / Sandia National Laboratories. Global Energy Storage Database (project listings).', 'https://sandia.gov/ess-ssl/gesdb/public/'),
 ('IRENA (2017). <em>Electricity Storage and Renewables: Costs and Markets to 2030</em>. International Renewable Energy Agency.', 'https://www.irena.org/publications/2017/Oct/Electricity-storage-and-renewables-costs-and-markets'),
 ('Minke, C., Turek, T. (2018). Materials, system designs and modelling approaches in techno-economic assessment of all-vanadium redox flow batteries – A review. <em>Journal of Power Sources</em>, 376, 66–81.', 'https://doi.org/10.1016/j.jpowsour.2017.11.058'),
 ('Knehr, K. W., Kumbur, E. C. (2011). Open circuit voltage of vanadium redox flow batteries: Discrepancy between models and experiments. <em>Electrochemistry Communications</em>, 13(4), 342–345.', 'https://doi.org/10.1016/j.elecom.2011.01.020'),
 ('Lourenssen, K., Williams, J., Ahmadpour, F., Clemmer, R., Tasnim, S. (2019). Vanadium redox flow batteries: A comprehensive review. <em>Journal of Energy Storage</em>, 25, 100844.', 'https://doi.org/10.1016/j.est.2019.100844'),
 ('Vanitec. Vanadium price information (V₂O₅ flake, ferrovanadium), historical series.', 'https://vanitec.org/vanadium/price'),
 ('Roe, S., Menictas, C., Skyllas-Kazacos, M. (2016). A High Energy Density Vanadium Redox Flow Battery with 3 M Vanadium Electrolyte. <em>Journal of The Electrochemical Society</em>, 163(1), A5023–A5028.', 'https://doi.org/10.1149/2.0041601jes'),
 ('U.S. Department of Energy, Office of Electricity (2023). <em>Technology Strategy Assessment: Findings from Storage Innovations 2030 — Flow Batteries</em>. DOE/OE-0033, July 2023.', 'https://www.energy.gov/oe/storage-innovations-2030'),
 ('Tang, A., Bao, J., Skyllas-Kazacos, M. (2014). Studies on pressure losses and flow rate optimization in vanadium redox flow battery. <em>Journal of Power Sources</em>, 248, 154–162.', 'https://doi.org/10.1016/j.jpowsour.2013.09.071'),
 ('Rodby, K. E., Carney, T. J., Ashraf Gandomi, Y., Barton, J. L., Darling, R. M., Brushett, F. R. (2020). Assessing the levelized cost of vanadium redox flow batteries with capacity fade and rebalancing. <em>Journal of Power Sources</em>, 460, 227958.', 'https://doi.org/10.1016/j.jpowsour.2020.227958'),
 ('Schmidt, O., Melchior, S., Hawkes, A., Staffell, I. (2019). Projecting the Future Levelized Cost of Electricity Storage Technologies. <em>Joule</em>, 3(1), 81–100.', 'https://doi.org/10.1016/j.joule.2018.12.008'),
 ('National Renewable Energy Laboratory. Annual Technology Baseline: Utility-Scale Battery Storage (cost and performance projections for lithium-ion systems).', 'https://atb.nrel.gov/electricity/2024/utility-scale_battery_storage'),
]
REFS_BODY = '''
<section id="how-to-read">
  <h2>How this site is sourced</h2>
  <p>Every bracketed number on the site links to an entry below. Standard electrode potentials, concentrations, temperature limits and efficiencies come from peer-reviewed reviews and primary papers; cost figures come from U.S. national-laboratory and industry assessments and are presented as ranges or editable assumptions, never as quotes. Where a value is a rule of thumb or a model simplification, the page says so next to the number.</p>
  <p>Four kinds of number appear on the site, and they are not equally solid:</p>
  <div class="provenance"><span class="chip chip--measured"><i></i>Measured data: laboratory or field measurements from the cited papers</span><span class="chip chip--model"><i></i>Model results: calculated by this site's documented, tested models</span><span class="chip chip--illustrative"><i></i>Illustrative defaults: editable starting values inside published ranges</span><span class="chip chip--claim"><i></i>Manufacturer claims: stated by suppliers, not independently verified here</span></div>
  <p>Links point to DOIs or publisher pages where available. If you find an error or a better source, open an issue on <a href="https://github.com/RuibinRay/VRFB-Info/issues">the repository</a>.</p>
</section>
<section id="references">
  <h2>References</h2>
  <ol style="padding-left:1.4em">''' + ''.join(f'<li id="ref-{i+1}" style="margin-bottom:12px;scroll-margin-top:90px">{t} <a href="{u}" rel="noopener" target="_blank" class="mono" style="font-size:0.8rem;word-break:break-all">{u}</a></li>' for i, (t, u) in enumerate(REFS)) + '''</ol>
</section>
<section id="data-notes">
  <h2>Notes on specific numbers</h2>
  <ul>
    <li><strong>E° values.</strong> −0.255 V (V³⁺/V²⁺) and +1.004 V (VO₂⁺/VO²⁺) vs SHE are the widely tabulated standard potentials; the literature also quotes −0.26 V and +1.00 V. The cell standard potential is therefore 1.26 V.</li>
    <li><strong>Open-circuit voltage.</strong> ≈ 1.40 V at 50 % SOC is the measured value discussed by Knehr and Kumbur [15]; the simple Nernst form predicts about 1.34 V in 5 M acid.</li>
    <li><strong>Energy density.</strong> 20–35 Wh/L refers to the total of both electrolytes; some sources quote per-side values twice as high.</li>
    <li><strong>Costs.</strong> The calculator defaults (stacks $450/kW, power conversion $100/kW, V₂O₅ $18/kg, balance of system $60/kWh + $150/kW, LFP $250 per nameplate kWh) are illustrative values within the ranges in [5], [6], [14], [19] and [23], not vendor data. Battery prices, LFP prices especially, change quickly: replace them with current figures.</li>
    <li><strong>Lifetimes.</strong> Cycle-life and calendar-life figures above about 10 000 cycles or 20 years are design targets or manufacturer claims for both technologies; long-term field data at grid scale is still limited [5], [19].</li>
    <li><strong>Efficiency.</strong> 65–80 % AC round trip for vanadium flow systems and 85–90 % for LFP are ranges from [5]; a specific product may sit outside them.</li>
    <li><strong>Flow and pumping.</strong> Flow factors of 5–10 and pump shares of 2–5 % are typical values from [14] and [20]; the optimum depends on the stack design and the state of charge.</li>
    <li><strong>Models.</strong> The calculation modules behind every tool are in <code>js/sim/</code> of the repository and are covered by automated tests (<code>npm test</code>), including energy balance, charge balance of the reactions and hand-checked LCOS cases.</li>
    <li><strong>Project figures.</strong> Dalian phase 1 (100 MW / 400 MWh, 2022) per DICP/Rongke Power announcements [7]; Hokkaido figures per Sumitomo Electric [8].</li>
  </ul>
</section>
'''

PAGES = [
 dict(slug='chemistry', title='Chemistry', accent='#a36bff', kicker='Pillar 01 · Chemistry', lede='Why one metal in four oxidation states makes a battery whose active material is not used up: the half-reactions, the Nernst equation, and an interactive open-circuit-voltage explorer.', toc=[('why-vanadium', 'Four oxidation states'), ('half-reactions', 'Half-reactions'), ('nernst', 'Nernst equation & explorer'), ('electrolyte', 'The electrolyte'), ('side-reactions', 'Side reactions')], body=CHEM, scripts=['chemistry']),
 dict(slug='anatomy', title='Battery anatomy', accent='#26d9e3', kicker='Pillar 02 · Anatomy', lede='Every layer of the stack and every box on the skid: what it is made of, what it does, and how it fails.', toc=[('overview', 'Cell to power station'), ('components', 'The stack, layer by layer'), ('balance-of-plant', 'Balance of plant'), ('failure-modes', 'Failure and maintenance')], body=ANAT),
 dict(slug='engineering', title='Engineering', accent='#5ee37a', kicker='Pillar 03 · Engineering', lede='Sizing stacks, tanks and pumps; where the efficiency goes; thermal limits; and a calculator that designs a system from first principles.', toc=[('power-vs-energy', 'Power vs energy'), ('sizing-tool', 'Sizing calculator'), ('efficiency', 'Efficiency'), ('thermal', 'Thermal & flow'), ('scaling', 'Scaling up')], body=ENG, scripts=['engineering']),
 dict(slug='economics', title='Economics', accent='#ff9b2f', kicker='Pillar 04 · Economics', lede='What a vanadium flow battery costs, why the vanadium price matters, and a levelised-cost-of-storage calculator to compare it with lithium-ion.', toc=[('cost-structure', 'Cost structure'), ('lcos-tool', 'LCOS calculator'), ('vanadium-market', 'The vanadium question'), ('comparison', 'Technology comparison')], body=ECON, scripts=['economics']),
 dict(slug='applications', title='Real-world applications', accent='#ffd23f', kicker='Pillar 05 · Applications', lede='Solar shifting, grid services and the flagship projects from Dalian to Hokkaido, with a 24-hour dispatch simulator.', toc=[('why-flow', 'What they are for'), ('dispatch-tool', 'Dispatch simulator'), ('case-studies', 'Flagship installations'), ('integration', 'Grid integration'), ('outlook', 'Outlook')], body=APPS, scripts=['applications']),
 dict(slug='references', title='Sources & citations', accent='#26d9e3', kicker='Verified data', lede='Every number on this site traces back to one of the sources below, and is labelled as measured, modelled, illustrative or claimed.', toggle=False, toc=[('how-to-read', 'How this site is sourced'), ('references', 'References'), ('data-notes', 'Notes on specific numbers')], body=REFS_BODY),
]

