"""Spanish content for the pillar pages (mirrors content_en.py)."""
from helpers import cite, field, stat

# enlaces desde pillars/es/ a los laboratorios de la raíz
LAB, SIZING, COMPARE, PROJECT = '../../lab.html?lang=es', '../../sizing.html?lang=es', '../../compare.html?lang=es', '../../project.html?lang=es'

LANG = 'es'
HTML_LANG = 'es'
UI = {
    'nav': {'home': 'Recorrido', 'chemistry': 'Química', 'anatomy': 'Anatomía', 'engineering': 'Ingeniería', 'economics': 'Economía', 'applications': 'Aplicaciones', 'references': 'Fuentes'},
    'on_this_page': 'En esta página', 'reading_level': 'Nivel de aprendizaje', 'beginner': 'Principiante', 'intermediate': 'Intermedio', 'advanced': 'Avanzado',
    'level_note': 'El nivel intermedio añade las cifras de ingeniería; el avanzado añade las ecuaciones y las notas de modelado. La mayoría de las secciones termina con una lección: una explicación a tu nivel, un diagrama animado, un ejemplo resuelto, un experimento y una comprobación rápida.',
    'pillar': 'Pilar', 'other_pillars': 'Otros pilares', 'language': 'Idioma',
    'footer_tag': 'VRFB — La ciencia de la energía de flujo · Educativo, sin fines comerciales.', 'footer_sources': 'Fuentes y citas', 'footer_back': 'Volver al recorrido',
    'site_title': 'VRFB: La ciencia de la energía de flujo', 'brand_sub': 'La ciencia de la energía de flujo',
}
PILLARS = [('chemistry', '01', 'Química', '#a36bff'), ('anatomy', '02', 'Anatomía de la batería', '#26d9e3'), ('engineering', '03', 'Ingeniería', '#5ee37a'), ('economics', '04', 'Economía', '#ff9b2f'), ('applications', '05', 'Aplicaciones', '#ffd23f')]

