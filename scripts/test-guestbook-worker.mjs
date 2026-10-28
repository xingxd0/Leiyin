import assert from 'node:assert/strict';import {readFileSync,mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';
const {default:worker}=await import('../workers/guestbook/worker.js');
const temporary=mkdtempSync(join(tmpdir(),'leiyin-guestbook-test-'));
process.on('exit',()=>rmSync(temporary,{recursive:true,force:true}));
const db=join(temporary,'messages.sqlite');
const py=`import sqlite3,json,sys\np=json.loads(sys.stdin.read());c=sqlite3.connect(p['db']);c.row_factory=sqlite3.Row\nif p.get('script'):c.executescript(p['script']);r=[]\nelse:r=[dict(x) for x in c.execute(p['sql'],p.get('args',[])).fetchall()]\nc.commit();print(json.dumps(r))`;
function sql(query,args=[],script){const r=spawnSync('python3',['-c',py],{input:JSON.stringify({db,sql:query,args,script}),encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
sql('',[],`DROP TABLE IF EXISTS messages;CREATE TABLE messages(id INTEGER PRIMARY KEY AUTOINCREMENT,nickname TEXT NOT NULL,content TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,status TEXT NOT NULL DEFAULT 'pending');${readFileSync(new URL('../workers/guestbook/migration.sql',import.meta.url),'utf8')}`);
const DB={prepare(query){let args=[];return {bind(...values){args=values;return this;},async all(){return {results:sql(query,args)};},async first(){return sql(query,args)[0]||null;}};}};
let valid=true;globalThis.fetch=async()=>Response.json(valid?{success:true,hostname:'leiyin.si',action:'guestbook'}:{success:false,'error-codes':['invalid-input-response']});
const env={DB,TURNSTILE_SECRET_KEY:'test-only',GUESTBOOK_RATE_LIMITER:{async limit(){return {success:true};}}};
const A='a'.repeat(64),B='b'.repeat(64);
async function request(key,body,ip='192.0.2.1',cursor=''){const headers={Origin:'https://leiyin.si','CF-Connecting-IP':ip};if(key)headers['X-Guestbook-Key']=key;if(body)headers['Content-Type']='application/json';return worker.fetch(new Request('https://api.example/messages'+cursor,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined}),env);}
const input={nickname:'A',content:'Private draft',token:'test-only'};
let response=await request(A,input);assert.equal(response.status,201);const created=await response.json();assert.equal(created.item.visibility,'private');assert.ok(!('owner_hash' in created.item));assert.equal((await (await request(A)).json()).items.length,1);assert.equal((await (await request(B)).json()).items.length,0);assert.equal((await (await request(null)).json()).items.length,0);assert.equal((await (await request(A,null,'192.0.2.99')).json()).items.length,1);
const stored=sql('SELECT owner_hash FROM messages')[0].owner_hash;assert.notEqual(stored,A);assert.match(stored,/^[a-f0-9]{64}$/);
sql("UPDATE messages SET status='hidden' WHERE id=?",[created.item.id]);assert.equal((await (await request(A)).json()).items.length,0);
sql("UPDATE messages SET status='published' WHERE id=?",[created.item.id]);assert.equal((await (await request(B)).json()).items[0].visibility,'public');assert.equal((await (await request(null)).json()).items.length,1);
assert.equal((await request('bad',input)).status,400);valid=false;assert.equal((await request(B,input)).status,403);assert.equal(sql('SELECT COUNT(*) AS n FROM messages')[0].n,1);valid=true;
for(let i=0;i<22;i++)sql("INSERT INTO messages(nickname,content,status,owner_hash) VALUES('x',?,'pending',?)",['note '+i,stored]);
const first=await (await request(A)).json();assert.equal(first.items.length,20);assert.ok(first.nextCursor);const second=await (await request(A,null,'192.0.2.1','?before='+first.nextCursor)).json();assert.equal(second.items.length,3);assert.equal(new Set([...first.items,...second.items].map(i=>i.id)).size,23);assert.equal((await (await request(B)).json()).items.length,1);
console.log('PASS SQLite migration, owner isolation, anonymous access, IP changes, hash-only storage, moderation/hidden behavior, token enforcement and pagination');


assert.equal((await request(null,input)).status,201);
console.log('PASS backwards-compatible submissions from the previous frontend');
