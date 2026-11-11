import components from './components.zh.js';

export default {
  meta: { site: 'VRFB — 液流储能的科学', title: 'VRFB — 液流储能的科学', description: '一个有科学出处的全钒液流电池交互实验室与课程：飞进一座运行中的储能电站，拆开电堆，逐个离子地观察充电与放电，然后自己动手设计、仿真并核算一套系统的成本。' },
  nav: {
    main: '主导航', home: '沉浸之旅', lab: '3D 实验室', sims: '仿真器', simulator: '充电与放电', sizing: '功率与能量', compare: 'VRFB 对比 LFP', project: '搭建项目',
    course: '课程', learn: '学习路径', chemistry: '化学原理', anatomy: '电池结构', engineering: '工程设计', economics: '经济分析', applications: '实际应用', glossary: '术语表', assessment: '结业测评', references: '参考文献',
    menu: '打开导航', language: '语言', level: '学习层级', beginner: '入门', intermediate: '进阶', advanced: '高级',
    hint: { simulator: '实时电化学单电池', sizing: 'MW、MWh、倍率与时长', compare: '成本、LCOS、净现值与敏感性', project: '一步步设计光伏 + 储能', learn: '15 节课，自动记录进度', glossary: '每个术语都配图解释', assessment: '检验你学到了什么' },
  },
  loader: '正在搭建电池',
  hero: { eyebrow: '交互式科学纪录片', sub: '液流储能的科学', lede: '一种把电能储存在两罐钒电解液中的电池。滚动页面，飞进一座运行中的储能电站，跟随电解液进入电堆，逐层拆开它，在单个离子的尺度上观看充电与放电，再退回到光伏电站和电网。', cta1: '进入 3D 实验室', cta2: '开始学习课程', scroll: '向下滚动开始' },
  chapters: {
    hero: { title: '储能电站' },
    approach: { title: '飞近', eyebrow: '01 · 功率与能量相互独立', h2: '功率在电堆，能量在储液罐。', p: '可以把它想成两大罐可充电的液体，中间有一台机器。这台机器叫电堆，它把储存的能量转换成电，它的大小决定电池能输出多少千瓦。储液罐装着能量，单凭容积就决定了电池能运行多少小时。想要更长的时间？加大储液罐即可，不必增加电堆。<span class="cite">[2]</span>', i: '额定功率 P（kW）和能量 E（kWh）是两个不同的数。时长 = E ÷ P，所以 1 MW / 8 MWh 的电池可以满功率运行 8 小时。', a: 'P ≈ N · A · j · V<sub>cell</sub>（电池节数 × 电极面积 × 电流密度 × 单电池电压）。每个储液罐的能量 E ≈ c · V · F · ΔSOC · V<sub>cell</sub>：浓度 × 体积 × 法拉第常数 × 可用区间。' },
    plant: { title: '储液罐与泵', eyebrow: '02 · 储液罐、泵和管路', h2: '看它充电时的颜色变化。', p: '没有任何东西被沉积，也没有任何东西被烧掉。充电时，正极罐中的 VO²⁺ 变成 VO₂⁺（由蓝变黄），负极罐中的 V³⁺ 变成 V²⁺（由绿变紫）。液体的颜色就是荷电状态。<span class="cite">[2]</span>', hint: '点击储液罐、泵、阀门或传感器', i: '在 1.6 mol/L 下，每升电解液可储存约 43 Ah。按 80 % 的可用区间和 1.35 V 计算，相当于每升总电解液约 23 Wh。', a: '荷电状态是处于充电形态的钒所占的比例：SOC = [V²⁺] / ([V²⁺] + [V³⁺]) = [VO₂⁺] / ([VO₂⁺] + [VO²⁺])。开路电压通过能斯特方程随 SOC 变化，控制系统正是这样测量 SOC 的。' },
    pipe: { title: '电解液回路', eyebrow: '03 · 跟随电解液', h2: '两条永不混合的闭合回路。', p: '每种电解液走自己的回路：储液罐、泵、电堆，再回到储液罐。泵始终朝同一个方向输送。电池从充电切换到放电时，反向的只是电流，而不是液流。<span class="cite">[4]</span>', i: '泵的流量约为反应理论所需的 5–10 倍，消耗的能量约占电池吞吐电量的 2–5 %。<span class="cite">[14]</span>', a: '对于 N 节电池、电流 I，化学计量流量 Q = N · I / (F · c · x)，其中 x 是仍可参加反应的钒所占比例。泵功率 = Q · Δp / η，因此在中等 SOC 时过量泵送会浪费能量，而在接近 SOC 上下限时流量不足会让电极缺料。' },
    explode: { title: '结构', eyebrow: '04 · 单电池的结构', h2: '十一层，组成一节电池。', p: '端板、铜集流板、液流框、石墨双极板、碳毡电极、离子交换膜，然后再镜像重复一遍。相邻的电池共用一块双极板，所以 40 节电池的电堆有 40 张膜和 41 块板。<span class="cite">[4]</span>', hint: '点击任意部件查看参数', i: '各节电池在电气上串联，电压相加：40 节 × 1.3 V ≈ 52 V。在液路上并联，每节电池都从公共流道得到新鲜的电解液。', a: '公共流道也会带来旁路电流：电位不同的电池之间通过导电的电解液形成漏电路径。每个液流框中细而长的进液流道增加了电阻，把这部分损失控制在百分之几。<span class="cite">[4]</span>' },
    flowcell: { title: '流场', eyebrow: '05 · 流场', h2: '每节电池都有一条蛇形流道。', p: '电堆像书一样打开。双极板上加工出的流道把电解液铺开，让它均匀地扫过紧贴其上的碳毡电极。流量太小，纤维得不到足够的钒；流量太大，又白白消耗泵功。<span class="cite">[14]</span>', i: '典型电流密度为每平方厘米电极 60–150 mA。一节 2 500 cm² 的电池在 80 mA/cm² 下通过 200 A 的电流。', a: '流道的几何形状需要在压降（泵功率 ∝ Q · Δp）和反应物到达碳毡的均匀程度之间权衡。供液不均会增大浓差过电位，并缩小可用的 SOC 区间。' },
    dive: { title: '进入碳毡', eyebrow: '06 · 进入微观', h2: '钻进碳毡。', p: '电极是一层几毫米厚的碳纤维毡，每根纤维直径约 10 µm。电解液从孔隙中渗过，反应发生在纤维表面，也就是离子与电子相遇的地方。<span class="cite">[10]</span>', i: '碳毡有 90–95 % 是空隙，因此在几毫米的厚度内就有极大的反应表面积。', a: '纤维表面的反应速率遵循巴特勒–福尔默动力学。VO²⁺/VO₂⁺ 电对较慢，所以正极的活化过电位更大；热处理或酸处理会引入含氧官能团，从而加快反应。<span class="cite">[10]</span>' },
    micro: { title: '放电', eyebrow: '07 · 放电', h2: '电子要绕远路。', p: '在负极一侧，每个 V²⁺ 离子交出一个电子，变成 V³⁺。电子无法穿过隔膜，只能经外电路走一圈，并在途中做有用功。到了正极一侧，它与一个 VO₂⁺ 离子结合，使其变成 VO²⁺。质子穿过隔膜，使两侧液体保持电中性。', eq: '负极：&nbsp; V<sup>2+</sup> → V<sup>3+</sup> + e<sup>−</sup> &nbsp;&nbsp; E° = −0.255 V<br>正极：&nbsp; VO<sub>2</sub><sup>+</sup> + 2H<sup>+</sup> + e<sup>−</sup> → VO<sup>2+</sup> + H<sub>2</sub>O &nbsp;&nbsp; E° = +1.004 V<br>电池：&nbsp; E°<sub>cell</sub> ≈ 1.26 V（50 % SOC 时开路电压 ≈ 1.4 V）<small>相对标准氢电极的标准电位。概念动画，未按比例绘制。<span class="cite">[1][15]</span></small>', legend: '<span><i style="color:#a36bff"></i>V²⁺ 紫色</span><span><i style="color:#5ee37a"></i>V³⁺ 绿色</span><span><i style="color:#3b8cff"></i>VO²⁺ 蓝色</span><span><i style="color:#ffd23f"></i>VO₂⁺ 黄色</span><span><i style="color:#ffffff"></i>H⁺ 穿过隔膜</span><span><i style="color:#26d9e3"></i>e⁻ 经过导线</span>', i: '电子经导线从负极流向正极。约定的电流方向与此相反。在电池内部，电路由离子而不是电子接通。', a: 'ΔG = −nFE：在 1.26 V 下，每摩尔电子释放约 121 kJ（34 Wh）。带负载时端电压为 V = E<sub>OCV</sub> − j · ASR − η，因此其中一部分能量变成了热。' },
    charge: { title: '充电', eyebrow: '08 · 充电', h2: '现在，让所有箭头反向。', p: '施加一个高于电池自身电压的电压，电流就会反向。电子被推回负极，V³⁺ 变回 V²⁺，VO²⁺ 变回 VO₂⁺，质子沿相反方向穿过隔膜。能量再次以化学能的形式储存起来。', eq: '负极：&nbsp; V<sup>3+</sup> + e<sup>−</sup> → V<sup>2+</sup><br>正极：&nbsp; VO<sup>2+</sup> + H<sub>2</sub>O → VO<sub>2</sub><sup>+</sup> + 2H<sup>+</sup> + e<sup>−</sup><small>充电时每节电池约需 1.5–1.6 V；放电时约输出 1.2–1.3 V。两者之差就是电压损失。<span class="cite">[4]</span></small>', legend: '<span><i style="color:#26d9e3"></i>电路中的装置现在是电源，而不是负载</span>', i: '往返效率 = 放出的能量 ÷ 充入的能量。单电池通常为 80–90 %（直流）；整套系统为 65–80 %（交流到交流）。<span class="cite">[5]</span>', a: '接近充满时有两种副反应参与竞争：负极的析氢和正极的碳氧化。这就是可用区间通常止于 90–95 % 荷电状态的原因。<span class="cite">[2][10]</span>' },
    rebuild: { title: '复原', eyebrow: '09 · 重新组装', h2: '电池串联，电压相加。', p: '拉杆把各层压紧，使碳毡被压缩、密封垫封严。四十节 1.3 V 的电池组成一个 52 V 的电堆；一集装箱的电堆就是一兆瓦。<span class="cite">[4]</span>', i: '电堆电压 = 节数 × 单电池电压。电堆功率 = 电压 × 电流：52 V × 200 A ≈ 10 kW。', a: '压紧力（碳毡上约 0.5–1.5 MPa）是一种折中：压得越紧，接触电阻越小，但孔隙被压闭，压降随之升高。' },
    grid: { title: '光伏与电网', eyebrow: '10 · 从光伏电站到电网', h2: '正午的阳光，留到晚餐时用。', p: '一套按 4–12 小时设计的液流电池吸收正午的光伏高峰，在傍晚负荷爬坡时释放。随着能量送出，可以看到储液罐的颜色重新变回蓝色和绿色。中国大连的 100 MW / 400 MWh 电站在 2022 年并网时是世界上最大的液流电池。<span class="cite">[7]</span>', i: '每天转移的能量 = 额定能量 × 循环次数。一套 100 MW / 400 MWh 的电池每天循环一次，最多可把 400 MWh 从正午移到傍晚。', a: '储能是否划算，取决于它的平准化储能成本与所赚取的价差之比。液流电池和锂离子电池都不是在所有时长下占优：请到对比实验室检验这些假设。' },
    outro: { title: '动手探索', eyebrow: '轮到你了', h2: '现在自己来探索。' },
  },
  explore: {
    eyebrow: '动手实验室', h2: '看得见，改得动，算得出。', p: '本站每一个难懂的概念都配有可以动手操作的东西：可以拆解的 3D 模型，可以充放电的实时单电池，以及把每一步计算都展示出来的计算器。',
    cards: {
      lab: { num: '3D 实验室', h3: '探索电池', p: '旋转、缩放并拆开整套系统。单独查看任意部件，隐藏防护罩，跟随电解液，并启动充电或放电。', tags: '<span>自由 3D</span><span>部件</span><span>术语表</span>' },
      simulator: { num: '仿真器', h3: '充电与放电', p: '一节实时运行的电池，电子、离子和颜色都在变化，由真实的能斯特与内阻模型驱动，并绘出 SOC、电压、功率和能量曲线。', tags: '<span>电化学</span><span>实时曲线</span>' },
      sizing: { num: '仿真器', h3: '功率与能量', p: '用滑块讲清 MW、MWh、倍率和时长：加电堆提高功率，加电解液提高能量，并看到每个公式的完整演算。', tags: '<span>MW / MWh</span><span>容量设计</span>' },
      compare: { num: '仿真器', h3: 'VRFB 对比 LFP', p: '在同一个项目寿命内做一次公平的成本对比：CAPEX、年度成本、LCOS、净现值、回收期和敏感性，所有假设都可以修改。', tags: '<span>LCOS</span><span>净现值</span><span>敏感性</span>' },
      project: { num: '项目搭建', h3: '搭建项目', p: '分七步为住宅、楼宇、工厂或电力公司设计光伏加储能，然后下载全部假设和结果。', tags: '<span>向导</span><span>Excel · CSV · PDF</span>' },
      learn: { num: '课程', h3: '学习路径', p: '十五节课、三个层级，配有例题、实验、小测验、术语表、结业测评和自动保存的进度。', tags: '<span>3 个层级</span><span>小测验</span><span>进度</span>' },
    },
  },
  pillars: {
    eyebrow: '课程体系', h2: '关于 VRFB 的一切，分为五大支柱。', p: '每个支柱都从通俗的语言讲起。在页面顶部切换学习层级，可以依次加入工程数据和科学原理。每个数字都链接到公开发表的来源。',
    cards: {
      chemistry: { num: '支柱 01', h3: '化学原理', p: '钒的四种氧化态、半反应、能斯特方程，以及一个交互式开路电压探索器。', tags: '<span>氧化还原</span><span>能斯特</span><span>仿真器</span>' },
      anatomy: { num: '支柱 02', h3: '电池结构', p: '电堆和辅助系统的每一个部件：材料、尺寸、存在的理由以及失效方式。', tags: '<span>电堆</span><span>隔膜</span><span>材料</span>' },
      engineering: { num: '支柱 03', h3: '工程设计', p: '电堆、储液罐和泵的选型；效率损失；热限制；以及一个可以动手试的系统设计计算器。', tags: '<span>选型</span><span>效率</span><span>计算器</span>' },
      economics: { num: '支柱 04', h3: '经济分析', p: '投资成本、钒价敏感性、电解液租赁，以及与磷酸铁锂对比的平准化储能成本计算器。', tags: '<span>LCOS</span><span>投资</span><span>计算器</span>' },
      applications: { num: '支柱 05', h3: '实际应用', p: '光伏移峰、电网服务，以及从大连到北海道的标杆项目，并附 24 小时调度仿真器。', tags: '<span>光伏</span><span>电网</span><span>案例</span>' },
    },
    sourcing: {
      h1: '有出处，有标注', p1: '标准电位、浓度、效率和成本均来自同行评议论文和美国国家实验室报告，并在<a data-pillar="references" href="pillars/zh/references.html">参考文献页</a>列出 DOI。实测数据、模型结果、示意性取值和厂商声明都会分别标明。',
      h2: '一气呵成的体验', p2: '3D 之旅完全由滚动位置驱动，因此可以正向播放，也可以倒退。几何体全部用 Three.js 程序化生成，储液罐的颜色遵循钒各氧化态的真实颜色。',
      h3: '开源且经过测试', p3: '纯 HTML、CSS 和 JavaScript，无需构建，也无需服务器。计算模型有自动化测试覆盖，整个网站可以复刻并托管在 GitHub Pages 上。',
    },
  },
  footer: { tag: 'VRFB — 液流储能的科学', note: '教育用途，非商业。各计算器采用有文档说明的简化模型，假设均可修改；它们不构成工程或投资建议。', links: '站点', sources: '参考文献与引用', repo: 'GitHub 仓库' },
  panel: { kicker: '部件', close: '关闭', spec: '参数', facts: '值得了解', sources: '来源', more: '在“电池结构”中阅读更多 →', lab: '在 3D 实验室中查看 →' },
  labels: {
    endplate: { text: '端板', sub: '不锈钢' }, collector: { text: '集流板', sub: '铜' }, gasket: { text: '液流框与密封垫', sub: 'PVC · EPDM' }, bipolar: { text: '双极板', sub: '石墨流场' },
    felt_neg: { text: '负极', sub: '碳毡 · V²⁺/V³⁺' }, membrane: { text: '离子交换膜', sub: '质子导体' }, felt_pos: { text: '正极', sub: '碳毡 · VO²⁺/VO₂⁺' }, tierod: { text: '拉杆与碟形弹簧', sub: '压紧力' },
    micro_neg: { text: '负极', sub: 'V²⁺ ⇌ V³⁺ + e⁻' }, micro_mem: { text: '隔膜', sub: 'H⁺ 通过 · 钒被阻挡' }, micro_pos: { text: '正极', sub: 'VO₂⁺ + 2H⁺ + e⁻ ⇌ VO²⁺ + H₂O' }, micro_circuit: { text: '外电路', sub: '电子在这里做功' },
    plant_tank_pos: { text: '正极储液罐', sub: 'VO²⁺ 蓝 → VO₂⁺ 黄' }, plant_pump: { text: '循环泵', sub: '磁力驱动' }, plant_pcs: { text: '功率变换', sub: '直流 ⇄ 交流 · 控制' }, plant_sensor: { text: '流量计', sub: '传感器为控制器提供数据' }, plant_valve: { text: '隔离阀', sub: '每条管路一只' }, plant_tank_neg: { text: '负极储液罐', sub: 'V³⁺ 绿 → V²⁺ 紫' },
  },
  components,
};
