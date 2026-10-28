const stickers = [
  {id:'intro',kind:'note',title:'Good things start with a little mess.',label:'A NOTE TO SELF',x:.05,y:.04,angle:-5},
  {id:'play',kind:'poster',title:'MAKE.\nTEST.\nPLAY.',label:'HOLOGRAPHIC / DEMO',x:.52,y:.06,angle:5},
  {id:'curious',kind:'word',title:'Stay\ncurious.',label:'',x:.34,y:.43,angle:-8},
  {id:'ideas',kind:'sketch',title:'A small idea,\na new direction.',label:'SKETCH / DEMO',x:.02,y:.72,angle:4},
  {id:'progress',kind:'badge',title:'WORK IN\nPROGRESS',label:'NOTHING IS FINAL',x:.78,y:.63,angle:9},
  {id:'caption',kind:'caption',title:'Less polish.\nMore possibilities.',label:'TRY SOMETHING',x:.52,y:.88,angle:-3},
  {id:'credits',kind:'credit',title:'Thanks,\nsimeydotme!',label:'HOLO INSPIRATION',url:'https://github.com/simeydotme/pokemon-cards-css',x:.82,y:.1,angle:-6}
];
// Shuffle once per module session, then assign without replacement.
const foilEffects=['rainbow','aurora','prism','sunset','pearl','sparkle','silver'];
for(let i=foilEffects.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [foilEffects[i],foilEffects[j]]=[foilEffects[j],foilEffects[i]];
}
stickers.forEach((sticker,index)=>{sticker.effect=foilEffects[index];});
const positions = new Map();
const descriptions = {
  intro:'A paper-note study exploring color, typography, and the feeling of a personal making space.',
  play:'A holographic-foil study: move your pointer to shift the spectrum and reflected light. Flip, drag, and open the sticker to explore. This is a visual demo, not a published project.',
  curious:'An expressive typography sticker. A small reminder to keep asking questions and exploring possibilities.',
  ideas:'A sketch-style composition using simple shapes to test the collage direction.',
  progress:'A round status sticker for unfinished experiments. The board is a place to explore, not a finished portfolio.',
  caption:'A short editorial note about making room for early ideas before polishing the result.'
};
let selected = null;
let layer = 1;

