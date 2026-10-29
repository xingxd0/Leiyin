// Axial hex geometry and connectivity rules shared by rendering and validation.
export const hexGeometry=Object.freeze({radius:76,width:Math.sqrt(3)*76,height:152,rowStep:114});
const vertexOffsets=[[0,-2],[1,-1],[1,1],[0,2],[-1,1],[-1,-1]];
export const hexCenter=({q,r})=>({x:hexGeometry.width*(q+r/2),y:hexGeometry.rowStep*r});
const vertexPoint=([u,v])=>[u*hexGeometry.width/2,v*hexGeometry.radius/2];
export const hexVertices=({q,r})=>vertexOffsets.map(([u,v])=>vertexPoint([2*q+r+u,3*r+v]));
export function sharedHexEdges(cells){
  const edges=new Map();
  for(const cell of cells){
    const vertices=vertexOffsets.map(([u,v])=>[2*cell.q+cell.r+u,3*cell.r+v]);
    vertices.forEach((a,i)=>{
      const b=vertices[(i+1)%6];
      // Integer lattice keys make both owners share exactly the same endpoints.
      const ends=[a,b].sort(([au,av],[bu,bv])=>au-bu||av-bv),key=ends.map(p=>p.join(',')).join(':');
      if(!edges.has(key))edges.set(key,{key,a:vertexPoint(ends[0]),b:vertexPoint(ends[1]),cells:[]});
      edges.get(key).cells.push(cell);
    });
  }
  return [...edges.values()];
}
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
  const q=x/hexGeometry.width-y/(3*hexGeometry.radius),r=y/hexGeometry.rowStep,s=-q-r;
  let rq=Math.round(q),rr=Math.round(r),rs=Math.round(s);
  if(Math.abs(rq-q)>Math.abs(rr-r)&&Math.abs(rq-q)>Math.abs(rs-s))rq=-rr-rs;
  else if(Math.abs(rr-r)>Math.abs(rs-s))rr=-rq-rs;
  return {q:rq,r:rr};
}
