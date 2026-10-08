import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';

type TextBlock = {
  title: string;
  description: string;
  items?: string[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const leiyinDesignSystem = {
  color: {
    ink: '#111111',
    stone: '#3F3F46',
    muted: '#6B7280',
    line: '#E5E7EB',
    soft: '#F8FAFC',
    white: '#FFFFFF',
    blue: '#2563EB',
    cyan: '#22D3EE',
    violet: '#8B5CF6',
    rose: '#FB7185',
    impact: '#10B981',
    violetGlow: '#CFC1FF',
    warmGlow: '#FFD2A3',
    mintGlow: '#A4F4E8',
    blueMist: '#DBEAFE',
  },
  gradient: {
    evidenceBoard:
      'bg-[radial-gradient(circle_at_10%_16%,#cfc1ff_0%,transparent_32%),radial-gradient(circle_at_74%_18%,#ffd2a3_0%,transparent_28%),radial-gradient(circle_at_92%_86%,#a4f4e8_0%,transparent_30%),linear-gradient(135deg,#fbfbff_0%,#ffffff_100%)]',
    definition:
      'bg-[radial-gradient(circle_at_12%_18%,#cfc1ff_0%,transparent_26%),radial-gradient(circle_at_82%_20%,#ffd2a3_0%,transparent_24%),radial-gradient(circle_at_86%_86%,#a4f4e8_0%,transparent_28%),linear-gradient(135deg,#fbfbff_0%,#ffffff_100%)]',
    card: 'bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)]',
  },
  typography: {
    display: 'text-4xl font-light leading-tight tracking-[-0.045em] text-[#111111] md:text-5xl',
    pageTitle: 'text-5xl font-extralight tracking-tighter md:text-7xl',
    sectionTitle: 'text-3xl font-light tracking-tight',
    cardTitle: 'text-2xl font-light tracking-tight',
    body: 'text-sm font-medium leading-7 text-gray-500',
    bodyStrong: 'text-sm font-semibold leading-7 text-gray-700',
    caption: 'text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400',
    meta: 'text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400',
    button: 'text-[10px] font-bold uppercase tracking-[0.24em]',
    darkBody: 'text-sm font-medium leading-7 text-white/55',
    darkCaption: 'text-[10px] font-bold uppercase tracking-[0.3em] text-white/45',
  },
  radius: {
    hero: 'rounded-[3rem]',
    feature: 'rounded-[2.75rem]',
    section: 'rounded-[2.5rem]',
    panel: 'rounded-[2rem]',
    card: 'rounded-[1.75rem]',
    inner: 'rounded-[1.5rem]',
    chip: 'rounded-full',
  },
  surface: {
    card: 'border border-gray-100 bg-white shadow-[0_18px_50px_rgba(20,20,40,0.05)]',
    soft: 'border border-gray-100 bg-gray-50',
    glass: 'border border-white/70 bg-white/70 backdrop-blur-xl',
    focus: 'shadow-[0_28px_90px_rgba(20,20,40,0.08)]',
    hero: 'border border-white/80 shadow-[0_34px_110px_rgba(22,24,44,0.1)]',
    heroCopy: 'border-white/65 bg-white/35 shadow-[0_18px_70px_rgba(20,20,40,0.08)] backdrop-blur-xl',
    evidenceCard: 'border border-white/80 bg-white/84 shadow-[0_26px_80px_rgba(20,20,40,0.14)] backdrop-blur-2xl',
    evidenceFeatured: 'shadow-[0_32px_100px_rgba(20,20,40,0.18)]',
    hoverCard: 'hover:shadow-[0_26px_70px_rgba(20,20,40,0.1)]',
    example: 'shadow-[0_14px_40px_rgba(20,20,40,0.04)]',
  },
  motion: {
    page: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    section: { duration: 0.6 },
    card: { duration: 0.55 },
    stagger: 0.06,
    evidenceStagger: 0.1,
  },
  component: {
    evidenceBoard: {
      interactionArea:
        'relative py-16 md:py-20',
      dragBoundary:
        'pointer-events-none absolute inset-y-0 left-1/2 hidden w-full -translate-x-1/2 md:block md:w-[calc(100vw-64px)] lg:w-[calc(100vw-80px)]',
      canvas:
        'relative min-h-[520px] overflow-visible p-7 md:min-h-[600px] md:p-12',
      texture: 'evidence-texture pointer-events-none absolute inset-0 opacity-80',
      glowTopLeft: 'pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-white/35 blur-3xl',
      glowBottomRight: 'pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/30 blur-3xl',
      guideLine: 'pointer-events-none absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent',
      easterEgg:
        'pointer-events-none absolute right-[12%] top-[45%] z-[1] hidden max-w-[380px] -rotate-2 select-none md:block xl:right-[18%]',
      easterEggLabel: 'text-[10px] font-bold uppercase tracking-[0.32em] text-gray-500',
      easterEggTitle: 'mt-4 text-2xl font-light leading-snug tracking-[-0.04em] text-gray-900',
      easterEggBody: 'mt-3 text-sm font-semibold leading-7 text-gray-600',
      easterEggIdleOpacity: 0.18,
      easterEggRevealedOpacity: 0.72,
      copyPanel: 'relative z-10 max-w-sm space-y-5 p-6 md:p-7 lg:max-w-md',
      desktopCardLayer: 'absolute inset-0 hidden md:block',
      mobileCardLayer: 'relative z-10 mt-10 grid gap-3 md:hidden',
    },
    evidenceCard: {
      base:
        'absolute z-20 cursor-grab touch-none select-none p-5 active:cursor-grabbing',
      mobile:
        'p-5',
      accentBar: 'mb-6 h-1.5 w-16 rounded-full bg-gradient-to-r',
      mobileAccentBar: 'mb-4 h-1.5 w-14 rounded-full bg-gradient-to-r',
      dot:
        'h-2.5 w-2.5 rounded-full bg-gradient-to-r shadow-[0_0_18px_rgba(37,99,235,0.35)]',
      metaRow: 'mb-7 flex items-center justify-between',
      valueRow: 'mb-3 flex items-end gap-2',
      featuredValue: 'text-6xl font-semibold leading-none tracking-[-0.055em] text-[#111111]',
      value: 'text-4xl font-semibold leading-none tracking-[-0.055em] text-[#111111]',
      mobileValue: 'mt-4 text-3xl font-semibold tracking-tight text-[#111111]',
      note: 'text-xs font-semibold leading-6 text-gray-500',
      mobileNote: 'mt-2 text-xs font-semibold leading-6 text-gray-500',
      unit: 'pb-1',
      variants: {
        experience: {
          position: 'left-[48%] bottom-[5%] w-[310px] rotate-[-5deg] xl:left-[42%] xl:w-[330px]',
          accent: 'from-blue-500 to-cyan-400',
        },
        innovation: {
          position: 'left-[48%] -top-7 w-[290px] rotate-[-4deg] xl:left-[43%] xl:w-[300px]',
          accent: 'from-violet-500 to-fuchsia-400',
        },
        recognition: {
          position: 'right-[2%] top-[20%] w-[300px] rotate-[0deg] xl:right-[4%] xl:top-[18%] xl:w-[310px]',
          accent: 'from-orange-400 to-rose-400',
        },
        impact: {
          position: '-right-2 -bottom-8 w-[330px] rotate-[-3deg] xl:w-[360px]',
          accent: 'from-emerald-400 to-teal-300',
        },
      },
    },
  },
};

type EvidenceCardVariant = keyof typeof leiyinDesignSystem.component.evidenceCard.variants;

const homeAboutHighlights = [
  '这里展示个人专业身份摘要，让访问者快速知道我是谁。',
  '这里展示职业经历的核心阶段，但不展开具体履历。',
  '这里展示成就清单的预览，让用户知道 About 页面值得继续阅读。',
];

const homeCareerHighlights = [
  {
    title: 'International Recognition',
    description: 'International award-winning work recognized by iF, Red Dot, and MUSE.',
  },
  {
    title: 'Patent-backed Innovation',
    description: '12 national patents, including invention patents, supporting original product and experience innovation.',
  },
  {
    title: 'Design Leadership',
    description: 'Design management across team incubation, quality governance, and scalable product decision-making.',
  },
  {
    title: 'Complex Product Systems',
    description: 'Experience across enterprise platform governance, creator tools, education products, and AI workflows.',
  },
];

const evidenceCards = [
  {
    label: 'Experience',
    value: '12+',
    unit: 'Years',
    note: 'Design leadership across B2B and B2C ecosystems',
    variant: 'experience' as EvidenceCardVariant,
    featured: true,
  },
  {
    label: 'Innovation',
    value: '12',
    unit: 'Patents',
    note: 'Including invention patents and product innovation records',
    variant: 'innovation' as EvidenceCardVariant,
  },
  {
    label: 'Recognition',
    value: 'iF / Red Dot / MUSE',
    unit: 'Awards',
    note: 'International award-winning work',
    variant: 'recognition' as EvidenceCardVariant,
  },
  {
    label: 'Impact',
    value: 'Multi-million-dollar',
    unit: 'Impact',
    note: 'Monetization impact through product design',
    variant: 'impact' as EvidenceCardVariant,
  },
];

const evidenceBoardSpecs = [
  ['Visual Background', 'same content width', '渐变背景板必须和下方内容区域同宽，不能因为拖拽范围而被拉宽。'],
  ['Drag Boundary', '100vw - 80px / desktop', '宽屏拖拽区域使用透明边界层，比视觉背景更宽，允许卡片破出背景板。'],
  ['Drag Boundary', '100vw - 64px / medium', '中等屏幕保留更小页面边距，避免拖拽区域造成横向压迫。'],
  ['Mobile Behavior', 'static stacked cards', '移动端不启用浮动拖拽，改为纵向堆叠，保证阅读优先。'],
  ['Overflow Rule', 'visible', 'Evidence Board 允许卡片破出背景，但默认状态不能遮盖主信息。'],
  ['Easter Egg Text', '18% -> 72% opacity', '彩蛋是卡片下方的纯文字区域，不使用容器、描边或阴影；首次拖拽证据卡后提高透明度。'],
];

const evidenceCardVariantSpecs = Object.entries(leiyinDesignSystem.component.evidenceCard.variants).map(
  ([name, variant]) => ({
    name,
    position: variant.position,
    accent: variant.accent,
  }),
);

const aboutBlocks: TextBlock[] = [
  {
    title: '个人定位',
    description: '这里用一段完整但克制的文字介绍我的专业身份、职业阶段和对外展示的核心价值。',
    items: ['专业身份', '经验年限', '领域方向', '国际化表达'],
  },
  {
    title: '职业路径',
    description: '这里按时间顺序概述我的关键职业阶段，让用户理解能力是如何长期形成的。',
    items: ['关键公司', '岗位阶段', '负责范围', '业务语境'],
  },
  {
    title: '能力结构',
    description: '这里总结我的核心能力，不是写具体项目，而是说明我能处理什么类型的问题。',
    items: ['设计领导力', '复杂系统', '产品判断', '创新能力'],
  },
  {
    title: '成就清单',
    description: '这里集中列出我的主要成就类型，Career 页面会进一步展开这些成就的来源、过程和证据。',
    items: ['国际认可', '专利与创新', '设计管理', '平台级项目', '0 到 1 经历', '评审潜力'],
  },
];

const careerBlocks: TextBlock[] = [
  {
    title: '成就一：国际认可',
    description: '这里解释该类成就是如何形成的，包含对应项目、外部认可、角色贡献和可验证材料。',
    items: ['背景', '我的角色', '代表项目', '外部认可', '可验证证据'],
  },
  {
    title: '成就二：专利与创新',
    description: '这里展开创新相关成就，说明原创贡献、专利方向、产品判断和实际落地方式。',
    items: ['创新问题', '解决方式', '专利方向', '产品价值', '职业反思'],
  },
  {
    title: '成就三：设计领导力',
    description: '这里展开管理与设计治理相关成就，说明我如何影响团队、质量标准和跨业务协作。',
    items: ['团队管理', '设计治理', '质量标准', '跨团队影响', '长期价值'],
  },
  {
    title: '成就四：复杂项目经验',
    description: '这里展开平台、运营、创作者、教育或 AI 等复杂项目，展示每类项目如何证明能力。',
    items: ['项目背景', '复杂性', '设计策略', '结果影响', '可点击详情'],
  },
];

const designSystemLayers = [
  {
    name: 'Definition',
    title: '主题定义',
    description: 'Leiyin 是证据驱动的个人能力展示系统，不是企业后台、作品集模板或个人日记。',
  },
  {
    name: 'Foundation',
    title: '基础 Token',
    description: '用颜色、字体、间距、圆角和阴影建立可信、年轻、克制的视觉语言。',
  },
  {
    name: 'Layout',
    title: '页面结构',
    description: '用入口、证据、成就、详情和联系承接完整阅读路径。',
  },
  {
    name: 'Patterns',
    title: '表达模式',
    description: '把职业能力转译为可验证的叙事模块，而不是堆砌项目截图。',
  },
];

const leiyinThemeDefinition = [
  ['Purpose', '对外展示个人能力、职业证据、国际认可和设计判断。'],
  ['Audience', '海外专业受众、国际奖项评委、潜在合作方和职业机会评估者。'],
  ['Tone', 'Credible / Editorial / Young / Evidence-driven / International。'],
  ['Not This', '不是企业产品官网，不是纯视觉作品集，不是头像 Hero 驱动的个人主页。'],
];

const foundationGroups = [
  {
    eyebrow: 'Color',
    title: '色彩',
    description: '中性色负责专业可信度，柔和光源负责年轻感，强调色只用于证据、链接和状态。',
    items: [
      ['Ink', leiyinDesignSystem.color.ink, '主文字、高对比内容和核心判断'],
      ['Muted', leiyinDesignSystem.color.muted, '正文说明、二级信息和解释性文案'],
      ['Soft Surface', leiyinDesignSystem.color.soft, '浅色背景、低优先级区域和页面呼吸感'],
      ['Blue Accent', leiyinDesignSystem.color.blue, '链接、可点击操作、职业证据强调'],
      ['Violet Glow', leiyinDesignSystem.color.violetGlow, '首页证据板的年轻感光源'],
      ['Warm Glow', leiyinDesignSystem.color.warmGlow, '中和科技感，提供温度和亲和力'],
      ['Mint Glow', leiyinDesignSystem.color.mintGlow, '补充轻科技感和背景层次'],
    ],
  },
  {
    eyebrow: 'Typography',
    title: '字体',
    description: '参考 TTEP 的 Header / Body / Longform / Caption 结构，但转译为个人叙事页面的阅读节奏。',
    items: [
      ['Display', '48-60px / light / tight', '首页核心判断，只用于真正有内容的句子'],
      ['Section Title', '28-36px / light or semibold', '页面模块标题和长段落分组'],
      ['Card Title', '20-28px / light or semibold', '证据卡、成就卡和详情入口'],
      ['Body', '14-16px / medium / 1.65-1.8', '摘要、说明、项目解释和职业反思'],
      ['Caption', '10-12px / bold / uppercase', '标签、编号、状态、元信息和辅助识别'],
    ],
  },
  {
    eyebrow: 'Spacing',
    title: '间距',
    description: '间距用于建立阅读节奏：首屏需要密度，详情页需要展开，证据模块需要可扫读。',
    items: [
      ['Micro', '8-12px', '标签、图标、按钮内部和元信息'],
      ['Component', '16-24px', '卡片内边距、信息组和小模块'],
      ['Group', '32-48px', '卡片组、内容区块和上下文分隔'],
      ['Section', '56-80px', '页面主模块之间的节奏切换'],
    ],
  },
  {
    eyebrow: 'Radius & Shadow',
    title: '形态与层级',
    description: '用大圆角和柔和阴影避免线框感，但所有材质都必须服务证据层级。',
    items: [
      ['Container Radius', '32-48px', '首页证据板、重点视觉区域和大容器'],
      ['Card Radius', '24-32px', '成就卡、证据卡和信息卡'],
      ['Control Radius', '999px / 12px', '胶囊按钮、标签和小控件'],
      ['Shadow S/M/L', '0 18 50 -> 0 34 110', '从卡片浮起到重点模块聚焦'],
    ],
  },
];

const colorPrimitives = [
  {
    group: 'Neutral',
    purpose: '文字、背景、边界和页面基础结构',
    colors: [
      ['Ink', leiyinDesignSystem.color.ink, '核心文字 / 高对比操作'],
      ['Stone', leiyinDesignSystem.color.stone, '次级标题 / 深色说明'],
      ['Muted', leiyinDesignSystem.color.muted, '正文说明 / 辅助信息'],
      ['Line', leiyinDesignSystem.color.line, '边界 / 分隔线'],
      ['Soft', leiyinDesignSystem.color.soft, '浅色背景 / 弱容器'],
      ['White', leiyinDesignSystem.color.white, '卡片 / 玻璃浮层'],
    ],
  },
  {
    group: 'Accent',
    purpose: '链接、交互、职业证据和局部强调',
    colors: [
      ['Blue', leiyinDesignSystem.color.blue, '链接 / hover / 可点击入口'],
      ['Cyan', leiyinDesignSystem.color.cyan, '科技感辅助光 / 渐变终点'],
      ['Violet', leiyinDesignSystem.color.violet, '创新、奖项、个人特质强调'],
      ['Rose', leiyinDesignSystem.color.rose, '识别度较高的成就提示'],
    ],
  },
  {
    group: 'Glow',
    purpose: '首页证据板和重点区域的背景光源',
    colors: [
      ['Violet Glow', leiyinDesignSystem.color.violetGlow, '年轻感光源'],
      ['Warm Glow', leiyinDesignSystem.color.warmGlow, '温度和亲和力'],
      ['Mint Glow', leiyinDesignSystem.color.mintGlow, '轻科技感和空间层次'],
      ['Blue Mist', leiyinDesignSystem.color.blueMist, '低饱和互动背景'],
    ],
  },
];

const colorSemantics = [
  ['text-primary', leiyinDesignSystem.color.ink, '主标题、核心判断、关键数字', '用于需要被优先阅读的内容，不用于大面积背景。'],
  ['text-secondary', leiyinDesignSystem.color.muted, '正文、解释、低优先级说明', '用于段落和辅助说明，避免承载关键结论。'],
  ['surface-base', leiyinDesignSystem.color.white, '卡片、浮层、正文容器', '配合轻边框和阴影使用，保证内容清晰。'],
  ['surface-soft', leiyinDesignSystem.color.soft, '弱分区、卡片组背景、间隔区', '用于降低页面噪音，不替代白色主内容区。'],
  ['border-subtle', leiyinDesignSystem.color.line, '分隔线、卡片边界、结构线', '边界应轻，不制造后台面板感。'],
  ['accent-action', leiyinDesignSystem.color.blue, '链接、按钮 hover、可点击状态', '只用于行动和跳转，不用于普通装饰。'],
  ['accent-proof', leiyinDesignSystem.color.violet, '奖项、专利、创新类证据', '小面积使用，帮助证据分类。'],
  ['accent-impact', leiyinDesignSystem.color.impact, '影响、增长、业务结果', '用于正向结果和影响力表达。'],
];

const colorExamples = [
  {
    name: 'Evidence Board',
    description: '使用 `Violet Glow / Warm Glow / Mint Glow` 作为背景光源，叠加白色玻璃卡片，建立首页记忆点。',
    swatches: [
      leiyinDesignSystem.color.violetGlow,
      leiyinDesignSystem.color.warmGlow,
      leiyinDesignSystem.color.mintGlow,
      leiyinDesignSystem.color.white,
    ],
  },
  {
    name: 'Evidence Card',
    description: '主文字使用 `Ink`，说明使用 `Muted`，顶部用一条小面积渐变表达证据类型。',
    swatches: [
      leiyinDesignSystem.color.ink,
      leiyinDesignSystem.color.muted,
      leiyinDesignSystem.color.blue,
      leiyinDesignSystem.color.cyan,
    ],
  },
  {
    name: 'Achievement Card',
    description: '默认保持中性白卡；只在 hover 或标签处使用 `Blue Accent`，避免首页变成彩色卡片墙。',
    swatches: [
      leiyinDesignSystem.color.white,
      leiyinDesignSystem.color.soft,
      leiyinDesignSystem.color.line,
      leiyinDesignSystem.color.blue,
    ],
  },
];

const colorUsageRules = [
  ['Do', '先用中性色建立可信度，再用强调色标记证据、行动和状态。'],
  ['Do', '柔和光源只用于重点容器背景，不直接作为正文承载色。'],
  ['Do', '同一屏最多出现 2-3 个强调色，避免削弱专业感。'],
  ['Avoid', '不要把所有成就卡做成不同大色块，容易变成模板化作品集。'],
  ['Avoid', '不要用浅色文字承载关键内容，尤其是奖项、专利、影响力数字。'],
  ['Avoid', '不要让颜色只承担装饰功能，每个颜色都需要说明它在证明什么。'],
];

const layoutRules = [
  {
    name: 'Home',
    role: '入口总览',
    rule: '先给出个人能力判断，再通过证据板和 Achievement Index 让用户快速理解网站价值。',
  },
  {
    name: 'About',
    role: '身份详情',
    rule: '解释我是谁、能力如何形成、有哪些成就类型，不展开每个项目的完整过程。',
  },
  {
    name: 'Career',
    role: '成就展开',
    rule: '把 About 中的成就转成项目、角色、证据、影响和职业思考。',
  },
  {
    name: 'Contact',
    role: '轻量承接',
    rule: '作为行动出口出现，不做独立主导航，不写成强销售 CTA。',
  },
];

const componentRules = [
  {
    name: 'Evidence Board',
    anatomy: '主判断语 / 背景光源 / 浮动证据卡 / 关键词轨道',
    rule: '建立首页记忆点，让用户在首屏获得可信判断和可验证证据。',
  },
  {
    name: 'Evidence Card',
    anatomy: '标签 / 结果数字 / 单位 / 简短证据说明 / 渐变强调条',
    rule: '结果优先，解释其次；避免所有卡片等权重或写成抽象能力词。',
  },
  {
    name: 'Achievement Card',
    anatomy: '序号 / 成就主题 / 证据摘要 / 详情入口',
    rule: '连接 Home 和 Career，保证首页展示内容密度，同时让用户知道可继续深入。',
  },
  {
    name: 'Outline Block',
    anatomy: '编号 / 标题 / 段落 / 关键词列表',
    rule: '用于 About 和 Career 的长内容骨架，帮助海外读者快速扫读。',
  },
];

const patternRules = [
  {
    name: 'Evidence First Narrative',
    description: '每个页面先给用户判断依据，再展开背景，不用空洞口号占据视觉中心。',
  },
  {
    name: 'Editorial Portfolio Rhythm',
    description: '像杂志专题一样组织内容：先建立观点，再提供证据，最后进入下一步。',
  },
  {
    name: 'Recognition To Qualification',
    description: '国际奖项、专利、影响力和复杂项目共同推导评审资格，不单独做生硬的 Jury 页面。',
  },
  {
    name: 'Global Professional Trust',
    description: '用英文表达、克制视觉、明确证据和低噪音交互建立跨文化可信度。',
  },
];

const motionRules = [
  ['Page Entrance', '520-700ms fade-up，用于页面进入和首屏建立节奏。'],
  ['Evidence Cards', '80-120ms stagger，体现年轻感和信息层次。'],
  ['Drag Interaction', '桌面端证据卡允许在透明交互区域内拖拽，增强探索感但不影响默认阅读。'],
  ['Hover', '轻微上移、阴影增强、文字强调，不使用夸张弹跳。'],
  ['Reduced Motion', '尊重用户系统设置，必要时保留静态层级。'],
];

const governanceRules = [
  ['Accessibility', '正文与背景保持可读对比；交互态不能只依赖颜色；链接和按钮需要清晰焦点状态。'],
  ['Internationalization', '默认面向英文阅读，中文内容只作为内部编辑或补充说明；避免过度本土化隐喻。'],
  ['Content Quality', '每个模块必须回答“它证明了什么”，不能只为了视觉丰富而存在。'],
  ['Adaptation', 'TTEP 只提供结构方法，Leiyin 的视觉语言必须服务个人能力展示和海外专业可信度。'],
];

function PageShell({
  eyebrow,
  title,
  description,
  children,
  showHeader = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  return (
    <section className="mx-auto flex h-full w-full max-w-7xl flex-col px-8 py-8 md:px-12 lg:px-20">
      {showHeader ? (
        <header className="mb-12 max-w-4xl space-y-5">
          <span className={leiyinDesignSystem.typography.caption}>{eyebrow}</span>
          <h1 className={leiyinDesignSystem.typography.pageTitle}>
            {title}
            <span className="font-bold text-blue-600">.</span>
          </h1>
          <p className={cx('max-w-2xl text-base md:text-lg', leiyinDesignSystem.typography.body)}>{description}</p>
        </header>
      ) : null}
      {children}
      <SiteFooter className="mt-16 grid gap-6 border-t border-gray-100 pt-8 md:grid-cols-3 md:items-start" />
    </section>
  );
}

function OutlineCard({ block, index }: { block: TextBlock; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: leiyinDesignSystem.motion.section.duration, delay: index * leiyinDesignSystem.motion.stagger }}
      className="grid gap-6 border-b border-gray-100 py-8 md:grid-cols-[120px_1fr]"
    >
      <div>
        <span className={leiyinDesignSystem.typography.meta}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="space-y-5">
        <div className="space-y-3">
          <h2 className={cx(leiyinDesignSystem.typography.cardTitle, 'md:text-3xl')}>{block.title}</h2>
          <p className={cx('max-w-3xl', leiyinDesignSystem.typography.body)}>{block.description}</p>
        </div>
        {block.items ? (
          <div className="grid gap-3 md:grid-cols-2">
          {block.items.map((item) => (
            <div key={item} className={cx(leiyinDesignSystem.surface.soft, 'px-4 py-3 text-xs font-semibold text-gray-500')}>
              {item}
            </div>
          ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

function OutlineList({ blocks }: { blocks: TextBlock[] }) {
  return (
    <div className="border-t border-black">
      {blocks.map((block, index) => (
        <OutlineCard key={block.title} block={block} index={index} />
      ))}
    </div>
  );
}

export function FrameworkHome() {
  const evidenceBoardRef = useRef<HTMLDivElement>(null);
  const [hasDraggedEvidenceCard, setHasDraggedEvidenceCard] = useState(false);

  return (
    <PageShell
      eyebrow="首页"
      title="能力总览"
      description="首页采用上下结构：先让访问者看到 About 的核心内容，再看到 Career 的成就与项目预览。用户不需要马上点击，也能理解这个网站要展示什么。"
      showHeader={false}
    >
      <div className={leiyinDesignSystem.component.evidenceBoard.interactionArea}>
        <div
          ref={evidenceBoardRef}
          className={leiyinDesignSystem.component.evidenceBoard.dragBoundary}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={leiyinDesignSystem.motion.page}
          className={cx(
            leiyinDesignSystem.component.evidenceBoard.canvas,
            leiyinDesignSystem.radius.hero,
            leiyinDesignSystem.surface.hero,
            leiyinDesignSystem.gradient.evidenceBoard,
          )}
        >
          <div className={leiyinDesignSystem.component.evidenceBoard.texture} />
          <div className={leiyinDesignSystem.component.evidenceBoard.glowTopLeft} />
          <div className={leiyinDesignSystem.component.evidenceBoard.glowBottomRight} />
          <div className={leiyinDesignSystem.component.evidenceBoard.guideLine} />

          <motion.div
            animate={{
              opacity: hasDraggedEvidenceCard
                ? leiyinDesignSystem.component.evidenceBoard.easterEggRevealedOpacity
                : leiyinDesignSystem.component.evidenceBoard.easterEggIdleOpacity,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={leiyinDesignSystem.component.evidenceBoard.easterEgg}
          >
            <span className={leiyinDesignSystem.component.evidenceBoard.easterEggLabel}>Hidden Signal</span>
            <p className={leiyinDesignSystem.component.evidenceBoard.easterEggTitle}>
              Proof is not decoration.
            </p>
            <p className={leiyinDesignSystem.component.evidenceBoard.easterEggBody}>
              Move the evidence around to reveal the logic behind the story.
            </p>
          </motion.div>

          <div className={cx(leiyinDesignSystem.component.evidenceBoard.copyPanel, leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.heroCopy)}>
            <span className={cx('inline-flex border border-white/80 bg-white/70 px-4 py-2 text-gray-500 shadow-sm backdrop-blur-md', leiyinDesignSystem.radius.chip, leiyinDesignSystem.typography.meta)}>
              Design Leadership Profile
            </span>
            <h1 className={leiyinDesignSystem.typography.display}>
              12+ years of design leadership across B2B and B2C ecosystems.
            </h1>
            <p className={cx('max-w-xl md:text-base', leiyinDesignSystem.typography.body)}>
              Expert in 0-to-1 product incubation, multi-million-dollar monetization, and enterprise platform governance
              across education, gaming, creator tools, and AI-driven product experiences.
            </p>
          </div>

          <div className={leiyinDesignSystem.component.evidenceBoard.desktopCardLayer}>
            {evidenceCards.map((card, index) => {
              const variant = leiyinDesignSystem.component.evidenceCard.variants[card.variant];

              return (
                <motion.div
                  key={card.label}
                  drag
                  dragConstraints={evidenceBoardRef}
                  dragElastic={0.08}
                  dragMomentum={false}
                  onDragStart={() => setHasDraggedEvidenceCard(true)}
                  whileDrag={{ scale: 1.03, zIndex: 40 }}
                  initial={{ opacity: 0, y: 26, rotate: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...leiyinDesignSystem.motion.page, delay: 0.15 + index * leiyinDesignSystem.motion.evidenceStagger }}
                  className={cx(
                    leiyinDesignSystem.component.evidenceCard.base,
                    variant.position,
                    leiyinDesignSystem.radius.panel,
                    leiyinDesignSystem.surface.evidenceCard,
                    card.featured && cx('p-6', leiyinDesignSystem.surface.evidenceFeatured),
                  )}
                >
                  <div className={cx(leiyinDesignSystem.component.evidenceCard.accentBar, variant.accent)} />
                  <div className={leiyinDesignSystem.component.evidenceCard.metaRow}>
                    <span className={leiyinDesignSystem.typography.meta}>
                      {card.label}
                    </span>
                    <span className={cx(leiyinDesignSystem.component.evidenceCard.dot, variant.accent)} />
                  </div>
                  <div className={leiyinDesignSystem.component.evidenceCard.valueRow}>
                    <h2 className={card.featured ? leiyinDesignSystem.component.evidenceCard.featuredValue : leiyinDesignSystem.component.evidenceCard.value}>
                      {card.value}
                    </h2>
                    <span className={cx(leiyinDesignSystem.component.evidenceCard.unit, leiyinDesignSystem.typography.meta)}>{card.unit}</span>
                  </div>
                  <p className={leiyinDesignSystem.component.evidenceCard.note}>{card.note}</p>
                </motion.div>
              );
            })}
          </div>

          <div className={leiyinDesignSystem.component.evidenceBoard.mobileCardLayer}>
            {evidenceCards.map((card) => {
              const variant = leiyinDesignSystem.component.evidenceCard.variants[card.variant];

              return (
              <div key={card.label} className={cx(leiyinDesignSystem.surface.evidenceCard, leiyinDesignSystem.radius.panel, leiyinDesignSystem.component.evidenceCard.mobile)}>
                <div className={cx(leiyinDesignSystem.component.evidenceCard.mobileAccentBar, variant.accent)} />
                <span className={leiyinDesignSystem.typography.meta}>{card.label}</span>
                <h2 className={leiyinDesignSystem.component.evidenceCard.mobileValue}>{card.value}</h2>
                <span className={leiyinDesignSystem.typography.meta}>{card.unit}</span>
                <p className={leiyinDesignSystem.component.evidenceCard.mobileNote}>{card.note}</p>
              </div>
              );
            })}
          </div>
        </motion.div>

      </div>

      <div className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={leiyinDesignSystem.motion.section}
          className="space-y-6"
        >
          <div className="flex items-end justify-between gap-6">
            <span className={leiyinDesignSystem.typography.caption}>Achievement Index</span>
            <span className="hidden text-xs font-semibold text-gray-400 md:block">Career evidence at a glance</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {homeCareerHighlights.map((block, index) => (
              <Link
                key={block.title}
                to="/career"
                className={cx(
                  'group relative flex min-h-64 flex-col justify-between overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-gray-200',
                  leiyinDesignSystem.radius.panel,
                  leiyinDesignSystem.surface.card,
                  leiyinDesignSystem.surface.hoverCard,
                  leiyinDesignSystem.gradient.card,
                )}
              >
                <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className={cx('grid h-9 w-9 place-items-center bg-gray-50 text-[10px] font-mono text-gray-400', leiyinDesignSystem.radius.chip)}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={cx('bg-blue-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600', leiyinDesignSystem.radius.chip)}>
                      Career
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h2 className={cx(leiyinDesignSystem.typography.cardTitle, 'leading-tight group-hover:text-blue-600')}>
                      {block.title}
                    </h2>
                    <p className={leiyinDesignSystem.typography.body}>{block.description}</p>
                  </div>
                </div>
                <span className={cx('mt-8 transition-colors group-hover:text-gray-900', leiyinDesignSystem.typography.meta)}>
                  View Detail
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <div className={cx('grid gap-6 px-6 py-6 md:grid-cols-[1fr_auto] md:items-center md:px-8', leiyinDesignSystem.radius.card, leiyinDesignSystem.surface.soft)}>
        <div className="space-y-2">
          <span className={leiyinDesignSystem.typography.caption}>Contact</span>
          <p className={cx('max-w-2xl', leiyinDesignSystem.typography.body)}>
            Open to professional exchange and collaboration conversations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <a
            href="mailto:placeholder@example.com"
            className={cx('bg-black px-5 py-4 text-white transition-colors hover:bg-blue-600', leiyinDesignSystem.radius.chip, leiyinDesignSystem.typography.button)}
          >
            Email
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className={cx('border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-black', leiyinDesignSystem.radius.chip, leiyinDesignSystem.typography.button)}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </PageShell>
  );
}

export function FrameworkAbout() {
  return (
    <PageShell
      eyebrow="个人详情"
      title="About"
      description="About 页面负责讲清楚我是谁，并集中展示我的成就清单。用户在这里形成对我的整体判断，再进入 Career 查看成就详情。"
    >
      <OutlineList blocks={aboutBlocks} />
      <div className={cx('mt-12 p-8', leiyinDesignSystem.radius.card, leiyinDesignSystem.surface.soft)}>
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <span className={leiyinDesignSystem.typography.caption}>Next</span>
          <div className="space-y-5">
            <h2 className={leiyinDesignSystem.typography.cardTitle}>从成就清单进入 Career。</h2>
            <p className={leiyinDesignSystem.typography.body}>
              About 只负责列出主要成就和能力结构，不展开具体项目细节。用户如果想知道这些成就是怎么来的，应进入 Career 查看对应详情。
            </p>
            <Link
              to="/career"
              className={cx('inline-flex border border-black px-5 py-3 transition-colors hover:bg-black hover:text-white', leiyinDesignSystem.typography.button)}
            >
              查看 Career 详情
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function FrameworkCareer() {
  return (
    <PageShell
      eyebrow="成就详情"
      title="Career"
      description="Career 页面负责展开 About 里列出的成就，说明每个成就背后的项目、角色、证据、影响和职业思考。"
    >
      <OutlineList blocks={careerBlocks} />
    </PageShell>
  );
}

export function FrameworkDesignSystem() {
  return (
    <PageShell
      eyebrow="内部规范"
      title="Leiyin Design System"
      description="按照 TTEP 的结构方法，沉淀 Leiyin 自己的设计系统：先定义主题，再规范基础 token、页面结构、组件语言、表达模式和治理边界。"
    >
      <div className="space-y-16">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {designSystemLayers.map((layer, index) => (
            <motion.article
              key={layer.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: leiyinDesignSystem.motion.card.duration, delay: index * leiyinDesignSystem.motion.stagger }}
              className={cx('p-6', leiyinDesignSystem.radius.card, leiyinDesignSystem.surface.card)}
            >
              <span className="text-[10px] font-mono text-gray-300">{String(index + 1).padStart(2, '0')}</span>
              <span className={cx('mt-8 block text-blue-600', leiyinDesignSystem.typography.meta)}>
                {layer.name}
              </span>
              <h2 className={cx('mt-3', leiyinDesignSystem.typography.cardTitle)}>{layer.title}</h2>
              <p className={cx('mt-4', leiyinDesignSystem.typography.body)}>{layer.description}</p>
            </motion.article>
          ))}
        </section>

        <section className={cx('overflow-hidden border border-white/70 p-7 md:p-10', leiyinDesignSystem.radius.feature, leiyinDesignSystem.gradient.definition, leiyinDesignSystem.surface.focus)}>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-5">
              <span className={cx(leiyinDesignSystem.typography.caption, 'text-gray-500')}>Definition</span>
              <h2 className={cx('max-w-lg', leiyinDesignSystem.typography.display)}>
                A personal evidence system, not a generic portfolio template.
              </h2>
              <p className={cx('max-w-xl', leiyinDesignSystem.typography.bodyStrong)}>
                Leiyin 的设计系统服务于“让海外受众快速判断专业能力”。它保留个人网站的叙事感，同时用设计系统的结构方法避免页面变成临时拼贴。
              </p>
            </div>
            <div className="grid gap-3">
              {leiyinThemeDefinition.map(([name, value]) => (
                <div key={name} className={cx('grid gap-3 bg-white/60 p-5 md:grid-cols-[150px_1fr]', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.glass)}>
                  <span className={leiyinDesignSystem.typography.meta}>{name}</span>
                  <span className={leiyinDesignSystem.typography.bodyStrong}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-5">
              <span className={leiyinDesignSystem.typography.caption}>Color System</span>
              <h2 className={leiyinDesignSystem.typography.display}>哪些颜色可以用，以及怎么用。</h2>
              <p className={leiyinDesignSystem.typography.body}>
                Leiyin 的色彩系统不是为了展示完整彩虹色板，而是帮助后续设计判断：哪些颜色承担文字、背景、证据、行动和光源。读者看到这里应该知道“能用什么、用在哪里、不要怎么用”。
              </p>
              <div className="grid gap-2">
                {colorUsageRules.map(([type, rule]) => (
                  <div
                    key={rule}
                    className={`${leiyinDesignSystem.radius.inner} p-4 text-xs font-semibold leading-6 ${
                      type === 'Do' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className="mr-2 text-[10px] font-black uppercase tracking-[0.2em]">{type}</span>
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {colorPrimitives.map((group) => (
                <article key={group.group} className={cx('p-5', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.card)}>
                  <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className={leiyinDesignSystem.typography.cardTitle}>{group.group}</h3>
                      <p className="mt-2 text-xs font-semibold leading-6 text-gray-500">{group.purpose}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.colors.map(([name, value, usage]) => (
                      <div key={name} className={cx('p-3', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.soft)}>
                        <div className="h-20 rounded-2xl border border-black/5" style={{ backgroundColor: value }} />
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <span className="text-sm font-semibold text-gray-900">{name}</span>
                          <code className="text-[11px] font-bold text-gray-400">{value}</code>
                        </div>
                        <p className="mt-2 text-xs font-medium leading-5 text-gray-500">{usage}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className={cx('p-6', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.card)}>
              <div className="mb-6">
                <span className={leiyinDesignSystem.typography.caption}>Semantic Tokens</span>
                <h3 className={cx('mt-4', leiyinDesignSystem.typography.sectionTitle)}>语义用色</h3>
                <p className={cx('mt-3 max-w-2xl', leiyinDesignSystem.typography.body)}>
                  语义色负责告诉设计者“这个颜色为什么存在”。实际页面优先按语义选择颜色，而不是直接按视觉喜好选色。
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {colorSemantics.map(([name, value, usage, rule]) => (
                  <div key={name} className="grid gap-4 py-4 md:grid-cols-[44px_150px_1fr]">
                    <span className="h-10 w-10 rounded-full border border-black/5" style={{ backgroundColor: value }} />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
                      <code className="mt-1 block text-[11px] font-bold text-gray-400">{value}</code>
                    </div>
                    <p className="text-xs font-medium leading-6 text-gray-500">
                      <span className="font-semibold text-gray-700">{usage}。</span>
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className={cx('p-6', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.soft)}>
              <div className="mb-6">
                <span className={leiyinDesignSystem.typography.caption}>Examples</span>
                <h3 className={cx('mt-4', leiyinDesignSystem.typography.sectionTitle)}>组件中的用法</h3>
              </div>
              <div className="grid gap-4">
                {colorExamples.map((example) => (
                  <article key={example.name} className={cx('bg-white p-5', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.example)}>
                    <div className="mb-4 flex gap-2">
                      {example.swatches.map((value) => (
                        <span key={value} className="h-8 flex-1 rounded-full border border-black/5" style={{ backgroundColor: value }} />
                      ))}
                    </div>
                    <h4 className="text-lg font-semibold tracking-tight text-gray-900">{example.name}</h4>
                    <p className="mt-3 text-xs font-medium leading-6 text-gray-500">{example.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className={leiyinDesignSystem.typography.caption}>Foundation</span>
              <h2 className={cx('mt-4', leiyinDesignSystem.typography.sectionTitle)}>基础 Token</h2>
            </div>
            <p className={cx('max-w-md', leiyinDesignSystem.typography.body)}>
              参考 TTEP 的 Foundation 思路，但 Leiyin 的 token 必须服务个人证据表达、国际可信度和年轻但克制的视觉记忆点。
            </p>
          </div>
          <div className="grid gap-5">
            {foundationGroups.map((group) => (
              <article key={group.eyebrow} className={cx('p-6', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.card)}>
                <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
                  <div className="space-y-4">
                    <span className={cx('text-blue-600', leiyinDesignSystem.typography.meta)}>{group.eyebrow}</span>
                    <h3 className={leiyinDesignSystem.typography.sectionTitle}>{group.title}</h3>
                    <p className={leiyinDesignSystem.typography.body}>{group.description}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.items.map(([name, spec, usage]) => (
                      <div key={name} className={cx('p-4', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.soft)}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm font-semibold text-gray-900">{name}</span>
                          <code className="text-right text-[11px] font-bold text-gray-400">{spec}</code>
                        </div>
                        <p className="mt-4 text-xs font-medium leading-6 text-gray-500">{usage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <span className={leiyinDesignSystem.typography.caption}>Layout</span>
            <h2 className={leiyinDesignSystem.typography.sectionTitle}>页面结构</h2>
            <p className={leiyinDesignSystem.typography.body}>
              TTEP 把 Layout 独立成系统层。Leiyin 也需要明确每个页面在叙事路径中的职责，避免 Home、About、Career 内容互相重复。
            </p>
          </div>
          <div className={cx('divide-y divide-gray-100', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.card)}>
            {layoutRules.map((rule, index) => (
              <div key={rule.name} className="grid gap-4 p-5 md:grid-cols-[72px_140px_1fr]">
                <span className="font-mono text-xs text-gray-300">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-gray-900">{rule.name}</h3>
                  <span className={cx('mt-2 block text-blue-600', leiyinDesignSystem.typography.meta)}>{rule.role}</span>
                </div>
                <p className={leiyinDesignSystem.typography.body}>{rule.rule}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className={leiyinDesignSystem.typography.caption}>Components</span>
              <h2 className={cx('mt-4', leiyinDesignSystem.typography.sectionTitle)}>组件规则</h2>
            </div>
            <p className={cx('max-w-md', leiyinDesignSystem.typography.body)}>
              组件不是通用控件库，而是 Leiyin 叙事里的证据容器。每个组件都必须说明它承接哪类信息。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {componentRules.map((rule) => (
              <article key={rule.name} className={cx('p-6', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.card)}>
                <h3 className={leiyinDesignSystem.typography.cardTitle}>{rule.name}</h3>
                <div className="mt-6 grid gap-3">
                  <p className={cx('bg-blue-50 p-4 text-xs font-semibold leading-6 text-blue-700', leiyinDesignSystem.radius.inner)}>Anatomy：{rule.anatomy}</p>
                  <p className={cx('p-4 text-xs font-semibold leading-6 text-gray-500', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.soft)}>Rule：{rule.rule}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={cx('grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.soft)}>
            <div className="space-y-4">
              <span className={cx('text-blue-600', leiyinDesignSystem.typography.meta)}>Evidence Board Spec</span>
              <h3 className={leiyinDesignSystem.typography.sectionTitle}>首页头部布局规范</h3>
              <p className={leiyinDesignSystem.typography.body}>
                首页头部必须引用 DS：视觉背景保持内容区宽度，卡片默认分布在主信息右侧，拖拽边界独立扩大。默认状态不能遮盖主判断语。
              </p>
              <div className="grid gap-3">
                {evidenceBoardSpecs.map(([name, spec, rule]) => (
                  <div key={`${name}-${spec}`} className={cx('grid gap-2 bg-white p-4 md:grid-cols-[140px_160px_1fr]', leiyinDesignSystem.radius.inner)}>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{name}</span>
                    <code className="text-xs font-bold text-gray-900">{spec}</code>
                    <span className="text-xs font-medium leading-6 text-gray-500">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={cx('bg-white p-5', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.example)}>
              <span className={leiyinDesignSystem.typography.meta}>Card Variants</span>
              <div className="mt-5 grid gap-3">
                {evidenceCardVariantSpecs.map((variant) => (
                  <div key={variant.name} className={cx('p-4', leiyinDesignSystem.radius.inner, leiyinDesignSystem.surface.soft)}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold capitalize tracking-tight text-gray-900">{variant.name}</span>
                      <span className={cx('h-2.5 w-12 rounded-full bg-gradient-to-r', variant.accent)} />
                    </div>
                    <code className="text-[11px] font-semibold leading-5 text-gray-400">{variant.position}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className={leiyinDesignSystem.typography.caption}>Patterns</span>
              <h2 className={cx('mt-4', leiyinDesignSystem.typography.sectionTitle)}>表达模式</h2>
            </div>
            <p className={cx('max-w-md', leiyinDesignSystem.typography.body)}>
              参考 TTEP 的 Key pages / patterns 思路，但 Leiyin 的模式重点是“如何证明能力”，不是“如何搭建产品页面”。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {patternRules.map((rule) => (
              <article key={rule.name} className={cx('p-6', leiyinDesignSystem.radius.panel, leiyinDesignSystem.surface.soft)}>
                <h3 className={leiyinDesignSystem.typography.cardTitle}>{rule.name}</h3>
                <p className={cx('mt-4', leiyinDesignSystem.typography.body)}>{rule.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={cx('bg-black p-7 text-white md:p-10', leiyinDesignSystem.radius.panel)}>
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <span className={leiyinDesignSystem.typography.darkCaption}>Motion & Governance</span>
              <h2 className={leiyinDesignSystem.typography.sectionTitle}>动效与治理</h2>
              <p className={leiyinDesignSystem.typography.darkBody}>
                动效用于建立年轻节奏和注意力引导；治理规则用于保证后续迭代不会偏离证据、可信度和跨文化表达。
              </p>
            </div>
            <div className="grid gap-6">
              <div className="grid gap-3">
                {motionRules.map(([name, usage]) => (
                  <div key={name} className="grid gap-2 rounded-2xl bg-white/8 p-4 md:grid-cols-[160px_1fr]">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{name}</span>
                    <span className={leiyinDesignSystem.typography.darkBody}>{usage}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 border-t border-white/10 pt-6">
                {governanceRules.map(([name, usage]) => (
                  <div key={name} className="grid gap-2 rounded-2xl bg-white/8 p-4 md:grid-cols-[160px_1fr]">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{name}</span>
                    <span className={leiyinDesignSystem.typography.darkBody}>{usage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
