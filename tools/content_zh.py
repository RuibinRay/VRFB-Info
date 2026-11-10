"""Simplified Chinese content for the pillar pages (mirrors content_en.py)."""
from helpers import cite, field, stat

# 从 pillars/zh/ 指向根目录各实验室的链接
LAB, SIZING, COMPARE, PROJECT = '../../lab.html?lang=zh', '../../sizing.html?lang=zh', '../../compare.html?lang=zh', '../../project.html?lang=zh'

LANG = 'zh'
HTML_LANG = 'zh-CN'
UI = {
    'nav': {'home': '沉浸之旅', 'chemistry': '化学原理', 'anatomy': '电池结构', 'engineering': '工程设计', 'economics': '经济分析', 'applications': '实际应用', 'references': '参考文献'},
    'on_this_page': '本页内容', 'reading_level': '学习层级', 'beginner': '入门', 'intermediate': '进阶', 'advanced': '高级',
    'level_note': '“进阶”会加入工程数据，“高级”会加入方程和建模说明。大多数小节以一节课收尾：按你的层级给出的讲解、动态示意图、例题、实验和小测验。',
    'pillar': '支柱', 'other_pillars': '其他支柱', 'language': '语言',
    'footer_tag': 'VRFB — 液流储能的科学 · 教育用途，非商业。', 'footer_sources': '参考文献与引用', 'footer_back': '返回沉浸之旅',
    'site_title': 'VRFB：液流储能的科学', 'brand_sub': '液流储能的科学',
}
PILLARS = [('chemistry', '01', '化学原理', '#a36bff'), ('anatomy', '02', '电池结构', '#26d9e3'), ('engineering', '03', '工程设计', '#5ee37a'), ('economics', '04', '经济分析', '#ff9b2f'), ('applications', '05', '实际应用', '#ffd23f')]

