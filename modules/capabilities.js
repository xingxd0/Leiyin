const stickers = [
  {id:'intro',kind:'note',title:'Good things start with a little mess.',label:'A NOTE TO SELF',x:.05,y:.04,angle:-5},
  {id:'play',kind:'poster',effect:'rainbow',title:'MAKE.\nTEST.\nPLAY.',label:'RAINBOW / DEMO',x:.52,y:.06,angle:5},
  {id:'curious',kind:'word',title:'Stay\ncurious.',label:'',x:.34,y:.43,angle:-8},
  {id:'ideas',kind:'sketch',title:'A small idea,\na new direction.',label:'SKETCH / DEMO',x:.02,y:.72,angle:4},
  {id:'progress',kind:'badge',title:'WORK IN\nPROGRESS',label:'NOTHING IS FINAL',x:.78,y:.63,angle:9},
  {id:'caption',kind:'caption',title:'Less polish.\nMore possibilities.',label:'TRY SOMETHING',x:.52,y:.88,angle:-3}
];
const positions = new Map();
const descriptions = {
  intro:'A paper-note study exploring color, typography, and the feeling of a personal making space.',
  play:'A rainbow-foil study: move your pointer to shift the spectrum and reflected light. Flip, drag, and open the sticker to explore. This is a visual demo, not a published project.',
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
  const tools=element('div','workshop-tools');
  const rotate=element('button','','Rotate sticker');
  rotate.type='button';rotate.disabled=!selected;
  const reset=element('button','','Reset layout');reset.type='button';
  tools.append(rotate,reset);
  header.append(intro,tools);
  const canvas=element('div','workshop-canvas');
  canvas.setAttribute('role','group');
  canvas.setAttribute('aria-label','Sticker board prototype');
  const annotation=element('p','workshop-annotation','Pick it up. Move it around.');
  annotation.setAttribute('aria-hidden','true');
  canvas.append(annotation);
  const status=element('p','workshop-sr');
  status.setAttribute('role','status');
  const help=element('p','workshop-help','Hover to flip. Click for details. Drag to move. Arrow keys move; Shift moves faster.');
  help.id='workshopHelp';
  const footer=element('div','workshop-bottom');
  footer.append(help,element('span','workshop-prototype','LAYOUT PROTOTYPE / DEMO CONTENT'));
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
  page.append(header,canvas,footer,status,dialog);
  host.replaceChildren(page);
  const nodes=new Map();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer=matchMedia('(hover: hover) and (pointer: fine)');
  const hoverCleanups=[];
  const clamp=value=>Math.max(0,Math.min(1,value));
  function state(sticker) {
    const narrow=canvas.clientWidth<460,key=`${narrow?'narrow':'wide'}-${sticker.id}`;
    if(!positions.has(key)){
      const index=stickers.indexOf(sticker);
      positions.set(key,{x:narrow?(index%2?.9:.05):sticker.x,
        y:narrow?index*.19:sticker.y,angle:sticker.angle});
    }
    return positions.get(key);
  }
  function limits(node) {
    // Leave room for the rotated white edge at the canvas boundaries.
    return {x:Math.max(1,canvas.clientWidth-node.offsetWidth-80),
      y:Math.max(1,canvas.clientHeight-node.offsetHeight-80)};
  }
  function paint(sticker,node) {
    const value=state(sticker),max=limits(node);
    node.style.left=`${40+value.x*max.x}px`;
    node.style.top=`${40+value.y*max.y}px`;
    node.style.setProperty('--sticker-angle',`${value.angle}deg`);
  }
  function select(sticker,node) {
    selected=sticker.id;rotate.disabled=false;
    nodes.forEach((item,id)=>item.setAttribute('aria-pressed',String(id===selected)));
    node.style.zIndex=String(++layer);
  }
  stickers.forEach(sticker=>{
    const node=element('button',`workshop-sticker sticker-${sticker.kind}`);
    if(sticker.effect)node.classList.add(`sticker-${sticker.effect}`);
    node.type='button';node.dataset.sticker=sticker.id;
    node.setAttribute('aria-pressed',String(sticker.id===selected));
    node.setAttribute('aria-describedby','workshopHelp');
    node.setAttribute('aria-haspopup','dialog');
    node.setAttribute('aria-label',`${sticker.title.replace(/\n/g,' ')}. Movable demo sticker.`);
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
    back.append(element('span','sticker-label','A PEEK BEHIND'),
      element('strong','',sticker.label||'TYPE / DEMO'),
      element('span','',descriptions[sticker.id]),
      element('span','sticker-back-action','Click to explore'));
    if(sticker.effect==='rainbow'){
      for(const face of [front,back]){
        const foil=element('span','sticker-rainbow-foil');
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
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:value.x*max.x,top:value.y*max.y,moved:false};
      node.setPointerCapture(event.pointerId);
    };
    node.onpointermove=event=>{
      if(!drag&&hoverPointer.matches&&!reducedMotion.matches&&event.pointerType!=='touch'){
        const rect=node.getBoundingClientRect();
        const x=clamp((event.clientX-rect.left)/rect.width),y=clamp((event.clientY-rect.top)/rect.height);
        node.style.setProperty('--foil-x',`${x*100}%`);
        node.style.setProperty('--foil-y',`${y*100}%`);
        node.style.setProperty('--tilt-x',`${(0.5-y)*20}deg`);
        node.style.setProperty('--tilt-y',`${(x-0.5)*24}deg`);
      }
      if(!drag||event.pointerId!==drag.id)return;
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<6&&!drag.moved)return;
      drag.moved=true;node.classList.add('is-dragging');
      const max=limits(node),value=state(sticker);
      value.x=clamp((drag.left+event.clientX-drag.x)/max.x);
      value.y=clamp((drag.top+event.clientY-drag.y)/max.y);
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
      if(suppressClick&&event.detail!==0){suppressClick=false;return;}
      select(sticker,node);
      clearHover();
      detailTrigger=node;
      detailTitle.textContent=sticker.title.replace(/\n/g,' ');
      detailText.textContent=descriptions[sticker.id];
      dialog.showModal();
    };
    node.onkeydown=event=>{
      const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!direction)return;
      event.preventDefault();select(sticker,node);
      const max=limits(node),value=state(sticker),step=event.shiftKey?40:10;
      value.x=clamp(value.x+direction[0]*step/max.x);
      value.y=clamp(value.y+direction[1]*step/max.y);
      paint(sticker,node);
      status.textContent=`${sticker.title.replace(/\n/g,' ')} moved.`;
    };
  });
  rotate.onclick=()=>{
    const sticker=stickers.find(item=>item.id===selected);
    if(!sticker)return;
    const value=state(sticker);
    value.angle=value.angle>=12?-12:Math.min(12,value.angle+3);
    paint(sticker,nodes.get(selected));
    status.textContent='Sticker rotated.';
  };
  reset.onclick=()=>{
    positions.clear();selected=null;rotate.disabled=true;
    stickers.forEach(sticker=>{
      const node=nodes.get(sticker.id);node.setAttribute('aria-pressed','false');
      node.style.zIndex='';paint(sticker,node);
    });
    status.textContent='Original layout restored.';
  };
  const resize=new ResizeObserver(()=>stickers.forEach(sticker=>paint(sticker,nodes.get(sticker.id))));
  resize.observe(canvas);
  stickers.forEach(sticker=>paint(sticker,nodes.get(sticker.id)));
  const motionChange=()=>hoverCleanups.forEach(cleanup=>cleanup());
  reducedMotion.addEventListener('change',motionChange);
  return {destroy(){
    resize.disconnect();hoverCleanups.forEach(cleanup=>cleanup());
    reducedMotion.removeEventListener('change',motionChange);
    if(dialog.open)dialog.close();
  }};
}