CHEM = f'''
<section id="why-vanadium">
  <h2>Un elemento, cuatro estados de oxidación</h2>
  <p>La mayoría de las baterías usan dos materiales distintos en sus dos lados. La batería de flujo de vanadio usa el mismo elemento en ambos, en dos pares distintos de estados de oxidación. El tanque negativo contiene V²⁺ y V³⁺; el positivo contiene VO²⁺ (vanadio +4) y VO₂⁺ (vanadio +5), todos disueltos en ácido sulfúrico.{cite(1, 2)}</p>
  <p>Esta es la idea que hace práctica a la VRFB. Cualquier otra química de flujo sufre cuando un poco de un electrolito se filtra por la membrana hacia el otro y lo envenena para siempre. En una VRFB el ion que se filtra sigue siendo vanadio; solo hace falta un <em>reequilibrado</em> periódico para devolver los dos tanques al mismo estado de carga. El vanadio no se consume, y la mayor parte de la capacidad perdida de este modo puede recuperarse.{cite(2, 16)}</p>
  <div class="table-wrap"><table><thead><tr><th>Especie</th><th>Estado de oxidación del vanadio</th><th>Color</th><th>Dónde</th></tr></thead><tbody>
  <tr><td>V²⁺</td><td class="num">+2</td><td><span class="panel__swatch" style="background:#7c3aed"></span>Violeta</td><td>Tanque negativo, cargado</td></tr>
  <tr><td>V³⁺</td><td class="num">+3</td><td><span class="panel__swatch" style="background:#1fae45"></span>Verde</td><td>Tanque negativo, descargado</td></tr>
  <tr><td>VO²⁺ (vanadilo)</td><td class="num">+4</td><td><span class="panel__swatch" style="background:#1d63f0"></span>Azul</td><td>Tanque positivo, descargado</td></tr>
  <tr><td>VO₂⁺ (dioxovanadio)</td><td class="num">+5</td><td><span class="panel__swatch" style="background:#f2c21a"></span>Amarillo</td><td>Tanque positivo, cargado</td></tr>
  </tbody></table></div>
  <p class="beginner-only">En el recorrido de la página de inicio los tanques cambian de color exactamente así a medida que la batería se carga: de azul a amarillo en el tanque positivo, a la izquierda, y de verde a violeta en el negativo, a la derecha.</p>
</section>
<section id="half-reactions">
  <h2>Las semirreacciones</h2>
  <p>Durante la descarga, el electrodo negativo cede electrones y el electrodo positivo los recibe. Escritas en el sentido de descarga:{cite(1, 9)}</p>
  <div class="equation">Electrodo negativo:&nbsp; V²⁺ → V³⁺ + e⁻ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E° = −0,255 V vs SHE<br>
Electrodo positivo:&nbsp;&nbsp; VO₂⁺ + 2H⁺ + e⁻ → VO²⁺ + H₂O &nbsp;&nbsp;&nbsp;E° = +1,004 V vs SHE<br>
Global:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; V²⁺ + VO₂⁺ + 2H⁺ → V³⁺ + VO²⁺ + H₂O &nbsp;&nbsp;E°<sub>celda</sub> = 1,259 V
<small>Potenciales estándar de reducción de los pares de vanadio; al cargar, todas las flechas se invierten.</small></div>
  <p>Fíjate en los protones. Cada vez que se entrega un electrón se consumen dos H⁺ en el lado positivo, así que los protones deben cruzar la membrana desde el lado negativo para que ambos electrolitos sigan siendo eléctricamente neutros. Ese es todo el trabajo de la membrana: dejar pasar H⁺ (y algo de agua) y retener el vanadio.{cite(4)}</p>
  <div class="callout adv"><div class="eyebrow">Avanzado · por qué se mueven los electrones</div><p>La fuerza impulsora es la diferencia entre los potenciales de electrodo de los dos pares. Cada uno viene fijado por la energía libre de Gibbs de su reducción, ΔG = −nFE. Con n = 1 para ambos pares, la celda entrega 1,259 V × 96 485 C/mol ≈ 121 kJ por mol de electrones, unos 34 Wh por mol de vanadio transferido. Cinéticamente, el par V²⁺/V³⁺ es una transferencia electrónica de esfera externa sencilla; el par VO²⁺/VO₂⁺ exige una transferencia de oxígeno y tiene una cinética más lenta, por eso la mayor parte de la investigación en activación de electrodos se centra en el lado positivo.{cite(10)}</p></div>
</section>
<section id="nernst">
  <h2>El voltaje depende del estado de carga: la ecuación de Nernst</h2>
  <p>Una VRFB completamente cargada tiene un voltaje mayor que una casi vacía. La relación es la ecuación de Nernst, que añade al potencial estándar un término que depende de las concentraciones. Para la celda completa, escribiendo el estado de carga como SOC (la fracción de vanadio en la forma cargada en cada lado):{cite(9, 15)}</p>
  <div class="equation">E = E° + (RT/F) · ln [ (c<sub>V²⁺</sub> · c<sub>VO₂⁺</sub> · c<sub>H⁺</sub>²) / (c<sub>V³⁺</sub> · c<sub>VO²⁺</sub>) ]<br>
&nbsp;&nbsp;= E° + (RT/F) · [ 2 ln( SOC / (1 − SOC) ) + 2 ln c<sub>H⁺</sub> ]
<small>R = 8,314 J mol⁻¹ K⁻¹, F = 96 485 C mol⁻¹, T en kelvin. RT/F = 25,7 mV a 25 °C.</small></div>
  <p>Los voltajes de circuito abierto medidos son sistemáticamente unos 50–60 mV mayores de lo que predice esta ecuación al 50 % de SOC (≈ 1,40 V frente a ≈ 1,34 V). Knehr y Kumbur demostraron que la diferencia proviene de la actividad de los protones y del potencial de Donnan en la membrana, que la forma simple ignora.{cite(15)} El explorador siguiente permite añadir ese desplazamiento empírico.</p>
  <div class="tool" id="tool-nernst">
    <div class="tool__head"><h3>Explorador de voltaje de circuito abierto</h3><span class="muted mono">modelo de Nernst · interactivo</span></div>
    <div class="tool__grid">
      {field('soc', 'Estado de carga', 50, ' %', 1, 99, 1, 'range')}
      {field('T', 'Temperatura', 25, ' °C', 5, 50, 1, 'range')}
      {field('cH', 'Concentración de protones c<sub>H⁺</sub>', 5, ' M', 1, 8, 0.1, 'range')}
      {field('N', 'Celdas en serie', 40, '', 1, 120, 1, 'range')}
      <label class="field"><span>Desplazamiento Donnan / actividad</span><span><input type="checkbox" data-k="donnan" checked> añadir +60 mV (empírico)</span></label>
    </div>
    <div class="stats">{stat('ocv', 'Voltaje de circuito abierto de la celda', True)}{stat('stack', 'Voltaje de circuito abierto de la pila')}{stat('ratio', 'Vanadio cargado : descargado')}{stat('nernst', 'RT/F a esta temperatura')}</div>
    <div class="stats"><div class="stat"><b style="display:block;height:26px;border-radius:6px" data-out="negtank"></b><span>Color del tanque negativo (V³⁺ → V²⁺)</span></div><div class="stat"><b style="display:block;height:26px;border-radius:6px" data-out="postank"></b><span>Color del tanque positivo (VO²⁺ → VO₂⁺)</span></div></div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Voltaje de circuito abierto frente al estado de carga"></div>
    <p class="note">La curva es muy pronunciada cerca del 0 % y del 100 % de SOC, y esa es una de las razones por las que los sistemas de gestión de batería mantienen la ventana de operación en torno al 10–90 %. En la zona central, más plana, el voltaje cambia solo unos 2 mV por punto porcentual de SOC, así que una celda de referencia debe leerse con precisión de milivoltios para servir de indicador de nivel.</p>
  </div>
</section>
<section id="electrolyte">
  <h2>El electrolito</h2>
  <p>El electrolito comercial contiene aproximadamente 1,5–2 mol/L de vanadio en ácido sulfúrico 2–5 mol/L. La concentración de vanadio fija cuánta energía cabe en un litro; el ácido aporta los protones, mantiene el vanadio disuelto y hace conductora la disolución.{cite(2)}</p>
  <p>La densidad de energía es modesta: unos 25 Wh por litro de electrolito total a 1,6 M, aproximadamente la décima parte de una celda de ion-litio. Es aceptable para almacenamiento estacionario, donde los tanques simplemente se hacen más grandes, pero descarta los vehículos.{cite(2, 5)}</p>
  <div class="callout adv"><div class="eyebrow">Avanzado · solubilidad y temperatura</div><p>La concentración de vanadio está limitada por la solubilidad. Los sulfatos de V²⁺ y V³⁺ precipitan a baja temperatura (por debajo de ≈ 10 °C en disoluciones de ~2 M), mientras que el VO₂⁺ forma V₂O₅ sólido por encima de ≈ 40 °C cuando la batería está muy cargada. Por eso los sistemas prácticos operan entre 10 y 40 °C y evitan dejar el electrolito positivo a SOC muy alto con calor.{cite(2, 11)} El electrolito de ácido mixto desarrollado en PNNL (sulfato + cloruro) eleva la concentración útil a unos 2,5 M y amplía la ventana a −5…50 °C, una ganancia del 70 % en densidad de energía.{cite(3)} Roe et al. llevaron el electrolito de sulfato hasta 3 M con estabilizantes de fosfato.{cite(18)}</p></div>
  <div class="table-wrap"><table><thead><tr><th>Parámetro</th><th class="num">Valor típico</th><th>Fuente</th></tr></thead><tbody>
  <tr><td>Concentración de vanadio</td><td class="num">1,5–2,0 M (2,5 M en ácido mixto)</td><td>{cite(2, 3)}</td></tr>
  <tr><td>Ácido de soporte</td><td class="num">2–5 M H₂SO₄</td><td>{cite(2)}</td></tr>
  <tr><td>Densidad de energía (electrolito total)</td><td class="num">20–35 Wh/L</td><td>{cite(2, 5)}</td></tr>
  <tr><td>Temperatura de operación</td><td class="num">10–40 °C</td><td>{cite(2, 11)}</td></tr>
  <tr><td>Potencial estándar de celda</td><td class="num">1,259 V</td><td>{cite(1, 9)}</td></tr>
  <tr><td>Voltaje de circuito abierto al 50 % de SOC</td><td class="num">≈ 1,40 V</td><td>{cite(15)}</td></tr>
  </tbody></table></div>
</section>
<section id="side-reactions">
  <h2>Qué puede salir mal químicamente</h2>
  <ul>
    <li><strong>Evolución de hidrógeno.</strong> En el electrodo negativo, cerca de la carga completa, parte de la corriente descompone el agua en H₂ en lugar de reducir V³⁺. Desperdicia carga y desequilibra lentamente los tanques.{cite(2, 16)}</li>
    <li><strong>Oxidación por el aire.</strong> El V²⁺ reacciona con el oxígeno, así que el tanque negativo se cubre con nitrógeno o se mantiene sellado.{cite(2)}</li>
    <li><strong>Cruce (crossover).</strong> Los iones de vanadio difunden a través de la membrana, autodescargan la celda y trasladan volumen de un tanque al otro. A diferencia de otras químicas, esto se revierte remezclando o con reequilibrado electroquímico.{cite(4, 16)}</li>
    <li><strong>Corrosión del carbono.</strong> El VO₂⁺ a SOC alto puede oxidar el fieltro positivo y la placa bipolar, por lo que las pilas rara vez se cargan más allá del 95 %.{cite(10)}</li>
  </ul>
</section>
'''