CHEM = f'''
<section id="why-vanadium">
  <h2>一种元素，四种氧化态</h2>
  <p>大多数电池的两极使用两种不同的材料。全钒液流电池的两极使用同一种元素，只是处于两对不同的氧化态。负极储液罐中是 V²⁺ 和 V³⁺；正极储液罐中是 VO²⁺（+4 价钒）和 VO₂⁺（+5 价钒），它们都溶解在硫酸中。{cite(1, 2)}</p>
  <p>正是这一点让 VRFB 得以实用。其他液流电池体系一旦有少量电解液透过隔膜渗入另一侧，就会永久“毒化”对方。而在 VRFB 中，渗透过去的离子仍然是钒，只需定期<em>再平衡</em>，即可让两个储液罐回到相同的荷电状态。电解液本身永远不会耗损。{cite(2, 16)}</p>
  <div class="table-wrap"><table><thead><tr><th>物种</th><th>钒的氧化态</th><th>颜色</th><th>位置</th></tr></thead><tbody>
  <tr><td>V²⁺</td><td class="num">+2</td><td><span class="panel__swatch" style="background:#8b4dff"></span>紫色</td><td>负极储液罐，充电态</td></tr>
  <tr><td>V³⁺</td><td class="num">+3</td><td><span class="panel__swatch" style="background:#3fcf5a"></span>绿色</td><td>负极储液罐，放电态</td></tr>
  <tr><td>VO²⁺（钒氧离子）</td><td class="num">+4</td><td><span class="panel__swatch" style="background:#2f7bff"></span>蓝色</td><td>正极储液罐，放电态</td></tr>
  <tr><td>VO₂⁺（二氧钒离子）</td><td class="num">+5</td><td><span class="panel__swatch" style="background:#ffcf33"></span>黄色</td><td>正极储液罐，充电态</td></tr>
  </tbody></table></div>
  <p class="beginner-only">首页的沉浸之旅中，储液罐正是这样变色的：随着电池充电，左侧由绿变紫，右侧由蓝变黄。</p>
</section>
<section id="half-reactions">
  <h2>半反应</h2>
  <p>放电时，负极释放电子，正极接收电子。按放电方向写出：{cite(1, 9)}</p>
  <div class="equation">负极：&nbsp; V²⁺ → V³⁺ + e⁻ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E° = −0.255 V（相对 SHE）<br>
正极：&nbsp;&nbsp; VO₂⁺ + 2H⁺ + e⁻ → VO²⁺ + H₂O &nbsp;&nbsp;&nbsp;E° = +1.004 V（相对 SHE）<br>
总反应：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; V²⁺ + VO₂⁺ + 2H⁺ → V³⁺ + VO²⁺ + H₂O &nbsp;&nbsp;E°<sub>电池</sub> = 1.259 V
<small>钒电对的标准还原电位；充电时所有箭头反向。</small></div>
  <p>请注意质子。每传递一个电子，正极就消耗两个 H⁺，因此质子必须从负极一侧穿过隔膜，才能保持两侧电解液的电中性。这就是隔膜的全部职责：让 H⁺（以及部分水）通过，而把钒离子挡在外面。{cite(4)}</p>
  <div class="callout adv"><div class="eyebrow">进阶 · 电子为何会移动</div><p>驱动力来自两个电对的电极电位之差。每个电位由其还原反应的吉布斯自由能决定，ΔG = −nFE。两个钒电对的 n 均为 1，因此电池每摩尔电子可输出 1.259 V × 96 485 C/mol ≈ 121 kJ，约合每摩尔转移的钒 34 Wh。从动力学上看，V²⁺/V³⁺ 电对是简单的外球电子转移；VO²⁺/VO₂⁺ 电对需要氧原子转移，动力学更慢，因此电极活化研究大多针对正极。{cite(10)}</p></div>
</section>
<section id="nernst">
  <h2>电压取决于荷电状态：能斯特方程</h2>
  <p>充满电的 VRFB 电压高于接近放空的 VRFB。二者的关系由能斯特方程描述，它在标准电位上叠加一个与浓度相关的项。对整个电池，把荷电状态记为 SOC（每一侧处于充电态的钒所占的分数）：{cite(9, 15)}</p>
  <div class="equation">E = E° + (RT/F) · ln [ (c<sub>V²⁺</sub> · c<sub>VO₂⁺</sub> · c<sub>H⁺</sub>²) / (c<sub>V³⁺</sub> · c<sub>VO²⁺</sub>) ]<br>
&nbsp;&nbsp;= E° + (RT/F) · [ 2 ln( SOC / (1 − SOC) ) + 2 ln c<sub>H⁺</sub> ]
<small>R = 8.314 J mol⁻¹ K⁻¹，F = 96 485 C mol⁻¹，T 以开尔文计。25 °C 时 RT/F = 25.7 mV。</small></div>
  <p>实测的开路电压在 50 % SOC 时总是比该方程的预测高出约 50–60 mV（≈ 1.40 V 而非 ≈ 1.34 V）。Knehr 和 Kumbur 证明，这一差异来自质子活度和隔膜处的唐南电位，而简化形式忽略了这两者。{cite(15)} 下方的探索器可以加入这一经验修正。</p>
  <div class="tool" id="tool-nernst">
    <div class="tool__head"><h3>开路电压探索器</h3><span class="muted mono">能斯特模型 · 可交互</span></div>
    <div class="tool__grid">
      {field('soc', '荷电状态', 50, ' %', 1, 99, 1, 'range')}
      {field('T', '温度', 25, ' °C', 5, 50, 1, 'range')}
      {field('cH', '质子浓度 c<sub>H⁺</sub>', 5, ' M', 1, 8, 0.1, 'range')}
      {field('N', '串联单电池数', 40, '', 1, 120, 1, 'range')}
      <label class="field"><span>唐南 / 活度修正</span><span><input type="checkbox" data-k="donnan" checked> 加上 +60 mV（经验值）</span></label>
    </div>
    <div class="stats">{stat('ocv', '单电池开路电压', True)}{stat('stack', '电堆开路电压')}{stat('ratio', '充电态 : 放电态钒')}{stat('nernst', '该温度下的 RT/F')}</div>
    <div class="stats"><div class="stat"><b style="display:block;height:26px;border-radius:6px" data-out="negtank"></b><span>负极储液罐颜色（V³⁺ → V²⁺）</span></div><div class="stat"><b style="display:block;height:26px;border-radius:6px" data-out="postank"></b><span>正极储液罐颜色（VO²⁺ → VO₂⁺）</span></div></div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="开路电压随荷电状态的变化"></div>
    <p class="note">曲线在 0 % 和 100 % SOC 附近非常陡：这就是电池管理系统把运行窗口限制在大约 10–90 % 的原因，也说明开路电压在中间区段是不错的 SOC 传感器，而在两端则很不可靠。</p>
  </div>
</section>
<section id="electrolyte">
  <h2>电解液</h2>
  <p>商用电解液通常含 1.5–2 mol/L 的钒，溶于 2–5 mol/L 的硫酸中。钒浓度决定每升能储多少能量；硫酸提供质子、维持钒的溶解并使溶液导电。{cite(2)}</p>
  <p>能量密度并不高：1.6 M 时每升总电解液约 25 Wh，大约是锂离子电池的十分之一。对固定式储能来说可以接受，储液罐做大即可，但这也排除了车用场景。{cite(2, 5)}</p>
  <div class="callout adv"><div class="eyebrow">进阶 · 溶解度与温度</div><p>钒浓度受溶解度限制。V²⁺ 和 V³⁺ 的硫酸盐在低温下析出（约 2 M 溶液在 ≈ 10 °C 以下），而电池处于高荷电态时，VO₂⁺ 在 ≈ 40 °C 以上会生成固体 V₂O₅。因此实际系统运行在 10–40 °C 之间，并避免在高温天气下让正极电解液长期处于很高的 SOC。{cite(2, 11)} PNNL 开发的混合酸电解液（硫酸 + 盐酸）把可用浓度提高到约 2.5 M，并把温度窗口拓宽至 −5 到 50 °C，能量密度提升 70 %。{cite(3)} Roe 等人借助磷酸盐稳定剂把硫酸体系电解液推到了 3 M。{cite(18)}</p></div>
  <div class="table-wrap"><table><thead><tr><th>参数</th><th class="num">典型值</th><th>来源</th></tr></thead><tbody>
  <tr><td>钒浓度</td><td class="num">1.5–2.0 M（混合酸 2.5 M）</td><td>{cite(2, 3)}</td></tr>
  <tr><td>支持酸</td><td class="num">2–5 M H₂SO₄</td><td>{cite(2)}</td></tr>
  <tr><td>能量密度（总电解液）</td><td class="num">20–35 Wh/L</td><td>{cite(2, 5)}</td></tr>
  <tr><td>运行温度</td><td class="num">10–40 °C</td><td>{cite(2, 11)}</td></tr>
  <tr><td>标准电池电位</td><td class="num">1.259 V</td><td>{cite(1, 9)}</td></tr>
  <tr><td>50 % SOC 时的开路电压</td><td class="num">≈ 1.40 V</td><td>{cite(15)}</td></tr>
  </tbody></table></div>
</section>
<section id="side-reactions">
  <h2>化学上可能出什么问题</h2>
  <ul>
    <li><strong>析氢。</strong> 接近充满时，负极的一部分电流会把水分解成 H₂，而不是还原 V³⁺。这会浪费电量，并使两罐电解液缓慢失衡。{cite(2, 16)}</li>
    <li><strong>空气氧化。</strong> V²⁺ 会与氧气反应，因此负极储液罐需要氮气保护或密封。{cite(2)}</li>
    <li><strong>渗透（crossover）。</strong> 钒离子会扩散穿过隔膜，造成自放电，并把体积从一罐带到另一罐。与其他体系不同，这可以通过重新混合或电化学再平衡来逆转。{cite(4, 16)}</li>
    <li><strong>碳腐蚀。</strong> 高 SOC 下的 VO₂⁺ 会氧化正极碳毡和双极板，因此电堆很少充电到 95 % 以上。{cite(10)}</li>
  </ul>
</section>
'''

