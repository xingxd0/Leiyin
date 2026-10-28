// Axial hex geometry and connectivity rules shared by rendering and validation.
export const distance=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
export function territory(nodes){
  const cells=new Map();
  for(const node of nodes)for(let dq=-2;dq<=2;dq++)for(let dr=-2;dr<=2;dr++){
    const cell={q:node.q+dq,r:node.r+dr};if(distance(node,cell)<=2)cells.set(`${cell.q},${cell.r}`,cell);
  }
  return [...cells.values()];
}
export function connected(nodes){
  // Only code-defined roots may start a separate island; persisted data cannot grant this.
  const reached=new Set(nodes.filter(n=>n.id==='me'||n.allowDisconnected===true).map(n=>n.id));
  let changed=true;while(changed){changed=false;for(const node of nodes)if(!reached.has(node.id)&&nodes.some(other=>reached.has(other.id)&&distance(node,other)<=2)){reached.add(node.id);changed=true;}}
  return reached.size===nodes.length;
}
export function canMove(nodes,id,target){
  const moving=nodes.find(n=>n.id===id);if(!moving||id==='me'||!Number.isSafeInteger(target.q)||!Number.isSafeInteger(target.r))return false;
  const others=nodes.filter(n=>n.id!==id);
  if(others.some(n=>distance(n,target)===0)||!others.some(n=>distance(n,target)<=2))return false;
  return connected(nodes.map(n=>n.id===id?{...n,...target}:n));
}
export function nearestHex(x,y){
  const q=x/(Math.sqrt(3)*76)-y/(3*76),r=y/114,s=-q-r;
  let rq=Math.round(q),rr=Math.round(r),rs=Math.round(s);
  if(Math.abs(rq-q)>Math.abs(rr-r)&&Math.abs(rq-q)>Math.abs(rs-s))rq=-rr-rs;
  else if(Math.abs(rr-r)>Math.abs(rs-s))rr=-rq-rs;
  return {q:rq,r:rr};
}