ANAT_ITEMS = [
 ('endplate', 'Placa terminal', 'endplate-negative.webp', 'Placa de acero inoxidable o aluminio, de 10–30 mm, que soporta la fuerza de apriete y aloja las conexiones de manguera. En el modelo 3D las juntas tóricas naranjas marcan el circuito positivo y las cian, en la placa opuesta, el negativo.', [('Material', 'Acero inoxidable · aluminio · GFRP'), ('Presión de apriete', '0,5–1,5 MPa sobre el fieltro'), ('Aislamiento', 'Lámina polimérica frente al colector de cobre')], (4, 14)),
 ('collector', 'Colector de corriente', 'current-collector.png', 'Lámina de cobre con una pestaña terminal que recoge la corriente de toda el área del electrodo. Se mantiene seca, detrás de la primera placa bipolar, porque el cobre se corroe rápidamente en el electrolito ácido.', [('Material', 'Cobre, 1–3 mm, a veces recubierto'), ('Resistividad', '1,7 × 10⁻⁸ Ω·m'), ('Cantidad', 'Dos por pila (terminales)')], (4,)),
 ('gasket', 'Marco de flujo y junta', 'gasket-frame.png', 'Un marco polimérico sujeta el fieltro en su ventana y conduce el electrolito desde los orificios del colector en las esquinas hasta el electrodo. Juntas de elastómero en cada cara sellan la celda. Los canales largos y estrechos añaden resistencia a propósito para limitar las corrientes de derivación por el colector compartido.', [('Marco', 'PVC · PP · PVDF'), ('Junta', 'EPDM · Viton® · PTFE'), ('Espesor', 'Fija la compresión del fieltro, 20–30 %')], (4, 14)),
 ('bipolar', 'Placa bipolar', 'bipolar-plate.webp', 'Placa compuesta de grafito y polímero compartida por celdas vecinas: cara positiva de una y negativa de la siguiente. Los electrones la atraviesan, así que las celdas se conectan en serie. El campo de flujo en serpentín reparte el electrolito por el fieltro y reduce la caída de presión frente a forzarlo todo a través de un fieltro grueso.', [('Material', 'PP / PE / PVDF cargado con grafito, 2–6 mm'), ('Resistividad', '10⁻³–10⁻² Ω·cm'), ('Campo de flujo', 'Serpentín · interdigitado · pasante')], (4, 10, 14)),
 ('felt_neg', 'Electrodo negativo (fieltro de carbono)', 'carbon-felt.webp', 'Manta porosa de fibras de carbono de 8–12 µm, con 90–95 % de porosidad, donde V²⁺/V³⁺ intercambian electrones con la superficie de la fibra. Los fieltros se activan calentándolos en aire o con tratamiento ácido, lo que añade grupos oxigenados que aceleran la reacción.', [('Material', 'Fieltro de carbono base PAN o rayón'), ('Espesor', '3–6 mm, comprimido un 20–30 %'), ('Diámetro de fibra', '≈ 10 µm'), ('Reacción secundaria', 'Evolución de H₂ cerca de la carga completa')], (2, 10)),
 ('membrane', 'Membrana de intercambio iónico', 'membrane.png', 'Película polimérica de 25–200 µm que conduce protones y bloquea el vanadio. Las membranas de ácido perfluorosulfónico (Nafion®) son la referencia; las de hidrocarburo y las de intercambio aniónico, más baratas, sacrifican algo de selectividad o conductividad. Suele ser el componente individual más caro de la pila.', [('Material', 'PFSA (Nafion® 115/212) · hidrocarburo · AEM'), ('Resistencia de área', '0,5–2 Ω·cm²'), ('Cruce', 'Causa autodescarga; se corrige reequilibrando')], (2, 4, 14)),
 ('felt_pos', 'Electrodo positivo (fieltro de carbono)', 'carbon-felt-2.webp', 'El espejo del fieltro negativo, que aloja VO²⁺/VO₂⁺. Aquí la cinética es más lenta, así que los catalizadores (bismuto, óxidos metálicos) y la funcionalización superficial son áreas activas de investigación. A SOC alto, el VO₂⁺, fuertemente oxidante, puede corroer el propio carbono.', [('Material', 'Fieltro de carbono o grafito, funcionalizado con O'), ('Límite', 'Mantener por debajo de ≈ 95 % de SOC')], (2, 10)),
 ('tierod', 'Tirantes y bridas de apriete', 'stack-assembled.webp', 'Varillas roscadas que pasan por los orificios de las esquinas y aprietan las placas terminales entre sí; las bridas externas mantienen las placas planas. Se aprietan en estrella, como una rueda, para sellar de forma uniforme.', [('Material', 'Acero inoxidable con manguitos aislantes'), ('Cantidad', '4–12 por pila')], (4,)),
]

ANAT = f'''
<section id="overview">
  <h2>De una sola celda a una central eléctrica</h2>
  <p>Una VRFB son tres cosas atornilladas entre sí: una <strong>pila</strong> (stack) que convierte química en corriente, unos <strong>tanques</strong> que almacenan la química y un <strong>balance de planta</strong> (bombas, tuberías, electrónica de potencia y controles) que mueve líquido y electrones entre ambos. La pila decide la potencia en kilovatios; los tanques deciden la energía en kilovatios-hora; y ambos pueden dimensionarse de forma independiente.{cite(2, 4)}</p>
  <figure class="figure"><img src="../../assets/img/stack-exploded.webp" alt="Vista explosionada de una celda de VRFB entre sus placas terminales" loading="lazy"><figcaption>Una celda explosionada: placa terminal, colector de cobre, marco de flujo, placa bipolar, fieltro, membrana, fieltro, placa bipolar, marco de flujo, colector, placa terminal. Las mismas capas se modelan en el recorrido de la página de inicio.</figcaption></figure>
  <p>Dentro de la pila, cada celda es un sándwich: una membrana entre dos electrodos de fieltro de carbono, cada uno respaldado por una placa bipolar. Las celdas se apilan eléctricamente en serie e hidráulicamente en paralelo, alimentadas por colectores que recorren toda la pila.{cite(4)}</p>
</section>
<section id="components">
  <h2>La pila, capa por capa</h2>
  <p>Haz clic en cualquier componente de la página de inicio, o abre el <a href="{LAB}">laboratorio 3D</a> para aislarlo y ver qué ocurre cuando falla. Las cifras son valores típicos de las revisiones citadas; cada producto concreto varía.</p>
''' + ''.join(f'''
  <article id="{cid}" class="component">
    <h3>{name}</h3>
    <div class="figure" style="display:grid;grid-template-columns:140px 1fr;gap:0;align-items:start"><img src="../../assets/img/{img}" alt="{name}" loading="lazy" style="width:140px;aspect-ratio:1;object-fit:cover"><div style="padding:14px 18px"><p style="margin-bottom:8px">{desc}</p><dl style="display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0;font-size:0.88rem">{''.join(f'<dt class="muted">{k}</dt><dd style="margin:0">{v}</dd>' for k, v in specs)}</dl><p class="muted" style="margin:8px 0 0;font-size:0.8rem">Fuentes {cite(*refs)}</p></div></div>
  </article>''' for cid, name, img, desc, specs, refs in ANAT_ITEMS) + f'''
</section>
<section id="balance-of-plant">
  <h2>Balance de planta</h2>
  <figure class="figure"><img src="../../assets/img/system-cabinet.webp" alt="Sistema VRFB sobre bancada con tanques, bombas, pila y armario de conversión de potencia" loading="lazy"><figcaption>Un sistema completo: tanques de electrolito a izquierda y derecha, bombas debajo, la pila en el centro, armario del inversor y panel de control detrás.</figcaption></figure>
  <div class="table-wrap"><table><thead><tr><th>Elemento</th><th>Función</th><th>Especificación típica</th></tr></thead><tbody>
  <tr><td>Tanques de electrolito</td><td>Almacenan la energía; el volumen fija la duración</td><td>HDPE/PP o acero revestido; manta de nitrógeno en el tanque negativo; ≈ 40 L por kWh en total{cite(2, 5)}</td></tr>
  <tr><td>Bombas (una por circuito)</td><td>Hacen circular el electrolito a 5–10× el caudal estequiométrico</td><td>Centrífugas de acoplamiento magnético, partes húmedas en PP/PVDF; 2–5 % de la energía como consumo parásito{cite(14)}</td></tr>
  <tr><td>Tuberías y válvulas</td><td>Conectan tanques, bombas y colectores de la pila</td><td>PVC/PP/PVDF; circuitos codificados por color para que no puedan intercambiarse</td></tr>
  <tr><td>Sistema de conversión de potencia</td><td>Conversión CC ⇄ CA, sincronización con la red</td><td>Inversor bidireccional, 96–98 % de eficiencia en cada sentido{cite(5)}</td></tr>
  <tr><td>Sistema de gestión de batería</td><td>Estimación del SOC, programación de bombas, protección, reequilibrado</td><td>Celda de referencia de OCV, sensores de temperatura y nivel{cite(14, 16)}</td></tr>
  <tr><td>Intercambiador de calor</td><td>Mantiene el electrolito en la ventana de 10–40 °C</td><td>Necesario en climas cálidos; a menudo líquido-aire{cite(11)}</td></tr>
  </tbody></table></div>
  <div class="callout adv"><div class="eyebrow">Avanzado · corrientes de derivación</div><p>Como todas las celdas comparten el mismo electrolito conductor a través de los colectores, existe un camino eléctrico paralelo alrededor de cada celda. Las corrientes de derivación resultantes desperdician carga y corroen las placas cercanas a los extremos de la pila. Los diseñadores alargan los canales de entrada de cada marco de flujo, limitan el número de celdas por colector y a veces dividen las pilas largas en módulos hidráulicamente separados para mantener esta pérdida en pocos puntos porcentuales.{cite(4, 14)}</p></div>
</section>
<section id="failure-modes">
  <h2>Cómo fallan las pilas y cómo se mantienen</h2>
  <ul>
    <li><strong>Fugas</strong> por fluencia de las juntas o apriete desigual: el fallo de campo más común; se corrige reapretando o sustituyendo juntas.{cite(14)}</li>
    <li><strong>Ensuciamiento o degradación de la membrana</strong> tras años de servicio, que eleva la resistencia; las membranas se sustituyen en una reconstrucción de la pila, normalmente a los 10–15 años.{cite(5, 14)}</li>
    <li><strong>Pérdida de capacidad</strong> por cruce y reacciones secundarias, que se corrige reequilibrando los electrolitos, no sustituyéndolos.{cite(16)}</li>
    <li><strong>Desgaste de bombas y sellos</strong> en el balance de planta: mantenimiento industrial ordinario.</li>
  </ul>
  <p>Como el electrolito de vanadio puede recuperarse y reutilizarse al final de la vida útil, una instalación VRFB puede conservar un valor residual; cuánto depende del mercado del vanadio en ese momento. Eso importa para la economía, tratada en el siguiente pilar.</p>
</section>
'''