ANAT_ITEMS = [
 ('endplate', '端板', 'endplate-negative.webp', '10–30 mm 厚的不锈钢或铝板，承受夹紧力并安装软管接头。青色 O 形圈标记负极回路；另一端板上的橙色 O 形圈标记正极回路。', [('材料', '不锈钢 · 铝 · 玻纤增强塑料'), ('夹紧压力', '碳毡上 0.5–1.5 MPa'), ('绝缘', '与铜集流体之间垫聚合物薄片')], (4, 14)),
 ('collector', '集流体', 'current-collector.png', '带有接线极耳的铜板，把整个电极面积上的电流汇集起来。它位于第一块双极板之后、保持干燥，因为铜在酸性电解液中会迅速腐蚀。', [('材料', '铜板，1–3 mm，有时镀层'), ('电阻率', '1.7 × 10⁻⁸ Ω·m'), ('数量', '每个电堆两片（正负极端子）')], (4,)),
 ('gasket', '流道框架与密封垫', 'gasket-frame.png', '聚合物框架把碳毡固定在窗口内，并把电解液从角部的公共流道孔引入电极。两面的弹性体密封垫封住单电池边缘。狭长的进液通道是有意增加电阻，以限制流经公共流道的旁路电流。', [('框架', 'PVC · PP · PVDF'), ('密封垫', 'EPDM · Viton® · PTFE'), ('厚度', '决定碳毡压缩率，通常 20–30 %')], (4, 14)),
 ('bipolar', '双极板', 'bipolar-plate.webp', '石墨-聚合物复合板，相邻两个单电池共用：一面是前一个单电池的正极，另一面是后一个单电池的负极。电子直接穿过它，因此单电池无需导线即可串联。板面加工出的蛇形流道把电解液均匀铺展到碳毡上，与直通式设计相比可减少 30–50 % 的泵送损耗。', [('材料', '石墨填充 PP / PE / PVDF，2–6 mm'), ('电阻率', '10⁻³–10⁻² Ω·cm'), ('流场', '蛇形 · 叉指形 · 直通式')], (4, 10, 14)),
 ('felt_neg', '负极（碳毡）', 'carbon-felt.webp', '由直径 8–12 µm 碳纤维组成的多孔毡，孔隙率 90–95 %，V²⁺/V³⁺ 在纤维表面与电子交换。碳毡通过空气中加热或酸处理活化，引入含氧官能团以加快反应。', [('材料', 'PAN 基或粘胶基碳毡'), ('厚度', '3–6 mm，压缩 20–30 %'), ('纤维直径', '≈ 10 µm'), ('副反应', '接近充满时析氢')], (2, 10)),
 ('membrane', '离子交换膜', 'membrane.png', '25–200 µm 厚的聚合物薄膜，导通质子、阻挡钒离子。全氟磺酸膜（Nafion®）是基准；更便宜的烃类膜和阴离子交换膜则以部分选择性或电导率换取成本。它通常是电堆中最昂贵的单一部件。', [('材料', 'PFSA（Nafion® 115/212）· 烃类膜 · 阴离子交换膜'), ('面电阻', '0.5–2 Ω·cm²'), ('渗透', '导致自放电；通过再平衡修正')], (2, 4, 14)),
 ('felt_pos', '正极（碳毡）', 'carbon-felt-2.webp', '负极碳毡的镜像，承载 VO²⁺/VO₂⁺。此处动力学较慢，因此催化剂（铋、金属氧化物）和表面官能化是活跃的研究方向。高 SOC 时强氧化性的 VO₂⁺ 会腐蚀碳材料本身。', [('材料', '碳毡或石墨毡，表面含氧官能化'), ('限制', '保持在 ≈ 95 % SOC 以下')], (2, 10)),
 ('tierod', '拉杆与夹紧支架', 'stack-assembled.webp', '穿过角孔的螺纹拉杆把两块端板拉紧；外部支架使端板保持平整。像拧车轮螺栓一样按星形顺序拧紧，以保证密封均匀。', [('材料', '不锈钢，带绝缘套管'), ('数量', '每个电堆 4–12 根')], (4,)),
]

