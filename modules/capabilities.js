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
  const page=element('section','workshop-page hex-workshop');page.lang='en';
  const header=element('header','hex-header');header.append(element('span','eyebrow','WORKSHOP / A WORLD IN THE MAKING'),element('h2','','Small ideas. New territories.'),element('p','','Tools, experiments, and things made along the way.'));
  const toolbar=element('div','hex-toolbar'),help=element('p','','Three territories, one board. Select a tile to explore; demo content is labeled.');
  const controls=element('div','hex-controls');controls.setAttribute('aria-label','Map controls');
  const viewport=element('div','hex-viewport');viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Workshop hexagonal map. Scroll to explore.');viewport.tabIndex=0;
  const world=element('div','hex-world'),canvas=element('div','hex-canvas');world.append(canvas);viewport.append(world);
  const status=element('span','hex-scale');status.setAttribute('role','status');
  let zoom=1,initialized=false,alive=true,frame=0;
  function fit(center=false){
    const width=900*zoom,height=760*zoom;world.style.width=`${width}px`;world.style.height=`${height}px`;canvas.style.transform=`scale(${zoom})`;status.textContent=`${Math.round(zoom*100)}%`;
    if(center){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(alive){viewport.scrollLeft=(width-viewport.clientWidth)/2;viewport.scrollTop=(height-viewport.clientHeight)/2;}});}
  }
  for(const [text,label,change] of [['−','Zoom out',-.15],['+','Zoom in',.15],['◎','Center map',0]]){
    const button=element('button','',text);button.type='button';button.setAttribute('aria-label',label);
    button.onclick=()=>{zoom=Math.max(.6,Math.min(1.6,zoom+change));fit(true);};controls.append(button);
  }
  controls.append(status);toolbar.append(help,controls);
  const dialog=element('dialog','hex-dialog');dialog.setAttribute('aria-labelledby','hexDetailTitle');
  const close=element('button','hex-close','Close');close.type='button';close.onclick=()=>dialog.close();
  const label=element('p','eyebrow'),title=element('h2'),description=element('p'),link=element('a','hex-link','Open source inspiration ↗');title.id='hexDetailTitle';link.target='_blank';link.rel='noopener noreferrer';
  dialog.append(close,label,title,description,link);let trigger=null;
  dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
  // Shared hex edges cancel within each territory, leaving a dashed perimeter.
  const regions=[{name:'🛠️ Tools',x:450,y:72},{name:'🚧 In the making',x:180,y:470},{name:'📦 Outputs',x:710,y:470}];
  const regionFor=(q,r)=>r<0?0:q<0?1:2;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('hex-regions');svg.setAttribute('viewBox','0 0 900 760');svg.setAttribute('aria-hidden','true');
  regions.forEach((region,index)=>{
    const edges=new Map();
    for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++){
      if(Math.abs(q+r)>3||regionFor(q,r)!==index)continue;
      const cx=450+Math.sqrt(3)*76*(q+r/2),cy=380+114*r;
      const points=Array.from({length:6},(_,i)=>{const a=(i*60-90)*Math.PI/180;return [cx+76*Math.cos(a),cy+76*Math.sin(a)];});
      points.forEach((a,i)=>{const b=points[(i+1)%6],key=[a,b].map(p=>p.map(n=>n.toFixed(2)).join(',')).sort().join(':');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);});
    }
    const path=document.createElementNS(svg.namespaceURI,'path');
    path.setAttribute('d',[...edges.values()].map(([a,b])=>`M${a.join(',')}L${b.join(',')}`).join(' '));svg.append(path);
    const heading=element('span','hex-region-label',region.name);heading.style.left=`${region.x}px`;heading.style.top=`${region.y}px`;canvas.append(heading);
  });
  canvas.append(svg);
  const nodes=new Map();
  for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++){
    if(Math.abs(q+r)>3)continue;
    const tile=tiles.find(tile=>tile.q===q&&tile.r===r),node=element(tile?'button':'div',`hex-tile ${tile?'hex-filled hex-'+tile.tone:'hex-empty'}`);
    node.style.left=`${450+Math.sqrt(3)*76*(q+r/2)-66}px`;node.style.top=`${380+114*r-76}px`;
    const face=element('span','hex-face');node.append(face);
    if(tile){
      node.type='button';node.setAttribute('aria-haspopup','dialog');node.setAttribute('aria-label',`${tile.title} — ${tile.label}`);node.dataset.tile=`${q},${r}`;
      face.append(element('span','hex-symbol',tile.symbol),element('strong','',tile.title),element('small','',tile.label));nodes.set(`${q},${r}`,node);
      node.onclick=()=>{trigger=node;label.textContent=tile.label;title.textContent=tile.title;description.textContent=tile.text;link.hidden=!tile.url;if(tile.url)link.href=tile.url;dialog.showModal();};
      node.onkeydown=event=>{
        const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
        if(!direction)return;const neighbor=nodes.get(`${q+direction[0]},${r+direction[1]}`);if(neighbor){event.preventDefault();neighbor.focus();}
      };
    }else{node.setAttribute('aria-hidden','true');face.append(element('span','hex-land-mark',Math.abs(q-r)%3===0?'⌁':'·'));}
    canvas.append(node);
  }
  page.append(header,toolbar,viewport,element('p','hex-legend','● 7 visual studies · 30 open territories · Real projects coming as they are ready.'),dialog);host.replaceChildren(page);
  const resize=new ResizeObserver(()=>{if(!initialized&&viewport.clientWidth){initialized=true;zoom=viewport.clientWidth<600?.65:1;fit(true);}else fit();});resize.observe(viewport);
  return {destroy(){alive=false;cancelAnimationFrame(frame);resize.disconnect();if(dialog.open)dialog.close();}};
}