ENG = f'''
<section id="power-vs-energy">
  <h2>Desacoplar potencia y energía</h2>
  <p>En una batería convencional, potencia y energía escalan juntas: más celdas significa más de ambas. En una batería de flujo son compras separadas. La <strong>potencia</strong> (kW) la fija el área total de electrodo de las pilas, ya que la corriente escala con el área a una densidad de corriente dada. La <strong>energía</strong> (kWh) la fija cuánto vanadio hay disuelto en los tanques.{cite(2, 4)}</p>
  <div class="equation">P ≈ N<sub>celdas</sub> · A · j · V<sub>celda</sub>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E ≈ V<sub>tanque</sub> · c<sub>V</sub> · F · ΔSOC · V<sub>celda</sub>
<small>A: área activa por celda · j: densidad de corriente · V<sub>tanque</sub>: volumen de un tanque · c<sub>V</sub>: concentración de vanadio · ΔSOC: ventana útil. Cada electrón necesita un ion de vanadio en <em>cada</em> tanque, así que los dos tanques tienen esta capacidad.</small></div>
  <p>La consecuencia práctica: un sistema de 4 horas y uno de 10 horas pueden compartir pilas idénticas y diferir solo en el tamaño de los tanques. Las duraciones largas resultan más baratas por kWh, y ese es el nicho comercial de la VRFB.{cite(5)} El <a href="{SIZING}">laboratorio de potencia y energía</a> permite mover los MW y los MWh por separado y ver cada paso del cálculo.</p>
</section>
<section id="sizing-tool">
  <h2>Diseña un sistema</h2>
  <div class="tool" id="tool-sizing">
    <div class="tool__head"><h3>Calculadora de dimensionado de pila, tanques y bombas</h3><span class="muted mono">modelo de primer orden · supuestos editables</span></div>
    <div class="tool__grid">
      {field('P', 'Potencia nominal', 250, 'kW', 1, 100000, 1)}
      {field('E', 'Capacidad de energía', 1000, 'kWh', 1, 1000000, 1)}
      {field('Vcell', 'Voltaje de celda bajo carga', 1.30, 'V', 1.0, 1.6, 0.01)}
      {field('j', 'Densidad de corriente', 80, 'mA/cm²', 10, 300, 5)}
      {field('A', 'Área activa por celda', 2500, 'cm²', 100, 20000, 50)}
      {field('N', 'Celdas por pila', 40, '', 1, 200, 1)}
      {field('c', 'Concentración de vanadio', 1.6, 'mol/L', 0.5, 3, 0.1)}
      {field('dod', 'Ventana de SOC útil', 0.8, 'fracción', 0.3, 1, 0.05)}
      {field('lambda', 'Factor de caudal λ (× estequiométrico)', 8, '', 1, 20, 0.5)}
      {field('dp', 'Pérdida de presión de la pila', 0.6, 'bar', 0.1, 3, 0.1)}
      {field('eta', 'Eficiencia de la bomba', 0.55, 'fracción', 0.2, 0.9, 0.05)}
      {field('asr', 'Resistencia específica de área', 1.2, 'Ω·cm²', 0.3, 4, 0.1)}
      {field('ce', 'Eficiencia culómbica', 96, '%', 80, 100, 0.5)}
      {field('inv', 'Eficiencia del inversor (un sentido)', 97, '%', 90, 99.5, 0.5)}
    </div>
    <h4 class="eyebrow">Pila</h4>
    <div class="stats">{stat('stackI', 'Corriente de la pila')}{stat('stackV', 'Voltaje de la pila bajo carga')}{stat('stackP', 'Potencia por pila')}{stat('nStacks', 'Pilas necesarias', True)}</div>
    <h4 class="eyebrow">Electrolito y tanques</h4>
    <div class="stats">{stat('litres', 'Electrolito total (ambos tanques)', True)}{stat('whL', 'Densidad de energía, electrolito total')}{stat('tank', 'Cada tanque (cilindro, H = 1,5 D)')}</div>
    <h4 class="eyebrow">Bombeo</h4>
    <div class="stats">{stat('flow', 'Caudal por pila, por circuito')}{stat('pump', 'Potencia total de bombeo')}{stat('pumpFrac', 'Bombeo como fracción de la potencia nominal', True)}</div>
    <h4 class="eyebrow">Eficiencia a la densidad de corriente elegida</h4>
    <div class="stats">{stat('ve', 'Eficiencia de voltaje')}{stat('cell', 'Eficiencia energética de la celda')}{stat('sys', 'Eficiencia del sistema CA-CA', True)}</div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Eficiencia frente a densidad de corriente"></div>
    <details><summary>Notas del modelo y fórmulas</summary><p>Corriente de la pila I = j·A. Electrolito por lado = E / (c · 26,8 Ah/mol · ΔSOC · V<sub>celda</sub>). Caudal estequiométrico por pila = N·I / (F·c); la bomba entrega λ veces ese valor. Potencia de bombeo = Q·Δp / η para dos circuitos por pila. La eficiencia de voltaje usa una resistencia específica de área concentrada en torno a un voltaje de circuito abierto de 1,40 V: VE = (OCV − j·ASR)/(OCV + j·ASR). La eficiencia del sistema multiplica la de la celda por la eficiencia del inversor dos veces y por (1 − f)/(1 + f) para una fracción de bombeo f, porque las bombas funcionan tanto en la carga como en la descarga. El factor de flujo λ está referido a la concentración total de vanadio; respecto al reactivo aún disponible al 50 % de SOC, el mismo caudal corresponde a λ/2. Se desprecian las corrientes de derivación, la gestión térmica y la dependencia de la ASR con el SOC; los valores publicados de 65–80 % CA-CA concuerdan con este modelo a 60–100 mA/cm².{cite(5, 14)}</p></details>
  </div>
</section>
<section id="efficiency">
  <h2>Adónde va la energía</h2>
  <p>Tres eficiencias se multiplican para dar la cifra de ida y vuelta de la batería.{cite(4, 14)}</p>
  <ul>
    <li><strong>Eficiencia culómbica</strong> (95–98 %): carga perdida por cruce, corrientes de derivación y evolución de hidrógeno.</li>
    <li><strong>Eficiencia de voltaje</strong> (80–92 %): la diferencia de voltaje entre carga y descarga causada por la resistencia y la cinética de reacción. Cae al subir la densidad de corriente, así que exigir más a la pila cambia eficiencia por una pila más pequeña y barata.</li>
    <li><strong>Pérdidas del sistema</strong>: bombas (2–5 %) e inversor (2–4 % en cada sentido).</li>
  </ul>
  <p>En conjunto, las celdas alcanzan 80–90 % en CC y los sistemas completos 65–80 % CA-CA, menos que el 85–90 % del ion-litio, pero estable durante decenas de miles de ciclos.{cite(5)}</p>
  <div class="callout adv"><div class="eyebrow">Avanzado · polarización</div><p>El voltaje de celda bajo carga es V = OCV ± (η<sub>act</sub> + η<sub>ohm</sub> + η<sub>conc</sub>). El sobrepotencial de activación sigue la cinética de Butler–Volmer y está dominado por el electrodo positivo; la pérdida óhmica es la membrana más el electrolito más la resistencia de contacto (en conjunto ≈ 1–2 Ω·cm² en celdas comerciales); el sobrepotencial de concentración aparece cuando el factor de caudal es demasiado bajo para reponer vanadio en la superficie de la fibra, sobre todo cerca de los extremos de la ventana de SOC. Las placas con campo de flujo y los fieltros más finos y comprimidos reducen los tres.{cite(10, 14)}</p></div>
</section>
<section id="thermal">
  <h2>Gestión térmica y de caudal</h2>
  <p>El calentamiento resistivo y el trabajo de las bombas calientan el electrolito. Como el VO₂⁺ precipita por encima de unos 40 °C y los sulfatos de V²⁺/V³⁺ por debajo de unos 10 °C, los sistemas grandes añaden un intercambiador de calor y mantienen las bombas en marcha durante los periodos de reposo con calor para que la pila no se sobrecaliente.{cite(2, 11)}</p>
  <p>Las bombas de velocidad variable programadas según el estado de carga son una mejora de eficiencia barata: solo hace falta caudal alto cerca de los extremos de la ventana de SOC, donde la concentración de vanadio en el electrodo escasea.{cite(14)}</p>
</section>
<section id="scaling">
  <h2>Escalar</h2>
  <p>Las pilas comerciales van de unos pocos kilovatios a unos 30–40 kW cada una, con áreas de celda de 0,1–0,4 m² y 20–100 celdas por pila. Los sistemas de megavatios conectan muchas pilas en serie-paralelo para alcanzar un bus de CC de varios cientos de voltios, y comparten tanques que contienen cientos de metros cúbicos de electrolito.{cite(14, 16)} La central de Dalian alcanza así 100 MW y 400 MWh, con pilas en contenedores alimentadas desde un parque de tanques.{cite(7)}</p>
</section>
'''

