import {growthRoadmap} from './growth-roadmap.js?v=20261028-input';

const $=id=>document.getElementById(id);
function element(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
}
let roadmapTrigger=null;
const roadmapStatuses={notstarted:'Not started',preparing:'Preparing',ongoing:'In progress',review:'Awaiting review',confirmed:'Confirmed',done:'Completed'};
const roadmapState={status:'all',query:'',open:{},more:{}};
const roadmapCards=growthRoadmap.flatMap(column=>column.cards);
const customTodoKey='leiyin.todol.custom.v1';
const customTodo=(record)=>({id:record.id,title:record.title,status:'notstarted',statusLabel:'Not started',workflow:[],logo:'+',local:true});
let customTodoRecords=[];
try{
  const records=JSON.parse(localStorage.getItem(customTodoKey)||'[]');
  if(Array.isArray(records))customTodoRecords=records.filter(record=>record&&typeof record.id==='string'&&record.id.startsWith('local-')&&typeof record.title==='string'&&record.title.trim()&&record.title.length<=500&&roadmapCards.some(card=>card.id===record.cardId)).slice(0,200);
}catch{}
customTodoRecords.forEach(record=>roadmapCards.find(card=>card.id===record.cardId).tasks.push(customTodo(record)));
const roadmapAliases={团队建设:'team',团队建设与协作:'team',作品与案例:'case-studies',专业探索:'case-studies',设计方法:'systems',专利:'patents',设计奖项:'awards',国际设计奖项:'awards',评委与分享:'talk-judge',人才成长:'mentoring',领导力:'leadership',AI设计观察:'ai-observation',下一代交互:'next-interface',持续学习:'learning'};
function addRoadmapCommand(command){
  const match=command.match(/^\/xd\s+增加到\s*(.+?)\s*的\s*todo\s*为\s*([\s\S]+)$/i);
  if(!match)return {message:'Usage: /xd 增加到团队建设的todo为…',ok:false};
  const target=match[1].trim(),title=match[2].trim();
  const card=roadmapCards.find(card=>card.id===roadmapAliases[target]||card.id.toLowerCase()===target.toLowerCase()||card.title.toLowerCase()===target.toLowerCase());
  if(!card)return {message:'Group not found. Use a card title or 团队建设.',ok:false};
  if(!title||title.length>500)return {message:'Enter a todo between 1 and 500 characters.',ok:false};
  if(customTodoRecords.length>=200)return {message:'This browser has reached the 200 custom-todo limit.',ok:false};
  const record={id:`local-${crypto.randomUUID()}`,cardId:card.id,title};
  try{localStorage.setItem(customTodoKey,JSON.stringify([...customTodoRecords,record]));}
  catch{return {message:'Could not save in this browser. Nothing was added.',ok:false};}
  customTodoRecords.push(record);const item=customTodo(record);card.tasks.push(item);roadmapTasks.push(item);
  roadmapState.status='all';roadmapState.query='';roadmapState.open[card.id]=true;roadmapState.more[card.id]=true;
  return {message:`Added to ${card.title}. Saved in this browser only.`,ok:true};
}
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
    const text=[column.name,column.desc,card.title,card.category,card.desc,task.title,task.subtitle,task.why,task.note,task.nextStep,task.statusLabel,...task.workflow,...(task.detail||[]),...(task.works||[]).map(work=>`${work.year||''} ${work.name}`)].join(' ').toLocaleLowerCase();
    return (!query||text.includes(query))&&(!includeStatus||roadmapState.status==='all'||roadmapState.status===task.status);
  }).sort((a,b)=>Number(a.status==='done')-Number(b.status==='done'));
}
function roadmapLogo(task){
  const isBrand=['if','reddot','muse','adesign','london','ny'].includes(task.logo);
  const logo=element('span',`roadmap-logo roadmap-logo-${isBrand?task.logo:'placeholder'}`);
  logo.setAttribute('aria-hidden','true');
  if(isBrand){
    const image=element('img');
    image.src=new URL(`./logo/${task.logo}.png`,import.meta.url).href;
    image.alt='';
    image.width=24;image.height=24;image.decoding='async';
    logo.append(image);
  }else logo.textContent=task.logo;
  return logo;
}
function openRoadmapTask(task,card,button){
  roadmapTrigger=button;$('roadmapDialogTitle').textContent=task.title;
  $('roadmapDialogText').textContent=`${card.title} / ${task.statusLabel}${task.subtitle?' · '+task.subtitle:''}`;
  const content=$('roadmapDialogProgress');content.replaceChildren();
  if(Number.isFinite(task.progress)){
    const label=element('p','roadmap-detail-label');
    label.append(element('span','',task.status==='done'?'Completed':'Progress'),element('span','',`${task.progress}%`));
    content.append(label);
  }
  if(card.id==='awards'&&task.status==='done'){
    content.append(renderRoadmapWorks(task));
  }else if(task.workflow.length)content.append(renderRoadmapStages(task));
  if(task.why)content.append(element('p','roadmap-detail-note',`Why: ${task.why}`));
  if(task.nextStep)content.append(element('p','roadmap-detail-note',`Next step: ${task.nextStep}`));
  if(task.note)content.append(element('p','roadmap-detail-note',task.note));
  if(task.detail){
    const list=element('ul','roadmap-detail-list');
    task.detail.forEach(text=>list.append(element('li','',text)));content.append(list);
  }
  if(task.optional)content.append(element('p','roadmap-item-meta',task.status==='notstarted'?'Backlog':'Optional'));
  $('roadmapDialog').showModal();
}
function renderRoadmapStages(task){
  const steps=element('ol','roadmap-stages');
  steps.setAttribute('aria-label',`${task.title}: stages`);
  task.workflow.forEach(text=>steps.append(element('li','',text)));
  return steps;
}
function renderRoadmapWorks(task){
  if(!task.works?.length)return element('p','roadmap-stages',`Work: ${task.workName||'To be added'}`);
  const list=element('ul','roadmap-works');
  list.setAttribute('aria-label',`${task.title}: awarded works`);
  task.works.forEach(work=>{
    const row=element('li');
    if(work.year)row.append(element('span','roadmap-work-year',String(work.year)));
    let url;
    try{url=new URL(work.url);}catch{}
    if(url&&['https:','http:'].includes(url.protocol)){
      const link=element('a','roadmap-work-link',work.name);
      link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
      link.setAttribute('aria-label',`${work.name} (opens in a new tab)`);
      row.append(link);
    }else{
      const name=element('span','roadmap-work-pending',work.name);
      name.title='Link to be added';row.append(name);
    }
    list.append(row);
  });
  return list;
}
function renderRoadmapTask(task,card){
  const item=element('article',`roadmap-item${task.featured?' roadmap-item-featured':''}`);
  item.dataset.item=task.id;item.dataset.status=task.status;
  const top=element('div','roadmap-item-top'),name=element('div','roadmap-item-name');
  const details=element('button','roadmap-item-title',task.title);
  details.type='button';details.setAttribute('aria-haspopup','dialog');
  if(task.awardCount){
    const badge=element('span','roadmap-award-count',`×${task.awardCount}`);
    badge.setAttribute('aria-label',`${task.awardCount} awards`);
    details.append(badge);
  }
  details.onclick=()=>openRoadmapTask(task,card,details);
  name.append(details);
  if(task.subtitle)name.append(element('p','roadmap-item-meta',task.subtitle));
  if(task.optional)name.append(element('span','roadmap-optional',task.status==='notstarted'?'Backlog':'Optional'));
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
  if(card.id==='awards'&&task.status==='done'){
    item.append(renderRoadmapWorks(task));
  }else if(task.workflow.length)item.append(renderRoadmapStages(task));
  const status=element('div','roadmap-item-status'),label=element('span','roadmap-status');
  label.append(task.status==='done'?roadmapIcon('check'):element('span','roadmap-dot'),document.createTextNode(task.statusLabel));
  status.append(label);
  if(Number.isFinite(task.progress))status.append(element('span','roadmap-percent',`${task.progress}%`));
  item.append(status);
  if(task.why){
    const why=element('p','roadmap-why');why.append(element('span','','Why: '),document.createTextNode(task.why));item.append(why);
  }
  if(task.nextStep){
    const note=element('p','roadmap-next-action');
    note.append(element('span','','Next step: '),document.createTextNode(task.nextStep));item.append(note);
  }
  if(task.note)item.append(element('p','roadmap-item-meta',task.note));
  return item;
}
function updateRoadmapCollapse(){
  const visible=roadmapCards.filter(card=>document.getElementById(`roadmap-body-${card.id}`));
  $('roadmapCollapse').lastChild.textContent=visible.some(roadmapCardOpen)?'Collapse all':'Expand all';
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
  body.hidden=!roadmapCardOpen(card);
  const expanded=roadmapState.more[card.id]||roadmapState.query||roadmapState.status!=='all';
  tasks.forEach((task,index)=>{
    const item=renderRoadmapTask(task,card);item.hidden=!expanded&&index>=4;body.append(item);
  });
  if(!expanded&&tasks.length>4){
    const more=element('button','roadmap-show-more',`Show more (${tasks.length-4})`);more.type='button';
    more.setAttribute('aria-controls',body.id);
    more.onclick=()=>{
      roadmapState.more[card.id]=true;
      body.querySelectorAll('.roadmap-item').forEach(item=>{item.hidden=false;});
      body.querySelectorAll('.roadmap-item')[4].querySelector('button').focus({preventScroll:true});more.remove();
    };
    body.append(more);
  }
  toggle.onclick=()=>{
    roadmapState.open[card.id]=!roadmapCardOpen(card);body.hidden=!roadmapCardOpen(card);
    toggle.setAttribute('aria-expanded',String(roadmapCardOpen(card)));updateRoadmapCollapse();
  };
  section.append(header,body);return section;
}
function updateRoadmap(){
  const baseTasks=growthRoadmap.flatMap(column=>column.cards.flatMap(card=>matchingRoadmapTasks(card,column,false)));
  $('roadmapFilters').replaceChildren();
  [['all','All'],...Object.entries(roadmapStatuses)].forEach(([status,label])=>{
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
    count.setAttribute('aria-label',`${cards.length} groups`);header.append(heading,count);
    section.append(header,element('p','roadmap-column-description',column.desc));
    if(cards.length)section.append(...cards.map(({card,tasks})=>renderRoadmapCard(card,tasks)));
    else section.append(element('p','roadmap-empty','No items match this filter.'));
    $('roadmapColumns').append(section);
  });
  $('roadmapResult').hidden=roadmapState.status==='all'&&!roadmapState.query;
  $('roadmapResult').textContent=`Showing ${visibleCount} / ${roadmapTasks.length} items${roadmapState.status!=='all'?' · '+roadmapStatuses[roadmapState.status]:''}${roadmapState.query?' · Search: '+roadmapState.query:''}`;
  updateRoadmapCollapse();
}
function prepareRoadmapFilter(){
  roadmapCards.forEach(card=>{roadmapState.open[card.id]=roadmapState.query||roadmapState.status!=='all'?true:card.open;});
  updateRoadmap();
}
export function renderRoadmap(host){
  const layout=element('div','roadmap-layout'),hero=element('header','roadmap-hero');
  layout.lang='en';
  const intro=element('div','roadmap-intro');
  intro.append(element('p','roadmap-eyebrow','[ PERSONAL EVOLUTION SYSTEM ]'));
  const title=element('h1','','todolist');title.append(element('span','roadmap-cursor','_'));
  const subtitle=element('p','roadmap-subtitle','Always Becoming · A work in progress, by design. Updated October 27, 2026.');
  intro.append(title,subtitle);
  const stats=element('dl','roadmap-stats');stats.setAttribute('aria-label','Item statistics');
  [[growthRoadmap.length,'Directions'],[roadmapCards.length,'Groups'],[roadmapTasks.length,'Items'],[roadmapTasks.filter(task=>task.status==='done').length,'Completed items']].forEach(([value,label])=>{
    const stat=element('div','roadmap-stat');stat.append(element('dt','',label),element('dd','',String(value).padStart(2,'0')));stats.append(stat);
  });
  hero.append(intro,stats);
  const toolbar=element('section','roadmap-toolbar');toolbar.setAttribute('aria-label','Board filters');
  const filters=element('div','roadmap-filters');filters.id='roadmapFilters';
  filters.setAttribute('role','group');filters.setAttribute('aria-label','Filter by status');
  const tools=element('div','roadmap-tools');
  const {form:search,input,syncValue}=globalThis.siteUI.createTerminalInput({
    prompt:'somebody:~ $',placeholder:'Search or /xd …',type:'search',
    label:'Search groups or add a todo with /xd',submitLabel:'Submit XD command',
    value:roadmapState.query,className:'roadmap-search'
  });
  const feedback=element('p','roadmap-command-feedback');feedback.setAttribute('role','status');feedback.hidden=true;
  input.oninput=()=>{
    roadmapState.query=/^\/xd(?:\s|$)/i.test(input.value.trim())?'':input.value.trim();
    feedback.hidden=true;prepareRoadmapFilter();
  };
  search.onsubmit=event=>{
    event.preventDefault();if(event.isComposing)return;
    const command=input.value.trim();if(!/^\/xd(?:\s|$)/i.test(command))return;
    const result=addRoadmapCommand(command);feedback.textContent=result.message;feedback.hidden=false;
    if(result.ok){
      input.value='';syncValue();updateRoadmap();
      const counts=layout.querySelectorAll('.roadmap-stat dd');counts[2].textContent=String(roadmapTasks.length).padStart(2,'0');
    }
    input.focus({preventScroll:true});
  };
  const collapse=element('button','roadmap-collapse');collapse.id='roadmapCollapse';collapse.type='button';
  collapse.append(roadmapIcon('collapse'),element('span','','Collapse all'));
  collapse.onclick=()=>{
    const visible=roadmapCards.filter(card=>document.getElementById(`roadmap-body-${card.id}`));
    const next=!visible.some(roadmapCardOpen);visible.forEach(card=>{roadmapState.open[card.id]=next;if(next)roadmapState.more[card.id]=true;});updateRoadmap();
  };
  tools.append(collapse);toolbar.append(filters,tools);
  const dock=element('div','roadmap-dock terminal-input-dock');dock.append(toolbar,search,feedback);
  const result=element('p','roadmap-result');result.id='roadmapResult';result.setAttribute('role','status');
  const columns=element('section','roadmap-columns');columns.id='roadmapColumns';columns.setAttribute('aria-label','Four directions of personal growth');
  const footer=element('div','roadmap-footer');footer.append(element('span','','● PROGRESS IS PERSONAL. KEEP BECOMING.'),element('span','','NO FINISH LINE.'));
  const dialog=element('dialog','roadmap-dialog');dialog.id='roadmapDialog';dialog.setAttribute('aria-labelledby','roadmapDialogTitle');
  const dialogTop=element('div','roadmap-dialog-top'),close=element('button','','×');close.type='button';close.setAttribute('aria-label','Close item details');
  close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>roadmapTrigger?.focus({preventScroll:true}));
  dialogTop.append(element('span','roadmap-category','ITEM DETAILS'),close);
  const dialogTitle=element('h2');dialogTitle.id='roadmapDialogTitle';
  const dialogText=element('p');dialogText.id='roadmapDialogText';
  const dialogProgress=element('div');dialogProgress.id='roadmapDialogProgress';
  dialog.append(dialogTop,dialogTitle,dialogText,dialogProgress);
  layout.append(hero,result,columns,footer,dialog);host.replaceChildren(layout,dock);updateRoadmap();
}