ANAT = f'''
<section id="overview">
  <h2>从单个单电池到储能电站</h2>
  <p>一套 VRFB 由三部分拼装而成：把化学能转换为电流的<strong>电堆</strong>、储存化学能的<strong>储液罐</strong>，以及在两者之间输送液体和电子的<strong>辅助系统</strong>（泵、管路、电力电子和控制）。电堆决定以千瓦计的功率；储液罐决定以千瓦时计的能量；二者可以独立设计。{cite(2, 4)}</p>
  <figure class="figure"><img src="../../assets/img/stack-exploded.webp" alt="夹在两块端板之间的单个 VRFB 单电池的爆炸视图" loading="lazy"><figcaption>一个单电池的爆炸图：端板、铜集流体、流道框架、双极板、碳毡、隔膜、碳毡、双极板、流道框架、集流体、端板。首页沉浸之旅中建模的正是这些层。</figcaption></figure>
  <p>在电堆内部，每个单电池都是一个三明治结构：隔膜夹在两片碳毡电极之间，每片碳毡背后是一块双极板。单电池在电路上串联、在液路上并联，由贯穿整个电堆的公共流道供液。{cite(4)}</p>
</section>
<section id="components">
  <h2>电堆，逐层拆解</h2>
  <p>在首页点击任一部件即可查看相同的规格。数值为所引综述中的典型值；具体产品会有差异。</p>
''' + ''.join(f'''
  <article id="{cid}" class="component">
    <h3>{name}</h3>
    <div class="figure" style="display:grid;grid-template-columns:140px 1fr;gap:0;align-items:start"><img src="../../assets/img/{img}" alt="{name}" loading="lazy" style="width:140px;aspect-ratio:1;object-fit:cover"><div style="padding:14px 18px"><p style="margin-bottom:8px">{desc}</p><dl style="display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0;font-size:0.88rem">{''.join(f'<dt class="muted">{k}</dt><dd style="margin:0">{v}</dd>' for k, v in specs)}</dl><p class="muted" style="margin:8px 0 0;font-size:0.8rem">来源 {cite(*refs)}</p></div></div>
  </article>''' for cid, name, img, desc, specs, refs in ANAT_ITEMS) + f'''
</section>
<section id="balance-of-plant">
  <h2>辅助系统</h2>
  <figure class="figure"><img src="../../assets/img/system-cabinet.webp" alt="撬装 VRFB 系统，包含储液罐、泵、电堆和功率变换柜" loading="lazy"><figcaption>完整系统：左右两侧是电解液储液罐，下方是泵，中央是电堆，后方是逆变器柜和控制面板。</figcaption></figure>
  <div class="table-wrap"><table><thead><tr><th>部件</th><th>作用</th><th>典型规格</th></tr></thead><tbody>
  <tr><td>电解液储液罐</td><td>储存能量；容积决定放电时长</td><td>HDPE/PP 或内衬钢罐；负极罐充氮保护；总计 ≈ 40 L/kWh{cite(2, 5)}</td></tr>
  <tr><td>泵（每回路一台）</td><td>以 5–10 倍化学计量流量循环电解液</td><td>磁力驱动离心泵，过流部件 PP/PVDF；寄生损耗占吞吐电量的 2–5 %{cite(14)}</td></tr>
  <tr><td>管路与阀门</td><td>连接储液罐、泵与电堆公共流道</td><td>PVC/PP/PVDF；回路按颜色区分以防接错</td></tr>
  <tr><td>功率变换系统</td><td>直流 ⇄ 交流变换，与电网同步</td><td>双向逆变器，单向效率 96–98 %{cite(5)}</td></tr>
  <tr><td>电池管理系统</td><td>SOC 估算、泵调度、保护、再平衡</td><td>开路电压参比电池、温度和液位传感器{cite(14, 16)}</td></tr>
  <tr><td>换热器</td><td>把电解液保持在 10–40 °C 窗口内</td><td>炎热气候下必需；常为液-气式{cite(11)}</td></tr>
  </tbody></table></div>
  <div class="callout adv"><div class="eyebrow">进阶 · 旁路电流</div><p>由于所有单电池通过公共流道共用同一种导电电解液，每个单电池周围都存在一条并联电路。由此产生的旁路电流会浪费电量，并腐蚀电堆两端附近的极板。设计者会加长每个流道框架的进液通道、限制每条公共流道的单电池数，有时还把长电堆分成液路独立的模块，把这项损耗控制在几个百分点以内。{cite(4, 14)}</p></div>
</section>
<section id="failure-modes">
  <h2>电堆如何失效，如何维护</h2>
  <ul>
    <li><strong>泄漏</strong>：密封垫蠕变或夹紧不均所致，是最常见的现场故障；重新拧紧或更换密封垫即可修复。{cite(14)}</li>
    <li><strong>隔膜污染或降解</strong>：多年运行后电阻升高；通常在 10–15 年的电堆翻新时更换隔膜。{cite(5, 14)}</li>
    <li><strong>容量衰减</strong>：由渗透和副反应造成，通过再平衡电解液修正，而不是更换电解液。{cite(16)}</li>
    <li><strong>泵与密封件磨损</strong>：辅助系统的常规工业维护。</li>
  </ul>
  <p>由于电解液在寿命终止时可以回收，VRFB 电站保留着锂离子系统所没有的残值。这对经济性很重要，将在下一支柱中讨论。</p>
</section>
'''

