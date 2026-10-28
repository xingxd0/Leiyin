// Workflow labels describe stages, not inferred completion or invented progress.
const task=(id,title,status,statusLabel,workflow=[],extra={})=>({
  id,title,status,statusLabel,workflow,logo:'>',...extra,
  ...(status==='done'?{progress:100}:{})
});
export const growthRoadmap=[
  {id:'craft',name:'Craft & Innovation',kicker:'01 / PUSH THE CRAFT',desc:'Turn complex problems into clear, reusable experiences.',icon:'craft',cards:[
    {id:'case-studies',category:'PORTFOLIO',title:'Selected Work & Case Studies',desc:'Not just outcomes — the reasoning behind them.',open:true,tasks:[
      task('workbench-case','AI Agent Workbench — Flagship Case Study','preparing','Preparing',['Problem framing','Process','Design impact'],{logo:'C1',why:'Make the design decisions behind AI-assisted work visible, including how people stay in control.',nextStep:'Confirm which screens and outcomes can be shared, then outline the case study. Reuse this evidence for the award submissions.'}),
      task('interaction-study','CUI × GUI in AI Products','notstarted','Not started',['Research','Prototypes','Validation'],{logo:'C2',optional:true,why:'Let people express intent through conversation and refine the outcome with precise visual controls.',subtitle:'Explore how conversation and visual interfaces work together.'})
    ]},
    {id:'systems',category:'DESIGN SYSTEMS',title:'Reusable Design Methods',desc:'Do it right once — and make it the starting point for next time.',open:true,tasks:[
      task('enterprise-system','Enterprise Operations-Platform Design System','ongoing','In progress',['Audit','Standards','Components','Adoption'],{logo:'UI',nextStep:'Define the next component or guideline deliverables and how their adoption will be checked'}),
      task('method-cards','Design Method Cards','notstarted','Not started',['Record','Distill','Reuse'],{logo:'M',optional:true,nextStep:'Select one completed practice and turn it into a reusable method card'})
    ]},
    {id:'patents',category:'INNOVATION',title:'Patents',desc:'Documented inventions and design contributions.',open:true,tasks:[
      task('chinese-patents','11 Chinese Patents','done','Completed',[],{logo:'IP',subtitle:'3 invention patents · 8 design patents',note:'Patent records are separate from international design-award wins.'})
    ]}
  ]},
  {id:'influence',name:'Design Influence',kicker:'02 / MAKE AN IMPACT',desc:'Share experience. Broaden perspective.',icon:'award',cards:[
    {id:'awards',category:'RECOGNITION',title:'International Design Awards',desc:'8 award wins across 6 award programs. Awarded works are listed below.',open:true,tasks:[
      task('reddot','Red Dot Award','done','Completed',[],{logo:'reddot',awardCount:2,works:[
        {year:2026,name:'Tmates',url:''},
        {year:2025,name:'SoulNest',url:''}
      ]}),
      task('if','iF Design Award','done','Completed',[],{logo:'if',awardCount:2,works:[
        {year:2026,name:'Semi Design System',url:''},
        {year:2026,name:'TikTok Customer Service Platform',url:''}
      ]}),
      task('a-design',"A' Design Award",'done','Completed',[],{logo:'adesign',awardCount:1,works:[
        {year:2026,name:'CollabAgents',url:''}
      ]}),
      task('muse-2025','MUSE Design Awards','done','Completed',[],{logo:'muse',awardCount:1,works:[
        {year:2025,name:'SoulNest',url:''}
      ]}),
      task('london-2025','London Design Awards','done','Completed',[],{logo:'london',awardCount:1,works:[
        {year:2025,name:'CollabAgents',url:''}
      ]}),
      task('ny-2025','NY Product Design Awards','done','Completed',[],{logo:'ny',awardCount:1,works:[
        {year:2025,name:'SoulNest',url:''}
      ]}),
      task('if-team','Help the Team Apply for the iF DESIGN AWARD','preparing','Preparing',[],{logo:'if',progress:80}),
      task('reddot-2027','Prepare for the Red Dot Award 2027','preparing','Preparing',[],{logo:'reddot',progress:10}),
      task('muse-entry','Apply for the MUSE Design Awards','preparing','Preparing',[],{logo:'muse',progress:40})
    ]},
    {id:'talk-judge',category:'TALK & JUDGE',title:'Talk & Judge',desc:'Share design experience and contribute professional judgment.',open:true,tasks:[
      task('muse-jury','MUSE Design Awards — Juror','review','Awaiting review',['Application','Materials','Committee review','Decision'],{logo:'muse',progress:90,nextStep:"Await the committee's decision"}),
      task('a-jury',"A' Design Award — Juror",'review','Awaiting review',['Application','Preliminary evaluation passed','Panel review (January 2027)','Decision'],{logo:'adesign',progress:90,nextStep:'Await panel review in January 2027'}),
      task('uci-jury','UC Irvine — Design Juror','preparing','Working toward this opportunity',[],{logo:'UCI',nextStep:'Work toward a design-juror opportunity at UC Irvine'}),
      task('cafa-talk','Prepare for a Talk at the Central Academy of Fine Arts (CAFA), Beijing, China','preparing','Preparing',['Topic confirmed','PR clearance','Talk draft','Review','On stage'],{logo:'T',why:'Turn cross-cultural product-design experience into lessons students can understand and apply.',subtitle:'TikTok and the Influence of Global Culture',nextStep:'Submit PR clearance in January 2027; on stage mid-March 2027 (tentative), Beijing'}),
      task('community-talk','Community Sessions / Workshops','notstarted','Not started',['Topic','Outreach','Live session'],{logo:'W',optional:true,nextStep:'Choose one discussion topic and define a concrete takeaway before planning an event'}),
      task('design-article','A Design Retrospective Article','notstarted','Not started',['Topic','Draft','Publish'],{logo:'Aa',optional:true,nextStep:'Choose one real design decision and collect the evidence for a retrospective'})
    ]}
  ]},
  {id:'people',name:'People & Leadership',kicker:'03 / GROW TOGETHER',desc:'Help designers grow and make stronger decisions together.',icon:'people',cards:[
    {id:'mentoring',category:'MENTORSHIP',title:'Mentoring & Talent Growth',desc:"Turn personal experience into someone else's next step.",open:true,tasks:[
      task('growth-conversations','One-on-One Growth Conversations with Designers','ongoing','In progress',['Goal alignment','Conversation','Follow-up'],{logo:'1:1',nextStep:'Agree on one growth priority and a follow-up action for each conversation'}),
      task('portfolio-feedback','Portfolio Feedback Notes','notstarted','Not started',['Read','Feedback','Action items'],{logo:'F',optional:true})
    ]},
    {id:'team',category:'TEAM',title:'Team Building & Collaboration',desc:'Turn scattered ideas into shared action.',open:true,tasks:[
      task('hiring-designer','Hiring — Full-Time Product Designer','ongoing','In progress',['Job post','Interviews','Onboard'],{logo:'H',subtitle:'~3 years of experience · strong visual craft · operations-platform team',nextStep:'Confirm the role requirements and publish or refresh the job posting'}),
      task('hiring-intern','Hiring — Design Intern','ongoing','In progress',['Job post','Interviews','Onboard'],{logo:'H',subtitle:'3+ months · UX workflow and international-award project incubation',nextStep:'Confirm the internship scope and publish or refresh the job posting'}),
      task('review-ritual','Design Review Ritual','ongoing','In progress',['Topics','Pilot','Feedback'],{logo:'R',why:'Help the team build shared judgment and make stronger design decisions independently.',subtitle:'Pilot phase',nextStep:'Choose the next review topic and capture feedback on the pilot format'})
    ]},
    {id:'leadership',category:'LEADERSHIP',title:'Leadership Practice',desc:'Learn from concrete judgment calls and feedback.',open:true,tasks:[
      task('team-delivery','Leading Delivery — Operations Platform & Design System','ongoing','In progress',['Goals','Delivery','Retrospective'],{logo:'L',nextStep:'Agree on the next delivery milestone and document the review criteria'}),
      task('decision-notes','Decision & Feedback Retrospectives','preparing','Preparing',['Record','Reflect','Next practice'],{logo:'N',nextStep:'Document one recent decision, its outcome and what to try next'})
    ]}
  ]},
  {id:'ai',name:"AI & What's Next",kicker:'04 / STAY CURIOUS',desc:'Explore how AI can improve real work, beyond the novelty.',icon:'spark',cards:[
    {id:'ai-observation',category:'AI × DESIGN',title:'AI Design Observation',desc:'Make new tools part of everyday design.',open:true,tasks:[
      task('agent-micro','Agent Interaction Prototype Experiment','preparing','Preparing',['Scenario','Interaction','Validation'],{logo:'A',nextStep:'Select one bounded agent scenario, build its key interaction and define a validation question'}),
      task('ai-field-notes','AI Product Field Notes','preparing','Preparing',['Try','Compare','Record'],{logo:'N',nextStep:'Compare two AI products on the same task and record the interaction tradeoffs'})
    ]},
    {id:'next-interface',category:"WHAT'S NEXT",title:'Next-Generation Interaction',desc:'New relationships between people and intelligence.',open:true,tasks:[
      task('multimodal','Multimodal Experience Observations','notstarted','Not started',['Experience','Record','Hypotheses'],{logo:'O',optional:true,nextStep:'Choose one voice-and-visual interaction to observe and document'}),
      task('next-question','The Next Question Worth Testing','notstarted','Not started',['Observe','Hypothesize','Micro-experiment'],{logo:'?',optional:true,nextStep:'Write one question grounded in a real usage problem before starting an experiment'})
    ]},
    {id:'learning',category:'LEARNING LOG',title:'Continuous Learning & Observation',desc:'Leave curiosity a paper trail.',open:true,tasks:[
      task('portfolio-research','Designer Portfolio Research','ongoing','In progress',['Daily collecting','Scoring calibration','Method notes'],{logo:'P',subtitle:'100+ cases and counting',nextStep:'Select a small comparison set and summarize patterns that can improve this portfolio'}),
      task('masters',"Part-Time Master's Application",'preparing','Preparing',['School selection','Materials','Application'],{logo:'M',optional:true,note:'Fully remote, study while working.'})
    ]}
  ]}
];
