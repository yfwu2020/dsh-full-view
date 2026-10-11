/** Real Chrome stacking/hit-testing across the three local repositories.
 * Uses actual client CSS/behavior with local API fixtures; never contacts Harness.
 * Recent-sessions is represented by its actual CSS and list DOM structure.
 */
import { createServer } from 'node:http'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const root=fileURLToPath(new URL('../',import.meta.url))
const chrome=process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if(!existsSync(chrome)) throw new Error('Chrome required for real stacking verification; set CHROME')
const page=`<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;font:14px system-ui}*{box-sizing:border-box}
#frame{position:relative;display:grid;grid-template-columns:220px 1fr 40%;height:800px;overflow:hidden}
#sidebar{background:#eee}#chat{min-width:0;overflow:hidden}
[data-shell-overlay]{position:absolute;inset:0;z-index:20;pointer-events:none}
[data-sidebar-right-panel]{position:absolute;inset:0;background:#f8f8f8}
[data-rightbar-col]{position:relative}[data-sidebar-right-panel="fullscreen"]{z-index:40}
#dock{display:none;position:absolute;left:40px;top:140px;width:400px;height:300px;z-index:60;background:#f0f0f0}
#frame[data-rightbar-fullscreen] #dock{display:block}
.dsh-rs__float-clip{left:10px;top:130px;width:300px;height:320px}
.dsh-rs__float{height:320px!important}.dsh-rs__row{height:50px}
#background-button{position:fixed;right:10px;top:10px}
</style></head><body><div id="frame"><aside id="sidebar">侧栏</aside><main id="chat">
<div data-conversation-session="s1"><p id="chat-message">聊天消息</p><textarea id="draft">原草稿</textarea></div></main>
<div data-rightbar-col><section data-sidebar-right-panel="push" data-sidebar-right-open><p>工作区</p></section></div>
<div id="dock">DockKit 浮动面板</div><div data-shell-overlay></div></div>
<button id="background-button">背景按钮</button><pre id="out">PENDING</pre>
<script>
const effects=[], React={createElement(type,props){return{type,props}}};let registration;
// Headless virtual time advances timers, but may finish before a compositor frame.
// This probe verifies stacking, not animation timing.
window.requestAnimationFrame=fn=>setTimeout(()=>fn(performance.now()),16);
window.cancelAnimationFrame=id=>clearTimeout(id);
window.fetch=async(url,options)=>{
 if(String(url).includes('/api/analyze'))return new Response(['start','delta','done'].map(type=>'data: '+JSON.stringify({type,stage:'translation',text:type==='delta'?'模拟译文':'',chars:4})+'\\n\\n').join(''),{headers:{'content-type':'text/event-stream'}});
 return new Response(JSON.stringify({ok:true,entries:[],position:null,size:null,models:[],route:{},limits:{}}),{headers:{'content-type':'application/json'}});
};
window.__ModuleLoader__={load(spec){const module=spec.factory(name=>name==='react'?React:{});
 if(spec.id.endsWith('dsh-selection-explain'))module.apply({get(){},effect(fn){const d=fn();if(typeof d==='function')effects.push(d)},slots:{inject(name,fn){return fn()},register(options,component){registration=component;return()=>{}}}});
}};
</script><script src="/recent.js"></script><script src="/selection.js"></script>
<script type="module">
import{installFullView}from'/src/client/index.js';
const checks=[];const check=(name,ok)=>checks.push({name,ok:!!ok});
const sleep=()=>new Promise(r=>setTimeout(r,100));
let cleanup;try{
 const element=registration(),anchor=document.createElement(element.type);Object.assign(anchor.style,element.props.style);document.querySelector('[data-shell-overlay]').append(anchor);element.props.ref(anchor);
 const layer=document.querySelector('.dsh-sel-layer'),hook=window.__dshSelectionExplain;
 const recent=document.createElement('div');recent.className='dsh-rs__float-clip';recent.innerHTML='<div class="dsh-rs__float"><button class="dsh-rs__row">最近会话</button></div>';document.body.append(recent);
 const frame=document.querySelector('#frame'),chat=document.querySelector('#chat'),overlay=document.querySelector('[data-shell-overlay]');
 cleanup=installFullView(document);hook.open('This is a local layering fixture.','','fixture',{});await sleep();await sleep();
 const panel=document.querySelector('.dsh-sel-panel'),pill=document.querySelector('.dsh-sel-pill');
 const position=()=>{Object.assign(panel.style,{left:'40px',top:'140px',width:'400px',height:'300px',display:'flex'});};position();
 const top=()=>panel.contains(document.elementFromPoint(110,220));
 check('解读根在 body，公共浮层仍为 20',layer.parentNode===document.body&&getComputedStyle(overlay).zIndex==='20');
 check('普通分栏：解读内容高于最近会话列表',top());
 check('空白区域穿透到背景按钮',document.elementFromPoint(1080,25)===document.querySelector('#background-button'));
 frame.setAttribute('data-rightbar-fullscreen','');document.querySelector('[data-sidebar-right-panel]').setAttribute('data-sidebar-right-panel','fullscreen');await sleep();position();
 check('完整视图：解读越过 DockKit 浮窗和最近会话',top());
 check('完整视图不抬高公共层',getComputedStyle(overlay).zIndex==='20');
 check('解读自己隐藏胶囊 '+JSON.stringify({frame:frame.hasAttribute('data-dsh-full-view'),root:layer.hasAttribute('data-full-view'),display:getComputedStyle(pill).display}),getComputedStyle(pill).display==='none');
 const menu=document.createElement('div');menu.style.cssText='position:fixed;left:40px;top:140px;width:400px;height:300px;z-index:1100;background:white';document.body.append(menu);
 check('宿主模型菜单层级 1100 高于解读根',menu===document.elementFromPoint(110,220));menu.remove();
 const draft=document.querySelector('#draft');draft.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));draft.focus();draft.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 check('点击聊天后 Esc 先收聊天，解读保留 '+JSON.stringify({mode:chat.hasAttribute('data-dsh-chat-minimized'),owner:frame.getAttribute('data-dsh-active-floating-window'),panel:getComputedStyle(panel).display}),chat.hasAttribute('data-dsh-chat-minimized')&&getComputedStyle(panel).display!=='none');
 draft.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 check('连续 Esc 再关闭解读',getComputedStyle(panel).display==='none');
 frame.removeAttribute('data-rightbar-fullscreen');document.querySelector('[data-sidebar-right-panel]').setAttribute('data-sidebar-right-panel','push');await sleep();
 check('返回分栏胶囊恢复',getComputedStyle(pill).display!=='none');
 check('最近会话位于普通公共浮层之下',Number(getComputedStyle(recent).zIndex)<20);
 const stable=registration().props.ref;check('稳定挂载 ref 不重建输入节点',stable===element.props.ref);
 stable(null);check('槽卸载时移除自己的根',!layer.isConnected);stable(anchor);await sleep();check('槽重新挂载只保留一个根',document.querySelectorAll('.dsh-sel-layer').length===1);
 cleanup();effects.splice(0).reverse().forEach(fn=>fn());await sleep();
 check('解读卸载清理自身，保留其他插件及公共层',!layer.isConnected&&recent.isConnected&&getComputedStyle(overlay).zIndex==='20');
}catch(error){checks.push({name:error.stack,ok:false})}finally{cleanup?.();effects.reverse().forEach(fn=>fn());document.querySelector('#out').textContent=JSON.stringify(checks)}
</script></body></html>`
const server=createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://local').pathname
  if(pathname==='/'){res.end(page);return}
  const file=pathname==='/recent.js'?resolve(root,'../dsh-recent-sessions/lib/client.js'):pathname==='/selection.js'?resolve(root,'../dsh-selection-explain/lib/client.js'):resolve(root,'.'+pathname)
  if(!['/recent.js','/selection.js'].includes(pathname)&&!file.startsWith(root+'src/')){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(await readFile(file))
 }catch{res.writeHead(404);res.end()}
})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const profile=await mkdtemp(resolve(tmpdir(),'dsh-layer-smoke-'))
try{
 const {stdout}=await promisify(execFile)(chrome,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--window-size=1100,820','--user-data-dir='+profile,'--virtual-time-budget=10000','--dump-dom','http://127.0.0.1:'+server.address().port+'/'],{maxBuffer:8*1024*1024,timeout:45000})
 const raw=stdout.match(/<pre id="out">([\s\S]*?)<\/pre>/)?.[1]
 const checks=JSON.parse(raw?.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"')||'null')
 if(!checks)throw new Error('Browser returned no checks')
 for(const item of checks)console.log((item.ok?'PASS ':'FAIL ')+item.name)
 if(checks.some(item=>!item.ok))process.exitCode=1
}finally{server.closeAllConnections();server.close();await rm(profile,{recursive:true,force:true})}