ECON = f'''
<section id="cost-structure">
  <h2>Qué cuesta una VRFB, y por qué</h2>
  <p>Un sistema de ion-litio es sobre todo celdas. Una VRFB se reparte entre pilas, electrolito y todo lo demás, y el reparto cambia con la duración: a 2 horas las pilas son la partida mayor; a 10 horas lo es el electrolito.{cite(5, 14)}</p>
  <ul>
    <li><strong>Pilas y electrónica de potencia</strong> escalan con los kilovatios. La membrana y las placas bipolares son las partes más caras de la pila.{cite(14)}</li>
    <li><strong>Electrolito</strong> escala con los kilovatios-hora y sigue el precio del pentóxido de vanadio (V₂O₅), que ha oscilado entre unos 5 y más de 25 dólares por libra en una década.{cite(17)}</li>
    <li><strong>Tanques, bombas, tuberías, controles, instalación</strong> escalan con ambos.</li>
  </ul>
  <p>La evaluación de 2022 del Departamento de Energía de EE. UU. sitúa los costes instalados de los sistemas de flujo de vanadio a escala de red en los pocos cientos de dólares por kWh para duraciones de 10 horas, con el electrolito como mayor partida; las cifras exactas dependen del año, el tamaño y el precio del vanadio, así que usa las entradas de la calculadora como supuestos editables, no como cotizaciones.{cite(5)}</p>
</section>
<section id="lcos-tool">
  <h2>Calculadora de coste nivelado de almacenamiento</h2>
  <p>El coste nivelado de almacenamiento (LCOS) reparte todos los costes a lo largo de la vida útil entre todos los megavatios-hora que la batería llegará a descargar, descontados a hoy. Es la cifra única más justa para comparar tecnologías con vidas útiles distintas.{cite(6, 13)}</p>
  <div class="equation">LCOS = [ CAPEX + Σ<sub>t</sub> (O&amp;M<sub>t</sub> + carga<sub>t</sub> + reemplazos<sub>t</sub>) / (1+r)<sup>t</sup> − residual / (1+r)<sup>N</sup> ] / Σ<sub>t</sub> E<sub>descargada,t</sub> / (1+r)<sup>t</sup></div>
  <div class="tool" id="tool-lcos">
    <div class="tool__head"><h3>VRFB frente a LFP: coste nivelado de almacenamiento</h3><span class="muted mono">todas las entradas editables · valores por defecto ilustrativos</span></div>
    <h4 class="eyebrow">Proyecto</h4>
    <div class="tool__grid">
      {field('P', 'Potencia', 10, 'MW', 0.1, 1000, 0.1)}
      {field('h', 'Duración', 8, 'horas', 1, 24, 0.5)}
      {field('cycles', 'Ciclos completos por año', 330, '', 1, 730, 1)}
      {field('life', 'Vida del proyecto (ambas tecnologías)', 25, 'años', 5, 40, 1)}
      {field('disc', 'Tasa de descuento', 7, '%', 0, 20, 0.5)}
      {field('chg', 'Precio de la electricidad de carga', 30, '$/MWh', 0, 200, 1)}
    </div>
    <h4 class="eyebrow">Costes de la VRFB</h4>
    <div class="tool__grid">
      {field('v2o5', 'Precio del V₂O₅', 18, '$/kg', 5, 60, 0.5)}
      {field('c', 'Concentración de vanadio', 1.6, 'mol/L', 0.8, 3, 0.1)}
      {field('dod', 'Ventana de SOC útil', 0.8, 'fracción', 0.4, 1, 0.05)}
      {field('acidProc', 'Ácido, agua, procesado', 15, '$/kWh', 0, 100, 1)}
      {field('stackCost', 'Pilas', 450, '$/kW', 100, 3000, 10)}
      {field('pcsCost', 'Sistema de conversión de potencia', 100, '$/kW', 0, 500, 5)}
      {field('bosE', 'Tanques y BOS (parte de energía)', 60, '$/kWh', 0, 300, 5)}
      {field('bosP', 'Bombas y BOS (parte de potencia)', 150, '$/kW', 0, 1000, 10)}
      {field('epc', 'EPC e instalación', 20, '% del equipo', 0, 60, 1)}
      {field('om', 'Operación y mantenimiento', 15, '$/kW·año', 0, 100, 1)}
      {field('rte', 'Eficiencia de ida y vuelta (CA)', 72, '%', 50, 90, 1)}
      {field('deg', 'Pérdida de capacidad no recuperada al año', 0.3, '%', 0, 5, 0.1)}
      {field('stackYear', 'Intervalo de reacondicionamiento de pilas', 12, 'años', 1, 40, 1)}
      {field('stackRepl', 'Coste del reacondicionamiento', 50, '% del coste de pilas', 0, 100, 5)}
      {field('resid', 'Valor residual del electrolito', 60, '% del coste del electrolito', 0, 100, 5)}
    </div>
    <h4 class="eyebrow">Comparador LFP</h4>
    <div class="tool__grid">
      {field('liCapex', 'Coste instalado (por kWh nominal)', 250, '$/kWh', 50, 1500, 5)}
      {field('liDod', 'Profundidad de descarga', 90, '%', 50, 100, 1)}
      {field('liRte', 'Eficiencia de ida y vuelta (CA)', 86, '%', 60, 95, 1)}
      {field('liLife', 'Vida máxima de calendario', 15, 'años', 3, 30, 1)}
      {field('liDeg', 'Degradación de calendario al año', 1.5, '%', 0, 10, 0.1)}
      {field('liRepl', 'Coste de sustitución', 60, '% del coste inicial', 10, 120, 5)}
      {field('liOm', 'Operación y mantenimiento', 10, '$/kW·año', 0, 100, 1)}
    </div>
    <div class="stats">{stat('lcos', 'LCOS de la VRFB', True)}{stat('lcosLi', 'LCOS de la LFP')}{stat('capex', 'Coste de capital total de la VRFB')}{stat('perKwh', 'Coste instalado de la VRFB')}{stat('liPerKwh', 'Coste instalado de la LFP')}{stat('kg', 'V₂O₅ por kWh útil')}{stat('elecShare', 'Peso del electrolito en el capex')}{stat('vRepl', 'Reacondicionamiento de pilas en el año')}{stat('liRepl', 'LFP sustituida en el año')}</div>
    <div class="costbar" style="display:flex;height:22px;border-radius:8px;overflow:hidden;gap:2px;background:var(--bg-2)"></div>
    <div class="legend costbar-legend"></div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Coste nivelado de almacenamiento frente al precio del pentóxido de vanadio"></div>
    <p class="note">Las dos tecnologías se evalúan durante la misma vida de proyecto. La LFP se sustituye cuando su capacidad llega al 70 % o termina su vida de calendario, y la vida que quede al final se abona como valor residual. El vanadio por kWh se deriva de la concentración y la ventana de SOC a 1,35 V y se dimensiona para la energía de CC que hay detrás de las pérdidas de descarga: unos 7,4 kg de V₂O₅ por kWh útil a 1,6 M, con una ventana del 80 % y un 72 % de eficiencia de ida y vuelta. El valor residual refleja que el electrolito de vanadio puede recuperarse o volver a arrendarse al final de la vida útil.{cite(14, 17, 21)} Para ver todas las entradas, incluidos el arrendamiento del electrolito, la degradación por ciclos, el valor actual neto, el plazo de recuperación y las gráficas de sensibilidad, abre el <a href="{COMPARE}">laboratorio de comparación</a>.</p>
  </div>
</section>
<section id="vanadium-market">
  <h2>La cuestión del vanadio</h2>
  <p>Aproximadamente el 90 % del vanadio se destina al acero como aditivo de refuerzo, así que su precio sigue el ciclo del acero y no el mercado de baterías. El pico de 2018, por encima de 25 dólares por libra de V₂O₅, casi duplicó el coste del electrolito; a mediados de la década de 2020 los precios se han mantenido en un solo dígito por libra.{cite(17)}</p>
  <p>Han surgido dos respuestas. El <strong>alquiler de electrolito</strong> saca el vanadio del balance del proyecto: el proveedor conserva la propiedad y recupera el metal al final de la vida útil, convirtiendo un coste de capital en una cuota operativa.{cite(14)} Los <strong>electrolitos alternativos</strong> (ácido mixto, mayor concentración) extraen más energía de cada kilogramo.{cite(3, 18)}</p>
  <div class="callout adv"><div class="eyebrow">Avanzado · sensibilidad</div><p>Como el electrolito es proporcional a la energía, la sensibilidad del LCOS al precio del vanadio crece con la duración. Duplicar el V₂O₅ de 10 a 20 $/kg eleva el LCOS por defecto de 8 horas de la calculadora aproximadamente una sexta parte; a 4 horas el efecto es menor, alrededor de una octava parte. La sensibilidad al coste de las pilas funciona al revés. Por eso los fabricantes de VRFB apuntan a aplicaciones de 6–12 horas mientras el ion-litio domina las de 1–4 horas.{cite(5)}</p></div>
</section>
<section id="comparison">
  <h2>Comparación de tecnologías</h2>
  <div class="table-wrap"><table><thead><tr><th>Métrica</th><th>Flujo de vanadio</th><th>Ion-litio (LFP)</th><th>Fuente</th></tr></thead><tbody>
  <tr><td>Eficiencia de ida y vuelta (CA)</td><td class="num">65–80 %</td><td class="num">85–90 %</td><td>{cite(5)}</td></tr>
  <tr><td>Vida en ciclos</td><td class="num">&gt; 10 000; los fabricantes declaran 15 000–20 000; capacidad del electrolito recuperable</td><td class="num">3 000–10 000 hasta el 70–80 % de capacidad</td><td>{cite(5, 16)}</td></tr>
  <tr><td>Vida calendario</td><td class="num">20–25 años previstos, con reacondicionamiento de pilas a los 10–15</td><td class="num">10–20 años</td><td>{cite(5)}</td></tr>
  <tr><td>Densidad de energía</td><td class="num">20–35 Wh/L</td><td class="num">250–400 Wh/L</td><td>{cite(2)}</td></tr>
  <tr><td>Profundidad de descarga</td><td class="num">La descarga profunda no daña la celda; ventana típica del 80 %</td><td class="num">80–95 %</td><td>{cite(16)}</td></tr>
  <tr><td>Comportamiento ante el fuego</td><td>El electrolito de base acuosa no arde; es corrosivo</td><td>Posible fuga térmica; se gestiona con el diseño y la separación</td><td>{cite(16)}</td></tr>
  <tr><td>Huella</td><td>Grande (tanques)</td><td>Compacta</td><td>{cite(2)}</td></tr>
  <tr><td>Fin de vida</td><td>El electrolito puede recuperarse y reutilizarse</td><td>El reciclaje existe y está creciendo</td><td>{cite(14)}</td></tr>
  </tbody></table></div>
  <p class="note">Los rangos combinan evaluaciones publicadas con afirmaciones de fabricantes, indicadas donde corresponde. Ninguna de las dos tecnologías tiene todavía décadas de datos de campo a escala de red, y ninguna es más barata en todos los casos: pon a prueba tus propios supuestos en el <a href="{COMPARE}">laboratorio de comparación</a>.</p>
</section>
'''

