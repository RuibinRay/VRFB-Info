/**
 * Component specifications shown in the homepage panel and the Anatomy pillar.
 * Reference numbers map to pillars/references.html (#ref-N).
 */
export const COMPONENTS = {
  endplate: {
    name: 'End plate', kicker: 'Structure · clamping', color: '#c9ced4',
    role: 'The two end plates carry the clamping force of the tie rods and distribute it evenly across every layer so the carbon felt is compressed and the gaskets seal. They also host the electrolyte inlet and outlet ports.',
    specs: [['Material', 'Stainless steel, aluminium or glass-fibre-reinforced polymer'], ['Thickness', '10–30 mm for lab stacks; thicker or ribbed for kW-class stacks'], ['Clamping pressure', '≈ 0.5–1.5 MPa on the felt'], ['Ports', 'Inlet and outlet for one electrolyte loop per side']],
    facts: ['Steel plates are often insulated from the copper collector by a polymer sheet so the stack voltage never reaches the frame.'],
    refs: [4, 14],
  },
  collector: {
    name: 'Current collector', kicker: 'Electrical · terminal', color: '#d8793a',
    role: 'A copper (sometimes brass or gold-plated) sheet that gathers current from the whole electrode area and brings it out through a tab to the busbar. There is one at each end of the stack: the negative and positive terminals.',
    specs: [['Material', 'Copper sheet, 1–3 mm; sometimes nickel- or gold-plated'], ['Resistivity', '1.7 × 10⁻⁸ Ω·m (Cu)'], ['Position', 'Between the end plate and the first bipolar plate']],
    facts: ['Copper corrodes quickly in vanadium sulfuric-acid electrolyte, so the collector must never touch liquid: the bipolar plate seals it off.'],
    refs: [4],
  },
  gasket: {
    name: 'Flow frame & gasket', kicker: 'Sealing · flow distribution', color: '#aab0b8',
    role: 'A polymer frame holds the felt in its window, routes electrolyte from the manifold holes into the electrode and seals the cell edge. Gaskets of EPDM or PTFE on both faces stop leaks between adjacent cells.',
    specs: [['Frame material', 'PVC, PP, PVDF or glass-filled polymer'], ['Gasket material', 'EPDM, Viton® or PTFE'], ['Thickness', 'Sets the felt compression ratio, typically 20–30 %']],
    facts: ['Long, narrow inlet channels in the frame deliberately add electrical resistance so that shunt currents flowing through the shared manifold stay small.'],
    refs: [4, 14],
  },
  bipolar: {
    name: 'Bipolar plate', kicker: 'Conduction · flow field', color: '#2a2d32',
    role: 'A graphite–polymer composite plate that is the positive side of one cell and the negative side of the next. Electrons pass straight through it, so cells connect in series without wiring. Serpentine or interdigitated channels machined into its face spread the electrolyte across the felt.',
    specs: [['Material', 'Graphite–polymer composite (PP, PE or PVDF binder), 2–6 mm'], ['In-plane resistivity', '≈ 10⁻³ – 10⁻² Ω·cm'], ['Flow field', 'Serpentine, interdigitated or flow-through (no channels)'], ['Must be', 'Liquid-tight: the two electrolytes must never mix across the plate']],
    facts: ['A flow field cuts pumping losses by 30–50 % compared with pushing electrolyte straight through a thick felt.'],
    refs: [4, 10, 14],
  },
  felt_neg: {
    name: 'Negative electrode', kicker: 'Carbon felt · V²⁺/V³⁺', color: '#5ee37a',
    role: 'A porous mat of carbon fibres where V³⁺ gains an electron on charge and V²⁺ loses it on discharge. The fibres conduct electrons, the pores carry electrolyte, and the fibre surface is where the two meet.',
    specs: [['Material', 'PAN- or rayon-based carbon or graphite felt'], ['Thickness', '3–6 mm uncompressed, compressed 20–30 %'], ['Fibre diameter', '≈ 8–12 µm'], ['Porosity', '90–95 %'], ['Activation', 'Thermal (400 °C in air) or acid treatment adds oxygen groups that speed up the reaction']],
    facts: ['The negative side also hosts the main parasitic reaction: hydrogen evolution. Keeping it small is why the negative electrode is operated well below 100 % state of charge.'],
    refs: [2, 10],
  },
  felt_pos: {
    name: 'Positive electrode', kicker: 'Carbon felt · VO²⁺/VO₂⁺', color: '#ffd23f',
    role: 'The mirror of the negative felt. On charge VO²⁺ is oxidised to VO₂⁺ (releasing two protons that cross the membrane); on discharge the reverse. Its kinetics are slower than the negative side, so most activation research targets this electrode.',
    specs: [['Material', 'Carbon or graphite felt, often with oxygen-functionalised surface'], ['Thickness', '3–6 mm uncompressed'], ['Hazard', 'At high state of charge VO₂⁺ can oxidise the carbon itself, so felts are kept below ≈ 95 % SOC']],
    facts: ['Catalysts such as bismuth or metal-oxide nanoparticles are added to the felt in research cells to lower the overpotential.'],
    refs: [2, 10],
  },
  membrane: {
    name: 'Ion-exchange membrane', kicker: 'Separator · proton conductor', color: '#d4ecdf',
    role: 'A thin polymer film between the two electrodes. It lets protons (and water) through to balance the charge but blocks vanadium ions, so the two electrolytes stay apart while current flows.',
    specs: [['Material', 'Perfluorosulfonic acid (Nafion®) or cheaper hydrocarbon / anion-exchange membranes'], ['Thickness', '25–200 µm (Nafion 115 = 127 µm; 212 = 51 µm)'], ['Area resistance', '≈ 0.5–2 Ω·cm²'], ['Vanadium crossover', 'Causes self-discharge and capacity fade, corrected by periodic rebalancing']],
    facts: ['The membrane is typically the single most expensive part of the stack, which is why hydrocarbon and porous separators are an active research area.'],
    refs: [2, 4, 14],
  },
  tierod: {
    name: 'Tie rod & clamp bracket', kicker: 'Structure', color: '#c9ced4',
    role: 'Threaded rods through the corner holes pull the end plates together. External brackets spread the load so the plates stay flat; springs or disc washers are sometimes added to keep the force constant as gaskets creep.',
    specs: [['Material', 'Stainless steel (insulated from the plates by sleeves)'], ['Count', '4–12 depending on stack size']],
    facts: ['Uneven torque is a classic cause of leaks: stacks are tightened in a star pattern, like a car wheel.'],
    refs: [4],
  },
  port_neg: {
    name: 'Electrolyte port (negative loop)', kicker: 'Hydraulics', color: '#26d9e3',
    role: 'Hose barbs on the end plate connect the stack to the negative-electrolyte pump and tank. Inside, a manifold runs the length of the stack and feeds each cell through its flow frame.',
    specs: [['Fluid', 'V²⁺/V³⁺ in 2–5 M H₂SO₄'], ['Seal', 'EPDM or Viton® O-ring']],
    facts: ['Colour-coding ports is standard practice: connecting the loops backwards would mix the electrolytes and discharge the battery.'],
    refs: [2],
  },
  port_pos: {
    name: 'Electrolyte port (positive loop)', kicker: 'Hydraulics', color: '#ff9b2f',
    role: 'The same as the negative port but for the VO²⁺/VO₂⁺ electrolyte. Many commercial stacks put both loops on one end plate; this model follows the reference renders with one loop per end.',
    specs: [['Fluid', 'VO²⁺/VO₂⁺ in 2–5 M H₂SO₄'], ['Seal', 'EPDM or Viton® O-ring']],
    facts: ['VO₂⁺ electrolyte is strongly oxidising, so positive-side plumbing must be PVC, PP or PVDF rather than most rubbers.'],
    refs: [2],
  },
  tank_neg: {
    name: 'Negative electrolyte tank', kicker: 'Energy storage', color: '#a36bff',
    role: 'Holds the V²⁺/V³⁺ electrolyte. Its volume, together with the vanadium concentration, sets the energy capacity: roughly 20–35 Wh per litre of total electrolyte. The liquid turns from green (V³⁺, discharged) to violet (V²⁺, charged).',
    specs: [['Material', 'HDPE, PP or fibreglass-lined steel'], ['Blanket', 'Nitrogen or sealed headspace: V²⁺ oxidises in air'], ['Energy density', '≈ 25 Wh/L of total electrolyte at 1.6 M V']],
    facts: ['Commercial systems store 4–12 hours of energy, which is why tanks dominate the footprint.'],
    refs: [2, 3, 5],
  },
  tank_pos: {
    name: 'Positive electrolyte tank', kicker: 'Energy storage', color: '#ffd23f',
    role: 'Holds the VO²⁺/VO₂⁺ electrolyte, blue when discharged and yellow when fully charged. Both tanks are the same size because every electron moved on one side is matched by one on the other.',
    specs: [['Material', 'HDPE, PP or lined steel'], ['Temperature limit', 'Keep below ≈ 40 °C or V(V) precipitates as V₂O₅']],
    facts: ['A rebalancing line between the tanks corrects the slow capacity fade caused by vanadium crossover through the membrane.'],
    refs: [2, 11],
  },
  pump: {
    name: 'Circulation pump', kicker: 'Balance of plant', color: '#3b8cff',
    role: 'A magnetically coupled centrifugal pump per loop circulates electrolyte through the stack. Flow is typically 5–10× the stoichiometric minimum; pumping consumes 2–5 % of the energy throughput.',
    specs: [['Type', 'Magnetic-drive centrifugal, acid-resistant (PP/PVDF wetted parts)'], ['Control', 'Variable speed, often scheduled with state of charge']],
    facts: ['Smarter pump control alone has been shown to raise system efficiency by several percentage points.'],
    refs: [14],
  },
  cabinet: {
    name: 'Power conversion & control', kicker: 'Balance of plant', color: '#c9ced4',
    role: 'The bidirectional inverter converts the stack DC (tens to hundreds of volts) to grid AC, and the battery management system schedules pumps, monitors state of charge via open-circuit-voltage cells and protects against over-charge.',
    specs: [['Inverter efficiency', '≈ 96–98 % each way'], ['SOC sensing', 'Reference cell OCV, conductivity or spectroscopy']],
    facts: ['System round-trip efficiency (AC-to-AC) of 65–80 % includes inverter, pump and shunt-current losses on top of the cell\'s own 80–90 %.'],
    refs: [5, 14],
  },
};