ENG = f'''
<section id="power-vs-energy">
  <h2>功率与能量解耦</h2>
  <p>在传统电池中，功率和能量一起增长：电芯越多，两者都越大。在液流电池中，它们是分开采购的。<strong>功率</strong>（kW）由电堆的总电极面积决定，因为在给定电流密度下，电流随面积增长。<strong>能量</strong>（kWh）则由储液罐中溶解了多少钒决定。{cite(2, 4)}</p>
  <div class="equation">P ≈ N<sub>单电池</sub> · A · j · V<sub>单电池</sub>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;E ≈ 2 · V<sub>储液罐</sub> · c<sub>V</sub> · F · ΔSOC · V<sub>标称</sub> / 2
<small>A：每个单电池的活性面积 · j：电流密度 · c<sub>V</sub>：钒浓度 · ΔSOC：可用窗口 · 系数 ½ 的来源是每个电子在<em>两侧</em>各需要一个钒离子。</small></div>
  <p>实际意义在于：4 小时系统和 10 小时系统可以使用完全相同的电堆，只是储液罐大小不同。时长越长，每 kWh 越便宜，这正是 VRFB 的商业定位。{cite(5)}</p>
</section>
<section id="sizing-tool">
  <h2>设计一套系统</h2>
  <div class="tool" id="tool-sizing">
    <div class="tool__head"><h3>电堆、储液罐与泵的选型计算器</h3><span class="muted mono">一阶模型 · 假设可编辑</span></div>
    <div class="tool__grid">
      {field('P', '额定功率', 250, 'kW', 1, 100000, 1)}
      {field('E', '能量容量', 1000, 'kWh', 1, 1000000, 1)}
      {field('Vcell', '负载下单电池电压', 1.30, 'V', 1.0, 1.6, 0.01)}
      {field('j', '电流密度', 80, 'mA/cm²', 10, 300, 5)}
      {field('A', '每个单电池的活性面积', 2500, 'cm²', 100, 20000, 50)}
      {field('N', '每个电堆的单电池数', 40, '', 1, 200, 1)}
      {field('c', '钒浓度', 1.6, 'mol/L', 0.5, 3, 0.1)}
      {field('dod', '可用 SOC 窗口', 0.8, '分数', 0.3, 1, 0.05)}
      {field('lambda', '流量系数 λ（× 化学计量）', 8, '', 1, 20, 0.5)}
      {field('dp', '电堆压降', 0.6, 'bar', 0.1, 3, 0.1)}
      {field('eta', '泵效率', 0.55, '分数', 0.2, 0.9, 0.05)}
      {field('asr', '面积比电阻', 1.2, 'Ω·cm²', 0.3, 4, 0.1)}
      {field('ce', '库仑效率', 96, '%', 80, 100, 0.5)}
      {field('inv', '逆变器效率（单向）', 97, '%', 90, 99.5, 0.5)}
    </div>
    <h4 class="eyebrow">电堆</h4>
    <div class="stats">{stat('stackI', '电堆电流')}{stat('stackV', '负载下电堆电压')}{stat('stackP', '单个电堆功率')}{stat('nStacks', '所需电堆数', True)}</div>
    <h4 class="eyebrow">电解液与储液罐</h4>
    <div class="stats">{stat('litres', '电解液总量（两罐）', True)}{stat('whL', '能量密度（总电解液）')}{stat('tank', '每罐尺寸（圆柱，H = 1.5 D）')}</div>
    <h4 class="eyebrow">泵送</h4>
    <div class="stats">{stat('flow', '每个电堆每回路流量')}{stat('pump', '总泵功率')}{stat('pumpFrac', '泵功率占额定功率比例', True)}</div>
    <h4 class="eyebrow">所选电流密度下的效率</h4>
    <div class="stats">{stat('ve', '电压效率')}{stat('cell', '单电池能量效率')}{stat('sys', '系统交流-交流效率', True)}</div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="效率随电流密度的变化"></div>
    <details><summary>模型说明与公式</summary><p>电堆电流 I = j·A。每侧电解液 = E / (c · 26.8 Ah/mol · ΔSOC · V<sub>单电池</sub>)。每个电堆的化学计量流量 = N·I / (F·c)，泵输送 λ 倍该流量。泵功率 = Q·Δp / η，每个电堆两条回路。电压效率采用围绕 1.40 V 开路电压的集总面积比电阻：VE = (OCV − j·ASR)/(OCV + j·ASR)。系统效率 = 单电池效率 × (1 − 泵功率比例) × 逆变器效率²。忽略了旁路电流、热管理以及 ASR 随 SOC 的变化；在 60–100 mA/cm² 下，该模型与文献报道的 65–80 % 交流-交流效率一致。{cite(5, 14)}</p></details>
  </div>
</section>
<section id="efficiency">
  <h2>能量去哪儿了</h2>
  <p>三个效率相乘得到电池的往返效率。{cite(4, 14)}</p>
  <ul>
    <li><strong>库仑效率</strong>（95–98 %）：因渗透、旁路电流和析氢损失的电量。</li>
    <li><strong>电压效率</strong>（80–92 %）：由电阻和反应动力学造成的充放电电压差。电流密度越高它越低，所以“压榨”电堆是在用效率换取更小更便宜的电堆。</li>
    <li><strong>系统损耗</strong>：泵（2–5 %）和逆变器（每向 2–4 %）。</li>
  </ul>
  <p>综合起来，单电池直流效率可达 80–90 %，完整系统交流-交流效率 65–80 %，低于锂离子电池的 85–90 %，但在数万次循环中保持稳定。{cite(5)}</p>
  <div class="callout adv"><div class="eyebrow">进阶 · 极化</div><p>负载下的单电池电压为 V = OCV ± (η<sub>act</sub> + η<sub>ohm</sub> + η<sub>conc</sub>)。活化过电位遵循 Butler–Volmer 动力学，由正极主导；欧姆损耗包括隔膜、电解液和接触电阻（商用单电池中合计 ≈ 1–2 Ω·cm²）；当流量系数太低、来不及在纤维表面补充钒时，就会出现浓差过电位，在 SOC 窗口两端尤为明显。带流场的双极板以及更薄、压缩更紧的碳毡能同时降低这三项。{cite(10, 14)}</p></div>
</section>
<section id="thermal">
  <h2>热管理与流量管理</h2>
  <p>电阻发热和泵功都会加热电解液。由于 VO₂⁺ 在约 40 °C 以上析出、V²⁺/V³⁺ 硫酸盐在约 10 °C 以下析出，大型系统会增设换热器，并在炎热天气的待机时段保持泵运转，以免电堆“闷热”。{cite(2, 11)}</p>
  <p>按荷电状态调度的变速泵是一项低成本的效率提升：只有在 SOC 窗口两端、电极处钒浓度不足时才需要大流量。{cite(14)}</p>
</section>
<section id="scaling">
  <h2>规模化</h2>
  <p>商用电堆从几千瓦到每台约 30–40 kW，单电池面积 0.1–0.4 m²，每个电堆 20–100 个单电池。兆瓦级系统把许多电堆串并联，形成数百伏的直流母线，并共用容积达数百立方米的储液罐。{cite(14, 16)} 大连电站正是以这种方式实现 100 MW / 400 MWh：集装箱式电堆由罐区统一供液。{cite(7)}</p>
</section>
'''

