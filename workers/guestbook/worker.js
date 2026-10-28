const ORIGIN='https://leiyin.si';
const KEY_HEADER='X-Guestbook-Key';
const FIELDS="id, nickname, content, created_at, CASE WHEN status = 'pending' THEN 'private' ELSE 'public' END AS visibility";
async function readBody(request){
  const reader=request.body?.getReader();if(!reader)throw new Error('Invalid body');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw new Error('Request too large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function hashKey(key){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('Origin');
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':`Origin, ${KEY_HEADER}`};
    if(origin===ORIGIN)Object.assign(headers,{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':`Content-Type, ${KEY_HEADER}`});
    const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});
    if(origin&&origin!==ORIGIN)return json({error:'Origin not allowed'},403);
    if(url.pathname!=='/messages')return json({error:'Not found'},404);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405,{Allow:'GET, POST, OPTIONS'});
    try{
      if(!env.DB)return json({error:'Missing Worker binding: DB'},503);
      const key=request.headers.get(KEY_HEADER);
      if(key!==null&&!/^[a-f0-9]{64}$/.test(key))return json({error:'Invalid browser credential'},400);
      const owner=key?await hashKey(key):null;
      if(request.method==='GET'){
        const before=url.searchParams.get('before');
        if(before!==null&&!/^[1-9]\d{0,14}$/.test(before))return json({error:'Invalid pagination cursor'},400);
        const values=[];
        let condition="status = 'published'";
        if(owner){condition="(status = 'published' OR (status = 'pending' AND owner_hash = ?))";values.push(owner);}
        if(before){condition+=' AND id < ?';values.push(Number(before));}
        const query=env.DB.prepare(`SELECT ${FIELDS} FROM messages WHERE ${condition} ORDER BY id DESC LIMIT 21`);
        const {results}=await (values.length?query.bind(...values):query).all();
        const items=results.slice(0,20);
        return json({items,nextCursor:results.length>20?String(items.at(-1).id):null,features:{privateMessages:true}});
      }
      if(origin!==ORIGIN)return json({error:'Origin not allowed'},403);
      if(!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||''))return json({error:'Expected application/json'},415);
      const secret=typeof env.TURNSTILE_SECRET_KEY==='string'?env.TURNSTILE_SECRET_KEY.trim():'';
      if(!secret||!env.GUESTBOOK_RATE_LIMITER)return json({error:'Posting temporarily unavailable'},503);
      const ip=request.headers.get('CF-Connecting-IP');if(!ip)return json({error:'Unable to verify request address'},503);
      const limit=await env.GUESTBOOK_RATE_LIMITER.limit({key:ip});
      if(!limit.success)return json({error:'Too many attempts. Please wait a minute.'},429,{'Retry-After':'60'});
      let body;try{body=await readBody(request);}catch(error){return json({error:error.message==='Request too large'?error.message:'Invalid JSON body'},error.message==='Request too large'?413:400);}
      if(!body||typeof body.nickname!=='string'||typeof body.content!=='string'||typeof body.token!=='string')return json({error:'Nickname, content and verification token are required'},400);
      const nickname=body.nickname.trim(),content=body.content.trim(),token=body.token.trim();
      if(!nickname||[...nickname].length>20||!content||[...content].length>500||!token||token.length>2048||nickname.includes('\0')||content.includes('\0'))return json({error:'Invalid nickname, content or verification token'},400);
      let response;
      try{response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token,remoteip:ip}),signal:AbortSignal.timeout(10000)});}catch{return json({error:'Verification service connection failed or timed out'},503);}
      const verification=await response.json().catch(()=>({}));
      const codes=Array.isArray(verification['error-codes'])?verification['error-codes'].join(', '):'no error code';
      if(!response.ok)return json({error:`Verification service error: HTTP ${response.status} (${codes})`},503);
      if(verification.success!==true)return json({error:`Verification rejected: ${codes}`},403);
      if(verification.hostname!=='leiyin.si'||verification.action!=='guestbook')return json({error:'Verification hostname or action mismatch. Refresh the website.'},403);
      const item=await env.DB.prepare(`INSERT INTO messages (nickname,content,status,owner_hash) VALUES (?,?,'pending',?) RETURNING ${FIELDS}`).bind(nickname,content,owner).first();
      return json({status:'pending',item,message:'Message sent. Thanks for leaving a note.'},201);
    }catch{return json({error:'Service temporarily unavailable'},503);}
  }
};