function element(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderPage(host) {
  const page=element('section','workshop-page');
  page.lang='en';
  const header=element('header','workshop-header');
  const intro=element('div','workshop-intro');
  intro.append(element('span','workshop-eyebrow','A LITTLE SPACE FOR BIG WHAT-IFS'),
    element('h2','','The making room.'),
    element('p','','Ideas, experiments, and things in between.'));
  header.append(intro);
  const canvas=element('div','workshop-canvas');
  const viewport=element('div','workshop-canvas-viewport');
  viewport.append(canvas);
  const boardSize={width:1200,height:720};
  canvas.style.width=`${boardSize.width}px`;
  canvas.style.height=`${boardSize.height}px`;
  let boardScale=1;
  canvas.setAttribute('role','group');
  canvas.setAttribute('aria-label','Sticker board prototype');
  const status=element('p','workshop-sr');
  status.setAttribute('role','status');
  const help=element('p','workshop-sr','Hover to flip. Click for details. Drag to move. Arrow keys move; Shift moves faster.');
  help.id='workshopHelp';
  const dialog=element('dialog','workshop-dialog');
  dialog.setAttribute('aria-labelledby','workshopDetailTitle');
  dialog.setAttribute('aria-describedby','workshopDetailText');
  const close=element('button','workshop-detail-close','Close');
  close.type='button';
  const detailTitle=element('h2');detailTitle.id='workshopDetailTitle';
  const detailText=element('p');detailText.id='workshopDetailText';
  dialog.append(close,element('span','sticker-label','STICKER STUDY / DEMO'),detailTitle,detailText,
    element('p','workshop-detail-note','Layout and interaction prototype. Real project content will be added separately.'));
  let detailTrigger=null;
  close.onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>detailTrigger?.focus({preventScroll:true}));
  dialog.onclick=event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  };
  page.append(header,viewport,help,status,dialog);
  host.replaceChildren(page);
  const nodes=new Map();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer=matchMedia('(hover: hover) and (pointer: fine)');
  const hoverCleanups=[];
  const clamp=value=>Math.max(0,Math.min(1,value));
  function state(sticker) {
    if(!positions.has(sticker.id)){
      positions.set(sticker.id,{x:sticker.x,y:sticker.y,angle:sticker.angle});
    }
    return positions.get(sticker.id);
  }
  function limits(node) {
    // Leave room for the rotated white edge at the canvas boundaries.
    const scale=Number(node.dataset.scale);
    return {x:Math.max(1,canvas.clientWidth-node.offsetWidth*scale-80),
      y:Math.max(1,canvas.clientHeight-node.offsetHeight*scale-80)};
  }
  function paint(sticker,node) {
    const value=state(sticker),max=limits(node);
    node.style.left=`${40+value.x*max.x}px`;
    node.style.top=`${40+value.y*max.y}px`;
    node.style.setProperty('--sticker-angle',`${value.angle}deg`);
  }
  function select(sticker,node) {
    selected=sticker.id;
    nodes.forEach((item,id)=>{
      item.dataset.selected=String(id===selected);
      if(item.tagName==='BUTTON')item.setAttribute('aria-pressed',String(id===selected));
    });
    node.style.zIndex=String(++layer);
  }
  stickers.forEach((sticker,index)=>{
    const node=element(sticker.url?'a':'button',`workshop-sticker sticker-${sticker.kind}`);
    node.classList.add('sticker-holo',`sticker-${sticker.effect}`);
    node.dataset.effect=sticker.effect;
    node.dataset.scale=String(sticker.kind==='credit'?.35:.7);
    node.style.setProperty('--sticker-scale',node.dataset.scale);
    node.style.setProperty('--foil-duration',`${7+index*.6}s`);
    node.style.setProperty('--foil-delay',`${-index*1.3}s`);
    node.dataset.sticker=sticker.id;node.dataset.selected=String(sticker.id===selected);
    if(sticker.url){
      node.href=sticker.url;node.target='_blank';node.rel='noopener noreferrer';
      node.draggable=false;
    }else{
      node.type='button';
      node.setAttribute('aria-pressed',String(sticker.id===selected));
      node.setAttribute('aria-haspopup','dialog');
    }
    node.setAttribute('aria-describedby','workshopHelp');
    node.setAttribute('aria-label',sticker.url
      ? 'Thanks to simeydotme for the holographic inspiration. Open pokemon-cards-css on GitHub in a new tab. Draggable sticker.'
      : `${sticker.title.replace(/\n/g,' ')}. Movable demo sticker.`);
    if(sticker.kind==='poster'){
      const art=element('span','sticker-poster-art');
      art.setAttribute('aria-hidden','true');
      art.append(element('span','poster-orbit'),element('span','poster-dot'),element('span','poster-star','+'));
      node.append(art);
    }
    if(sticker.kind==='sketch'){
      const art=element('span','sticker-sketch-art');
      art.setAttribute('aria-hidden','true');art.append(element('span'),element('span'),element('span'));
      node.append(art);
    }
    if(sticker.label)node.append(element('span','sticker-label',sticker.label));
    node.append(element('strong','sticker-title',sticker.title));
    if(sticker.kind==='note')node.append(element('span','sticker-signature','Keep becoming.'));
    const front=element('span','sticker-front');
    front.append(...node.childNodes);
    const back=element('span','sticker-back');
    back.setAttribute('aria-hidden','true');
    if(sticker.url){
      back.append(element('span','sticker-label','GITHUB / INSPIRATION'),
        element('strong','','simeydotme'),
        element('span','sticker-credit-url','github.com/simeydotme/pokemon-cards-css'),
        element('span','sticker-back-action','Open GitHub in a new tab'));
    }else back.append(element('span','sticker-label','A PEEK BEHIND'),
      element('strong','',sticker.label||'TYPE / DEMO'),
      element('span','',descriptions[sticker.id]),
      element('span','sticker-back-action','Click to explore'));
    if(sticker.effect){
      for(const face of [front,back]){
        const foil=element('span','sticker-foil');
        foil.setAttribute('aria-hidden','true');
        face.append(foil);
      }
    }
    const visual=element('span','sticker-visual');
    visual.append(front,back);node.append(visual);
    nodes.set(sticker.id,node);canvas.append(node);
    let drag=null,suppressClick=false;
    let hoverTimer=null,leaveTimer=null;
    const clearHover=()=>{
      clearTimeout(hoverTimer);clearTimeout(leaveTimer);
      node.classList.remove('is-hovered','is-pointing');
      for(const key of ['--foil-x','--foil-y','--tilt-x','--tilt-y'])node.style.removeProperty(key);
    };
    hoverCleanups.push(clearHover);
    node.onpointerenter=event=>{
      if(!hoverPointer.matches||event.pointerType==='touch'||drag)return;
      clearTimeout(leaveTimer);
      node.classList.add('is-pointing');
      clearTimeout(hoverTimer);
      hoverTimer=setTimeout(()=>{
        if(!drag&&!dialog.open)node.classList.add('is-hovered');
      },650);
    };
    node.onpointerdown=event=>{
      if(event.button!==0)return;
      clearHover();
      select(sticker,node);node.focus({preventScroll:true});
      const max=limits(node),value=state(sticker);
      suppressClick=false;
      const rect=canvas.getBoundingClientRect();
      drag={id:event.pointerId,
        x:(event.clientX-rect.left)/boardScale,y:(event.clientY-rect.top)/boardScale,
        screenX:event.clientX,screenY:event.clientY,
        left:value.x*max.x,top:value.y*max.y,moved:false};
      node.setPointerCapture(event.pointerId);
    };
    node.onpointermove=event=>{
      if(!drag&&hoverPointer.matches&&!reducedMotion.matches&&event.pointerType!=='touch'){
        const rect=node.getBoundingClientRect();
        const x=clamp((event.clientX-rect.left)/rect.width),y=clamp((event.clientY-rect.top)/rect.height);
        node.style.setProperty('--foil-x',`${x*100}%`);
        node.style.setProperty('--foil-y',`${y*100}%`);
        node.style.setProperty('--tilt-x',`${(0.5-y)*30}deg`);
        node.style.setProperty('--tilt-y',`${(x-0.5)*36}deg`);
      }
      if(!drag||event.pointerId!==drag.id)return;
      if(Math.hypot(event.clientX-drag.screenX,event.clientY-drag.screenY)<6&&!drag.moved)return;
      drag.moved=true;node.classList.add('is-dragging');
      const max=limits(node),value=state(sticker);
      // Convert screen coordinates into the fixed board's logical coordinates.
      const rect=canvas.getBoundingClientRect();
      value.x=clamp((drag.left+(event.clientX-rect.left)/boardScale-drag.x)/max.x);
      value.y=clamp((drag.top+(event.clientY-rect.top)/boardScale-drag.y)/max.y);
      paint(sticker,node);
    };
    node.onpointerleave=()=>{
      clearTimeout(hoverTimer);
      leaveTimer=setTimeout(clearHover,180);
    };
    const release=event=>{
      if(!drag)return;
      suppressClick=drag.moved||event.type==='pointercancel';
      const moved=drag.moved;
      drag=null;node.classList.remove('is-dragging');
      if(moved)status.textContent=`${sticker.title.replace(/\n/g,' ')} moved.`;
    };
    node.onpointerup=release;node.onpointercancel=release;node.onlostpointercapture=release;
    node.onclick=event=>{
      if(suppressClick&&event.detail!==0){event.preventDefault();suppressClick=false;return;}
      select(sticker,node);
      clearHover();
      if(sticker.url)return;
      detailTrigger=node;
      detailTitle.textContent=sticker.title.replace(/\n/g,' ');
      detailText.textContent=descriptions[sticker.id];
      dialog.showModal();
    };
    node.onkeydown=event=>{
      const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!direction)return;
      event.preventDefault();select(sticker,node);
      const max=limits(node),value=state(sticker),step=(event.shiftKey?40:10)/boardScale;
      value.x=clamp(value.x+direction[0]*step/max.x);
      value.y=clamp(value.y+direction[1]*step/max.y);
      paint(sticker,node);
      status.textContent=`${sticker.title.replace(/\n/g,' ')} moved.`;
    };
  });
  function fitBoard(){
    const {width,height}=viewport.getBoundingClientRect();
    if(!width||!height)return;
    boardScale=Math.min(width/boardSize.width,height/boardSize.height);
    // Expand logical bounds to cover the full viewport, including the title.
    canvas.style.width=`${width/boardScale}px`;
    canvas.style.height=`${height/boardScale}px`;
    canvas.style.transform=`scale(${boardScale})`;
    canvas.style.left='0';
    canvas.style.top='0';
    stickers.forEach(sticker=>paint(sticker,nodes.get(sticker.id)));
  }
  const resize=new ResizeObserver(fitBoard);
  resize.observe(viewport);
  stickers.forEach(sticker=>paint(sticker,nodes.get(sticker.id)));
  fitBoard();
  const motionChange=()=>hoverCleanups.forEach(cleanup=>cleanup());
  reducedMotion.addEventListener('change',motionChange);
  return {destroy(){
    resize.disconnect();hoverCleanups.forEach(cleanup=>cleanup());
    reducedMotion.removeEventListener('change',motionChange);
    if(dialog.open)dialog.close();
  }};
}