APPS = f'''
<section id="why-flow">
  <h2>Para qué sirven las baterías de flujo</h2>
  <p>Una VRFB tarda en construirse, es pesada y tiene una eficiencia del 70–75 %, así que no es una batería para teléfonos ni para coches. Es una batería <strong>estacionaria y de larga duración</strong>: está diseñada para ciclar a diario durante décadas con poca pérdida permanente de capacidad, su electrolito de base acuosa no arde y resulta más barata por kilovatio-hora cuanto más tiempo se le pide que funcione. Esas propiedades encajan con tres trabajos.{cite(5, 16)}</p>
  <ul>
    <li><strong>Desplazamiento solar.</strong> Almacenar el excedente del mediodía y entregarlo durante el pico de la tarde, de cuatro a doce horas después.</li>
    <li><strong>Servicios de red.</strong> Regulación de frecuencia, recorte de picos, aplazamiento de refuerzos de transmisión y apoyo al arranque en negro.</li>
    <li><strong>Microrredes y emplazamientos aislados.</strong> Islas, minas y campus que quieren renovables más suministro firme durante la noche.</li>
  </ul>
</section>
<section id="dispatch-tool">
  <h2>Simula un día de solar con almacenamiento</h2>
  <div class="tool" id="tool-dispatch">
    <div class="tool__head"><h3>Simulador de despacho de 24 horas</h3><span class="muted mono">pasos de 15 minutos · perfiles idealizados</span></div>
    <div class="tool__grid">
      {field('solar', 'Potencia pico del parque solar', 50, ' MW', 5, 500, 5, 'range')}
      {field('Pbat', 'Potencia de la batería', 20, ' MW', 1, 300, 1, 'range')}
      {field('Ecap', 'Energía de la batería', 160, ' MWh', 5, 3000, 5, 'range')}
      {field('base', 'Carga base', 20, ' MW', 1, 300, 1, 'range')}
      {field('peak', 'Pico de la tarde sobre la base', 25, ' MW', 0, 300, 1, 'range')}
      {field('rte', 'Eficiencia de ida y vuelta', 72, ' %', 50, 95, 1, 'range')}
      {field('soc0', 'Estado de carga a medianoche', 20, ' %', 0, 100, 5, 'range')}
    </div>
    <div class="stats">{stat('solarE', 'Energía solar generada')}{stat('shifted', 'Entregada por la batería', True)}{stat('exported', 'Excedente exportado o vertido')}{stat('imported', 'Importada de la red')}{stat('self', 'Carga cubierta por solar + batería', True)}{stat('hours', 'Duración de la batería')}</div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="Producción solar, carga y potencia de la batería a lo largo de un día"></div>
    <div class="chart chart--soc" role="img" aria-label="Estado de carga de la batería a lo largo de un día" style="aspect-ratio:16/5;min-height:140px;margin-top:10px"></div>
    <p class="note">La solar sigue una curva de cielo despejado de 06:00 a 19:00; la carga es una base con un repunte matinal y un pico de tarde en torno a las 19:30. La batería solo se carga con excedente solar y solo se descarga ante un déficit, con las pérdidas repartidas a partes iguales entre carga y descarga. Prueba a duplicar la energía manteniendo la potencia: esa es la mejora más barata de una VRFB. Para diseñar un proyecto completo paso a paso, con economía y descargas, abre el <a href="{PROJECT}">constructor de proyectos</a>.</p>
  </div>
</section>
<section id="case-studies">
  <h2>Instalaciones emblemáticas</h2>
  <div class="table-wrap"><table><thead><tr><th>Proyecto</th><th class="num">Potencia / energía</th><th>Año</th><th>Función</th><th>Fuente</th></tr></thead><tbody>
  <tr><td>Central de almacenamiento con batería de flujo de Dalian, China (Rongke Power / DICP)</td><td class="num">100 MW / 400 MWh (fase 1)</td><td>2022</td><td>Recorte de picos e integración de renovables en la red de Dalian; la mayor batería de flujo del mundo cuando se puso en servicio</td><td>{cite(7)}</td></tr>
  <tr><td>Hokkaido Electric Power Network, subestación de Minami-Hayakita, Japón (Sumitomo Electric)</td><td class="num">15 MW / 60 MWh, luego 17 MW / 51 MWh</td><td>2015, 2022</td><td>Suavizado de la producción eólica y solar; apoyo de frecuencia y tensión</td><td>{cite(8)}</td></tr>
  <tr><td>Energy Superhub Oxford, Reino Unido (Invinity)</td><td class="num">2 MW / 5 MWh (híbrido con ion-litio)</td><td>2022</td><td>Servicios de red junto a carga de vehículos eléctricos en una batería híbrida</td><td>{cite(12)}</td></tr>
  <tr><td>San Diego Gas &amp; Electric, Escondido, EE. UU. (Sumitomo Electric)</td><td class="num">2 MW / 8 MWh</td><td>2017</td><td>Demostración de cuatro horas a nivel de distribución</td><td>{cite(12)}</td></tr>
  </tbody></table></div>
  <p>El proyecto de Dalian es la señal más clara de dónde se sitúa la tecnología: un activo a escala de red de cuatro horas (y después ocho) construido en torno a un parque de tanques, en un mercado que valora la seguridad y la vida en ciclos por encima de la huella.{cite(7)}</p>
</section>
<section id="integration">
  <h2>Cómo se conecta una VRFB a un parque solar y a la red</h2>
  <p>Eléctricamente, la batería es un recurso basado en inversor más. La CC de las pilas pasa a un inversor bidireccional y a un transformador elevador, y de ahí al mismo punto de interconexión que el parque solar. El sistema de gestión de energía decide cuándo cargar (precios negativos, vertidos, excedente del mediodía) y cuándo descargar (pico de la tarde, llamadas a servicios auxiliares).{cite(5, 13)}</p>
  <div class="callout adv"><div class="eyebrow">Avanzado · regla de dimensionado</div><p>Para desplazar solar a la tarde, la energía de la batería debe cubrir el déficit vespertino: aproximadamente (pico de carga − solar nocturna, que es cero) × 4–6 horas. La potencia de la batería solo necesita igualar el pico del déficit, que suele ser entre un tercio y la mitad de la potencia del parque solar. Esa asimetría (potencia modesta, duración larga) es precisamente la forma que una batería de flujo produce de manera barata. El simulador de despacho anterior permite comprobarlo.{cite(5)}</p></div>
</section>
<section id="outlook">
  <h2>Perspectivas</h2>
  <p>Las baterías de flujo de vanadio siguen siendo una pequeña parte del almacenamiento en red, pero el mercado de duraciones de 8 horas o más es el que más crece, y la seguridad frente al fuego de la química de flujo se valora cada vez más cerca de los núcleos de población. Las bajadas de coste vendrán menos de la química, ya madura, que de la escala de fabricación, las membranas más baratas y el alquiler de vanadio.{cite(5, 13, 14)}</p>
</section>
'''

