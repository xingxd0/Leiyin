const tracks=[
  {title:'Craft & Experience',code:'DESIGNING',color:'#8873b2'},
  {title:'Systems & Scale',code:'SYSTEMIZING',color:'#7593aa'},
  {title:'People & Leadership',code:'LEADING',color:'#a68e74'},
  {title:"AI & What's Next",code:'EXPLORING',color:'#8a77c0'}
];
const views={
  identity:{title:'身份认证',subtitle:'CLI / Identity',description:'终端已接入。查看今日摘要，选择任务中心或能力作品档案。'},
  todo:{title:'Personal Growth Roadmap',subtitle:'个人成长路线图',description:'已完成的成就不是终点，而是下一阶段成长的基础。',columns:growthRoadmap},
  model:{title:'能力模型',subtitle:'Capabilities / Work',description:'能力、方法与作品。'},
  pending:{title:'待定',subtitle:'Undefined',description:''}
};
// Configure each tab independently after image direction is confirmed.
const tabImages={identity:null,todo:null,model:null,pending:null};
const $=id=>document.getElementById(id);
function element(tag,cls,text){
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n;
}
let view='identity',filter='all',trigger=null,dimension=0;
const commandHistory=[];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const welcomeMessages=[
  {type:'boot',lines:['> initializing identity...','Loading personal profile...','✓ Identity verified']},
  {type:'profile',heading:'PROFILE / 001',lines:['Xudong Xing','Product Design Leader','Product Design Manager @ TikTok','12 Years in Product Design','Enterprise SaaS · ByteDance · Kuaishou']},
  {type:'capabilities',heading:'CAPABILITIES / 002',lines:['[01] Craft — Designing with clarity and precision.','[02] Systems — Turning complexity into scalable solutions.','[03] People — Building teams where people grow.',"[04] AI — Exploring what's next in human-computer interaction."]},
  {type:'record',heading:'TRACK RECORD / 003',lines:['10 Designers · 11 Business Lines','11 Design Patents',"iF · Red Dot · MUSE · A' Design Awards"]},
  {type:'philosophy',heading:'PHILOSOPHY / 004',lines:['Find clarity in complexity.','Build systems that scale.','Give people room to grow.']},
  {type:'complete',lines:['✓ Profile loaded successfully.','Entering Always Becoming workspace_']}
];
let welcomeCount=0,welcomeTimer=null,loginTimer=null,loginStep=0,loggedIn=false;
function stopWelcome(){clearTimeout(welcomeTimer);welcomeTimer=null;}
const routes={identity:'/identity',todo:'/roadmap',model:'/capabilities',pending:'/pending'};
function routeView(){
  return Object.keys(routes).find(key=>`#${routes[key]}`===location.hash)||'identity';
}
function syncRoute(){
  view=routeView();filter='all';
  if(location.hash!==`#${routes[view]}`){
    history.replaceState(null,'',`${location.pathname}${location.search}#${routes[view]}`);
  }
  if($('cardDialog').open){trigger=null;$('cardDialog').close();}
  render();
  document.title=`${views[view].title} / Always Becoming`;
}
function navigate(target){
  if(!Object.hasOwn(routes,target))return;
  if(location.hash!==`#${routes[target]}`)history.pushState(null,'',`#${routes[target]}`);
  syncRoute();$(`nav-${target}`).focus({preventScroll:true});
}
function scheduleWelcome(){
  stopWelcome();
  if(!loggedIn||view!=='identity'||welcomeCount>=welcomeMessages.length)return;
  welcomeTimer=setTimeout(()=>{
    welcomeCount++;renderTerminal();
  },reducedMotion.matches?0:1100);
}
function finishLogin(){
  clearTimeout(loginTimer);loginTimer=null;
  stopLoginCrow();
  loggedIn=true;view=routeView();filter='all';
  if($('loginScreen').open)$('loginScreen').close();
  render();$('boardPanel').focus({preventScroll:true});
}
function startLogin(){
  clearTimeout(loginTimer);stopWelcome();stopAscii();
  loggedIn=false;welcomeCount=0;loginStep=0;commandHistory.length=0;
  $('loginLog').replaceChildren();$('loginProgress').value=0;
  $('loginStatus').textContent='初始化连接';
  if(!$('loginScreen').open)$('loginScreen').showModal();
  startLoginCrow();
  const steps=['[ OK ] 终端信号已发现','[ OK ] 访客通道已开放','[ OK ] 身份档案已挂载','[ OK ] 任务与能力模块就绪'];
  function advance(){
    $('loginLog').append(element('p','',steps[loginStep]));
    loginStep++;$('loginProgress').value=loginStep*25;
    $('loginStatus').textContent=loginStep===4?'连接成功 / ACCESS GRANTED':'自动接入中';
    loginTimer=setTimeout(loginStep===4?finishLogin:advance,reducedMotion.matches?0:650);
  }
  loginTimer=setTimeout(advance,reducedMotion.matches?0:400);
}
let asciiPaused=reducedMotion.matches,asciiController=null,asciiCanvas=null,asciiRequest=0;
let loginCrowController=null,loginCrowRequest=0;
function stopLoginCrow(){
  loginCrowRequest++;
  loginCrowController?.destroy();loginCrowController=null;
}
function startLoginCrow(){
  stopLoginCrow();
  const request=loginCrowRequest;
  const host=$('loginCrow');
  import('./terminal-crow.js').then(async({createCrow})=>{
    if(request!==loginCrowRequest)return;
    const controller=await createCrow(host,{
      paused:asciiPaused||document.hidden,
      isCurrent:()=>request===loginCrowRequest&&$('loginScreen').open
    });
    if(!controller)return;
    if(request!==loginCrowRequest){controller.destroy();return;}
    loginCrowController=controller;
    controller.setPaused(asciiPaused||document.hidden);
  }).catch(error=>console.error('Login crow:',error));
}
function stopAscii(){
  asciiRequest++;asciiController?.destroy();asciiController=null;asciiCanvas=null;
}
function syncAscii(){
  const art=$('asciiArt');
  loginCrowController?.setPaused(asciiPaused||document.hidden);
  if(!art||view!=='identity')return;
  const paused=asciiPaused||document.hidden||!loggedIn;
  if(asciiController){asciiController.setPaused(paused);return;}
  if(asciiCanvas===art)return;
  stopAscii();asciiCanvas=art;
  const request=asciiRequest;
  import('./terminal-crow.js').then(async({createCrow})=>{
    if(request!==asciiRequest||!art.isConnected||view!=='identity')return;
    const controller=await createCrow(art,{
      paused:asciiPaused||document.hidden||!loggedIn,
      isCurrent:()=>request===asciiRequest&&art.isConnected&&view==='identity'
    });
    if(!controller)return;
    if(request!==asciiRequest||!art.isConnected||view!=='identity'){controller.destroy();return;}
    asciiController=controller;
    controller.setPaused(asciiPaused||document.hidden||!loggedIn);
  }).catch(error=>{
    if(request!==asciiRequest)return;
    asciiCanvas=null;
    console.error('Chinese crow:',error);
  });
}
reducedMotion.addEventListener('change',event=>{asciiPaused=event.matches;syncAscii();});
document.addEventListener('visibilitychange',syncAscii);
const commandOutputs={
  help:'可用命令：whoami、about、experience、principles、clear。\n输入 1 或 todo 查看任务；输入 2 或 portfolio 查看能力作品集。',
  whoami:'Xudong Xing\nProduct Design Leader\nProduct Design Manager @ TikTok',
  about:'Always Becoming.\n记录积累、探索与下一步。',
  experience:'12 Years in Product Design\nEnterprise SaaS · ByteDance · Kuaishou\n10 Designers · 11 Business Lines\n11 Design Patents\niF · Red Dot · MUSE · A\' Design Awards',
  principles:'Find clarity in complexity.\nBuild systems that scale.\nGive people room to grow.'
};
function terminalCommand(command){
  const line=element('p','terminal-command');
  line.append(element('span','cli-prompt','somebody:~ $ '));
  command.split(/(\s+)/).forEach((token,index)=>{
    const kind=/^\s+$/.test(token)?'cli-punctuation':token.startsWith('--')?'cli-argument':index===0?'cli-function':'cli-value';
    line.append(element('span',kind,token));
  });
  return line;
}
function renderTerminal(){
  stopWelcome();
  const previousInput=$('commandInput');
  const previousOutput=document.querySelector('.terminal-output');
  const previousScroll=previousOutput?.scrollTop||0;
  const inputFocused=previousInput&&document.activeElement===previousInput;
  const inputDraft=inputFocused?previousInput.value:'';
  const terminal=element('section','terminal');
  terminal.setAttribute('aria-label','个人介绍终端');
  const body=element('div','terminal-body');
  let visual=$('asciiPanel');
  if(!visual){
    visual=element('div','ascii-panel');visual.id='asciiPanel';
    const art=element('div','ascii-art');art.id='asciiArt';
    art.setAttribute('role','img');art.setAttribute('aria-label','汉字乌鸦居中振翅，分层飞羽明暗变化，树林从右向左移动');
    visual.append(art);
  }
  let output=element('div','terminal-output');
  output.setAttribute('role','log');output.setAttribute('aria-label','命令输出');
  const header=element('div','identity-terminal-header');
  header.append(element('span','','>_ IDENTITY TERMINAL'),element('span','identity-connected','● CONNECTED'));
  output.append(header);
  welcomeMessages.slice(0,welcomeCount).forEach(item=>{
    const section=element('section',`identity-section identity-${item.type}`);
    if(item.heading)section.append(element('h3','identity-section-label',item.heading));
    item.lines.forEach((text,index)=>{
      const cls=item.type==='profile'
        ? ['identity-name','identity-role','identity-position','identity-muted','identity-muted'][index]
        : text.startsWith('✓')||text.startsWith('>')?'identity-success'
        : item.type==='boot'||item.type==='complete'?'identity-muted':'identity-line';
      section.append(element(item.type==='profile'&&index===0?'h2':'p',cls,text));
    });
    output.append(section);
  });
  commandHistory.forEach(item=>output.append(terminalCommand(item.command),element('pre','terminal-result',item.result)));
  if(welcomeCount===welcomeMessages.length){
    const choices=element('div','terminal-choices');
    [['todo','1','tasks','查看成长路线图'],['model','2','portfolio','查看我的作品集']].forEach(([target,number,command,title])=>{
      const button=element('button','terminal-choice');button.type='button';
      const cursor=element('span','terminal-cursor','▌');cursor.setAttribute('aria-hidden','true');
      const text=element('span','cli-choice-text');
      text.append(element('span','cli-punctuation','['),element('span','cli-number',number),element('span','cli-punctuation','] '),element('span','cli-keyword','open '),element('span','cli-value',command),element('span','cli-punctuation',' / '),element('span','cli-choice-label',title));
      button.append(element('span','choice-marker','>'),text,cursor);
      button.onclick=()=>navigate(target);choices.append(button);
    });
    output.append(choices);
  }
  const form=element('form','terminal-form'),label=element('label','','somebody:~ $'),input=element('input');
  input.id='commandInput';input.name='command';input.autocomplete='off';input.spellcheck=false;
  input.setAttribute('aria-label','输入个人介绍命令');label.htmlFor=input.id;
  const submit=element('button','','执行');submit.type='submit';
  const inputCursor=element('span','terminal-cursor','▌');inputCursor.setAttribute('aria-hidden','true');
  const inputWrap=element('span','terminal-input');
  inputWrap.append(input,inputCursor);
  input.oninput=()=>{inputWrap.classList.toggle('has-value',Boolean(input.value));};
  form.append(label,inputWrap,submit);
  form.onsubmit=event=>{
    event.preventDefault();const command=input.value.trim().toLowerCase();if(!command)return;
    if(command==='1'||command==='todo'){navigate('todo');return;}
    if(command==='2'||command==='portfolio'){navigate('model');return;}
    if(command==='clear')commandHistory.length=0;
    else commandHistory.push({command,result:commandOutputs[command]||`未识别的命令：${command}\n输入 help 查看可用命令。`});
    input.value='';renderTerminal();$('commandInput').focus({preventScroll:true});
  };
  if(previousOutput){
    previousOutput.replaceChildren(...output.childNodes);
    output=previousOutput;
  }
  body.append(visual,output);
  terminal.append(body,form);$('boardPanel').replaceChildren(terminal);
  const latest=commandHistory.length
    ? output.querySelector('.terminal-command:last-of-type')
    : output.querySelector('.identity-section:last-of-type');
  if(latest){
    const top=latest.getBoundingClientRect().top-output.getBoundingClientRect().top+output.scrollTop-24;
    // Leave enough trailing room to bring the newest block to the top.
    const space=element('div');
    space.setAttribute('aria-hidden','true');
    space.style.height=`${Math.max(0,top+output.clientHeight-output.scrollHeight)}px`;
    output.append(space);
    // Restore only after the scroll range exists, avoiding a clamped first jump.
    output.scrollTo({top:previousScroll,behavior:'instant'});
    output.scrollTo({top:Math.max(0,top),behavior:reducedMotion.matches?'instant':'smooth'});
  }
  else output.scrollTo({top:previousScroll,behavior:'instant'});
  if(inputFocused){input.value=inputDraft;inputWrap.classList.toggle('has-value',Boolean(inputDraft));input.focus({preventScroll:true});}
  syncAscii();scheduleWelcome();
}
function renderModel(){
  const layout=element('section','model-layout'),dimensions=element('div','model-dimensions');
  dimensions.append(element('span','eyebrow','MODEL / 能力维度'),element('h2','','somebody 的能力模型'));
  tracks.forEach((track,index)=>{
    const button=element('button','dimension-button');
    button.type='button';button.setAttribute('aria-pressed',String(index===dimension));
    button.append(element('span','',`0${index+1}`),element('strong','',track.title),element('span','','→'));
    button.onclick=()=>{dimension=index;renderModel();document.querySelectorAll('.dimension-button')[index].focus();};
    dimensions.append(button);
  });
  const detail=element('div','model-detail');
  detail.append(element('span','eyebrow','SELECTED DIMENSION'),element('h2','',tracks[dimension].title));
  const connection=element('div','model-connection','能力维度 → 能做的事 → 作品证据');
  detail.append(connection);layout.append(dimensions,detail);$('boardPanel').replaceChildren(layout);
}
function progress(value,title){
  const wrapper=element('div','progress-wrapper'),label=element('span','progress-label');
  label.append(element('span','','任务进度'),element('span','',`${value}%`));
  const bar=element('progress','task-progress');bar.max=100;bar.value=value;
  bar.setAttribute('aria-label',`${title}：任务进度`);
  wrapper.append(label,bar);return wrapper;
}
function render(){
  stopAscii();stopWelcome();
  document.querySelectorAll('[data-view]').forEach(button=>{
    const active=button.dataset.view===view;
    button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
  });
  document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
  const data=views[view];
  $('workspace').classList.toggle('identity-workspace',view==='identity');
  $('viewTitle').replaceChildren(document.createTextNode(data.title),element('small','',data.subtitle));
  $('viewDescription').textContent=data.description;
  const isTodo=view==='todo';
  document.querySelector('.filters').hidden=!isTodo;
  $('columnCount').textContent=isTodo?'04 COLUMNS':view==='identity'?'CLI':view==='model'?'CAPABILITY MODEL':'UNDEFINED';
  $('footerNote').textContent='Always Becoming.';
  $('boardPanel').setAttribute('aria-labelledby',`nav-${view}`);
  const image=tabImages[view];
  $('tabImage').hidden=!image;
  if(image){$('tabImage').src=image.src;$('tabImage').alt=image.alt;}
  else $('tabImage').removeAttribute('src');
  $('boardPanel').replaceChildren();
  if(view==='identity'){renderTerminal();return;}
  if(view==='model'){renderModel();return;}
  if(view==='pending'){
    const empty=element('section','pending-page');
    empty.append(element('span','eyebrow','04 / UNDEFINED'));
    $('boardPanel').append(empty);return;
  }
  $('boardPanel').append(element('div','columns'));document.querySelector('.columns').id='columns';
  $('columns').style.setProperty('--columns',data.columns.length);
  $('columns').replaceChildren();
  // Growth directions have no aggregate completion percentage.
  data.columns.forEach((column,index)=>{
    const section=element('section','column');section.style.setProperty('--track',column.color);
    const header=element('header','column-heading'),meta=element('span','column-code');
    meta.append(element('span','',`0${index+1} / ${column.code}`),element('i'));
    const heading=element('h2','',column.title);
    header.append(meta,heading,element('p','roadmap-subtitle',column.subtitle),element('p','roadmap-goal',column.goal));section.setAttribute('aria-label',column.title);
    const list=element('div','card-list');
    const cards=column.cards.filter(card=>filter==='all'||(filter==='done'?card.completed:!card.completed));
    cards.forEach((card,cardIndex)=>{
      const button=element('button',`task-card${card.completed?' done':''}`);button.type='button';
      if(filter==='all'&&cardIndex>=3)button.hidden=true;
      const status=card.status;
      const meta=element('span','card-meta');
      meta.append(element('span','',card.stage),element('span','card-state',status));
      button.append(meta,element('span','card-title',card.title),element('span','card-copy',card.description));
      const milestones=element('ul','roadmap-milestones');
      card.milestones.slice(0,3).forEach(text=>milestones.append(element('li','',text)));
      button.append(milestones);
      const bottom=element('span','card-bottom');
      bottom.append(element('span','',String(cardIndex+1).padStart(2,'0')),element('span','','查看详情 ↗'));
      button.append(bottom);
      button.onclick=()=>{
        trigger=button;$('dialogTitle').textContent=card.title;
        $('dialogText').textContent=`${column.subtitle} / ${card.status}。${card.description}`;
        $('dialogProgress').replaceChildren();
        const milestones=element('ul','roadmap-milestones');
        card.milestones.forEach(text=>milestones.append(element('li','',text)));
        $('dialogProgress').append(element('h3','roadmap-detail-title','成果与阶段节点'),milestones);
        $('cardDialog').showModal();
      };
      list.append(button);
    });
    if(filter==='all'&&cards.length>3){
      const more=element('button','roadmap-more',`查看全部 ${cards.length} 项`);
      more.type='button';more.setAttribute('aria-expanded','false');
      more.onclick=()=>{
        const expanded=more.getAttribute('aria-expanded')!=='true';
        list.querySelectorAll('.task-card').forEach((card,i)=>card.hidden=!expanded&&i>=3);
        more.setAttribute('aria-expanded',String(expanded));
        more.textContent=expanded?'收起':`查看全部 ${cards.length} 项`;
      };
      list.append(more);
    }
    if(!cards.length)list.append(element('p','empty','暂无任务'));
    section.append(header,list);$('columns').append(section);
  });
  $('boardPanel').scrollTop=0;$('boardPanel').scrollLeft=0;
}
document.querySelectorAll('[data-view]').forEach(button=>{
  button.onclick=()=>navigate(button.dataset.view);
  button.onkeydown=event=>{
    const keys=Object.keys(views),index=keys.indexOf(button.dataset.view);
    let target;
    if(event.key==='ArrowDown')target=keys[(index+1)%keys.length];
    if(event.key==='ArrowUp')target=keys[(index+keys.length-1)%keys.length];
    if(event.key==='Home')target=keys[0];
    if(event.key==='End')target=keys[keys.length-1];
    if(target){event.preventDefault();navigate(target);}
  };
});
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;render();});
$('closeDialog').onclick=()=>$('cardDialog').close();
$('cardDialog').addEventListener('close',()=>trigger?.focus({preventScroll:true}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&$('cardDialog').open){event.preventDefault();$('cardDialog').close();}
});
$('loginScreen').addEventListener('cancel',event=>{event.preventDefault();finishLogin();});
window.addEventListener('popstate',syncRoute);
window.addEventListener('hashchange',()=>{
  if(view!==routeView()||location.hash!==`#${routes[view]}`)syncRoute();
});
syncRoute();
startLogin();
