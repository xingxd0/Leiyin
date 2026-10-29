import {growthRoadmap} from '../growth-roadmap.js?v=20261028-input';

const storageKey='leiyin.todol.custom.v1';
const featureId='workbench-case';
const brands=new Set(['if','reddot','muse','adesign','london','ny']);
const node=(tag,className,text)=>{
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(text!==undefined)el.textContent=text;
  return el;
};
function publicLink(value,label){
  try{
    const url=new URL(value);
    if(!['https:','http:'].includes(url.protocol))return null;
    const link=node('a','journal-link',label);
    link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
    link.setAttribute('aria-label',`${label} (opens in a new tab)`);
    return link;
  }catch{return null;}
}

// Take a fresh snapshot: the original board may already have loaded local tasks.
function records(){
  const columns=growthRoadmap.map(column=>({...column,cards:column.cards.map(group=>({
    ...group,tasks:group.tasks.filter(task=>!task.local).map(task=>({...task}))
  }))}));
  const groups=columns.flatMap(column=>column.cards);
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
    const seen=new Set(groups.flatMap(group=>group.tasks.map(task=>task.id)));
    if(Array.isArray(saved))for(const task of saved.slice(0,200)){
      const group=groups.find(group=>group.id===task?.cardId);
      if(!group||typeof task.id!=='string'||!task.id.startsWith('local-')||seen.has(task.id)
        ||typeof task.title!=='string'||!task.title.trim()||task.title.length>500)continue;
      group.tasks.push({id:task.id,title:task.title,status:'notstarted',statusLabel:'Not started',workflow:[],local:true});
      seen.add(task.id);
    }
  }catch{}
  return columns;
}
function searchText(column,group,task){
  return [column.name,column.desc,group.category,group.title,group.desc,task.title,task.subtitle,
    task.statusLabel,task.why,task.nextStep,task.note,task.progress,task.awardCount,...(task.workflow||[]),
    ...(task.detail||[]),...(task.works||[]).map(work=>`${work.year||''} ${work.name}`)]
    .join(' ').toLocaleLowerCase();
}
function renderWorks(task){
  const list=node('ul','journal-works');
  for(const work of task.works||[]){
    const row=node('li');
    if(work.year)row.append(node('span','journal-work-year',String(work.year)));
    row.append(publicLink(work.url,work.name)||node('span','',work.name));
    list.append(row);
  }
  return list;
}
function renderStory(task,group,{feature=false,query='',preview=false}={}){
  const article=node('article',`journal-story${feature?' journal-feature':''}${task.status==='done'?' journal-story-completed':''}`);
  article.dataset.item=task.id;article.dataset.status=task.status;
  if(feature)article.append(node('p','journal-kicker',`IN FOCUS / ${group.category}`));
  const heading=node('h4','journal-story-title');
  if(brands.has(task.logo)){
    const logo=node('img','journal-award-logo');
    logo.src=new URL(`../logo/${task.logo}.png`,import.meta.url).href;
    logo.alt='';logo.width=24;logo.height=24;logo.loading='lazy';
    heading.append(logo);
  }
  heading.append(document.createTextNode(task.title));
  if(task.awardCount)heading.append(node('span','journal-award-count',` x${task.awardCount}`));
  article.append(heading);
  const meta=node('p','journal-story-meta',task.statusLabel);
  if(task.optional)meta.append(document.createTextNode(task.status==='notstarted'?' / Backlog':' / Optional'));
  if(task.local)meta.append(document.createTextNode(' / This browser only'));
  article.append(meta);
  if(task.subtitle)article.append(node('p','journal-deck',task.subtitle));
  if(task.why){
    const why=node('p','journal-story-copy',task.why);
    why.dataset.field='why';article.append(why);
  }
  if(preview){if(!task.why&&task.nextStep)article.append(node('p','journal-story-copy',task.nextStep));return article;}
  if(task.works?.length)article.append(renderWorks(task));
  const external=publicLink(task.link,task.linkLabel||'Visit project');
  if(external)article.append(external);
  const hasNotes=task.workflow?.length||task.nextStep||task.note||task.detail?.length||Number.isFinite(task.progress);
  if(hasNotes){
    const details=node('details','journal-notes');
    // Search covers the full record and reveals matching reading notes.
    details.open=Boolean(query);
    details.append(node('summary','',task.status==='done'?'Record details':'Read the practice notes'));
    const body=node('div','journal-notes-body');
    if(Number.isFinite(task.progress))body.append(node('p','',`${task.status==='done'?'Completed':'Recorded progress'}: ${task.progress}%`));
    if(task.workflow?.length){
      body.append(node('p','journal-note-label','Stages'));
      const stages=node('ol','journal-stages');
      for(const stage of task.workflow)stages.append(node('li','',stage));
      body.append(stages);
    }
    if(task.nextStep){
      body.append(node('p','journal-note-label','Next step'),node('p','',task.nextStep));
    }
    if(task.note)body.append(node('p','',task.note));
    if(task.detail?.length){
      const list=node('ul');
      for(const item of task.detail)list.append(node('li','',item));
      body.append(list);
    }
    details.append(body);article.append(details);
  }
  return article;
}