from content_en import REFS
REFS_BODY = '''
<section id="how-to-read">
  <h2>Cómo se documenta este sitio</h2>
  <p>Cada número entre corchetes del sitio enlaza con una entrada de la lista inferior. Los potenciales de electrodo estándar, las concentraciones, los límites de temperatura y las eficiencias proceden de revisiones y artículos primarios revisados por pares; las cifras de coste proceden de evaluaciones de laboratorios nacionales de EE. UU. y de la industria y se presentan como rangos o supuestos editables, nunca como cotizaciones. Cuando un valor es una regla general o una simplificación de modelo, la página lo indica junto al número.</p>
  <p>En el sitio aparecen cuatro tipos de cifras, y no todas son igual de sólidas:</p>
  <div class="provenance"><span class="chip chip--measured"><i></i>Datos medidos: medidas de laboratorio o de campo de los artículos citados</span><span class="chip chip--model"><i></i>Resultados de modelos: calculados por los modelos documentados y probados de este sitio</span><span class="chip chip--illustrative"><i></i>Valores ilustrativos: valores iniciales editables dentro de rangos publicados</span><span class="chip chip--claim"><i></i>Afirmaciones de fabricantes: declaradas por los proveedores, sin verificación independiente aquí</span></div>
  <p>Los enlaces apuntan a DOI o páginas del editor cuando existen. Si encuentras un error o una fuente mejor, abre un issue en <a href="https://github.com/RuibinRay/VRFB-Info/issues">el repositorio</a>. Las referencias se citan en su idioma original.</p>
</section>
<section id="references">
  <h2>Referencias</h2>
  <ol style="padding-left:1.4em">''' + ''.join(f'<li id="ref-{i+1}" style="margin-bottom:12px;scroll-margin-top:90px">{t} <a href="{u}" rel="noopener" target="_blank" class="mono" style="font-size:0.8rem;word-break:break-all">{u}</a></li>' for i, (t, u) in enumerate(REFS)) + '''</ol>
</section>
<section id="data-notes">
  <h2>Notas sobre cifras concretas</h2>
  <ul>
    <li><strong>Valores de E°.</strong> −0,255 V (V³⁺/V²⁺) y +1,004 V (VO₂⁺/VO²⁺) frente a SHE son los potenciales estándar tabulados habitualmente; la literatura también cita −0,26 V y +1,00 V. El potencial estándar de celda es, por tanto, 1,26 V.</li>
    <li><strong>Voltaje de circuito abierto.</strong> ≈ 1,40 V al 50 % de SOC es el valor medido que discuten Knehr y Kumbur [15]; la forma simple de Nernst predice unos 1,34 V en ácido 5 M.</li>
    <li><strong>Densidad de energía.</strong> 20–35 Wh/L se refiere al total de ambos electrolitos; algunas fuentes citan valores por lado el doble de altos.</li>
    <li><strong>Costes.</strong> Los valores por defecto de las calculadoras (pilas 450 $/kW, conversión de potencia 100 $/kW, V₂O₅ 18 $/kg, resto del sistema 60 $/kWh + 150 $/kW, LFP 250 $ por kWh nominal) son valores ilustrativos dentro de los rangos de [5], [6], [14], [19] y [23], no datos de fabricantes. Los precios de las baterías, sobre todo los de la LFP, cambian deprisa: sustitúyelos por cifras actuales.</li>
    <li><strong>Vidas útiles.</strong> Las cifras de ciclos y de vida de calendario por encima de unos 10 000 ciclos o 20 años son objetivos de diseño o afirmaciones de fabricantes en las dos tecnologías; los datos de campo a largo plazo y a escala de red aún son limitados [5], [19].</li>
    <li><strong>Eficiencia.</strong> El 65–80 % de ida y vuelta en CA de los sistemas de flujo de vanadio y el 85–90 % de la LFP son rangos de [5]; un producto concreto puede quedar fuera de ellos.</li>
    <li><strong>Caudal y bombeo.</strong> Los factores de flujo de 5–10 y los consumos de bombeo del 2–5 % son valores típicos de [14] y [20]; el óptimo depende del diseño de la pila y del estado de carga.</li>
    <li><strong>Modelos.</strong> Los módulos de cálculo de todas las herramientas están en <code>js/sim/</code> del repositorio y cuentan con pruebas automáticas (<code>npm test</code>), que incluyen el balance de energía, el balance de carga de las reacciones y casos de LCOS comprobados a mano.</li>
    <li><strong>Cifras de proyectos.</strong> Dalian fase 1 (100 MW / 400 MWh, 2022) según los anuncios de DICP/Rongke Power [7]; cifras de Hokkaido según Sumitomo Electric [8].</li>
  </ul>
</section>
'''