ECON = f'''
<section id="cost-structure">
  <h2>VRFB 的成本构成及原因</h2>
  <p>锂离子系统的成本主要是电芯。VRFB 则大致是三分之一电堆、三分之一电解液、三分之一其他，并且这一比例随时长变化：2 小时系统以电堆为主；10 小时系统以电解液为主。{cite(5, 14)}</p>
  <ul>
    <li><strong>电堆与电力电子</strong>随千瓦数增长。隔膜和双极板是电堆中最贵的部件。{cite(14)}</li>
    <li><strong>电解液</strong>随千瓦时数增长，并跟随五氧化二钒（V₂O₅）价格波动，后者在十年内曾从每磅约 5 美元升至 25 美元以上。{cite(17)}</li>
    <li><strong>储液罐、泵、管路、控制、安装</strong>同时随两者增长。</li>
  </ul>
  <p>美国能源部 2022 年评估把 10 小时时长的电网级全钒液流系统的安装成本定在每 kWh 几百美元的低位区间，其中电解液是最大的单项；确切数字取决于年份、规模和钒价，因此请把计算器的输入当作可编辑的假设而非报价。{cite(5)}</p>
</section>
<section id="lcos-tool">
  <h2>平准化储能成本计算器</h2>
  <p>平准化储能成本（LCOS）把全寿命周期内的全部成本分摊到电池一生将放出的每一兆瓦时上，并折现到今天。它是比较寿命不同的技术时最公平的单一指标。{cite(6, 13)}</p>
  <div class="equation">LCOS = [ CAPEX + Σ<sub>t</sub> (运维<sub>t</sub> + 充电成本<sub>t</sub> + 更换<sub>t</sub>) / (1+r)<sup>t</sup> − 残值 / (1+r)<sup>N</sup> ] / Σ<sub>t</sub> E<sub>放电,t</sub> / (1+r)<sup>t</sup></div>
  <div class="tool" id="tool-lcos">
    <div class="tool__head"><h3>VRFB 与锂离子电池的 LCOS 对比</h3><span class="muted mono">所有输入可编辑 · 默认值仅作示意</span></div>
    <h4 class="eyebrow">项目</h4>
    <div class="tool__grid">
      {field('P', '功率', 10, 'MW', 0.1, 1000, 0.1)}
      {field('h', '时长', 8, '小时', 1, 24, 0.5)}
      {field('cycles', '每年完整循环次数', 330, '', 1, 730, 1)}
      {field('life', 'VRFB 项目寿命', 25, '年', 5, 40, 1)}
      {field('disc', '折现率', 7, '%', 0, 20, 0.5)}
      {field('chg', '充电电价', 30, '$/MWh', 0, 200, 1)}
    </div>
    <h4 class="eyebrow">VRFB 成本</h4>
    <div class="tool__grid">
      {field('v2o5', 'V₂O₅ 价格', 18, '$/kg', 5, 60, 0.5)}
      {field('c', '钒浓度', 1.6, 'mol/L', 0.8, 3, 0.1)}
      {field('dod', '可用 SOC 窗口', 0.8, '分数', 0.4, 1, 0.05)}
      {field('acidProc', '酸、水与加工', 15, '$/kWh', 0, 100, 1)}
      {field('stackCost', '电堆 + 电力电子', 650, '$/kW', 100, 3000, 10)}
      {field('bosE', '储液罐与辅助系统（能量部分）', 60, '$/kWh', 0, 300, 5)}
      {field('bosP', '泵与辅助系统（功率部分）', 150, '$/kW', 0, 1000, 10)}
      {field('epc', 'EPC 与安装', 20, '% 设备成本', 0, 60, 1)}
      {field('om', '运行与维护', 15, '$/kW·年', 0, 100, 1)}
      {field('rte', '往返效率（交流）', 72, '%', 50, 90, 1)}
      {field('deg', '年容量衰减', 0.3, '%', 0, 5, 0.1)}
      {field('stackYear', '电堆翻新年份', 12, '', 1, 40, 1)}
      {field('stackRepl', '翻新成本', 50, '% 电堆成本', 0, 100, 5)}
      {field('resid', '电解液残值', 60, '% 电解液成本', 0, 100, 5)}
    </div>
    <h4 class="eyebrow">锂离子对比方案</h4>
    <div class="tool__grid">
      {field('liCapex', '安装成本', 320, '$/kWh', 50, 1500, 5)}
      {field('liRte', '往返效率（交流）', 87, '%', 60, 95, 1)}
      {field('liLife', '项目寿命', 15, '年', 3, 30, 1)}
      {field('liDeg', '年容量衰减', 2, '%', 0, 10, 0.1)}
      {field('liOm', '运行与维护', 10, '$/kW·年', 0, 100, 1)}
    </div>
    <div class="stats">{stat('lcos', 'VRFB 的 LCOS', True)}{stat('lcosLi', '锂离子的 LCOS')}{stat('capex', 'VRFB 总资本成本')}{stat('perKwh', 'VRFB 安装成本')}{stat('liPerKwh', '锂离子安装成本')}{stat('kg', '每 kWh 容量所需 V₂O₅')}{stat('elecShare', '电解液占资本成本比例')}</div>
    <div class="costbar" style="display:flex;height:22px;border-radius:8px;overflow:hidden;gap:2px;background:var(--bg-2)"></div>
    <div class="legend costbar-legend"></div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="平准化储能成本随五氧化二钒价格的变化"></div>
    <p class="note">每 kWh 的钒质量由浓度和 SOC 窗口在 1.35 V 标称单电池电压下推算；1.6 M、80 % 窗口时约为每 kWh 6 kg V₂O₅。残值反映了钒电解液在寿命终止时可回收或再租赁。{cite(14, 17)} 锂离子曲线采用 90 % 可用窗口且无残值。</p>
  </div>
</section>
<section id="vanadium-market">
  <h2>钒的问题</h2>
  <p>约 85 % 的钒用于炼钢作为强化添加剂，因此其价格跟随钢铁周期而非电池市场。2018 年 V₂O₅ 价格飙升至每磅 25 美元以上，使电解液成本几乎翻倍；2020 年代中期价格则维持在每磅个位数美元。{cite(17)}</p>
  <p>业界出现了两种应对。<strong>电解液租赁</strong>把钒移出项目的资产负债表：供应商保留所有权并在寿命终止时回收金属，把资本支出变成运营费用。{cite(14)} <strong>替代电解液</strong>（混合酸、更高浓度）则从每公斤钒中榨取更多能量。{cite(3, 18)}</p>
  <div class="callout adv"><div class="eyebrow">进阶 · 敏感性</div><p>由于电解液与能量成正比，LCOS 对钒价的敏感性随时长增加。把 V₂O₅ 从 10 $/kg 翻倍到 20 $/kg，计算器默认的 8 小时 LCOS 大约上升五分之一；4 小时时影响约为一半。电堆成本的敏感性则相反。这就是 VRFB 厂商瞄准 6–12 小时应用、而锂离子主导 1–4 小时应用的原因。{cite(5)}</p></div>
</section>
<section id="comparison">
  <h2>技术对比</h2>
  <div class="table-wrap"><table><thead><tr><th>指标</th><th>全钒液流</th><th>锂离子（LFP）</th><th>来源</th></tr></thead><tbody>
  <tr><td>往返效率（交流）</td><td class="num">65–80 %</td><td class="num">85–90 %</td><td>{cite(5)}</td></tr>
  <tr><td>循环寿命</td><td class="num">&gt; 15 000–20 000 次，电解液不耗损</td><td class="num">3 000–8 000 次</td><td>{cite(5, 16)}</td></tr>
  <tr><td>日历寿命</td><td class="num">20–25 年（约 12–15 年翻新电堆）</td><td class="num">10–15 年</td><td>{cite(5)}</td></tr>
  <tr><td>能量密度</td><td class="num">20–35 Wh/L</td><td class="num">250–400 Wh/L</td><td>{cite(2)}</td></tr>
  <tr><td>放电深度</td><td class="num">100 % 且无损伤</td><td class="num">通常 80–90 %</td><td>{cite(16)}</td></tr>
  <tr><td>火灾风险</td><td>水系，不可燃</td><td>可能热失控</td><td>{cite(16)}</td></tr>
  <tr><td>占地</td><td>大（储液罐）</td><td>紧凑</td><td>{cite(2)}</td></tr>
  <tr><td>寿命终止</td><td>电解液可回收</td><td>回收体系仍在发展</td><td>{cite(14)}</td></tr>
  </tbody></table></div>
</section>
'''

