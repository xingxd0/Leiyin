import {playgroundConfig} from './playground-config.js?v=20261028-playground';

let turnstilePromise;
function loadTurnstile(){
  if(globalThis.turnstile)return Promise.resolve(globalThis.turnstile);
  if(turnstilePromise)return turnstilePromise;
  turnstilePromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;
    const timer=setTimeout(()=>fail(),20000);
    function fail(){clearTimeout(timer);script.remove();turnstilePromise=null;reject(new Error('Verification could not load.'));}
    script.onload=()=>{
      clearTimeout(timer);
      if(globalThis.turnstile)resolve(globalThis.turnstile);else fail();
    };
    script.onerror=fail;document.head.append(script);
  });
  return turnstilePromise;
}
function element(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
}
let browserKey;
function getBrowserKey(){
  if(browserKey)return browserKey;
  try{const saved=localStorage.getItem('leiyin.guestbook.key.v1');if(/^[a-f0-9]{64}$/.test(saved||''))return browserKey=saved;}catch{}
  browserKey=Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
  try{localStorage.setItem('leiyin.guestbook.key.v1',browserKey);}catch{}
  return browserKey;
}
export function renderPage(host){
  let active=true,loading=false,sending=false,token='',widget=null,nextCursor=null;
  let verifyRequest=0,listRequest=0;
  const ownerKey=getBrowserKey();
  const controllers=new Set(),seen=new Set(),stickers=new Map();
  const events=new AbortController();let topLayer=1,drag=null,dropPoint=null,zoom=1;
  let positions={};try{positions=JSON.parse(localStorage.getItem('leiyin.guestbook.positions.v1')||'{}');if(!positions||typeof positions!=='object')positions={};}catch{}
  function savePositions(){try{localStorage.setItem('leiyin.guestbook.positions.v1',JSON.stringify(positions));}catch{}}
  const page=element('section','module-page playground-page');page.lang='en';
  page.setAttribute('aria-label','Playground note wall');
  const intro=element('header','playground-intro');
  intro.append(element('span','eyebrow','PGD / PLAYGROUND'),element('h2','','Leave a little piece of you.'),element('p','','A playful wall for thoughts, questions, experiments, and hellos.'));
  const grid=element('div','playground-grid'),composer=element('dialog','module-dialog playground-composer');
  composer.setAttribute('aria-labelledby','playgroundComposerTitle');
  const composerClose=element('button','playground-secondary playground-composer-close','Close');composerClose.type='button';composerClose.onclick=()=>composer.close();
  composer.append(composerClose);
  composer.append(element('h3','','Leave a message'),element('p','playground-hint','Your note appears here right away for you. It becomes public after review. Please leave out private information.'));
  composer.querySelector('h3').id='playgroundComposerTitle';
  const form=element('form');
  const nameLabel=element('label','','Nickname'),name=element('input');
  name.id='playgroundNickname';name.name='nickname';name.required=true;name.autocomplete='nickname';nameLabel.htmlFor=name.id;
  // Code-point length is validated on submit, matching the API and database.
  name.maxLength=40;name.placeholder='What should I call you?';
  try{name.value=localStorage.getItem('leiyin.guestbook.nickname')||'';}catch{}
  const contentLabel=element('label','','Message'),content=element('textarea');
  content.id='playgroundContent';content.name='content';content.required=true;content.rows=6;content.maxLength=1000;content.placeholder='Your words go here…';contentLabel.htmlFor=content.id;
  const count=element('span','playground-count','0 / 500');count.id='playgroundCount';content.setAttribute('aria-describedby',count.id);
  content.oninput=()=>{count.textContent=`${[...content.value].length} / 500`;};
  const verification=element('div','playground-verification');
  const verifyStatus=element('p','playground-hint','Loading verification…');
  const retry=element('button','playground-secondary','Retry verification');retry.type='button';retry.hidden=true;
  const submit=element('button','playground-submit','Send message');submit.type='submit';submit.disabled=true;
  const feedback=element('p','playground-feedback');feedback.setAttribute('role','status');feedback.hidden=true;
  form.append(nameLabel,name,contentLabel,content,count,verification,verifyStatus,retry,submit,feedback);composer.append(form);
  const messages=element('section','playground-messages');messages.setAttribute('aria-labelledby','playgroundMessagesTitle');
  const listTitle=element('h3','','Playground notes');listTitle.id='playgroundMessagesTitle';
  const list=element('div','playground-list'),listStatus=element('p','playground-hint','Loading messages…');listStatus.setAttribute('role','status');
  const more=element('button','playground-secondary','Load more');more.type='button';more.hidden=true;
  const reload=element('button','playground-secondary','Try again');reload.type='button';reload.hidden=true;
  const add=element('button','playground-add','＋ Leave a note');add.type='button';add.setAttribute('aria-haspopup','dialog');
  const wallHint=element('p','playground-hint','Click an empty spot to leave a note. Select a sticker to read it.');
  let composerTrigger=add,verificationStarted=false;
  function openComposer(trigger=add){
    if(composer.open)return;composerTrigger=trigger;composer.showModal();
    if(!verificationStarted||(!token&&!sending)){verificationStarted=true;verification.hidden=false;setupVerification();}
  }
  add.onclick=()=>openComposer();
  composer.addEventListener('close',()=>{if(active)composerTrigger.focus({preventScroll:true});});
  page.addEventListener('click',event=>{
    if(event.target.closest('button,a,input,textarea,label,dialog,.playground-sticker'))return;
    const rect=scene.getBoundingClientRect();dropPoint={x:(event.clientX-rect.left)/zoom,y:(event.clientY-rect.top)/zoom};openComposer();
  });
  messages.append(listTitle,wallHint,add,listStatus,list,reload,more);grid.append(messages);const world=element('div','playground-world'),scene=element('div','playground-scene');scene.append(intro,grid);world.append(scene);page.append(world,composer);host.replaceChildren(page);
  const wallFeedback=element('p','playground-wall-feedback');wallFeedback.setAttribute('role','status');scene.append(wallFeedback);
  const zoomControls=element('div','module-controls module-zoom-controls playground-zoom');
  zoomControls.setAttribute('role','group');zoomControls.setAttribute('aria-label','Zoom controls');
  const zoomStatus=element('span','module-zoom-value','100%');zoomStatus.setAttribute('role','status');
  for(const [text,label,delta] of [['−','Zoom out',-.1],['+','Zoom in',.1],['◎','Reset zoom',0]]){const button=element('button','',text);button.type='button';button.setAttribute('aria-label',label);button.onclick=()=>setZoom(delta?zoom+delta:1);zoomControls.append(button);}
  zoomControls.append(zoomStatus);page.append(zoomControls);
  function setZoom(value,clientX,clientY){
    const bounds=scene.getBoundingClientRect(),area=page.getBoundingClientRect();
    const px=clientX??area.left+page.clientWidth/2,py=clientY??area.top+page.clientHeight/2;
    const x=(px-bounds.left)/zoom,y=(py-bounds.top)/zoom;
    zoom=Math.max(.6,Math.min(1.6,value));layoutStickers();
    page.scrollLeft=x*zoom-(px-area.left);page.scrollTop=y*zoom-(py-area.top);
  }
  page.addEventListener('wheel',event=>{
    if(event.target.closest('dialog,.playground-note-full'))return;
    event.preventDefault();if(drag)return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?page.clientHeight:1);
    setZoom(zoom*Math.exp(-delta*.0015),event.clientX,event.clientY);
  },{passive:false,signal:events.signal});
  function fitNickname(entry){
    const front=entry.querySelector('.playground-front'),nickname=front.querySelector('.playground-nickname');
    const style=getComputedStyle(front),label=front.querySelector('.playground-front-label'),action=front.querySelector('.playground-note-action');
    const available=front.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-label.offsetHeight-action.offsetHeight-2*parseFloat(style.rowGap);
    let size=entry.classList.contains('has-long-nickname')?16:24;nickname.style.fontSize=`${size}px`;
    while(size>10&&(nickname.scrollHeight>available||nickname.scrollWidth>nickname.clientWidth)){nickname.style.fontSize=`${--size}px`;}
  }
  function layoutStickers(){
    const width=page.clientWidth,cardWidth=Math.min(180,width-40),columns=Math.max(1,Math.floor((width-32)/(cardWidth+65)));
    let bottom=page.clientHeight;
    [...stickers.values()].forEach(({entry},index)=>{
      const saved=positions[entry.dataset.messageId];
      const x=saved&&Number.isFinite(saved.x)?saved.x*width:28+(index%columns)*(cardWidth+65)+((Math.floor(index/columns)%2)*32);
      const y=saved&&Number.isFinite(saved.y)?saved.y:(width<650?340:240)+Math.floor(index/columns)*230+(index%columns)*28;
      const left=Math.max(12,Math.min(width-cardWidth-12,x)),top=Math.max(16,y);
      entry.style.left=`${left}px`;entry.style.top=`${top}px`;entry.style.width=`${cardWidth}px`;fitNickname(entry);bottom=Math.max(bottom,top+230);
    });
    list.style.height=`${bottom}px`;scene.style.width=`${width}px`;scene.style.height=`${bottom}px`;scene.style.transform=`scale(${zoom})`;world.style.width=`${width*zoom}px`;world.style.height=`${bottom*zoom}px`;zoomStatus.textContent=`${Math.round(zoom*100)}%`;
  }
  const resize=new ResizeObserver(layoutStickers);resize.observe(page);
  function showFeedback(text){feedback.textContent=text;feedback.hidden=false;}
  function syncSubmit(){submit.disabled=sending||!token;submit.textContent=sending?'Sending…':'Send message';}
  async function api(path,options={}){
    const controller=new AbortController();controllers.add(controller);
    const timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(`${playgroundConfig.apiBase}${path}`,{...options,headers:{...options.headers,'X-Guestbook-Key':ownerKey},signal:controller.signal,credentials:'omit'});
      const body=await response.json();
      if(!response.ok)throw new Error(response.status===429?'Too many attempts. Please wait a minute and verify again.':body.error||'Unable to complete the request.');
      return body;
    }finally{clearTimeout(timer);controllers.delete(controller);}
  }
  function renderMessage(message,prepend=false){
    if(!message||!Number.isSafeInteger(message.id)||typeof message.nickname!=='string'||typeof message.content!=='string'||seen.has(message.id))return;
    seen.add(message.id);
    const entry=element('div','playground-sticker'),flip=element('button','playground-flip'),inner=element('span','playground-sticker-inner');
    const front=element('span','playground-face playground-front'),back=element('span','playground-face playground-back');
    flip.type='button';flip.setAttribute('aria-label',`Read note from ${message.nickname}`);flip.setAttribute('aria-pressed','false');back.setAttribute('aria-hidden','true');
    front.append(element('span','playground-tape'),element('span','playground-front-label','A NOTE FROM'),element('strong','playground-nickname',message.nickname),element('span','playground-note-action','Click to flip · Drag to move'));
    if([...message.nickname].length>12)entry.classList.add('has-long-nickname');
    const date=new Date(`${String(message.created_at||'').replace(' ','T')}${/[zZ]|[+-]\d\d:\d\d$/.test(message.created_at)?'':'Z'}`);
    const meta=element('span','playground-message-meta',message.nickname);
    if(!Number.isNaN(date.valueOf()))meta.append(element('time','',new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(date)));
    back.append(meta,element('span','playground-note-full',message.content));
    if(message.visibility==='private')back.append(element('span','playground-private','Only visible to you'));
    back.append(element('span','playground-note-action','Click to return'));
    inner.append(front,back);flip.append(inner);entry.append(flip);
    entry.dataset.shape=['ticket','pebble','round','postcard','badge'][message.id%5];
    entry.dataset.foil=['spectrum','satin','prism','metal'][Math.floor(message.id/5+message.id)%4];
    entry.dataset.tone=String(message.id%3);
    entry.dataset.messageId=String(message.id);entry.style.setProperty('--note-angle',`${(message.id%5-2)*1.3}deg`);
    let moved=false;
    flip.onclick=event=>{
      if(moved&&event.detail!==0){moved=false;return;}
      const flipped=entry.classList.toggle('is-flipped');flip.setAttribute('aria-pressed',String(flipped));
      front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped));
      flip.setAttribute('aria-label',flipped?`Return to nickname for ${message.nickname}`:`Read note from ${message.nickname}`);
      entry.style.zIndex=String(++topLayer);
    };
    entry.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0)return;
      moved=false;entry.style.zIndex=String(++topLayer);
      drag={id:event.pointerId,entry,x:event.clientX,y:event.clientY,left:parseFloat(entry.style.left),top:parseFloat(entry.style.top),moved:false,markMoved:()=>{moved=true;}};
    },{signal:events.signal});
    entry.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||drag?.moved)return;
      const bounds=entry.getBoundingClientRect(),x=(event.clientX-bounds.left)/bounds.width,y=(event.clientY-bounds.top)/bounds.height;
      entry.style.setProperty('--shine-x',`${x*100}%`);entry.style.setProperty('--shine-y',`${y*100}%`);
      entry.style.setProperty('--tilt-x',`${(0.5-y)*14}deg`);entry.style.setProperty('--tilt-y',`${(x-0.5)*14}deg`);
    },{signal:events.signal});
    entry.addEventListener('pointerleave',()=>{for(const key of ['--shine-x','--shine-y','--tilt-x','--tilt-y'])entry.style.removeProperty(key);},{signal:events.signal});
    stickers.set(message.id,{entry});if(prepend)list.prepend(entry);else list.append(entry);layoutStickers();
  }
  page.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=(event.clientX-drag.x)/zoom,dy=(event.clientY-drag.y)/zoom;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    if(!drag.moved){drag.moved=true;drag.markMoved();drag.entry.setPointerCapture(event.pointerId);drag.entry.classList.add('is-dragging');}
    event.preventDefault();
    drag.entry.style.left=`${Math.max(12,Math.min(page.clientWidth-drag.entry.offsetWidth-12,drag.left+dx))}px`;
    drag.entry.style.top=`${Math.max(16,drag.top+dy)}px`;
  },{signal:events.signal});
  function endDrag(event){
    if(!drag||event.pointerId!==drag.id)return;
    const {entry,moved,id}=drag;drag=null;entry.classList.remove('is-dragging');
    if(entry.hasPointerCapture(id))entry.releasePointerCapture(id);
    if(moved){positions[entry.dataset.messageId]={x:parseFloat(entry.style.left)/page.clientWidth,y:parseFloat(entry.style.top)};savePositions();layoutStickers();}
  }
  for(const event of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(event,endDrag,{signal:events.signal});
  async function loadMessages(append=false){
    if(loading)return;const request=++listRequest;loading=true;more.disabled=true;reload.hidden=true;
    listStatus.hidden=false;listStatus.textContent='Loading messages…';
    try{
      const cursor=append?nextCursor:null;
      const data=await api(`/messages${cursor?'?before='+encodeURIComponent(cursor):''}`);
      if(!active||request!==listRequest)return;
      if(!Array.isArray(data.items))throw new Error('Unexpected response. Please try again.');
      if(!append){list.replaceChildren();seen.clear();stickers.clear();}
      data.items.forEach(message=>renderMessage(message));
      nextCursor=typeof data.nextCursor==='string'?data.nextCursor:null;
      more.hidden=!nextCursor;listStatus.hidden=seen.size>0;
      if(!seen.size)listStatus.textContent='No notes yet. You can leave the first one.';
    }catch(error){if(active&&request===listRequest){listStatus.hidden=false;listStatus.textContent=error.name==='AbortError'?'The request timed out. Please try again.':'Messages could not load. Please try again.';reload.hidden=false;}}
    finally{if(request===listRequest){loading=false;if(active)more.disabled=false;}}
  }
  async function setupVerification(){
    const request=++verifyRequest;token='';syncSubmit();retry.hidden=true;verifyStatus.hidden=false;
    if(!playgroundConfig.siteKey){verifyStatus.textContent='Message submission will be available soon.';return;}
    verifyStatus.textContent='Loading verification…';
    try{
      const service=await loadTurnstile();if(!active||request!==verifyRequest)return;
      if(widget!==null)service.remove(widget);
      verification.replaceChildren();
      widget=service.render(verification,{
        sitekey:playgroundConfig.siteKey,action:'guestbook',theme:'dark',size:'compact',appearance:'interaction-only',
        callback:value=>{if(active){token=value;verifyStatus.hidden=true;retry.hidden=true;syncSubmit();}},
        'expired-callback':()=>{if(active){token='';verifyStatus.hidden=false;verifyStatus.textContent='Verification expired. Please verify again.';retry.hidden=false;syncSubmit();}},
        'error-callback':()=>{if(active){token='';verifyStatus.hidden=false;verifyStatus.textContent='Verification failed to load. Please retry.';retry.hidden=false;syncSubmit();}}
      });
    }catch{if(active&&request===verifyRequest){verifyStatus.textContent='Verification could not load. Please retry.';retry.hidden=false;}}
  }
  retry.onclick=()=>{verification.hidden=false;retry.textContent='Retry verification';setupVerification();};reload.onclick=()=>loadMessages(Boolean(seen.size));more.onclick=()=>loadMessages(true);
  form.onsubmit=async event=>{
    event.preventDefault();if(sending||!token)return;
    const nickname=name.value.trim(),text=content.value.trim();
    if(!nickname||[...nickname].length>20||!text||[...text].length>500){showFeedback('Use 1–20 characters for your nickname and 1–500 for your message.');return;}
    let accepted=false;
    sending=true;syncSubmit();name.disabled=true;content.disabled=true;
    try{
      const result=await api('/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname,content:text,token})});
      if(!active)return;
      if(result.status!=='pending')throw new Error('Unexpected response. Please check before retrying.');
      accepted=true;
      ++listRequest;loading=false;
      if(result.item){
        if(dropPoint){positions[result.item.id]={x:dropPoint.x/page.clientWidth,y:Math.max(16,dropPoint.y)};savePositions();}
        renderMessage(result.item,true);listStatus.hidden=true;
      }
      try{localStorage.setItem('leiyin.guestbook.nickname',nickname);}catch{}
      content.value='';count.textContent='0 / 500';showFeedback('Message sent. Thanks for leaving a note.');
      composer.close();wallFeedback.textContent='Message sent. Your sticker is on the wall.';dropPoint=null;
      loadMessages();
    }catch(error){if(active)showFeedback(error.name==='AbortError'?'The request timed out; it may have been received. Please wait before retrying.':error.message);}
    finally{
      token='';sending=false;
      if(active){
        name.disabled=false;content.disabled=false;syncSubmit();
        verification.hidden=true;verifyStatus.hidden=false;
        verifyStatus.textContent=accepted?'Your message was received. Verification is only needed again for a new message.':'Before retrying, renew verification using the button below.';
        retry.textContent=accepted?'Write another message':'Retry verification';retry.hidden=false;
      }
    }
  };
  loadMessages();
  return {destroy(){active=false;events.abort();resize.disconnect();drag=null;if(composer.open)composer.close();verifyRequest++;controllers.forEach(controller=>controller.abort());if(widget!==null&&globalThis.turnstile)globalThis.turnstile.remove(widget);}};
}
