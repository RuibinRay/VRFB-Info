/** English strings for the laboratories: 3D lab, simulators, comparison and project builder. */
const port = {
  what: ['A hose connector where liquid enters or leaves the stack.', 'A barbed or flanged hydraulic port in the end plate, sealed with an acid-resistant O-ring.'],
  why: ['It links the stack to its tank and pump.', 'It joins the external piping to the internal manifold that feeds every cell in parallel.'],
  how: ['Liquid goes in at the bottom and comes out at the top.', 'Bottom-in, top-out flow sweeps gas bubbles out of the cells and keeps the electrodes fully wetted.'],
  fail: ['A loose connection drips acid.', 'A leaking port is an external leak; connecting the wrong loop would mix the electrolytes and discharge the battery as heat.'],
};

export default {
  common: {
    conceptual: 'Conceptual animation', model: 'Quantitative model', illustrative: 'Illustrative defaults', measured: 'Measured data', claim: 'Manufacturer claim',
    download: 'Download', csv: 'CSV', xlsx: 'Excel', pdf: 'PDF', assumptions: 'Assumptions and limits', formulas: 'Formulas, step by step', reset: 'Reset', sources: 'Sources',
    beginner: 'In plain words', intermediate: 'The engineering', advanced: 'The science', year: 'Year', total: 'Total',
  },
  lab: {
    title: '3D Lab', lede: 'Free-exploration 3D laboratory: rotate, take apart and operate a vanadium redox flow battery, and inspect every component.',
    view: 'View', viewSystem: 'System', viewStack: 'Stack', viewCell: 'One cell', explode: 'Explode the stack', operate: 'Operate', charge: 'Charge', idle: 'Idle', discharge: 'Discharge',
    soc: 'State of charge', flowToggle: 'Circulate electrolyte', follow: 'Follow the electrolyte', tourStop: 'Stop the tour', show: 'Show / hide',
    enclosure: 'Stack enclosure', tanks: 'Tanks', pumps: 'Pumps', pipes: 'Pipes, valves, sensors', pcs: 'Power conversion', membranes: 'Membranes', electrodes: 'Electrodes (felt)', site: 'Surrounding site', reset: 'Reset everything',
    tipDefault: 'Drag to rotate · scroll to zoom · click a part', controls: 'Controls', info: 'Component',
    emptyTitle: 'Pick any part', empty: '<p>This is the same battery as in the journey, but now the camera is yours.</p><ul><li><b>Drag</b> to orbit, <b>scroll or pinch</b> to zoom, <b>right-drag</b> to pan.</li><li><b>Click a component</b> to learn what it is, why it exists, how it works and what happens when it fails.</li><li>Slide <b>Explode</b> to open the stack, or switch layers off to see inside.</li><li>Press <b>Charge</b> or <b>Discharge</b> and watch the colours, the flow and the electrons.</li></ul>',
    parts_h: 'All components', simple: 'Simple', engineering: 'Engineering', what: 'What it is', why: 'Why it exists', how: 'How it works', fail: 'What happens if it fails', specs: 'Technical specifications',
    isolate: 'Isolate', showAll: 'Show everything', focus: 'Zoom to it', deselect: 'Close', sources: 'Sources', more: 'Read more in Anatomy →',
    ocv: 'Open-circuit voltage', hudCharge: 'Charging', hudDischarge: 'Discharging', hudIdle: 'Idle',
    eDis: 'e⁻ leave the negative terminal, do work, return at the positive terminal', eChg: 'e⁻ are pushed into the negative terminal by the charger',
    flowNote: 'The liquid always circulates the same way; only the current reverses',
    tour: ['Tank: the negative electrolyte waits here, green when discharged, violet when charged.', 'Pump: it pushes the liquid towards the stack, always in the same direction.', 'Supply line: a flow meter checks that enough vanadium is on its way.', 'Stack: the liquid spreads through every cell, reacts on the felt, and leaves at the top.', 'Return line: the electrolyte heads back, slightly changed in state of charge.', 'Back in the tank it mixes, and the loop starts again.'],
    fallbackTitle: '3D is not available on this device', fallback: 'Your browser could not start WebGL, so the model cannot be shown. The component guide on the right still works, and the Anatomy pillar has the same information with pictures.',
    parts: {
      endplate: {
        what: ['A thick, stiff plate at each end of the stack.', 'A 10–30 mm steel, aluminium or fibre-reinforced plate that closes the stack and carries the hydraulic ports.'],
        why: ['It squeezes all the layers together so nothing leaks.', 'It spreads the tie-rod force evenly, giving about 0.5–1.5 MPa on the felt so that contact resistance is low and the gaskets seal.'],
        how: ['Rods pull the two plates towards each other, like a vice.', 'The plate must stay flat under load: stiffness, not strength, sets its thickness. An insulating sheet keeps the stack voltage off the metal.'],
        fail: ['If it bends, the middle of the stack is squeezed less and can leak.', 'Plate bowing gives uneven compression: higher resistance in the centre, gasket leaks at the edge, and uneven current density.'],
      },
      collector: {
        what: ['A copper sheet that collects the electricity.', 'A 1–3 mm copper plate with a terminal tab, one at each end of the stack: the two DC terminals.'],
        why: ['It gathers current from the whole cell area and sends it to the cables.', 'Copper’s low resistivity (1.7 × 10⁻⁸ Ω·m) lets hundreds of amps leave the stack with a negligible voltage drop.'],
        how: ['It presses against the last graphite plate and picks up the current.', 'Current crosses every bipolar plate through its thickness, then spreads sideways in the copper to the tab and busbar.'],
        fail: ['If acid reaches it, the copper corrodes quickly.', 'Electrolyte seeping past the end plate corrodes the copper, raises contact resistance and contaminates the electrolyte with copper ions.'],
      },
      gasket: {
        what: ['A plastic frame with a rubber seal around each cell.', 'A polymer flow frame (PVC, PP or PVDF) with elastomer gaskets, holding the felt in a window and containing the manifold holes.'],
        why: ['It keeps each liquid inside its own half of the cell.', 'It seals the cell, sets how much the felt is compressed, and routes electrolyte from the manifold into the electrode.'],
        how: ['Holes in the corners line up to make four channels running through the whole stack.', 'Long, narrow inlet and outlet channels add ionic resistance between cells, which limits shunt currents through the shared manifolds.'],
        fail: ['A worn seal lets electrolyte drip out or mix.', 'Gasket creep causes external leaks; internal leaks between half-cells mix the electrolytes and appear as self-discharge and capacity loss.'],
      },
      bipolar: {
        what: ['A graphite plate between two neighbouring cells.', 'A graphite–polymer composite plate, 2–6 mm thick, that is the positive side of one cell and the negative side of the next.'],
        why: ['It joins the cells in a chain so their voltages add up.', 'It connects cells electrically in series while keeping the two electrolytes physically apart; channels in its faces distribute the flow.'],
        how: ['Electricity passes straight through it; liquid cannot.', 'Electrons cross the plate thickness. The serpentine or interdigitated flow field forces electrolyte into the felt with a controlled pressure drop.'],
        fail: ['If it cracks or turns porous, the two liquids mix.', 'Oxidation of the carbon on the positive side at high state of charge raises resistance and can eventually make the plate permeable.'],
      },
      felt_neg: {
        what: ['A spongy mat of carbon fibres: the negative electrode.', 'A porous carbon or graphite felt, 3–6 mm thick and 90–95 % void, with fibres about 10 µm in diameter.'],
        why: ['It gives the reaction a huge surface to happen on.', 'It provides electronic conduction, a flow path and a large specific surface area for the V²⁺/V³⁺ reaction.'],
        how: ['Electrolyte soaks through it and vanadium ions swap electrons with the fibres.', 'On discharge V²⁺ → V³⁺ + e⁻ at the fibre surface; the electron travels through the fibre network to the bipolar plate.'],
        fail: ['If it clogs or loses its surface activity, part of it stops working.', 'Hydrogen evolution near full charge wastes current and unbalances the tanks; loss of surface oxygen groups slows the kinetics over time.'],
      },
      felt_pos: {
        what: ['The matching carbon mat on the other side: the positive electrode.', 'The same felt hosting the VO²⁺/VO₂⁺ couple, usually with an oxygen-functionalised surface.'],
        why: ['It is where the second half of the reaction happens.', 'It provides the reaction surface for the slower of the two couples, so its activity largely sets the voltage loss.'],
        how: ['On discharge, yellow vanadium takes an electron and turns blue.', 'On discharge VO₂⁺ + 2H⁺ + e⁻ → VO²⁺ + H₂O. The reaction transfers an oxygen atom as well as an electron, which makes it slower.'],
        fail: ['If the battery is overcharged, the carbon itself is slowly eaten away.', 'Above about 95 % state of charge the electrode potential is high enough to oxidise carbon to CO₂, permanently damaging the felt and the plate.'],
      },
      membrane: {
        what: ['A thin plastic film between the two electrodes.', 'An ion-exchange membrane 25–200 µm thick, typically a perfluorosulfonic acid polymer such as Nafion.'],
        why: ['It keeps the two liquids apart but lets the circuit close.', 'It must conduct protons with low resistance while blocking vanadium ions: conductivity and selectivity pull in opposite directions.'],
        how: ['Tiny charged particles called protons slip through; vanadium is held back.', 'Fixed sulfonate groups form water channels that carry H⁺. Area resistance is about 0.5–2 Ω·cm²; thinner membranes conduct better but let more vanadium through.'],
        fail: ['If vanadium leaks through, the battery slowly discharges itself.', 'Crossover causes self-discharge and an imbalance of volume and concentration between the tanks, seen as capacity fade and corrected by rebalancing. Fouling raises resistance.'],
      },
      tierod: {
        what: ['Long bolts that hold the stack together.', 'Threaded rods through the plate corners with nuts and disc-spring stacks, sleeved for electrical insulation.'],
        why: ['They provide the squeeze that seals every layer.', 'They set and maintain the clamping load as gaskets creep and the stack warms and cools.'],
        how: ['Tightening the nuts pulls the end plates together.', 'Disc springs act as a soft element in series, so a small loss of gasket thickness causes only a small loss of force.'],
        fail: ['Uneven tightening makes one side leak.', 'Uneven torque tilts the plates; loss of preload over time lowers contact pressure, raising resistance and the risk of leaks.'],
      },
      port_neg: port, port_pos: port,
      tank_neg: {
        what: ['The tank for the negative liquid: green when empty, violet when charged.', 'A sealed polymer or lined-steel vessel holding the V²⁺/V³⁺ electrolyte under an inert-gas blanket.'],
        why: ['It stores half of the battery’s energy.', 'Its volume and the vanadium concentration set the energy capacity; it is sized independently of the stack.'],
        how: ['A bigger tank holds more charged liquid, so the battery runs longer.', 'Capacity per tank = c · V · F: at 1.6 mol/L each litre holds about 43 Ah, of which roughly 80 % is used.'],
        fail: ['If air gets in, the charged liquid loses its charge.', 'Oxygen oxidises V²⁺, lowering the negative state of charge and unbalancing the two tanks; hence the nitrogen blanket.'],
      },
      tank_pos: {
        what: ['The tank for the positive liquid: blue when empty, yellow when charged.', 'A polymer or lined-steel vessel holding the VO²⁺/VO₂⁺ electrolyte.'],
        why: ['It stores the other half of the energy.', 'It holds the same amount of vanadium as the negative tank, because every electron moved on one side is matched on the other.'],
        how: ['Its colour shows how full the battery is.', 'State of charge is the share of vanadium present as VO₂⁺; the open-circuit voltage rises with it according to the Nernst equation.'],
        fail: ['If it gets too hot while fully charged, solid crystals can form.', 'Above about 40 °C at high state of charge, vanadium(V) precipitates as V₂O₅, blocking felts and pipes; temperature and SOC limits prevent it.'],
      },
      pump: {
        what: ['A pump that keeps the liquid moving.', 'A magnetic-drive centrifugal pump with acid-resistant wetted parts, one per electrolyte loop.'],
        why: ['Fresh liquid must keep reaching the stack, or it stops working.', 'It supplies reactant faster than the current consumes it and carries heat away from the cells.'],
        how: ['It always pushes the same way, for charging and for discharging.', 'Flow is typically 5–10 times the stoichiometric minimum; variable-speed control raises the flow only near the ends of the SOC window.'],
        fail: ['If a pump stops, the battery cannot deliver power for long.', 'Loss of flow starves the electrode: the cell voltage collapses on discharge or rises into side reactions on charge. Pumping uses about 2–5 % of throughput.'],
      },
      pipe: {
        what: ['Plastic pipes that carry each liquid round its own loop.', 'PVC, PP or PVDF piping forming two closed circuits: tank → pump → stack → tank.'],
        why: ['They keep the two liquids completely separate.', 'They connect tanks, pumps and stack manifolds with a low pressure drop and no metal in contact with the acid.'],
        how: ['Each liquid goes round and round its own circuit.', 'Pressure drop grows with flow rate and falls steeply with pipe diameter, so pipe size is a trade-off between cost and pump power.'],
        fail: ['A cracked pipe spills acid.', 'Leaks are the main operational hazard; long conductive liquid paths also carry shunt currents between stacks connected in series.'],
      },
      valve: {
        what: ['Taps that open or close a pipe.', 'Ball, globe or diaphragm valves with polymer bodies and elastomer seats.'],
        why: ['They let part of the system be shut off for repair or in an emergency.', 'They isolate tanks, pumps and stacks, allow the stack to be drained, and control the rebalancing line.'],
        how: ['A quarter turn of the handle stops the flow.', 'Actuated valves close automatically on a leak or over-temperature signal from the battery management system.'],
        fail: ['A valve left closed makes the pump push against a dead end.', 'A stuck or leaking valve can starve a stack or allow unwanted mixing through the rebalancing line.'],
      },
      sensor: {
        what: ['Instruments that measure flow, pressure, temperature and level.', 'Flow meters, pressure transmitters, temperature probes, level gauges and an open-circuit-voltage reference cell.'],
        why: ['They tell the control system what is happening inside.', 'They provide the measurements for state-of-charge estimation, pump control, thermal protection and leak detection.'],
        how: ['Their readings decide how fast the pumps run and when to stop.', 'Open-circuit voltage gives SOC through the Nernst equation; pressure drop across the stack reveals blockage; tank levels reveal crossover.'],
        fail: ['A wrong reading can let the battery overcharge.', 'Sensor drift mis-states the SOC, which can push the stack into hydrogen evolution or carbon corrosion at the ends of the window.'],
      },
      cabinet: {
        what: ['The electrical cabinet that connects the battery to the grid.', 'A bidirectional power conversion system (inverter and transformer) together with the battery management system.'],
        why: ['The battery makes direct current; the grid needs alternating current.', 'It converts between the stack’s DC voltage and grid AC, and enforces the voltage, current and SOC limits.'],
        how: ['It turns DC into AC when discharging and AC into DC when charging.', 'Each conversion is about 96–98 % efficient; together with pumps and shunt currents this takes the cell’s 80–90 % down to 65–80 % AC to AC.'],
        fail: ['If it trips, the battery is disconnected but not damaged.', 'Loss of the converter isolates the stack; the pumps stop, and only the electrolyte inside the stack self-discharges.'],
      },
      casing: {
        what: ['A clear cover around the stack.', 'A polycarbonate or PVC splash guard and drip tray: secondary containment for the stack.'],
        why: ['It catches drips and keeps hands away from live parts.', 'It contains leaks of corrosive electrolyte and prevents contact with DC terminals at stack voltage.'],
        how: ['A sensor in the tray stops the pumps if liquid appears.', 'A leak detector in the tray triggers pump shutdown and valve closure, limiting a spill to the stack’s own hold-up volume.'],
        fail: ['Without it a small leak can spread.', 'A missing or damaged enclosure turns a gasket weep into an electrical and chemical hazard.'],
      },
    },
  },
};
