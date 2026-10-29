import {growthRoadmap} from '../growth-roadmap.js?v=20261028-input';
const recipes=[
  ['workbench','craft','AI Workbench Case Study',-1,-1,['workbench-case'],'C1'],
  ['cui-gui','craft','CUI × GUI Exploration',-2,-1,['interaction-study'],'C2'],
  ['design-methods','craft','Design Systems & Methods',-1,-2,['systems'],'UI'],
  ['patents','craft','11 Chinese Patents',-2,-2,['patents'],'IP'],
  ['award-wins','influence','International Award Wins',1,-1,['awards'],'★','done'],
  ['award-entries','influence','Team Award Applications',2,-2,['awards'],'↗','pending'],
  ['talk-judge','influence','Talk & Judge',3,-2,['talk-judge'],'T'],
  ['mentorship','people','Mentoring & Talent Growth',-1,1,['mentoring'],'1:1'],
  ['team-building','people','Team Building & Reviews',-2,2,['team'],'TM'],
  ['leadership','people','Leadership Practice',-3,2,['leadership'],'L'],
  ['ai-practice','ai','AI Experiments & Field Notes',1,1,['ai-observation'],'AI'],
  ['next-interface','ai','Next-Generation Interaction',2,1,['next-interface'],'◎'],
  ['continuous-learning','ai','Research & Continuous Learning',1,2,['learning'],'?']
];
export function buildMapContent(storage){
  const columns=growthRoadmap.map(c=>({...c,cards:c.cards.map(g=>({...g,tasks:g.tasks.filter(t=>!t.local).map(t=>({...t}))}))}));
  const groups=columns.flatMap(c=>c.cards),seen=new Set(groups.flatMap(g=>g.tasks.map(t=>t.id)));
  try{const saved=JSON.parse((storage??globalThis.localStorage)?.getItem('leiyin.todol.custom.v1')||'[]');if(Array.isArray(saved))for(const t of saved.slice(0,200)){
    const g=groups.find(g=>g.id===t?.cardId);if(!g||typeof t.id!=='string'||!t.id.startsWith('local-')||seen.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>500)continue;
    g.tasks.push({id:t.id,title:t.title,status:'notstarted',statusLabel:'Not started',local:true});seen.add(t.id);
  }}catch{}
  return recipes.map(([id,columnId,title,q,r,sources,symbol,kind])=>{
    const column=columns.find(c=>c.id===columnId);
    const tasks=column.cards.flatMap(g=>g.tasks.filter(t=>sources.includes(g.id)||sources.includes(t.id)||(id==='workbench'&&g.id==='case-studies'&&t.local))).filter(t=>!kind||(kind==='done')===(t.status==='done'));
    const completed=tasks.filter(t=>t.status==='done').length,done=tasks.length>0&&completed===tasks.length;
    const displayTitle=id==='award-wins'?`${tasks.reduce((sum,t)=>sum+(t.awardCount||0),0)} Design Award Wins`:title;
    return {id,columnId,title:displayTitle,q,r,symbol,tasks,completed,total:tasks.length,state:done?'done':'pending',label:done?'COMPLETED':`${tasks.length-completed} TO DO`,text:column.desc};
  }).filter(n=>n.total);
}
