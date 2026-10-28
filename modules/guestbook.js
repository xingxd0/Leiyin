import {guestbookConfig} from './guestbook-config.js?v=20261028-guestbook';

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
export function renderPage(host){
  let active=true,loading=false,sending=false,token='',widget=null,nextCursor=null;
  let verifyRequest=0;
  const controllers=new Set(),seen=new Set();
  const page=element('section','guestbook-page');page.lang='en';
  const intro=element('header','guestbook-intro');
  intro.append(element('span','eyebrow','04 / LEAVE A NOTE'),element('h2','','A little hello goes a long way.'),element('p','','A thought, a question, or just a hello. Leave something behind.'));
  const grid=element('div','guestbook-grid'),composer=element('section','guestbook-composer');
  composer.append(element('h3','','Leave a message'),element('p','guestbook-hint','Messages are public after review. Please leave out private or sensitive information.'));
  const form=element('form');
  const nameLabel=element('label','','Nickname'),name=element('input');
  name.id='guestbookNickname';name.name='nickname';name.required=true;name.autocomplete='nickname';nameLabel.htmlFor=name.id;
  // Code-point length is validated on submit, matching the API and database.
  name.maxLength=40;name.placeholder='What should I call you?';
  try{name.value=localStorage.getItem('leiyin.guestbook.nickname')||'';}catch{}
  const contentLabel=element('label','','Message'),content=element('textarea');
  content.id='guestbookContent';content.name='content';content.required=true;content.rows=6;content.maxLength=1000;content.placeholder='Your words go here…';contentLabel.htmlFor=content.id;
  const count=element('span','guestbook-count','0 / 500');count.id='guestbookCount';content.setAttribute('aria-describedby',count.id);
  content.oninput=()=>{count.textContent=`${[...content.value].length} / 500`;};
  const verification=element('div','guestbook-verification');
  const verifyStatus=element('p','guestbook-hint','Loading verification…');
  const retry=element('button','guestbook-secondary','Retry verification');retry.type='button';retry.hidden=true;
  const submit=element('button','guestbook-submit','Send message');submit.type='submit';submit.disabled=true;
  const feedback=element('p','guestbook-feedback');feedback.setAttribute('role','status');feedback.hidden=true;
  form.append(nameLabel,name,contentLabel,content,count,verification,verifyStatus,retry,submit,feedback);composer.append(form);
  const messages=element('section','guestbook-messages');messages.setAttribute('aria-labelledby','guestbookMessagesTitle');
  const listTitle=element('h3','','Notes from visitors');listTitle.id='guestbookMessagesTitle';
  const list=element('div','guestbook-list'),listStatus=element('p','guestbook-hint','Loading messages…');listStatus.setAttribute('role','status');
  const more=element('button','guestbook-secondary','Load more');more.type='button';more.hidden=true;
  const reload=element('button','guestbook-secondary','Try again');reload.type='button';reload.hidden=true;
  messages.append(listTitle,listStatus,list,reload,more);grid.append(composer,messages);page.append(intro,grid);host.replaceChildren(page);
  function showFeedback(text){feedback.textContent=text;feedback.hidden=false;}
  function syncSubmit(){submit.disabled=sending||!token;submit.textContent=sending?'Sending…':'Send message';}
  async function api(path,options={}){
    const controller=new AbortController();controllers.add(controller);
    const timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(`${guestbookConfig.apiBase}${path}`,{...options,signal:controller.signal,credentials:'omit'});
      const body=await response.json();
      if(!response.ok)throw new Error(response.status===429?'Too many attempts. Please wait a minute and verify again.':body.error||'Unable to complete the request.');
      return body;
    }finally{clearTimeout(timer);controllers.delete(controller);}
  }
  async function loadMessages(append=false){
    if(loading)return;loading=true;more.disabled=true;reload.hidden=true;
    listStatus.hidden=false;listStatus.textContent='Loading messages…';
    try{
      const cursor=append?nextCursor:null;
      const data=await api(`/messages${cursor?'?before='+encodeURIComponent(cursor):''}`);
      if(!active)return;
      if(!Array.isArray(data.items))throw new Error('Unexpected response. Please try again.');
      if(!append){list.replaceChildren();seen.clear();}
      for(const message of data.items){
        if(!Number.isSafeInteger(message.id)||typeof message.nickname!=='string'||typeof message.content!=='string'||seen.has(message.id))continue;
        seen.add(message.id);
        const entry=element('article','guestbook-message'),meta=element('div','guestbook-message-meta');
        meta.append(element('strong','',message.nickname));
        const date=new Date(`${message.created_at.replace(' ','T')}${/[zZ]|[+-]\d\d:\d\d$/.test(message.created_at)?'':'Z'}`);
        if(!Number.isNaN(date.valueOf())){
          const time=element('time','',new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(date));time.dateTime=date.toISOString();meta.append(time);
        }
        entry.append(meta,element('p','',message.content));list.append(entry);
      }
      nextCursor=typeof data.nextCursor==='string'?data.nextCursor:null;
      more.hidden=!nextCursor;listStatus.hidden=seen.size>0;
      if(!seen.size)listStatus.textContent='No published notes yet. You can leave the first one.';
    }catch(error){if(active){listStatus.hidden=false;listStatus.textContent=error.name==='AbortError'?'The request timed out. Please try again.':'Messages could not load. Please try again.';reload.hidden=false;}}
    finally{loading=false;if(active)more.disabled=false;}
  }
  async function setupVerification(){
    const request=++verifyRequest;token='';syncSubmit();retry.hidden=true;verifyStatus.hidden=false;
    if(!guestbookConfig.siteKey){verifyStatus.textContent='Message submission will be available soon.';return;}
    verifyStatus.textContent='Loading verification…';
    try{
      const service=await loadTurnstile();if(!active||request!==verifyRequest)return;
      if(widget!==null)service.remove(widget);
      verification.replaceChildren();
      widget=service.render(verification,{
        sitekey:guestbookConfig.siteKey,action:'guestbook',theme:'dark',size:'compact',
        callback:value=>{if(active){token=value;verifyStatus.hidden=true;retry.hidden=true;syncSubmit();}},
        'expired-callback':()=>{if(active){token='';verifyStatus.hidden=false;verifyStatus.textContent='Verification expired. Please verify again.';retry.hidden=false;syncSubmit();}},
        'error-callback':()=>{if(active){token='';verifyStatus.hidden=false;verifyStatus.textContent='Verification failed to load. Please retry.';retry.hidden=false;syncSubmit();}}
      });
    }catch{if(active&&request===verifyRequest){verifyStatus.textContent='Verification could not load. Please retry.';retry.hidden=false;}}
  }
  retry.onclick=setupVerification;reload.onclick=()=>loadMessages(Boolean(seen.size));more.onclick=()=>loadMessages(true);
  form.onsubmit=async event=>{
    event.preventDefault();if(sending||!token)return;
    const nickname=name.value.trim(),text=content.value.trim();
    if(!nickname||[...nickname].length>20||!text||[...text].length>500){showFeedback('Use 1–20 characters for your nickname and 1–500 for your message.');return;}
    sending=true;syncSubmit();name.disabled=true;content.disabled=true;
    try{
      const result=await api('/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname,content:text,token})});
      if(!active)return;
      if(result.status!=='pending')throw new Error('Unexpected response. Please check before retrying.');
      try{localStorage.setItem('leiyin.guestbook.nickname',nickname);}catch{}
      content.value='';count.textContent='0 / 500';showFeedback('Thanks! Your message is awaiting review and will appear once approved.');
    }catch(error){if(active)showFeedback(error.name==='AbortError'?'The request timed out; it may have been received. Please wait before retrying.':error.message);}
    finally{
      token='';sending=false;
      if(active){name.disabled=false;content.disabled=false;syncSubmit();setupVerification();}
    }
  };
  loadMessages();setupVerification();
  return {destroy(){active=false;verifyRequest++;controllers.forEach(controller=>controller.abort());if(widget!==null&&globalThis.turnstile)globalThis.turnstile.remove(widget);}};
}
