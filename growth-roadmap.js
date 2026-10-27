// Workflow labels describe stages, not inferred completion or invented progress.
const task=(id,title,status,statusLabel,workflow=[],extra={})=>({
  id,title,status,statusLabel,workflow,logo:'>',...extra,
  ...(status==='done'?{progress:100}:{})
});
export const growthRoadmap=[
  {id:'influence',name:'Design Influence',kicker:'01 / MAKE AN IMPACT',desc:'Let design travel. Let impact stay.',icon:'award',cards:[
    {id:'awards',category:'RECOGNITION',title:'International Design Awards',desc:'11 international design awards · 11 Chinese patents (3 invention + 8 design)',open:true,tasks:[
      task('reddot','Red Dot Award','done','Won',[],{logo:'reddot',awardCount:2,works:[
        {year:2026,name:'Tmates',url:''},
        {year:2025,name:'SoulNest',url:''}
      ]}),
      task('if','iF Design Award','done','Won',[],{logo:'if',awardCount:2,works:[
        {year:2026,name:'Semi Design System',url:''},
        {year:2026,name:'TikTok Customer Service Platform',url:''}
      ]}),
      task('a-design',"A' Design Award",'done','Won',[],{logo:'adesign',awardCount:1,works:[
        {year:2026,name:'CollabAgents',url:''}
      ]}),
      task('muse-2025','MUSE Design Awards','done','Won',[],{logo:'muse',awardCount:1,works:[
        {year:2025,name:'SoulNest',url:''}
      ]}),
      task('london-2025','London Design Awards','done','Won',[],{logo:'london',awardCount:1,works:[
        {year:2025,name:'CollabAgents',url:''}
      ]}),
      task('ny-2025','NY Product Design Awards','done','Won',[],{logo:'ny',awardCount:1,works:[
        {year:2025,name:'SoulNest',url:''}
      ]}),
      task('award-entries','AI Agent Workbench · Eight-Award Full-Coverage Entries','preparing','In preparation',['Materials','Submissions','Judging','Results'],{
        featured:true,optional:true,logo:'+',
        nextStep:'Confirm which interfaces can go public; nearest deadlines — Webby early bird Oct 30, iF Nov 2',
        detail:['The Webby Awards, 31st','iF DESIGN AWARD 2027','UX Design Awards Spring 2027','MUSE Design Awards 2027','French Design Awards 2027','Indigo Design Award 2027','C-IDEA 2027','ADC Annual Awards, 106th']
      })
    ]},
    {id:'jury',category:'JURY',title:'Jury Seats',desc:'Trade winning work for a jury seat — and let the seat amplify the next win.',open:true,tasks:[
      task('muse-jury','MUSE Design Awards — Juror','review','Under committee review',['Application','Materials','Committee review','Decision'],{logo:'muse',nextStep:"Await the committee's decision"}),
      task('stevie-jury','Stevie Awards — Juror','review','Pending review',['Application (all 9 programs)','Review','2027 judging pool'],{logo:'S',nextStep:'Await review'}),
      task('a-jury',"A' Design Award — Juror",'review','Awaiting panel review',['Application','Preliminary evaluation passed','Panel review (January 2027)','Decision'],{logo:'adesign',nextStep:'Panel review in January 2027'}),
      task('uci-jury','UC Irvine — Design Juror','confirmed','Confirmed (date tentative)',['Invitation','Date confirmation','On-site judging'],{logo:'UCI',nextStep:'Late March 2027; confirm the exact date'})
    ]},
    {id:'speaking',category:'SHARING',title:'Talks & Public Sharing',desc:'Turn design experience into shareable points of view.',open:true,tasks:[
      task('cafa-talk','Talk at the Central Academy of Fine Arts · "TikTok and the Influence of Global Culture"','preparing','In preparation',['Topic confirmed','PR clearance','Talk draft','Review','On stage'],{logo:'T',nextStep:'Submit PR clearance in January 2027; on stage mid-March 2027 (tentative), Beijing'}),
      task('community-talk','Community Sessions / Workshops','notstarted','Not started',['Topic','Outreach','Live session'],{logo:'W'}),
      task('design-article','A Design Retrospective Article','notstarted','Not started',['Topic','Draft','Publish'],{logo:'Aa'})
    ]}
  ]},
  {id:'craft',name:'Craft & Innovation',kicker:'02 / PUSH THE CRAFT',desc:'Polish the details. Explore new answers.',icon:'craft',cards:[
    {id:'case-studies',category:'PORTFOLIO',title:'Selected Work & Case Studies',desc:'Not just outcomes — the reasoning behind them.',open:true,tasks:[
      task('workbench-case','AI Agent Workbench — Flagship Case Study','preparing','In preparation',['Problem framing','Process','Design impact'],{logo:'C1',nextStep:'Lock the public-disclosure scope first; one material set shared with the award entries in Module 01'}),
      task('portfolio-site','Personal Portfolio Site — Always Becoming','ongoing','In build',['Style direction','Layout build','Content','Launch'],{logo:'AB',nextStep:'Complete by December 31, 2026'}),
      task('interaction-study','Interaction Details Study','notstarted','Not started',['Collect','Prototype','Case write-up'],{logo:'C2',optional:true})
    ]},
    {id:'systems',category:'DESIGN SYSTEMS',title:'Reusable Design Methods',desc:'Do it right once — and make it the starting point for next time.',open:true,tasks:[
      task('enterprise-system','Enterprise Operations-Platform Design System','ongoing','Ongoing build',['Audit','Standards','Components','Adoption'],{logo:'UI',nextStep:'Leading the TikTok operations platform & design system team'}),
      task('method-cards','Design Method Cards','notstarted','Not started',['Record','Distill','Reuse'],{logo:'M'})
    ]},
    {id:'experiments',category:'EXPERIMENTS',title:'Design Lab',desc:'Small experiments to test new design possibilities.',open:true,tasks:[
      task('ai-site','Building a Personal Site with an AI Pair-Programmer','ongoing','In progress',['Concept','Build','Launch & iterate'],{logo:'</>',subtitle:'This site is the outcome'}),
      task('agent-prototype','Agent Interaction Prototype Experiments','preparing','In preparation',['Scenario','Interaction prototype','Validation'],{logo:'A'})
    ]}
  ]},
  {id:'people',name:'People & Leadership',kicker:'03 / GROW TOGETHER',desc:'Help others grow. Make collaboration stronger.',icon:'people',cards:[
    {id:'mentoring',category:'MENTORSHIP',title:'Mentoring & Talent Growth',desc:"Turn personal experience into someone else's next step.",open:true,tasks:[
      task('growth-conversations','One-on-One Growth Conversations with Designers','ongoing','Ongoing',['Goal alignment','Conversation','Follow-up'],{logo:'1:1'}),
      task('portfolio-feedback','Portfolio Feedback Notes','notstarted','Not started',['Read','Feedback','Action items'],{logo:'F',optional:true})
    ]},
    {id:'team',category:'TEAM',title:'Team Building & Collaboration',desc:'Turn scattered ideas into shared action.',open:true,tasks:[
      task('hiring-designer','Hiring — Full-Time Product Designer','ongoing','In progress',['Job post','Interviews','Onboard'],{logo:'H',nextStep:'~3 years of experience, strong visual craft, operations-platform team'}),
      task('hiring-intern','Hiring — Design Intern','ongoing','In progress',['Job post','Interviews','Onboard'],{logo:'H',nextStep:'3+ months; UX workflow and international-award project incubation'}),
      task('review-ritual','Design Review Ritual','ongoing','Piloting',['Topics','Pilot','Feedback'],{logo:'R'})
    ]},
    {id:'leadership',category:'LEADERSHIP',title:'Leadership Practice',desc:'Learn from concrete judgment calls and feedback.',open:true,tasks:[
      task('team-delivery','Leading Delivery — Operations Platform & Design System','ongoing','Ongoing',['Goals','Delivery','Retrospective'],{logo:'L'}),
      task('decision-notes','Decision & Feedback Retrospectives','preparing','In preparation',['Record','Reflect','Next practice'],{logo:'N'})
    ]}
  ]},
  {id:'ai',name:"AI & What's Next",kicker:'04 / STAY CURIOUS',desc:'Stay curious. Turn the unknown into testable exploration.',icon:'spark',cards:[
    {id:'ai-observation',category:'AI × DESIGN',title:'AI Design Observation',desc:'Make new tools part of everyday design.',open:true,tasks:[
      task('agent-micro','Agent Experience Micro-Experiments','preparing','In preparation',['Scenario','Interaction','Validation'],{logo:'A'}),
      task('ai-field-notes','AI Product Field Notes','preparing','In preparation',['Try','Compare','Record'],{logo:'N'})
    ]},
    {id:'next-interface',category:"WHAT'S NEXT",title:'Next-Generation Interaction',desc:'New relationships between people and intelligence.',open:true,tasks:[
      task('multimodal','Multimodal Experience Observations','notstarted','Not started',['Experience','Record','Hypotheses'],{logo:'O'}),
      task('next-question','The Next Question Worth Testing','notstarted','Not started',['Observe','Hypothesize','Micro-experiment'],{logo:'?'})
    ]},
    {id:'learning',category:'LEARNING LOG',title:'Continuous Learning & Observation',desc:'Leave curiosity a paper trail.',open:true,tasks:[
      task('portfolio-research','Designer Portfolio Research','ongoing','Ongoing',['Daily collecting','Scoring calibration','Method notes'],{logo:'P',subtitle:'100+ cases and counting'}),
      task('masters',"Part-Time Master's Application",'preparing','In preparation',['School selection','Materials','Application'],{logo:'M',optional:true,note:'Fully remote, study while working.'})
    ]}
  ]}
];
