const tracks=[
  {title:'Craft & Experience',code:'DESIGNING',color:'#8873b2'},
  {title:'Systems & Scale',code:'SYSTEMIZING',color:'#7593aa'},
  {title:'People & Leadership',code:'LEADING',color:'#a68e74'},
  {title:"AI & What's Next",code:'EXPLORING',color:'#8a77c0'}
];
const views={
  identity:{title:'身份认证',subtitle:'CLI / Identity',description:'终端已接入。查看今日摘要，选择任务中心或能力作品档案。'},
  todo:{title:'TODO list',subtitle:'任务看板',description:'四个成长方向并行呈现；每列承载积累、探索和下一步。',columns:tracks,cards:[
    {title:'已积累的成果',label:'BUILT',progress:100,description:'对应已完成实践与成果的卡片位置。'},
    {title:'正在开展的探索',label:'EXPLORING',progress:40,description:'对应正在投入的具体任务位置。'},
    {title:'下一步行动',label:'NEXT',progress:0,description:'对应尚未开始的具体任务位置。'}
  ]},
  model:{title:'能力模型',subtitle:'Capabilities / Work',description:'选择能力维度，查看能做的事与关联作品。当前只验证关联框架。'},
  pending:{title:'待定',subtitle:'Undefined',description:'暂不定义这个页面的用途。'}
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
  {command:'session.connect --guest',result:'连接成功。欢迎来到 somebody 的个人终端。'},
  {command:'whoami --brief',result:'我是 somebody，一个记录个人身份、状态、任务与能力的数字终端。\n这里连接我的设计实践、系统思考、团队经验和未来探索。\n[DEMO] 这是介绍结构示例，真实 resume 后续补充。'},
  {command:'tasks.summary --today',result:'今日任务摘要 / 演示数据\n4 个并行方向 · 4 项进行中 · 4 项未开始 · 4 项已完成。\n当前关注：体验设计、系统与规模、团队与领导力、AI 探索。\n你可以查看任务状态，也可以查询能力和对应作品。'},
  {command:'route.select',result:'接下来，你想查看什么？点击命令选项，或输入 1 / 2。'}
];
let welcomeCount=0,welcomeTimer=null,loginTimer=null,loginStep=0,loggedIn=false;
function stopWelcome(){clearTimeout(welcomeTimer);welcomeTimer=null;}
function navigate(target){
  view=target;filter='all';render();$(`nav-${target}`).focus({preventScroll:true});
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
  loggedIn=true;view='identity';filter='all';
  if($('loginScreen').open)$('loginScreen').close();
  render();$('boardPanel').focus({preventScroll:true});
}
function startLogin(){
  clearTimeout(loginTimer);stopWelcome();stopAscii();
  loggedIn=false;welcomeCount=0;loginStep=0;commandHistory.length=0;
  $('loginLog').replaceChildren();$('loginProgress').value=0;
  $('loginStatus').textContent='初始化连接';
  if(!$('loginScreen').open)$('loginScreen').showModal();
  $('loginMotionToggle').textContent=asciiPaused?'播放动画':'暂停动画';
  $('loginMotionToggle').setAttribute('aria-pressed',String(asciiPaused));
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
  const loginToggle=$('loginMotionToggle');
  loginToggle.textContent=asciiPaused?'播放动画':'暂停动画';
  loginToggle.setAttribute('aria-pressed',String(asciiPaused));
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
    $('asciiStatus').textContent='汉字乌鸦 / 84姿态暂用版 / 24 fps / 林间视差';
  }).catch(error=>{
    if(request!==asciiRequest)return;
    asciiCanvas=null;$('asciiStatus').textContent='动画加载失败，切换页面可重试。';
    console.error('Chinese crow:',error);
  });
}
reducedMotion.addEventListener('change',event=>{asciiPaused=event.matches;syncAscii();});
document.addEventListener('visibilitychange',syncAscii);
const commandOutputs={
  help:'可用命令：whoami、about、experience、principles、clear。\n输入 1 或 todo 查看任务；输入 2 或 portfolio 查看能力作品集。\n这里只模拟个人介绍，不会执行系统命令。',
  whoami:'somebody\n个人身份字段待补充。',
  about:'个人简介待补充。\n这里将介绍我是谁，以及我的设计观点。',
  experience:'经历内容待补充。\n这里将输出真实的职业经历。',
  principles:'设计理念待补充。\n这里将输出个人判断与工作原则。'
};
function renderTerminal(){
  stopWelcome();
  const previousInput=$('commandInput');
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
    const status=element('span','ascii-status','加载汉字乌鸦…');status.id='asciiStatus';
    visual.append(art,status);
  }
  const output=element('div','terminal-output');
  output.setAttribute('role','log');output.setAttribute('aria-label','命令输出');
  output.append(element('p','terminal-welcome','somebody / guest session\n自动对话 · 演示模式 · 无系统权限'));
  welcomeMessages.slice(0,welcomeCount).forEach(item=>output.append(element('p','terminal-command',`somebody:~ $ ${item.command}`),element('pre','terminal-result',item.result)));
  commandHistory.forEach(item=>output.append(element('p','terminal-command',`somebody:~ $ ${item.command}`),element('pre','terminal-result',item.result)));
  if(welcomeCount===welcomeMessages.length){
    const choices=element('div','terminal-choices');
    [['todo','[1] open tasks     / 查看 TODO list'],['model','[2] open portfolio / 查看我的作品集']].forEach(([target,text])=>{
      const button=element('button','terminal-choice');button.type='button';
      const cursor=element('span','terminal-cursor','▌');cursor.setAttribute('aria-hidden','true');
      button.append(element('span','choice-marker','>'),element('span','',text),cursor);
      button.onclick=()=>navigate(target);choices.append(button);
    });
    output.append(choices);
  }else{
    const skip=element('button','welcome-skip','显示完整摘要 →');
    skip.onclick=()=>{welcomeCount=welcomeMessages.length;renderTerminal();};
    output.append(skip);
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
  body.append(visual,output);
  terminal.append(body,form);$('boardPanel').replaceChildren(terminal);output.scrollTop=output.scrollHeight;
  if(inputFocused){input.value=inputDraft;inputWrap.classList.toggle('has-value',Boolean(inputDraft));input.focus({preventScroll:true});}
  syncAscii();scheduleWelcome();
}
function renderModel(){
  const layout=element('section','model-layout'),dimensions=element('div','model-dimensions');
  dimensions.append(element('span','eyebrow','MODEL / 能力维度'),element('h2','','somebody 的能力模型'),element('p','model-caption','维度是能力入口，不使用虚构分数。'));
  tracks.forEach((track,index)=>{
    const button=element('button','dimension-button');
    button.type='button';button.setAttribute('aria-pressed',String(index===dimension));
    button.append(element('span','',`0${index+1}`),element('strong','',track.title),element('span','','→'));
    button.onclick=()=>{dimension=index;renderModel();document.querySelectorAll('.dimension-button')[index].focus();};
    dimensions.append(button);
  });
  const detail=element('div','model-detail');
  detail.append(element('span','eyebrow','SELECTED DIMENSION'),element('h2','',tracks[dimension].title));
  const ability=element('section','ability-block');
  ability.append(element('h3','','能做的事'),element('p','','这里将描述这项能力可以解决的问题、工作范围与方法。具体内容待补充。'));
  const work=element('section','work-block');
  work.append(element('h3','','关联作品 / Portfolio'),element('p','','真实作品后续与所选能力维度关联。当前不填充示例项目或虚构成果。'));
  const connection=element('div','model-connection','能力维度 → 能做的事 → 作品证据');
  detail.append(ability,work,connection);layout.append(dimensions,detail);$('boardPanel').replaceChildren(layout);
}
function progress(value,title){
  const wrapper=element('div','progress-wrapper'),label=element('span','progress-label');
  label.append(element('span','','任务进度 / 示例'),element('span','',`${value}%`));
  const bar=element('progress','task-progress');bar.max=100;bar.value=value;
  bar.setAttribute('aria-label',`${title}：示例任务进度`);
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
  $('footerNote').textContent=isTodo?'完成状态与进度属于具体任务，不属于成长方向。':'当前仅验证页面框架，个人内容与图片后续补充。';
  $('boardPanel').setAttribute('aria-labelledby',`nav-${view}`);
  const image=tabImages[view];
  $('tabImage').hidden=!image;$('imagePending').hidden=Boolean(image);
  if(image){$('tabImage').src=image.src;$('tabImage').alt=image.alt;}
  else $('tabImage').removeAttribute('src');
  $('pictureLabel').textContent=`${data.title} / ${image?'图片区域':'图片待定'}`;
  $('boardPanel').replaceChildren();
  if(view==='identity'){renderTerminal();return;}
  if(view==='model'){renderModel();return;}
  if(view==='pending'){
    const empty=element('section','pending-page');
    empty.append(element('span','eyebrow','04 / UNDEFINED'),element('h2','','这一页，暂时留白。'),element('p','','用途、内容与页面框架均待确定。'));
    $('boardPanel').append(empty);return;
  }
  $('boardPanel').append(element('div','columns'));document.querySelector('.columns').id='columns';
  $('columns').style.setProperty('--columns',data.columns.length);
  $('columns').replaceChildren();
  // Status and progress belong to example tasks, never to an entire growth direction.
  data.columns.forEach((column,index)=>{
    const section=element('section','column');section.style.setProperty('--track',column.color);
    const header=element('header','column-heading'),meta=element('span','column-code');
    meta.append(element('span','',`0${index+1} / ${column.code}`),element('i'));
    const heading=element('h2','',column.title);
    header.append(meta,heading);section.setAttribute('aria-label',column.title);
    const list=element('div','card-list');
    const cards=data.cards.filter(card=>filter==='all'||(filter==='done'?card.progress===100:card.progress!==null&&card.progress<100));
    cards.forEach((card,cardIndex)=>{
      const button=element('button',`task-card${card.progress===100?' done':''}`);button.type='button';
      const status=card.progress===null?'信息模块':card.progress===100?'✓ 已完成':card.progress===0?'○ 未开始':'◉ 进行中';
      const meta=element('span','card-meta');
      meta.append(element('span','',card.label),element('span','card-state',status));
      button.append(meta,element('span','card-title',card.title),element('span','card-copy',card.description));
      if(card.progress!==null)button.append(progress(card.progress,card.title));
      const bottom=element('span','card-bottom');
      bottom.append(element('span','',`示例 ${String(cardIndex+1).padStart(2,'0')}`),element('span','','查看结构 ↗'));
      button.append(bottom);
      button.onclick=()=>{
        trigger=button;$('dialogTitle').textContent=card.title;
        $('dialogText').textContent=`${column.title} / ${card.label}。${card.description}`;
        $('dialogProgress').replaceChildren();
        if(card.progress!==null)$('dialogProgress').append(progress(card.progress,card.title));
        $('cardDialog').showModal();
      };
      list.append(button);
    });
    if(!cards.length)list.append(element('p','empty','该视图暂无此状态的示例'));
    section.append(header,list);$('columns').append(section);
  });
  $('boardPanel').scrollTop=0;$('boardPanel').scrollLeft=0;
}
document.querySelectorAll('[data-view]').forEach(button=>{
  button.onclick=()=>{view=button.dataset.view;filter='all';render();};
  button.onkeydown=event=>{
    const keys=Object.keys(views),index=keys.indexOf(button.dataset.view);
    let target;
    if(event.key==='ArrowDown')target=keys[(index+1)%keys.length];
    if(event.key==='ArrowUp')target=keys[(index+keys.length-1)%keys.length];
    if(event.key==='Home')target=keys[0];
    if(event.key==='End')target=keys[keys.length-1];
    if(target){event.preventDefault();view=target;filter='all';render();$(`nav-${target}`).focus();}
  };
});
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;render();});
$('closeDialog').onclick=()=>$('cardDialog').close();
$('cardDialog').addEventListener('close',()=>trigger?.focus({preventScroll:true}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&$('cardDialog').open){event.preventDefault();$('cardDialog').close();}
});
$('loginMotionToggle').onclick=()=>{asciiPaused=!asciiPaused;syncAscii();};
$('replayLogin').onclick=startLogin;
$('loginScreen').addEventListener('cancel',event=>{event.preventDefault();finishLogin();});
render();
startLogin();
