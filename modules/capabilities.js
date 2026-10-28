import {territory,connected,canMove,nearestHex} from './hex-map.js?v=20261028-map';
// Existing visual studies remain explicitly labeled demos until real projects are supplied.
const tiles=[
  {q:-1,r:-1,title:'Holographic foil',label:'VISUAL DEMO',symbol:'✦',text:'A study of spectrum, reflected light, and the holographic finish from the original Workshop board.',tone:'lilac'},
  {q:1,r:1,title:'Typography play',label:'TYPE DEMO',symbol:'Aa',text:'An expressive typography study built around the reminder to stay curious.',tone:'pink'},
  {q:0,r:2,title:'Small ideas',label:'SKETCH DEMO',symbol:'⌁',text:'A sketch-style composition exploring simple shapes and new visual directions.',tone:'lime'},
  {q:-2,r:1,title:'Work in progress',label:'STATUS STUDY',symbol:'◌',text:'A status study for unfinished experiments. Real Skills and incubated projects will be added when they are ready to share.',tone:'green'},
  {q:2,r:0,title:'A note to self',label:'PAPER DEMO',symbol:'↗',text:'Good things start with a little mess. A paper-note study of color and typography.',tone:'paper'},
  {q:-2,r:2,title:'More possibilities',label:'EDITORIAL DEMO',symbol:'+',text:'Less polish. More possibilities. An editorial note about making room for early ideas.',tone:'lilac'},
  {q:1,r:-1,title:'Credits & thanks',label:'INSPIRATION',symbol:'♡',text:'Thanks to simeydotme for the holographic inspiration behind the original sticker studies.',tone:'paper',url:'https://github.com/simeydotme/pokemon-cards-css'}
];
function element(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
export function renderPage(host){
  const origin=4000,size=8000,key='leiyin.map.positions.v1';
  const nodes=[{id:'me',q:0,r:0,title:'ME',label:'THE ORIGIN',symbol:'◎',tone:'lime',text:'Every exploration starts here. A growing map of ideas, experiments, and things made along the way.'},...tiles.map(tile=>({...tile,id:tile.title.toLowerCase().replace(/[^a-z]+/g,'-')}))];
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'{}');
    const restored=nodes.map(n=>n.id!=='me'&&Number.isSafeInteger(saved[n.id]?.q)&&Number.isSafeInteger(saved[n.id]?.r)?{...n,q:saved[n.id].q,r:saved[n.id].r}:n);
    if(new Set(restored.map(n=>`${n.q},${n.r}`)).size===nodes.length&&connected(restored))nodes.splice(0,nodes.length,...restored);
  }catch{}
  const page=element('section','workshop-page hex-workshop map-workspace');page.lang='en';
  const viewport=element('div','hex-viewport');viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','MAP. Drag the background to pan, scroll to zoom, drag a tile to move it.');
  const world=element('div','hex-world'),canvas=element('div','hex-canvas');world.append(canvas);viewport.append(world);
  const header=element('header','hex-header');header.append(element('span','eyebrow','MAP / EVERYTHING STARTS WITH ME'),element('h2','','A continent of becoming.'),element('p','','Drag the land to explore. Move a tile to grow. Keep every idea connected.'));
  const regions=element('div','map-region-layer'),land=element('div','map-land'),content=element('div','map-content');canvas.append(header,regions,land,content);
  const controls=element('div','hex-controls'),scale=element('span','hex-scale'),feedback=element('p','map-feedback','Move tiles within two hex steps. Every branch stays connected to ME.');feedback.setAttribute('role','status');
  const dialog=element('dialog','hex-dialog');dialog.setAttribute('aria-labelledby','hexDetailTitle');
  const close=element('button','hex-close','Close');close.type='button';close.onclick=()=>dialog.close();
  const label=element('p','eyebrow'),title=element('h2'),description=element('p'),link=element('a','hex-link','Open source inspiration ↗');title.id='hexDetailTitle';link.target='_blank';link.rel='noopener noreferrer';dialog.append(close,label,title,description,link);
  let triggerId=null;dialog.addEventListener('close',()=>content.querySelector(`[data-id="${triggerId}"]`)?.focus({preventScroll:true}));
  let zoom=1,alive=true,frame=0,initialized=false,drag=null,suppressClick=false;
  const events=new AbortController();
  const point=n=>({x:origin+Math.sqrt(3)*76*(n.q+n.r/2),y:origin+114*n.r});
  function place(el,n){const p=point(n);el.style.left=`${p.x-66}px`;el.style.top=`${p.y-76}px`;}
  function fit(center=false){
    const px=viewport.clientWidth/2,py=viewport.clientHeight/2;
    canvas.style.left=`${px}px`;canvas.style.top=`${py}px`;canvas.style.transform=`scale(${zoom})`;
    world.style.width=`${size*zoom+px*2}px`;world.style.height=`${size*zoom+py*2}px`;scale.textContent=`${Math.round(zoom*100)}%`;
    if(center){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(alive){viewport.scrollLeft=origin*zoom;viewport.scrollTop=origin*zoom;}});}
  }
  function tileNode(n,filled){const el=element(filled?'button':'div',`hex-tile ${filled?'hex-filled hex-'+n.tone:'hex-empty'}`),face=element('span','hex-face');place(el,n);el.append(face);return {el,face};}
  function draw(){
    const cells=territory(nodes);land.replaceChildren();content.replaceChildren();regions.replaceChildren();
    for(const cell of cells){if(nodes.some(n=>n.q===cell.q&&n.r===cell.r))continue;const {el,face}=tileNode(cell,false);el.setAttribute('aria-hidden','true');face.append(element('span','hex-land-mark','+'));land.append(el);}
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${size} ${size}`);svg.setAttribute('aria-hidden','true');svg.classList.add('hex-regions');
    const regionFor=n=>n.r<0?0:n.q<0?1:2;
    ['🛠️ Tools','🚧 In the making','📦 Outputs'].forEach((name,index)=>{
      const edges=new Map();
      for(const cell of cells.filter(c=>regionFor(c)===index)){
        const c=point(cell),points=Array.from({length:6},(_,i)=>{const a=(i*60-90)*Math.PI/180;return [c.x+76*Math.cos(a),c.y+76*Math.sin(a)];});
        points.forEach((a,i)=>{const b=points[(i+1)%6],key=[a,b].map(p=>p.map(v=>v.toFixed(2)).join(',')).sort().join(':');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);});
      }
      const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',[...edges.values()].map(([a,b])=>`M${a.join(',')}L${b.join(',')}`).join(' '));svg.append(path);
      const text=element('span','hex-region-label',name);const anchors=[{q:1,r:-3},{q:-3,r:1},{q:3,r:0}],p=point(anchors[index]);text.style.left=`${p.x}px`;text.style.top=`${p.y}px`;regions.append(text);
    });regions.append(svg);
    for(const n of nodes){
      const {el,face}=tileNode(n,true);el.type='button';el.dataset.id=n.id;el.dataset.q=n.q;el.dataset.r=n.r;el.setAttribute('aria-label',`${n.title} — ${n.label}`);el.setAttribute('aria-haspopup','dialog');
      face.append(element('span','hex-symbol',n.symbol),element('strong','',n.title),element('small','',n.label));
      el.onclick=()=>{triggerId=n.id;label.textContent=n.label;title.textContent=n.title;description.textContent=n.text;link.hidden=!n.url;if(n.url)link.href=n.url;dialog.showModal();};
      el.onkeydown=event=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(event.altKey&&d&&n.id!=='me'){event.preventDefault();move(n,{q:n.q+d[0],r:n.r+d[1]});content.querySelector(`[data-id="${n.id}"]`)?.focus({preventScroll:true});}};
      content.append(el);
    }
  }
  function move(n,target){
    if(!canMove(nodes,n.id,target)){feedback.textContent='Move cancelled. Choose an empty nearby hex and keep every branch connected.';draw();return false;}
    Object.assign(n,target);try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(nodes.filter(n=>n.id!=='me').map(n=>[n.id,{q:n.q,r:n.r}]))));}catch{}
    feedback.textContent='Tile moved. The continent stays connected.';draw();return true;
  }
  viewport.addEventListener('wheel',event=>{
    event.preventDefault();if(drag)return;cancelAnimationFrame(frame);
    const bounds=canvas.getBoundingClientRect(),area=viewport.getBoundingClientRect(),x=(event.clientX-bounds.left)/zoom,y=(event.clientY-bounds.top)/zoom;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);zoom=Math.max(.45,Math.min(1.6,zoom*Math.exp(-delta*.0015)));fit();
    viewport.scrollLeft=viewport.clientWidth/2+x*zoom-(event.clientX-area.left-viewport.clientLeft);viewport.scrollTop=viewport.clientHeight/2+y*zoom-(event.clientY-area.top-viewport.clientTop);
  },{passive:false,signal:events.signal});
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary)return;suppressClick=false;
    const tile=event.target.closest('[data-id]'),n=tile&&nodes.find(n=>n.id===tile.dataset.id&&n.id!=='me');
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,moved:false,tile:n?tile:null,node:n};
  },{signal:events.signal});
  viewport.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    if(!drag.moved){drag.moved=true;viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');drag.tile?.classList.add('map-tile-dragging');}
    event.preventDefault();if(drag.tile){const p=point(drag.node);drag.tile.style.left=`${p.x-66+dx/zoom}px`;drag.tile.style.top=`${p.y-76+dy/zoom}px`;const target=nearestHex(p.x-origin+dx/zoom,p.y-origin+dy/zoom);drag.target=target;drag.tile.classList.toggle('map-drop-invalid',!canMove(nodes,drag.node.id,target));}
    else{viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;}
  },{signal:events.signal});
  function stopDrag(event){
    if(!drag||event.pointerId!==drag.id)return;const previous=drag;drag=null;suppressClick=previous.moved;viewport.classList.remove('is-dragging');
    if(viewport.hasPointerCapture(previous.id))viewport.releasePointerCapture(previous.id);
    if(previous.tile&&previous.moved){if(event.type==='pointerup'&&previous.target)move(previous.node,previous.target);else draw();}
  }
  for(const name of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(name,stopDrag,{signal:events.signal});
  viewport.addEventListener('click',event=>{if(suppressClick&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick=false;}},{capture:true,signal:events.signal});
  for(const [text,name,delta] of [['−','Zoom out',-.15],['+','Zoom in',.15],['◎','Center on ME',0]]){const button=element('button','',text);button.type='button';button.setAttribute('aria-label',name);button.onclick=()=>{zoom=Math.max(.45,Math.min(1.6,zoom+delta));fit(true);};controls.append(button);}
  controls.append(scale);page.append(viewport,controls,feedback,dialog);host.replaceChildren(page);draw();
  header.style.left=`${origin-360}px`;header.style.top=`${origin-540}px`;
  const resize=new ResizeObserver(()=>{if(!initialized&&viewport.clientWidth){initialized=true;zoom=viewport.clientWidth<600?.6:.8;fit(true);}else fit();});resize.observe(viewport);
  return {destroy(){alive=false;events.abort();drag=null;resize.disconnect();cancelAnimationFrame(frame);if(dialog.open)dialog.close();}};
}