APPS = f'''
<section id="why-flow">
  <h2>液流电池的用途</h2>
  <p>VRFB 建设周期长、重量大、效率约 70–75 %，所以它不是手机电池，也不是汽车电池。它是一种<strong>固定式、长时</strong>电池：每天循环、持续数十年而不耗损，不会起火，而且被要求放电的时间越长，每千瓦时的成本就越低。这些特性对应三类任务。{cite(5, 16)}</p>
  <ul>
    <li><strong>光伏平移。</strong> 储存正午的发电盈余，在四到十二小时后的晚高峰释放。</li>
    <li><strong>电网服务。</strong> 调频、削峰、延缓输电扩容以及黑启动支持。</li>
    <li><strong>微电网与离网场所。</strong> 需要“可再生能源 + 夜间可靠供电”的海岛、矿山和园区。</li>
  </ul>
</section>
<section id="dispatch-tool">
  <h2>模拟“光伏 + 储能”的一天</h2>
  <div class="tool" id="tool-dispatch">
    <div class="tool__head"><h3>24 小时调度模拟器</h3><span class="muted mono">15 分钟步长 · 理想化曲线</span></div>
    <div class="tool__grid">
      {field('solar', '光伏电站峰值出力', 50, ' MW', 5, 500, 5, 'range')}
      {field('Pbat', '电池功率', 20, ' MW', 1, 300, 1, 'range')}
      {field('Ecap', '电池能量', 160, ' MWh', 5, 3000, 5, 'range')}
      {field('base', '基础负荷', 20, ' MW', 1, 300, 1, 'range')}
      {field('peak', '基础负荷之上的晚高峰', 25, ' MW', 0, 300, 1, 'range')}
      {field('rte', '往返效率', 72, ' %', 50, 95, 1, 'range')}
      {field('soc0', '午夜荷电状态', 20, ' %', 0, 100, 5, 'range')}
    </div>
    <div class="stats">{stat('solarE', '光伏发电量')}{stat('shifted', '由电池供给', True)}{stat('exported', '外送或弃光的盈余')}{stat('imported', '从电网购入')}{stat('self', '由光伏 + 电池满足的负荷', True)}{stat('hours', '电池时长')}</div>
    <div class="legend"></div>
    <div class="chart" role="img" aria-label="一天内的光伏出力、负荷和电池功率"></div>
    <div class="chart chart--soc" role="img" aria-label="一天内的电池荷电状态" style="aspect-ratio:16/5;min-height:140px;margin-top:10px"></div>
    <p class="note">光伏按 06:00 到 19:00 的晴天曲线出力；负荷由基础负荷、一个早间小高峰和约 19:30 的晚高峰组成。电池只用光伏盈余充电、只在缺口时放电，损耗在充放电之间平均分摊。试着在功率不变的情况下把能量翻倍：这正是 VRFB 最便宜的升级方式。</p>
  </div>
</section>
<section id="case-studies">
  <h2>标志性项目</h2>
  <div class="table-wrap"><table><thead><tr><th>项目</th><th class="num">功率 / 能量</th><th>年份</th><th>作用</th><th>来源</th></tr></thead><tbody>
  <tr><td>大连液流电池储能调峰电站，中国（融科储能 / 大连化物所）</td><td class="num">100 MW / 400 MWh（一期）</td><td>2022</td><td>大连电网的调峰与可再生能源消纳；全球最大的液流电池</td><td>{cite(7)}</td></tr>
  <tr><td>北海道电力网络公司南早来变电站，日本（住友电工）</td><td class="num">15 MW / 60 MWh，后增 17 MW / 51 MWh</td><td>2015、2022</td><td>平滑风电和光伏出力；频率与电压支撑</td><td>{cite(8)}</td></tr>
  <tr><td>牛津 Energy Superhub，英国（Invinity）</td><td class="num">2 MW / 5 MWh（与锂离子混合）</td><td>2022</td><td>在混合电池中与电动汽车充电一同提供电网服务</td><td>{cite(12)}</td></tr>
  <tr><td>圣地亚哥燃气电力公司，埃斯孔迪多，美国（住友电工）</td><td class="num">2 MW / 8 MWh</td><td>2017</td><td>配电级四小时示范</td><td>{cite(12)}</td></tr>
  </tbody></table></div>
  <p>大连项目最清楚地表明了这项技术的定位：围绕罐区建设的四小时（后期八小时）电网级资产，面向一个把安全和循环寿命看得比占地更重要的市场。{cite(7)}</p>
</section>
<section id="integration">
  <h2>VRFB 如何接入光伏电站与电网</h2>
  <p>在电气上，电池只是又一个基于逆变器的资源。电堆输出的直流经双向逆变器和升压变压器，接入与光伏电站相同的并网点。能量管理系统决定何时充电（负电价、弃光、正午盈余）和何时放电（晚高峰、辅助服务调用）。{cite(5, 13)}</p>
  <div class="callout adv"><div class="eyebrow">进阶 · 选型经验法则</div><p>对于晚间光伏平移，电池能量应覆盖晚间缺口：大约（负荷峰值 − 夜间光伏，即零）× 4–6 小时。电池功率只需匹配缺口的峰值，通常是光伏电站额定功率的三分之一到一半。这种不对称（功率适中、时长很长）恰恰是液流电池能够低成本实现的形态。上面的调度模拟器可以验证这一点。{cite(5)}</p></div>
</section>
<section id="outlook">
  <h2>展望</h2>
  <p>全钒液流电池在电网储能中仍占很小份额，但 8 小时以上时长的市场增长最快，而液流体系的防火安全性在人口密集地区日益受到重视。未来的成本下降更多来自制造规模、更便宜的隔膜和钒租赁，而非已经成熟的化学体系本身。{cite(5, 13, 14)}</p>
</section>
'''

