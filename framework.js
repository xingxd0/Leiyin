const views=siteConfig.views;
const tabImages=siteConfig.images;
const $=id=>document.getElementById(id);
function element(tag,cls,text){
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n;
}
let view='identity',filter='all',trigger=null,renderRequest=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let identityController=null,pageController=null,loginTimer=null,loginStep=0,loggedIn=false;
function stopWelcome(){
  identityController?.destroy();identityController=null;
  pageController?.destroy();pageController=null;
}
const routes=Object.fromEntries(Object.entries(views).map(([key,data])=>[key,data.route]));
let activeRoute=null;
function routeView(){
  return Object.keys(routes).find(key=>`#${routes[key]}`===location.hash)||'identity';
}
function syncRoute(){
  const route=location.hash;
  if(route===activeRoute)return;
  activeRoute=route;
  if(!route){
    if($('cardDialog').open){trigger=null;$('cardDialog').close();}
    document.title='Login / Always Becoming';
    startLogin();
    return;
  }
  clearTimeout(loginTimer);loginTimer=null;
  stopLoginCrow();
  if($('loginScreen').open)$('loginScreen').close();
  loggedIn=true;
  view=routeView();filter='all';
  if(location.hash!==`#${routes[view]}`){
    history.replaceState(null,'',`${location.pathname}${location.search}#${routes[view]}`);
    activeRoute=location.hash;
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
function finishLogin(){
  clearTimeout(loginTimer);loginTimer=null;
  stopLoginCrow();
  history.replaceState(null,'',`${location.pathname}${location.search}#/idt`);
  syncRoute();$('boardPanel').focus({preventScroll:true});
}
function startLogin(){
  renderRequest++;
  clearTimeout(loginTimer);stopWelcome();stopAscii();
  loggedIn=false;loginStep=0;
  $('loginLog').replaceChildren();$('loginProgress').value=0;
  $('loginStatus').textContent='Initializing connection';
  if(!$('loginScreen').open)$('loginScreen').showModal();
  startLoginCrow();
  const steps=['[ OK ] Terminal signal detected','[ OK ] Guest channel open','[ OK ] Identity profile mounted','[ OK ] Task and map modules ready'];
  function advance(){
    $('loginLog').append(element('p','',steps[loginStep]));
    loginStep++;$('loginProgress').value=loginStep*25;
    $('loginStatus').textContent=loginStep===4?'Connected / ACCESS GRANTED':'Connecting automatically';
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
  const art=$('navigationCrow');
  loginCrowController?.setPaused(asciiPaused||document.hidden);
  if(!art||!loggedIn)return;
  const paused=asciiPaused||document.hidden||!loggedIn;
  if(asciiController){asciiController.setPaused(paused);return;}
  if(asciiCanvas===art)return;
  stopAscii();asciiCanvas=art;
  const request=asciiRequest;
  import('./terminal-crow.js').then(async({createCrow})=>{
    if(request!==asciiRequest||!art.isConnected||!loggedIn)return;
    const controller=await createCrow(art,{
      paused:asciiPaused||document.hidden||!loggedIn,
      isCurrent:()=>request===asciiRequest&&art.isConnected&&loggedIn
    });
    if(!controller)return;
    if(request!==asciiRequest||!art.isConnected||!loggedIn){controller.destroy();return;}
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
function renderTerminal(){
  stopWelcome();
  const terminal=element('section','terminal');
  terminal.setAttribute('aria-label','Personal introduction terminal');
  const body=element('div','terminal-body');
  terminal.append(body);$('boardPanel').replaceChildren(terminal);
  identityController=createIdentityTerminal(body,{navigate,reducedMotion});
  syncAscii();
}
function render(){
  const request=++renderRequest;
  stopWelcome();
  document.querySelectorAll('[data-view]').forEach(button=>{
    const metadata=views[button.dataset.view];
    button.querySelector('strong').textContent=metadata.title;
    button.querySelector('small').textContent=metadata.subtitle;
  });
  document.querySelectorAll('[data-view]').forEach(button=>{
    const active=button.dataset.view===view;
    button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
  });
  document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
  const data=views[view];
  document.querySelector('.identity > strong').replaceChildren(
    document.createTextNode(view==='identity'?'Xudong Xing':'Xudong'),element('span','','.')
  );
  document.querySelector('.identity > small').textContent=view==='identity'
    ? 'PRODUCT DESIGN LEADER / ALWAYS BECOMING':'PERSONAL TERMINAL / GUEST ONLINE';
  $('workspace').classList.toggle('identity-workspace',view==='identity');
  $('workspace').classList.toggle('roadmap-workspace',view==='todo');
  $('workspace').classList.toggle('todolist-lab-workspace',view==='todoLab');
  $('workspace').classList.toggle('map-workspace-shell',view==='map');
  $('workspace').classList.toggle('playground-workspace',view==='playground');
  $('viewTitle').replaceChildren(document.createTextNode(data.title),element('small','',data.subtitle));
  $('viewDescription').textContent=data.description;
  const isTodo=view==='todo';
  document.querySelector('.filters').hidden=!isTodo;
  $('columnCount').textContent=isTodo?'TDL':view==='identity'?'IDT':view==='map'?'MAP':view==='playground'?'PGD':'UNDEFINED';
  $('footerNote').textContent='Always Becoming.';
  $('boardPanel').setAttribute('aria-labelledby',`nav-${view}`);
  const image=tabImages[view];
  $('tabImage').hidden=!image;
  if(image){$('tabImage').src=image.src;$('tabImage').alt=image.alt;}
  else $('tabImage').removeAttribute('src');
  $('boardPanel').replaceChildren();
  syncAscii();
  if(view==='identity'){renderTerminal();return;}
  const target=view;
  import(siteConfig.modules[target]).then(module=>{
    // Ignore imports resolved after a later navigation, including login.
    if(request!==renderRequest||view!==target)return;
    const mount=target==='todo'?module.renderRoadmap:module.renderPage;
    pageController=mount($('boardPanel'));
  }).catch(error=>{
    if(request!==renderRequest)return;
    $('boardPanel').append(element('p','module-error','This page could not load. Please refresh and try again.'));
    console.error('Page module:',error);
  });
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
window.addEventListener('hashchange',syncRoute);
syncRoute();
