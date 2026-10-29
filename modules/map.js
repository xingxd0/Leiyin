import {territory,connected,canMove,nearestHex,distance,hexGeometry,hexCenter,hexVertices,sharedHexEdges} from './hex-map.js?v=20261029-shared-edges';
import {buildMapContent} from './map-content.js?v=20261029-award-logos';
function element(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
export function renderPage(host){
  const origin=4000,size=8000,key='leiyin.map.positions.v1';
  const nodes=[{id:'me',q:0,r:0,title:'ME',label:'THE ORIGIN',symbol:'◎',tone:'lime',text:'Every exploration starts here. A growing map of ideas, experiments, and things made along the way.'},...buildMapContent()];
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'{}');
    const restored=nodes.map(n=>n.id!=='me'&&Number.isSafeInteger(saved[n.id]?.q)&&Number.isSafeInteger(saved[n.id]?.r)?{...n,q:saved[n.id].q,r:saved[n.id].r}:n);
    if(new Set(restored.map(n=>`${n.q},${n.r}`)).size===nodes.length&&connected(restored))nodes.splice(0,nodes.length,...restored);
  }catch{}
  const page=element('section','module-page hex-map map-page');page.lang='en';
  page.style.setProperty('--hex-width',`${hexGeometry.width}px`);
  page.style.setProperty('--hex-height',`${hexGeometry.height}px`);
  page.style.setProperty('--hex-edge-dash',hexGeometry.radius/15);
  const viewport=element('div','hex-viewport');viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','MAP. Drag the background to pan, scroll to zoom, drag a tile to move it.');
  const world=element('div','hex-world'),canvas=element('div','hex-canvas');world.append(canvas);viewport.append(world);
  const header=element('header','hex-header');header.append(element('span','eyebrow','MAP / EVERYTHING STARTS WITH ME'),element('h2','','A continent of becoming.'),element('p','','Drag the land to explore. Move a tile to grow. Keep every idea connected.'));
  const regions=element('div','map-region-layer'),land=element('div','map-land'),content=element('div','map-content');canvas.append(header,regions,land,content);
  const grid=document.createElementNS('http://www.w3.org/2000/svg','svg');
  grid.classList.add('map-shared-edges');grid.setAttribute('viewBox',`0 0 ${size} ${size}`);grid.setAttribute('aria-hidden','true');canvas.append(grid);
  const controls=element('div','module-controls module-zoom-controls hex-controls'),scale=element('span','module-zoom-value hex-scale'),feedback=element('p','map-feedback','Move tiles within two hex steps. Every branch stays connected to ME.');feedback.setAttribute('role','status');
  controls.setAttribute('role','group');controls.setAttribute('aria-label','Zoom controls');
  const dialog=element('dialog','module-dialog hex-dialog');dialog.setAttribute('aria-labelledby','hexDetailTitle');
  const close=element('button','hex-close','Close');close.type='button';close.onclick=()=>dialog.close();
  const label=element('p','eyebrow'),title=element('h2'),description=element('div','map-detail-records'),link=element('a','hex-link','Explore this direction in Todolist Lab →');title.id='hexDetailTitle';dialog.append(close,label,title,description,link);
  let triggerId=null;dialog.addEventListener('close',()=>content.querySelector(`[data-id="${triggerId}"]`)?.focus({preventScroll:true}));
  let zoom=1,alive=true,frame=0,initialized=false,drag=null,suppressClick=false;
  const events=new AbortController();
  const point=n=>{const p=hexCenter(n);return {x:origin+p.x,y:origin+p.y};};
  function place(el,n){const p=point(n);el.style.left=`${p.x-hexGeometry.width/2}px`;el.style.top=`${p.y-hexGeometry.radius}px`;}
  const anchors=[{q:-2,r:-1},{q:2,r:-2},{q:-2,r:2},{q:1,r:2}];
  const regionFor=n=>anchors.reduce((best,a,i)=>distance(n,a)<distance(n,anchors[best])?i:best,0);
  function drawEdges(excludeId){
    const occupied=new Map(nodes.filter(n=>n.id!==excludeId).map(n=>[`${n.q},${n.r}`,n]));
    const priority={empty:0,region:1,origin:2,pending:3,done:4};
    const edges=sharedHexEdges(territory(nodes)).map(edge=>{
      let state=edge.cells.length===1||regionFor(edge.cells[0])!==regionFor(edge.cells[1])?'region':'empty';
      for(const cell of edge.cells){
        const node=occupied.get(`${cell.q},${cell.r}`),next=node?(node.state||'origin'):'empty';
        if(priority[next]>priority[state])state=next;
      }
      return {...edge,state};
    }).sort((a,b)=>priority[a.state]-priority[b.state]);
    grid.replaceChildren();
    for(const edge of edges){
      const path=document.createElementNS(grid.namespaceURI,'path');
      path.dataset.edge=edge.key;path.dataset.state=edge.state;
      path.setAttribute('d',`M${edge.a.map(v=>v+origin).join(',')}L${edge.b.map(v=>v+origin).join(',')}`);
      grid.append(path);
    }
  }
  function dragOutline(el){
    const outline=document.createElementNS(grid.namespaceURI,'svg');
    outline.classList.add('map-drag-outline');outline.setAttribute('viewBox',`0 0 ${hexGeometry.width} ${hexGeometry.height}`);outline.setAttribute('aria-hidden','true');
    const polygon=document.createElementNS(grid.namespaceURI,'polygon');
    polygon.setAttribute('points',hexVertices({q:0,r:0}).map(([x,y])=>`${x+hexGeometry.width/2},${y+hexGeometry.radius}`).join(' '));
    outline.append(polygon);el.append(outline);
  }
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
    ['Craft & Innovation','Design Influence','People & Leadership',"AI & What’s Next"].forEach((name,index)=>{
      const text=element('span','hex-region-label',name);const p=point([{q:-3,r:-2},{q:3,r:-4},{q:-4,r:3},{q:2,r:3}][index]);text.style.left=`${p.x}px`;text.style.top=`${p.y}px`;regions.append(text);
    });
    for(const n of nodes){
      const {el,face}=tileNode(n,true);el.type='button';el.dataset.id=n.id;el.dataset.state=n.state||'origin';el.dataset.q=n.q;el.dataset.r=n.r;el.setAttribute('aria-label',`${n.title} — ${n.label}`);el.setAttribute('aria-haspopup','dialog');
      if(['reddot','if','adesign','muse','london','ny'].includes(n.logo)){
        const logo=element('img','map-award-logo');logo.src=new URL(`../logo/${n.logo}.png`,import.meta.url).href;logo.alt=`${n.title} logo`;logo.width=34;logo.height=34;logo.draggable=false;face.append(logo);
      }else face.append(element('span','hex-symbol',n.state==='done'?'✓':n.symbol));
      face.append(element('strong','',n.title),element('small','',n.label));
      el.onclick=()=>{
        triggerId=n.id;label.textContent=n.label;title.textContent=n.title;description.replaceChildren(element('p','',n.text));
        if(n.tasks){description.append(element('p','map-detail-count',`${n.completed} completed · ${n.total-n.completed} to do`));
          for(const task of n.tasks){const record=element('section','map-detail-record');record.append(element('h3','',task.title),element('p','',`${task.status==='done'?'✓':'◌'} ${task.statusLabel}${Number.isFinite(task.progress)?` · ${task.progress}%`:''}${task.local?' · This browser only':''}`));
            for(const text of [task.subtitle,task.why,task.nextStep?`Next: ${task.nextStep}`:null,task.note])if(text)record.append(element('p','',text));
            for(const work of task.works||[])record.append(element('p','',`${work.year||''} ${work.name}`.trim()));description.append(record);
          }
        }
        link.hidden=!n.columnId;if(n.columnId)link.href=`${location.pathname}?labSection=${encodeURIComponent(n.columnId)}#/tdl-lab`;dialog.showModal();
      };
      el.onkeydown=event=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(event.altKey&&d&&n.id!=='me'){event.preventDefault();move(n,{q:n.q+d[0],r:n.r+d[1]});content.querySelector(`[data-id="${n.id}"]`)?.focus({preventScroll:true});}};
      content.append(el);
    }
    drawEdges();
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
    if(!drag.moved){
      drag.moved=true;viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');
      if(drag.tile){
        drag.tile.classList.add('map-tile-dragging');canvas.append(drag.tile);dragOutline(drag.tile);
        const {el,face}=tileNode(drag.node,false);el.setAttribute('aria-hidden','true');face.append(element('span','hex-land-mark','+'));land.append(el);drawEdges(drag.node.id);
      }
    }
    event.preventDefault();if(drag.tile){const p=point(drag.node);drag.tile.style.left=`${p.x-hexGeometry.width/2+dx/zoom}px`;drag.tile.style.top=`${p.y-hexGeometry.radius+dy/zoom}px`;const target=nearestHex(p.x-origin+dx/zoom,p.y-origin+dy/zoom);drag.target=target;drag.tile.classList.toggle('map-drop-invalid',!canMove(nodes,drag.node.id,target));}
    else{viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;}
  },{signal:events.signal});
  function stopDrag(event){
    if(!drag||event.pointerId!==drag.id)return;const previous=drag;drag=null;suppressClick=previous.moved;viewport.classList.remove('is-dragging');
    if(viewport.hasPointerCapture(previous.id))viewport.releasePointerCapture(previous.id);
    if(previous.tile&&previous.moved){previous.tile.remove();if(event.type==='pointerup'&&previous.target)move(previous.node,previous.target);else draw();}
  }
  for(const name of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(name,stopDrag,{signal:events.signal});
  viewport.addEventListener('click',event=>{if(suppressClick&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick=false;}},{capture:true,signal:events.signal});
  for(const [text,name,delta] of [['−','Zoom out',-.15],['+','Zoom in',.15],['◎','Center on ME',0]]){const button=element('button','',text);button.type='button';button.setAttribute('aria-label',name);button.onclick=()=>{zoom=Math.max(.45,Math.min(1.6,zoom+delta));fit(true);};controls.append(button);}
  controls.append(scale);const legend=element('div','map-state-legend');legend.append(element('span','', '◌ Dashed · To do / In progress'),element('span','', '✓ Solid · Completed'));page.append(viewport,controls,feedback,legend,dialog);host.replaceChildren(page);draw();
  header.style.left=`${origin-360}px`;header.style.top=`${origin-540}px`;
  const resize=new ResizeObserver(()=>{if(!initialized&&viewport.clientWidth){initialized=true;zoom=viewport.clientWidth<600?.6:.8;fit(true);}else fit();});resize.observe(viewport);
  return {destroy(){alive=false;events.abort();drag=null;resize.disconnect();cancelAnimationFrame(frame);if(dialog.open)dialog.close();}};
}
