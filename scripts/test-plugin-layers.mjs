/** Cross-repository integration; build all three plugins before running.
 * No live Harness, persisted settings, microphone or model requests.
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { installFullView } from '../src/client/index.js'

const selectionPath = process.argv[2] || new URL('../../dsh-selection-explain/lib/client.js', import.meta.url)
const recentPath = process.argv[3] || new URL('../../dsh-recent-sessions/lib/client.js', import.meta.url)
const selectionSource = await readFile(selectionPath, 'utf8')
const recentSource = await readFile(recentPath, 'utf8')
const dom = new JSDOM(`<!doctype html><html><head><style>
  [data-shell-overlay] { position:absolute; inset:0; z-index:20; pointer-events:none }
</style></head><body><div id="frame"><aside></aside><main id="chat">
<div data-conversation-session="s1"><p>聊天消息</p><textarea>原草稿</textarea></div>
</main><div data-rightbar-col><section data-sidebar-right-panel="push" data-sidebar-right-open></section></div>
<div data-shell-overlay></div></div></body></html>`, { url:'https://layers.test/', pretendToBeVisual:true, runScripts:'outside-only' })
const { window: win } = dom
const doc = win.document, effects = []
const React = { createElement(type, props) { return { type, props } } }
let registration
win.fetch = async () => new Response(JSON.stringify({ok:true,entries:[],position:null,size:null,models:[],route:{}}), {headers:{'content-type':'application/json'}})
win.Response = Response
win.ResizeObserver = class { observe() {} disconnect() {} }
win.__ModuleLoader__ = { load(spec) {
  const module = spec.factory(name => name === 'react' ? React : {})
  if (spec.id.endsWith('dsh-selection-explain')) module.apply({get(){},effect(fn){const cleanup=fn();if(typeof cleanup==='function')effects.push(cleanup)},slots:{inject(name,fn){return fn()},register(options,component){registration=component;return()=>{}}}})
} }
const settle = () => new Promise(resolve => win.setTimeout(resolve,60))
let disposeFullView
try {
  win.eval(recentSource) // Materialization installs the actual recent-sessions CSS.
  const recent = doc.createElement('div'); recent.className='dsh-rs__float-clip'; doc.body.append(recent)
  assert.ok(Number(win.getComputedStyle(recent).zIndex)<20,'最近会话应在公共浮层下方')
  win.eval(selectionSource)
  const element = registration(), anchor = doc.createElement(element.type)
  Object.assign(anchor.style,element.props.style)
  anchor.className=element.props.className
  doc.querySelector('[data-shell-overlay]').append(anchor)
  element.props.ref(anchor)
  const layer = doc.querySelector('.dsh-sel-layer')
  assert.equal(layer.parentElement,doc.body,'解读界面必须离开公共父层，挂到自己的独立根')
  assert.equal(layer.getAttribute('data-dsh-floating-owner'),'explanation')
  const css=node=>win.getComputedStyle(node)
  assert.equal(css(layer).position,'fixed')
  assert.equal(css(layer).pointerEvents,'none')
  assert.ok(Number(css(recent).zIndex)<20,'最近会话应在公共浮层下方')
  assert.ok(Number(css(layer).zIndex)>Number(css(recent).zIndex),'解读必须在最近会话上方')
  assert.ok(Number(css(layer).zIndex)>60,'解读必须越过完整视图工作面板与 DockKit 浮窗')
  const pill=layer.querySelector('.dsh-sel-pill'), panel=layer.querySelector('.dsh-sel-panel')
  const chat=doc.querySelector('#chat'), frame=doc.querySelector('#frame'), sidebar=frame.firstElementChild
  const rect={left:0,top:0,width:1200,height:800,right:1200,bottom:800}
  frame.getBoundingClientRect=()=>rect;sidebar.getBoundingClientRect=()=>({...rect,width:220,right:220})
  disposeFullView=installFullView(doc)
  frame.setAttribute('data-rightbar-fullscreen','')
  doc.querySelector('[data-sidebar-right-panel]').setAttribute('data-sidebar-right-panel','fullscreen')
  await settle()
  assert.equal(css(doc.querySelector('[data-shell-overlay]')).zIndex,'20')
  assert.equal(css(pill).display,'none','解读自己隐藏全屏胶囊')
  assert.ok(Number(css(layer).zIndex)>Number(css(chat).zIndex))
  panel.style.display='flex'
  const content=doc.createElement('p');content.textContent='解读内容';panel.append(content)
  content.dispatchEvent(new win.MouseEvent('pointerdown',{bubbles:true,button:0}))
  assert.equal(frame.getAttribute('data-dsh-active-floating-window'),'explanation')
  assert.equal(chat.hasAttribute('data-dsh-chat-minimized'),false)
  frame.removeAttribute('data-rightbar-fullscreen')
  doc.querySelector('[data-sidebar-right-panel]').setAttribute('data-sidebar-right-panel','push')
  await settle()
  assert.notEqual(css(pill).display,'none','退出完整视图后胶囊恢复')
  assert.equal(layer.parentElement,doc.body)
  disposeFullView()
  for(const cleanup of effects.splice(0).reverse()) cleanup()
  assert.equal(layer.isConnected,false,'解读卸载清理独立根')
  assert.equal(recent.isConnected,true,'不得删除最近会话节点')
  assert.equal(css(doc.querySelector('[data-shell-overlay]')).zIndex,'20')
  console.log('PASS: three-plugin roots, ordering, full-view transitions, companion clicks and cleanup')
} finally { disposeFullView?.();for(const cleanup of effects.reverse())cleanup();dom.window.close() }