export function renderPage(host){
  const columns=records().sort((a,b)=>Number(b.id==='influence')-Number(a.id==='influence')),allTasks=columns.flatMap(column=>column.cards.flatMap(group=>group.tasks));
  const events=new AbortController();
  let query='',filter='all';
  let selected=columns.some(c=>c.id===new URL(location.href).searchParams.get('labSection'))?new URL(location.href).searchParams.get('labSection'):null;
  let overviewScroll=0;
  function openSection(id,taskId){
    overviewScroll=host.scrollTop;selected=id;
    const url=new URL(location.href);url.searchParams.set('labSection',id);history.pushState(null,'',url);render();host.scrollTop=0;
    const target=taskId?sections.querySelector(`[data-item="${taskId}"]`):sections.querySelector('h2');
    if(target){target.tabIndex=-1;target.focus({preventScroll:true});if(taskId)target.scrollIntoView({block:'start'});}
  }
  function backToOverview(){selected=null;const url=new URL(location.href);url.searchParams.delete('labSection');history.pushState(null,'',url);render();host.scrollTop=overviewScroll;index.querySelector('button')?.focus({preventScroll:true});}

  const paper=node('div','todolist-journal');paper.lang='en';
  const masthead=node('header','journal-masthead');
  const dateline=node('div','journal-dateline');
  dateline.append(node('span','','XUDONG XING / PRODUCT DESIGN LEADER'),node('span','','A PERSONAL JOURNAL'));
  const title=node('h1','journal-name','Always Becoming.');
  masthead.append(dateline,title);
  const index=node('nav','journal-index');index.setAttribute('aria-label','Journal sections');
  columns.forEach((column,i)=>{
    const button=node('button','journal-index-link',`${String(i+1).padStart(2,'0')} ${column.name}`);
    button.type='button';
    button.addEventListener('click',()=>openSection(column.id),{signal:events.signal});
    index.append(button);
  });
  const record=node('aside','journal-record');record.setAttribute('aria-label','Completed achievements');
  const awards=allTasks.filter(task=>task.status==='done'&&task.awardCount);
  const awardCount=awards.reduce((sum,task)=>sum+task.awardCount,0);
  const patents=allTasks.find(task=>task.id==='chinese-patents');
  record.append(node('p','',`${awardCount} international design award wins / ${awards.length} programs`));
  if(patents)record.append(node('p','',patents.title));
  const tools=node('details','journal-tools');tools.append(node('summary','','Find a topic'));
  const controls=node('div','journal-search-controls');
  const label=node('label','','Search this journal'),input=node('input');
  input.type='search';input.id='journal-search';input.placeholder='A project, a topic, a practice...';label.htmlFor=input.id;
  const statusLabel=node('label','','Show'),select=node('select');select.id='journal-filter';statusLabel.htmlFor=select.id;
  for(const [value,text] of [['all','All records'],['active','Current practices'],['done','Completed records'],['backlog','Not started']]){
    const option=node('option','',text);option.value=value;select.append(option);
  }
  controls.append(label,input,statusLabel,select);tools.append(controls);
  const result=node('p','journal-result');result.setAttribute('role','status');result.hidden=true;
  const sections=node('div','journal-sections');
  const back=node('button','journal-back','← Front page');back.type='button';back.onclick=backToOverview;
  const detailNav=node('div','journal-detail-nav');detailNav.append(back,node('span','journal-kicker','THE FULL PICTURE'));

  const footer=node('footer','journal-colophon');
  footer.append(node('span','','ALWAYS BECOMING / NO FINISH LINE.'),node('span','','Source record updated October 27, 2026.'));
  const maintenance=node('details','journal-maintenance');maintenance.append(node('summary','','Record maintenance'));
  const maintenanceLink=node('a','journal-link','Open the original Todolist to add a local note');
  maintenanceLink.href='#/tdl';
  maintenance.append(node('p','','Additions are saved in this browser only, not published to GitHub.'),maintenanceLink);
  const overview=node('div','journal-overview');overview.append(record,tools);
  paper.append(masthead,index,overview,result,detailNav,sections,footer,maintenance);
  host.replaceChildren(paper);
  function matches(column,group,task){
    const statusMatches=filter==='all'||(filter==='active'&&!['done','notstarted'].includes(task.status))
      ||(filter==='done'&&task.status==='done')||(filter==='backlog'&&task.status==='notstarted');
    return statusMatches&&(!query||searchText(column,group,task).includes(query));
  }
  function render(){
    sections.replaceChildren();
    const searching=Boolean(query)||filter!=='all',front=!selected&&!searching;
    paper.classList.toggle('journal-front-page',front);paper.classList.toggle('journal-detail-page',Boolean(selected));
    detailNav.hidden=!selected;
    [...index.children].forEach((button,i)=>{button.setAttribute('aria-current',selected===columns[i].id?'page':'false');});
    let count=0;

    for(const [index,column] of columns.entries()){
      if(selected&&column.id!==selected)continue;
      const groups=column.cards.map(group=>({group,tasks:group.tasks.filter(task=>matches(column,group,task))}))
        .filter(entry=>entry.tasks.length);
      if(!groups.length)continue;
      const section=node('section','journal-section');section.id=`journal-section-${column.id}`;section.tabIndex=-1;
      section.dataset.direction=column.id;
      section.setAttribute('aria-labelledby',`${section.id}-title`);
      const header=node('header','journal-section-header');
      const title=node('h2');title.id=`${section.id}-title`;
      if(!selected){const open=node('button','journal-section-link',`${column.name} →`);open.type='button';open.setAttribute('aria-label',`Explore ${column.name}`);open.onclick=()=>openSection(column.id);title.append(open);}else title.textContent=column.name;
      header.append(node('span','journal-section-number',String(index+1).padStart(2,'0')),title,node('p','',column.desc));
      const grid=node('div','journal-columns');
      if(front){
        const stories=groups.flatMap(({group,tasks})=>tasks.map(task=>({group,task})));
        const ranked=[...stories].sort((a,b)=>Number(b.task.id===featureId)-Number(a.task.id===featureId)||Number(['done','notstarted'].includes(a.task.status))-Number(['done','notstarted'].includes(b.task.status)));
        const previewLimits={influence:6,craft:4,people:6,ai:4};
        const limit=previewLimits[column.id]||3,featured=[],chosen=new Set();
        for(const story of ranked)if(!chosen.has(story.group.id)&&featured.length<limit){featured.push(story);chosen.add(story.group.id);}
        for(const story of ranked)if(featured.length<limit&&!featured.includes(story))featured.push(story);
        for(const {group,task} of featured){
          const story=renderStory(task,group,{preview:true});
          if(column.id==='people'&&task.why&&task.nextStep)story.append(node('p','journal-story-copy',task.nextStep));
          if(Number.isFinite(task.progress))story.append(node('p','journal-story-meta',`Recorded progress: ${task.progress}%`));
          grid.append(story);
        }
        header.querySelector('.journal-section-number').textContent=`${stories.length} records`;
        section.append(header,grid);sections.append(section);count+=stories.length;continue;
      }
      grid.dataset.groups=String(groups.length);
      for(const {group,tasks} of groups){
        const body=node('section','journal-group');body.dataset.group=group.id;
        body.append(node('p','journal-kicker',group.category),node('h3','journal-group-title',group.title),
          node('p','journal-group-description',group.desc));
        for(const task of tasks){
          count++;
          body.append(renderStory(task,group,{feature:task.id===featureId,query}));
        }
        grid.append(body);
      }
      section.append(header,grid);sections.append(section);
    }
    if(front){
      // Independent editorial desks avoid reserving empty space below a short column.
      const items=[...sections.children],lead=node('div','journal-desk journal-desk-lead'),side=node('div','journal-desk journal-desk-side');
      for(const section of items)(['influence','people'].includes(section.dataset.direction)?lead:side).append(section);
      sections.append(lead,side);
    }
    result.hidden=!searching;
    result.textContent=count?`${count} of ${allTasks.length} records match.`:'No records match. Try another topic or show all records.';
    [...index.children].forEach(button=>{button.disabled=false;});
  }
  input.addEventListener('input',()=>{query=input.value.trim().toLocaleLowerCase();render();},{signal:events.signal});
  select.addEventListener('change',()=>{filter=select.value;render();},{signal:events.signal});
  window.addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('labSection');selected=columns.some(c=>c.id===id)?id:null;render();},{signal:events.signal});
  render();
  return {destroy(){events.abort();}};
}