from content_en import REFS
REFS_BODY = '''
<section id="how-to-read">
  <h2>本站的资料来源方式</h2>
  <p>本站每个方括号中的数字都链接到下方的一条文献。标准电极电位、浓度、温度极限和效率均来自同行评审的综述和原始论文；成本数据来自美国国家实验室和行业评估，并以区间或可编辑的假设形式给出，绝非报价。凡是经验法则或模型简化的数值，页面都会在数字旁注明。</p>
  <p>链接尽可能指向 DOI 或出版方页面。如果发现错误或更好的来源，请在<a href="https://github.com/RuibinRay/VRFB-Info/issues">代码仓库</a>提交 issue。参考文献保留原文语言。</p>
</section>
<section id="references">
  <h2>参考文献</h2>
  <ol style="padding-left:1.4em">''' + ''.join(f'<li id="ref-{i+1}" style="margin-bottom:12px;scroll-margin-top:90px">{t} <a href="{u}" rel="noopener" target="_blank" class="mono" style="font-size:0.8rem;word-break:break-all">{u}</a></li>' for i, (t, u) in enumerate(REFS)) + '''</ol>
</section>
<section id="data-notes">
  <h2>关于具体数值的说明</h2>
  <ul>
    <li><strong>E° 数值。</strong> 相对 SHE 的 −0.255 V（V³⁺/V²⁺）和 +1.004 V（VO₂⁺/VO²⁺）是常见的标准电位表值；文献中也常写作 −0.26 V 和 +1.00 V。因此标准电池电位为 1.26 V。</li>
    <li><strong>开路电压。</strong> 50 % SOC 时 ≈ 1.40 V 是 Knehr 和 Kumbur [15] 讨论的实测值；简化的能斯特形式在 5 M 酸中预测约 1.34 V。</li>
    <li><strong>能量密度。</strong> 20–35 Wh/L 指两侧电解液的总和；部分文献给出的单侧数值是其两倍。</li>
    <li><strong>成本。</strong> 计算器默认值（电堆 650 $/kW、V₂O₅ 18 $/kg、辅助系统 60 $/kWh + 150 $/kW、锂离子 320 $/kWh）是 [5]、[6]、[14] 区间内的示意值，并非厂商数据。请换成你自己的数据。</li>
    <li><strong>项目数据。</strong> 大连一期（100 MW / 400 MWh，2022 年）依据大连化物所/融科储能的公告 [7]；北海道数据依据住友电工 [8]。</li>
  </ul>
</section>
'''

PAGES = [
 dict(slug='chemistry', title='化学原理', accent='#a36bff', kicker='支柱 01 · 化学原理', lede='为什么一种金属的四种氧化态能造出一种“燃料”永不耗损的电池：半反应、能斯特方程，以及可交互的开路电压探索器。', toc=[('why-vanadium', '四种氧化态'), ('half-reactions', '半反应'), ('nernst', '能斯特方程与探索器'), ('electrolyte', '电解液'), ('side-reactions', '副反应')], body=CHEM, scripts=['chemistry']),
 dict(slug='anatomy', title='电池结构', accent='#26d9e3', kicker='支柱 02 · 电池结构', lede='电堆的每一层和撬装系统上的每一个箱体：由什么制成、起什么作用、如何失效。', toc=[('overview', '从单电池到电站'), ('components', '电堆，逐层拆解'), ('balance-of-plant', '辅助系统'), ('failure-modes', '失效与维护')], body=ANAT),
 dict(slug='engineering', title='工程设计', accent='#5ee37a', kicker='支柱 03 · 工程设计', lede='电堆、储液罐和泵的选型；效率损失在哪里；热极限；以及一个从第一性原理出发设计系统的计算器。', toc=[('power-vs-energy', '功率与能量'), ('sizing-tool', '选型计算器'), ('efficiency', '效率'), ('thermal', '热与流量'), ('scaling', '规模化')], body=ENG, scripts=['engineering']),
 dict(slug='economics', title='经济分析', accent='#ff9b2f', kicker='支柱 04 · 经济分析', lede='全钒液流电池的成本、钒价为何重要，以及一个与锂离子电池对比的平准化储能成本计算器。', toc=[('cost-structure', '成本构成'), ('lcos-tool', 'LCOS 计算器'), ('vanadium-market', '钒的问题'), ('comparison', '技术对比')], body=ECON, scripts=['economics']),
 dict(slug='applications', title='实际应用', accent='#ffd23f', kicker='支柱 05 · 实际应用', lede='光伏平移、电网服务，以及从大连到北海道的标志性项目，附 24 小时调度模拟器。', toc=[('why-flow', '用途'), ('dispatch-tool', '调度模拟器'), ('case-studies', '标志性项目'), ('integration', '并网集成'), ('outlook', '展望')], body=APPS, scripts=['applications']),
 dict(slug='references', title='参考文献与引用', accent='#26d9e3', kicker='经核实的数据', lede='本站的每一个数字都可追溯到下列来源之一。', toggle=False, toc=[('how-to-read', '资料来源方式'), ('references', '参考文献'), ('data-notes', '关于具体数值的说明')], body=REFS_BODY),
]