PAGES = [
 dict(slug='chemistry', title='Química', accent='#a36bff', kicker='Pilar 01 · Química', lede='Por qué un metal en cuatro estados de oxidación da una batería cuyo material activo no se consume: las semirreacciones, la ecuación de Nernst y un explorador interactivo de voltaje de circuito abierto.', toc=[('why-vanadium', 'Cuatro estados de oxidación'), ('half-reactions', 'Semirreacciones'), ('nernst', 'Ecuación de Nernst y explorador'), ('electrolyte', 'El electrolito'), ('side-reactions', 'Reacciones secundarias')], body=CHEM, scripts=['chemistry']),
 dict(slug='anatomy', title='Anatomía de la batería', accent='#26d9e3', kicker='Pilar 02 · Anatomía', lede='Cada capa de la pila y cada caja de la bancada: de qué está hecha, qué hace y cómo falla.', toc=[('overview', 'De la celda a la central'), ('components', 'La pila, capa por capa'), ('balance-of-plant', 'Balance de planta'), ('failure-modes', 'Fallos y mantenimiento')], body=ANAT),
 dict(slug='engineering', title='Ingeniería', accent='#5ee37a', kicker='Pilar 03 · Ingeniería', lede='Dimensionar pilas, tanques y bombas; adónde va la eficiencia; límites térmicos; y una calculadora que diseña un sistema desde los primeros principios.', toc=[('power-vs-energy', 'Potencia frente a energía'), ('sizing-tool', 'Calculadora de dimensionado'), ('efficiency', 'Eficiencia'), ('thermal', 'Térmica y caudal'), ('scaling', 'Escalar')], body=ENG, scripts=['engineering']),
 dict(slug='economics', title='Economía', accent='#ff9b2f', kicker='Pilar 04 · Economía', lede='Qué cuesta una batería de flujo de vanadio, por qué importa el precio del vanadio y una calculadora de coste nivelado de almacenamiento para compararla con el ion-litio.', toc=[('cost-structure', 'Estructura de costes'), ('lcos-tool', 'Calculadora de LCOS'), ('vanadium-market', 'La cuestión del vanadio'), ('comparison', 'Comparación de tecnologías')], body=ECON, scripts=['economics']),
 dict(slug='applications', title='Aplicaciones reales', accent='#ffd23f', kicker='Pilar 05 · Aplicaciones', lede='Desplazamiento solar, servicios de red y los proyectos emblemáticos de Dalian a Hokkaido, con un simulador de despacho de 24 horas.', toc=[('why-flow', 'Para qué sirven'), ('dispatch-tool', 'Simulador de despacho'), ('case-studies', 'Instalaciones emblemáticas'), ('integration', 'Integración en red'), ('outlook', 'Perspectivas')], body=APPS, scripts=['applications']),
 dict(slug='references', title='Fuentes y citas', accent='#26d9e3', kicker='Datos verificados', lede='Cada número de este sitio remite a una de las fuentes siguientes y está etiquetado como medido, modelado, ilustrativo o declarado.', toggle=False, toc=[('how-to-read', 'Cómo se documenta el sitio'), ('references', 'Referencias'), ('data-notes', 'Notas sobre cifras concretas')], body=REFS_BODY),
]
