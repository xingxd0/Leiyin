export const growthRoadmap=[
  {id:'influence',name:'Design Influence',kicker:'01 / MAKE AN IMPACT',desc:'让设计走出去，让影响留下来。',icon:'award',color:'#7ce5b1',cards:[
    {id:'awards',category:'RECOGNITION',title:'国际设计奖项',desc:'已获认可，也为下一个可能留个位置。',open:true,tasks:[
      {id:'if',title:'iF Design Award',subtitle:'已获奖',logo:'if',status:'done',progress:100,link:'https://ifdesign.com/en/',linkLabel:'奖项官网',note:'获奖年份、作品和级别待补充。'},
      {id:'reddot',title:'Red Dot Award',subtitle:'已获奖',logo:'reddot',status:'done',progress:100,link:'https://www.red-dot.org/award',linkLabel:'奖项官网',note:'获奖年份、作品和级别待补充。'},
      {id:'muse',title:'MUSE Design Awards',subtitle:'已获奖',logo:'muse',status:'done',progress:100,link:'https://design.museaward.com/',linkLabel:'奖项官网',note:'获奖年份、作品和级别待补充。'},
      {id:'next-award',title:'下一项国际奖项',subtitle:'奖项待确定',logo:'+',status:'preparing',progress:35,link:'',linkLabel:'',featured:true,workflow:['材料准备','提交','评审','结果'],note:'整理项目故事与参赛视觉材料'}
    ]},
    {id:'speaking',category:'SHARING',title:'讲座与公开分享',desc:'把设计经验，变成可分享的观点。',open:true,tasks:[
      {id:'talk-outline',title:'设计实践主题分享',subtitle:'主题提纲 → 案例 → 讲稿',logo:'T',status:'preparing',progress:40,link:'',note:'先梳理一个有具体案例的主题'},
      {id:'community-talk',title:'社区交流 / 工作坊',subtitle:'议题 → 联系 → 现场分享',logo:'W',status:'notstarted',progress:0,link:'',note:'选择一个适合讨论的设计问题'}
    ]},
    {id:'writing',category:'PUBLISHING',title:'写作与设计观点',desc:'持续整理，让思考有迹可循。',open:false,tasks:[
      {id:'design-essay',title:'写一篇设计复盘',subtitle:'选题 → 初稿 → 发布',logo:'Aa',status:'preparing',progress:25,link:'',note:'从一个真实的设计取舍写起'},
      {id:'publish-essay',title:'整理公开案例索引',subtitle:'收集 → 编排 → 公开',logo:'↗',status:'notstarted',progress:0,link:'',note:'补充可公开的案例与来源链接'}
    ]}
  ]},
  {id:'craft',name:'Craft & Innovation',kicker:'02 / PUSH THE CRAFT',desc:'打磨细节，也探索新的解法。',icon:'craft',color:'#b9a2e3',cards:[
    {id:'case-studies',category:'PORTFOLIO',title:'代表作品与案例',desc:'不止展示结果，也讲清设计为什么。',open:true,tasks:[
      {id:'core-case',title:'核心项目深度复盘',subtitle:'问题定义 → 过程 → 设计影响',logo:'C1',status:'preparing',progress:60,link:'',note:'补齐关键决策的过程证据'},
      {id:'interaction-case',title:'交互细节专题',subtitle:'收集 → 原型 → 案例整理',logo:'C2',status:'notstarted',progress:0,link:'',note:'挑选一个能说明设计判断的交互'}
    ]},
    {id:'experiments',category:'EXPERIMENTS',title:'设计实验室',desc:'用小实验，检验新的设计可能。',open:true,tasks:[
      {id:'motion-prototype',title:'动效与交互原型',subtitle:'概念 → 可运行原型 → 评审',logo:'↔',status:'submitted',progress:75,link:'',note:'收集原型评审反馈，再迭代一轮'},
      {id:'creative-code',title:'Creative coding 练习',subtitle:'参考 → 实验 → 展示',logo:'</>',status:'preparing',progress:30,link:'',note:'完成一个可交互的小作品'}
    ]},
    {id:'systems',category:'DESIGN SYSTEMS',title:'可复用的设计方法',desc:'把一次做对，变成下一次的起点。',open:false,tasks:[
      {id:'component-kit',title:'组件与模式梳理',subtitle:'盘点 → 规范 → 验证',logo:'UI',status:'preparing',progress:20,link:'',note:'从最常使用的组件开始'},
      {id:'method-library',title:'设计方法卡片',subtitle:'记录 → 提炼 → 复用',logo:'M',status:'notstarted',progress:0,link:'',note:'提炼一次实践中的可复用方法'}
    ]}
  ]},
  {id:'people',name:'People & Leadership',kicker:'03 / GROW TOGETHER',desc:'帮助他人成长，让协作更有力量。',icon:'people',color:'#91b7dc',cards:[
    {id:'mentoring',category:'MENTORSHIP',title:'指导与人才成长',desc:'让个人经验，成为别人的下一步。',open:true,tasks:[
      {id:'mentoring-plan',title:'一对一成长交流',subtitle:'目标对齐 → 交流 → 回访',logo:'1:1',status:'preparing',progress:45,link:'',note:'整理交流提纲与可讨论的问题'},
      {id:'portfolio-feedback',title:'作品集反馈笔记',subtitle:'阅读 → 反馈 → 行动建议',logo:'↗',status:'notstarted',progress:0,link:'',note:'设计一套有具体依据的反馈结构'}
    ]},
    {id:'collaboration',category:'COLLABORATION',title:'建立更好的协作',desc:'把分散的想法，变成共同的行动。',open:true,tasks:[
      {id:'review-format',title:'设计评审机制',subtitle:'议题 → 试行 → 反馈',logo:'R',status:'preparing',progress:50,link:'',note:'明确每次评审要回答的关键问题'},
      {id:'shared-language',title:'跨职能协作备忘',subtitle:'访谈 → 共识 → 协作约定',logo:'Co',status:'submitted',progress:80,link:'',note:'等待协作方对备忘的反馈'}
    ]},
    {id:'leadership',category:'LEADERSHIP',title:'领导力练习',desc:'从具体的判断和反馈中学习。',open:false,tasks:[
      {id:'leadership-notes',title:'决策与反馈复盘',subtitle:'记录 → 反思 → 下一次实践',logo:'L',status:'preparing',progress:15,link:'',note:'记录一次值得复盘的沟通'},
      {id:'team-workshop',title:'团队共创工作坊',subtitle:'准备 → 共创 → 跟进',logo:'WS',status:'notstarted',progress:0,link:'',note:'选择一个适合共同解决的议题'}
    ]}
  ]},
  {id:'ai',name:"AI & What's Next",kicker:'04 / STAY CURIOUS',desc:'保持好奇，把未知变成可验证的探索。',icon:'spark',color:'#deb985',cards:[
    {id:'ai-workflow',category:'AI × DESIGN',title:'AI 设计工作流',desc:'让新工具真正进入日常设计。',open:true,tasks:[
      {id:'ai-prototype',title:'从想法到可运行原型',subtitle:'需求 → 生成 → 验证',logo:'>_',status:'preparing',progress:65,link:'',note:'验证关键交互，而不只看静态效果'},
      {id:'prompt-library',title:'可复用的提示词库',subtitle:'收集 → 测试 → 归档',logo:'P',status:'preparing',progress:35,link:'',note:'为每条提示词保留输入与效果对照'}
    ]},
    {id:'next-interface',category:'WHAT’S NEXT',title:'下一代交互探索',desc:'关注人与智能之间的新关系。',open:true,tasks:[
      {id:'agent-experience',title:'Agent 体验小实验',subtitle:'场景 → 交互 → 验证',logo:'A',status:'preparing',progress:20,link:'',note:'选一个有明确边界的代理任务'},
      {id:'multimodal',title:'多模态体验观察',subtitle:'体验 → 记录 → 假设',logo:'◉',status:'notstarted',progress:0,link:'',note:'记录语音、视觉与界面的协作方式'}
    ]},
    {id:'learning',category:'LEARNING LOG',title:'持续学习与观察',desc:'把好奇心留下，再走远一点。',open:false,tasks:[
      {id:'research-notes',title:'AI 产品观察手记',subtitle:'体验 → 对比 → 记录',logo:'N',status:'preparing',progress:25,link:'',note:'用同一个任务比较两种产品体验'},
      {id:'next-hypothesis',title:'下一个值得验证的问题',subtitle:'观察 → 假设 → 小实验',logo:'?',status:'notstarted',progress:0,link:'',note:'从日常使用中的一个真实困惑出发'}
    ]}
  ]}
];
