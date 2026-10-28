const tracks = [
  {title:'Craft & Experience',code:'DESIGNING',color:'#8873b2'},
  {title:'Systems & Scale',code:'SYSTEMIZING',color:'#7593aa'},
  {title:'People & Leadership',code:'LEADING',color:'#a68e74'},
  {title:"AI & What's Next",code:'EXPLORING',color:'#8a77c0'}
];
let dimension = 0;

function element(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderPage(host) {
  const layout=element('section','model-layout'),dimensions=element('div','model-dimensions');
  dimensions.append(element('span','eyebrow','MODEL / 能力维度'),element('h2','','somebody 的能力模型'));
  tracks.forEach((track,index)=>{
    const button=element('button','dimension-button');
    button.type='button';button.setAttribute('aria-pressed',String(index===dimension));
    button.append(element('span','',`0${index+1}`),element('strong','',track.title),element('span','','→'));
    button.onclick=()=>{
      dimension=index;
      renderPage(host);
      host.querySelectorAll('.dimension-button')[index].focus();
    };
    dimensions.append(button);
  });
  const detail=element('div','model-detail');
  detail.append(element('span','eyebrow','SELECTED DIMENSION'),element('h2','',tracks[dimension].title));
  detail.append(element('div','model-connection','能力维度 → 能做的事 → 作品证据'));
  layout.append(dimensions,detail);
  host.replaceChildren(layout);
}
