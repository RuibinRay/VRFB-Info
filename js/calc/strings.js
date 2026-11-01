/** Chart and series labels for the calculators, keyed by the page language. */
const L = (document.documentElement.lang || 'en').slice(0, 2);
const S = {
  en: {
    chem: { yours: 'Your settings', ref: 'Reference: 25 °C, 5 M H⁺, no offset', x: 'State of charge (%)', y: 'Open-circuit voltage (V)' },
    eng: { cell: 'Cell energy efficiency (CE × VE)', sys: 'System AC-AC (pumps + inverter)', ve: 'Voltage efficiency', x: 'Current density (mA/cm²)', y: 'Efficiency (%)' },
    econ: { vrfb: 'VRFB LCOS vs V₂O₅ price', li: 'Li-ion comparator (your inputs)', x: 'V₂O₅ price ($/kg)', y: 'LCOS ($/MWh)', parts: ['Stacks & power electronics', 'Vanadium electrolyte', 'Tanks, pumps, BOS', 'EPC & installation'] },
    apps: { solar: 'Solar output', load: 'Load', battery: 'Battery (+ discharge / − charge)', soc: 'Tank state of charge', x: 'Hour of day', y: 'Power (MW)', ySoc: 'SOC (%)' },
  },
  es: {
    chem: { yours: 'Tus ajustes', ref: 'Referencia: 25 °C, 5 M H⁺, sin desplazamiento', x: 'Estado de carga (%)', y: 'Voltaje de circuito abierto (V)' },
    eng: { cell: 'Eficiencia energética de la celda (CE × VE)', sys: 'Sistema CA-CA (bombas + inversor)', ve: 'Eficiencia de voltaje', x: 'Densidad de corriente (mA/cm²)', y: 'Eficiencia (%)' },
    econ: { vrfb: 'LCOS de la VRFB frente al precio del V₂O₅', li: 'Comparador de ion-litio (tus entradas)', x: 'Precio del V₂O₅ ($/kg)', y: 'LCOS ($/MWh)', parts: ['Pilas y electrónica de potencia', 'Electrolito de vanadio', 'Tanques, bombas, BOS', 'EPC e instalación'] },
    apps: { solar: 'Producción solar', load: 'Carga', battery: 'Batería (+ descarga / − carga)', soc: 'Estado de carga de los tanques', x: 'Hora del día', y: 'Potencia (MW)', ySoc: 'SOC (%)' },
  },
  zh: {
    chem: { yours: '你的设置', ref: '参考：25 °C，5 M H⁺，无修正', x: '荷电状态 (%)', y: '开路电压 (V)' },
    eng: { cell: '单电池能量效率（CE × VE）', sys: '系统交流-交流（泵 + 逆变器）', ve: '电压效率', x: '电流密度 (mA/cm²)', y: '效率 (%)' },
    econ: { vrfb: 'VRFB 的 LCOS 随 V₂O₅ 价格变化', li: '锂离子对比方案（你的输入）', x: 'V₂O₅ 价格 ($/kg)', y: 'LCOS ($/MWh)', parts: ['电堆与电力电子', '钒电解液', '储液罐、泵、辅助系统', 'EPC 与安装'] },
    apps: { solar: '光伏出力', load: '负荷', battery: '电池（+ 放电 / − 充电）', soc: '储液罐荷电状态', x: '时刻', y: '功率 (MW)', ySoc: 'SOC (%)' },
  },
};
export const CS = S[L] || S.en;
