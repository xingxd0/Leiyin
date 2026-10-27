import {growthRoadmap} from './growth-roadmap.js';

const $=id=>document.getElementById(id);
function element(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
}
let roadmapTrigger=null;
const roadmapStatuses={notstarted:'未开始',preparing:'准备中',submitted:'已提交',done:'已完成'};
const roadmapState={status:'all',query:'',open:{}};
const roadmapCards=growthRoadmap.flatMap(column=>column.cards);
const roadmapTasks=roadmapCards.flatMap(card=>card.tasks);
function roadmapIcon(name){
  const paths={
    award:'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM7 10l-1 7 4-2 4 2-1-7',
    craft:'m10 2 7 8-7 8-7-8 7-8ZM3 10h14M10 2v16',
    people:'M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 17v-2a6 6 0 0 1 12 0v2M14 3a3 3 0 0 1 0 6M16 12a5 5 0 0 1 2 5',
    spark:'m10 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z',
    search:'M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM13 13l4 4',
    chevron:'m5 7 5 5 5-5',
    collapse:'M5 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM7 10h6',
    arrow:'M6 14l8-8M6 6h8v8',
    check:'m4 10 4 4 8-8'
  };
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.setAttribute('viewBox','0 0 20 20');icon.setAttribute('aria-hidden','true');
  icon.classList.add('roadmap-icon');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',paths[name]);icon.append(path);return icon;
}
function roadmapCardOpen(card){
  return Object.hasOwn(roadmapState.open,card.id)?roadmapState.open[card.id]:card.open;
}
function matchingRoadmapTasks(card,column,includeStatus=true){
  const query=roadmapState.query.toLocaleLowerCase();
  return card.tasks.filter(task=>{
    const text=[column.name,column.desc,card.title,card.category,card.desc,task.title,task.subtitle,task.note,roadmapStatuses[task.status]].join(' ').toLocaleLowerCase();
    return (!query||text.includes(query))&&(!includeStatus||roadmapState.status==='all'||roadmapState.status===task.status);
  });
}
function roadmapLogo(task){
  const logo=element('span',`roadmap-logo roadmap-logo-${['if','reddot','muse'].includes(task.logo)?task.logo:'placeholder'}`);
  logo.setAttribute('aria-hidden','true');
  if(['if','reddot'].includes(task.logo)){
    const image=element('img');
    image.src=new URL(`./logo/${task.logo}.png`,import.meta.url).href;
    image.alt='';
    image.width=24;image.height=24;image.decoding='async';
    logo.append(image);
  }else logo.textContent=task.logo==='muse'?'M':task.logo;
  return logo;
}
function openRoadmapTask(task,card,button){
  roadmapTrigger=button;$('roadmapDialogTitle').textContent=task.title;
  $('roadmapDialogText').textContent=`${card.title} / ${roadmapStatuses[task.status]}。${task.subtitle}。`;
  const label=element('p','roadmap-detail-label');
  label.append(element('span','','事项进度'),element('span','',`${task.progress}%`));
  const bar=element('progress','roadmap-progress');bar.max=100;bar.value=task.progress;
  bar.setAttribute('aria-label',`${task.title}：事项进度`);
  $('roadmapDialogProgress').replaceChildren(label,bar,element('p','roadmap-detail-note',task.note));
  $('roadmapDialog').showModal();
}
function renderRoadmapTask(task,card){
  const item=element('article',`roadmap-item${task.featured?' roadmap-item-featured':''}`);
  item.dataset.item=task.id;item.dataset.status=task.status;
  const top=element('div','roadmap-item-top'),name=element('div','roadmap-item-name');
  const details=element('button','roadmap-item-title',task.title);
  details.type='button';details.setAttribute('aria-haspopup','dialog');
  details.onclick=()=>openRoadmapTask(task,card,details);
  name.append(details,element('p','roadmap-item-meta',task.subtitle));
  top.append(roadmapLogo(task),name);
  // Only explicitly supplied web destinations become outbound links.
  let url;
  try{url=new URL(task.link);}catch{}
  if(url&&['https:','http:'].includes(url.protocol)){
    const link=element('a','roadmap-item-link');link.href=url.href;
    link.target='_blank';link.rel='noopener noreferrer';
    link.setAttribute('aria-label',`${task.title}：${task.linkLabel}`);link.title=task.linkLabel;
    link.append(roadmapIcon('arrow'));top.append(link);
  }
  item.append(top);
  if(task.workflow){
    const steps=element('ol','roadmap-steps');steps.setAttribute('aria-label',`${task.title}申请流程`);
    const active=task.progress===100?task.workflow.length:task.progress>=75?2:task.progress>=50?1:task.progress>0?0:-1;
    task.workflow.forEach((label,index)=>{
      const step=element('li',`roadmap-step${index<active?' finished':index===active?' active':''}`);
      if(index===active)step.setAttribute('aria-current','step');
      const node=element('span','roadmap-step-node');node.setAttribute('aria-hidden','true');
      step.append(node,element('span','',label));steps.append(step);
    });
    item.append(steps);
  }
  const status=element('div','roadmap-item-status'),label=element('span','roadmap-status');
  label.append(task.status==='done'?roadmapIcon('check'):element('span','roadmap-dot'),document.createTextNode(roadmapStatuses[task.status]));
  status.append(label,element('span','roadmap-percent',`${task.progress}%`));item.append(status);
  if(task.status!=='done'){
    const bar=element('progress','roadmap-progress');bar.max=100;bar.value=task.progress;
    bar.setAttribute('aria-label',`${task.title}独立进度`);item.append(bar);
  }
  if(task.featured&&task.note){
    const note=element('p','roadmap-next-action');
    note.append(element('span','','下一步 '),document.createTextNode(task.note));item.append(note);
  }
  return item;
}
function updateRoadmapCollapse(){
  const visible=roadmapCards.filter(card=>document.getElementById(`roadmap-body-${card.id}`));
  $('roadmapCollapse').lastChild.textContent=visible.some(roadmapCardOpen)?'折叠全部':'展开全部';
  $('roadmapCollapse').disabled=!visible.length;
}
function renderRoadmapCard(card,tasks){
  const section=element('section','roadmap-card'),header=element('header','roadmap-card-header');
  section.dataset.card=card.id;
  header.append(element('span','roadmap-category',card.category));
  const heading=element('h3'),toggle=element('button','roadmap-card-toggle');toggle.type='button';
  toggle.setAttribute('aria-expanded',String(roadmapCardOpen(card)));
  toggle.setAttribute('aria-controls',`roadmap-body-${card.id}`);
  toggle.append(element('span','',card.title),roadmapIcon('chevron'));heading.append(toggle);
  header.append(heading,element('p','roadmap-card-description',card.desc));
  const body=element('div','roadmap-card-body');body.id=`roadmap-body-${card.id}`;
  body.hidden=!roadmapCardOpen(card);body.append(...tasks.map(task=>renderRoadmapTask(task,card)));
  toggle.onclick=()=>{
    roadmapState.open[card.id]=!roadmapCardOpen(card);body.hidden=!roadmapCardOpen(card);
    toggle.setAttribute('aria-expanded',String(roadmapCardOpen(card)));updateRoadmapCollapse();
  };
  section.append(header,body);return section;
}
function updateRoadmap(){
  const baseTasks=growthRoadmap.flatMap(column=>column.cards.flatMap(card=>matchingRoadmapTasks(card,column,false)));
  $('roadmapFilters').replaceChildren();
  [['all','全部'],...Object.entries(roadmapStatuses)].forEach(([status,label])=>{
    const button=element('button','roadmap-filter');button.type='button';button.dataset.status=status;
    button.setAttribute('aria-pressed',String(roadmapState.status===status));
    button.append(element('span','',label),element('span','roadmap-filter-count',status==='all'?baseTasks.length:baseTasks.filter(task=>task.status===status).length));
    button.onclick=()=>{
      roadmapState.status=status;prepareRoadmapFilter();
      $('roadmapFilters').querySelector(`[data-status="${status}"]`).focus({preventScroll:true});
    };
    $('roadmapFilters').append(button);
  });
  let visibleCount=0;
  $('roadmapColumns').replaceChildren();
  growthRoadmap.forEach(column=>{
    const cards=column.cards.map(card=>({card,tasks:matchingRoadmapTasks(card,column)})).filter(entry=>entry.tasks.length);
    visibleCount+=cards.reduce((count,entry)=>count+entry.tasks.length,0);
    const section=element('section','roadmap-column');section.style.setProperty('--roadmap-accent',column.color);
    section.setAttribute('aria-labelledby',`roadmap-column-${column.id}`);
    const header=element('header','roadmap-column-header'),heading=element('div','roadmap-column-heading');
    const glyph=element('span','roadmap-column-glyph');glyph.append(roadmapIcon(column.icon));
    const text=element('div'),title=element('h2','',column.name);title.id=`roadmap-column-${column.id}`;
    text.append(element('p','roadmap-column-kicker',column.kicker),title);heading.append(glyph,text);
    const count=element('span','roadmap-column-count',String(cards.length).padStart(2,'0'));
    count.setAttribute('aria-label',`${cards.length} 个目标`);header.append(heading,count);
    section.append(header,element('p','roadmap-column-description',column.desc));
    if(cards.length)section.append(...cards.map(({card,tasks})=>renderRoadmapCard(card,tasks)));
    else section.append(element('p','roadmap-empty','当前筛选下暂无事项'));
    $('roadmapColumns').append(section);
  });
  $('roadmapResult').hidden=roadmapState.status==='all'&&!roadmapState.query;
  $('roadmapResult').textContent=`显示 ${visibleCount} / ${roadmapTasks.length} 个事项${roadmapState.status!=='all'?' · '+roadmapStatuses[roadmapState.status]:''}${roadmapState.query?' · 搜索「'+roadmapState.query+'」':''}`;
  updateRoadmapCollapse();
}
function prepareRoadmapFilter(){
  roadmapCards.forEach(card=>{roadmapState.open[card.id]=roadmapState.query||roadmapState.status!=='all'?true:card.open;});
  updateRoadmap();
}
export function renderRoadmap(host){
  const layout=element('div','roadmap-layout'),hero=element('header','roadmap-hero');
  const intro=element('div','roadmap-intro');
  intro.append(element('p','roadmap-eyebrow','[ PERSONAL EVOLUTION SYSTEM ]'));
  const title=element('h1','','Always becoming');title.append(element('span','roadmap-cursor','_'));
  const subtitle=element('p','roadmap-subtitle','把想成为的自己，拆成正在发生的小事。');
  subtitle.append(element('span','roadmap-english',' / A work in progress, by design.'));
  intro.append(title,subtitle);
  const stats=element('dl','roadmap-stats');stats.setAttribute('aria-label','事项统计');
  [[growthRoadmap.length,'成长方向'],[roadmapCards.length,'成长目标'],[roadmapTasks.length,'独立事项'],[roadmapTasks.filter(task=>task.status==='done').length,'已完成事项']].forEach(([value,label])=>{
    const stat=element('div','roadmap-stat');stat.append(element('dt','',label),element('dd','',String(value).padStart(2,'0')));stats.append(stat);
  });
  hero.append(intro,stats);
  const command=element('div','roadmap-command'),line=element('p');
  line.append(element('span','roadmap-prompt','somebody:~ $ '),element('span','','becoming '),element('span','roadmap-flag','--view board'),element('span','',' ↵'));
  command.append(line,element('small','','● 每一步，都在成为。'));
  const toolbar=element('section','roadmap-toolbar');toolbar.setAttribute('aria-label','看板筛选');
  const filters=element('div','roadmap-filters');filters.id='roadmapFilters';
  filters.setAttribute('role','group');filters.setAttribute('aria-label','按事项状态筛选');
  const tools=element('div','roadmap-tools'),search=element('label','roadmap-search'),input=element('input');
  input.type='search';input.placeholder='搜索目标、事项…';input.autocomplete='off';input.value=roadmapState.query;
  input.setAttribute('aria-label','搜索目标或事项');
  input.oninput=()=>{roadmapState.query=input.value.trim();prepareRoadmapFilter();};
  search.append(roadmapIcon('search'),input);
  const collapse=element('button','roadmap-collapse');collapse.id='roadmapCollapse';collapse.type='button';
  collapse.append(roadmapIcon('collapse'),element('span','','折叠全部'));
  collapse.onclick=()=>{
    const visible=roadmapCards.filter(card=>document.getElementById(`roadmap-body-${card.id}`));
    const next=!visible.some(roadmapCardOpen);visible.forEach(card=>{roadmapState.open[card.id]=next;});updateRoadmap();
  };
  tools.append(search,collapse);toolbar.append(filters,tools);
  const result=element('p','roadmap-result');result.id='roadmapResult';result.setAttribute('role','status');
  const columns=element('section','roadmap-columns');columns.id='roadmapColumns';columns.setAttribute('aria-label','四个成长方向的目标看板');
  const footer=element('div','roadmap-footer');footer.append(element('span','','● PROGRESS IS PERSONAL. KEEP BECOMING.'),element('span','','NO FINISH LINE.'));
  const dialog=element('dialog','roadmap-dialog');dialog.id='roadmapDialog';dialog.setAttribute('aria-labelledby','roadmapDialogTitle');
  const dialogTop=element('div','roadmap-dialog-top'),close=element('button','','×');close.type='button';close.setAttribute('aria-label','关闭事项详情');
  close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>roadmapTrigger?.focus({preventScroll:true}));
  dialogTop.append(element('span','roadmap-category','事项详情'),close);
  const dialogTitle=element('h2');dialogTitle.id='roadmapDialogTitle';
  const dialogText=element('p');dialogText.id='roadmapDialogText';
  const dialogProgress=element('div');dialogProgress.id='roadmapDialogProgress';
  dialog.append(dialogTop,dialogTitle,dialogText,dialogProgress);
  layout.append(hero,command,toolbar,result,columns,footer,dialog);host.replaceChildren(layout);updateRoadmap();
}
