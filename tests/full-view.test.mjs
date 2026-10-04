import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

let install
try { ({ installFullView: install } = await import('../src/client/index.js')) } catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
}

function fixture() {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="frame" data-rightbar-collapsed>
      <aside id="sidebar"></aside>
      <main id="chat"><div data-conversation-content data-conversation-session="s1"><div id="messages">已有回复</div><textarea id="draft">正在编辑的草稿</textarea><button id="send">发送</button></div></main>
      <div data-rightbar-col><div data-sidebar-right-session="s1"><section data-sidebar-right-panel="push" data-sidebar-right-open><button data-sidebar-right-mode="fullscreen">全屏</button><iframe id="preview"></iframe></section></div></div>
      <div data-shell-overlay></div>
    </div></body></html>`, { url: 'https://harness.test/', pretendToBeVisual: true })
  const { document } = dom.window
  const frame = document.getElementById('frame')
  const chat = document.getElementById('chat')
  const sidebar = document.getElementById('sidebar')
  const panel = document.querySelector('[data-sidebar-right-panel]')
  const box = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height })
  frame.getBoundingClientRect = () => box(0, 0, 1200, 800)
  sidebar.getBoundingClientRect = () => box(0, 0, 280, 800)
  panel.getBoundingClientRect = () => box(700, 0, 500, 800)
  dom.window.ResizeObserver = class { observe() {} disconnect() {} }
  const enter = () => { frame.setAttribute('data-rightbar-fullscreen', 'true'); panel.setAttribute('data-sidebar-right-panel', 'fullscreen') }
  const exit = () => { frame.removeAttribute('data-rightbar-fullscreen'); panel.setAttribute('data-sidebar-right-panel', 'push') }
  document.querySelector('[data-sidebar-right-mode]').addEventListener('click', exit)
  return { dom, document, frame, chat, panel, enter, exit }
}

const settle = async () => { await new Promise(resolve => setTimeout(resolve, 40)) }

test('双击右下角恢复配置尺寸，保留位置和草稿，并记住恢复后的尺寸', async () => {
  for (const config of [{}, { chatWidth: 480, chatHeight: 600 }]) {
    const f = fixture()
    const key = 'dsh.full-view.geometry.v1'
    f.dom.window.localStorage.setItem(key, JSON.stringify({ x: 400, y: 80, width: 650, height: 640 }))
    let dispose = install(f.document, config)
    try {
      f.enter(); await settle()
      const draft = f.document.getElementById('draft')
      const preview = f.document.getElementById('preview')
      const corner = f.document.querySelector('[data-dsh-full-view-resize]')
      corner.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      corner.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-width'), '666px')
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-height'), '656px')
      corner.dispatchEvent(new f.dom.window.MouseEvent('dblclick', { bubbles: true }))
      const width = config.chatWidth ?? 400
      const height = config.chatHeight ?? 540
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-width'), `${width}px`)
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-height'), `${height}px`)
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-x'), '400px')
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-y'), '80px')
      assert.equal(f.document.getElementById('draft'), draft)
      assert.equal(draft.value, '正在编辑的草稿')
      assert.equal(f.document.getElementById('preview'), preview)
      assert.deepEqual(JSON.parse(f.dom.window.localStorage.getItem(key)), { x: 400, y: 80, width, height })
      dispose()
      dispose = install(f.document, config)
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-width'), `${width}px`)
      assert.equal(f.chat.style.getPropertyValue('--dsh-fv-height'), `${height}px`)
    } finally {
      dispose()
      f.dom.window.close()
    }
  }
})

test('进入完整视图浮起原聊天节点，并保留网页、草稿、发送事件和流式消息', async () => {
  assert.equal(typeof install, 'function', '插件尚未实现完整视图行为')
  const f = fixture()
  const draft = f.document.getElementById('draft')
  const preview = f.document.getElementById('preview')
  const messages = f.document.getElementById('messages')
  let sends = 0
  f.document.getElementById('send').addEventListener('click', () => sends++)
  const dispose = install(f.document)
  f.enter()
  await settle()
  assert.equal(f.chat.hasAttribute('data-dsh-floating-chat'), true)
  assert.equal(f.frame.hasAttribute('data-dsh-full-view'), true)
  assert.equal(f.dom.window.getComputedStyle(f.document.querySelector('[data-rightbar-col]')).gridColumn, '3', '聊天离开文档流后，右侧栏仍位于原来的第三列')
  assert.equal(f.document.getElementById('draft'), draft)
  assert.equal(draft.value, '正在编辑的草稿')
  assert.equal(f.document.getElementById('preview'), preview)
  messages.textContent += '，流式追加'
  f.document.getElementById('send').click()
  assert.equal(sends, 1)
  assert.match(messages.textContent, /流式追加/)
  assert.equal(f.document.querySelectorAll('[data-dsh-full-view-toolbar]').length, 1)
  f.document.querySelector('[data-dsh-return-split]').click()
  await settle()
  assert.equal(f.chat.hasAttribute('data-dsh-floating-chat'), false)
  assert.equal(draft.value, '正在编辑的草稿')
  dispose()
  f.dom.window.close()
})

test('关闭面板或切换到全局页面会恢复聊天，重复切换不会重复创建控件', async () => {
  assert.equal(typeof install, 'function', '插件尚未实现完整视图行为')
  const f = fixture()
  const dispose = install(f.document)
  for (let i = 0; i < 3; i++) { f.enter(); await settle(); f.exit(); await settle() }
  f.enter(); await settle()
  assert.equal(f.document.querySelectorAll('[data-dsh-full-view-toolbar]').length, 1)
  f.panel.removeAttribute('data-sidebar-right-open')
  await settle()
  assert.equal(f.chat.hasAttribute('data-dsh-floating-chat'), false)
  f.panel.setAttribute('data-sidebar-right-open', '')
  await settle()
  f.chat.querySelector('[data-conversation-session]').remove()
  await settle()
  assert.equal(f.chat.hasAttribute('data-dsh-floating-chat'), false)
  dispose()
  f.dom.window.close()
})

test('卸载插件清理样式、工具栏和几何标记，保留宿主原有属性', async () => {
  assert.equal(typeof install, 'function', '插件尚未实现完整视图行为')
  const f = fixture()
  f.chat.style.color = 'red'
  const dispose = install(f.document)
  f.enter(); await settle()
  dispose()
  assert.equal(f.document.querySelector('[data-dsh-full-view-toolbar]'), null)
  assert.equal(f.document.querySelector('[data-dsh-full-view-style]'), null)
  assert.equal(f.chat.hasAttribute('data-dsh-floating-chat'), false)
  assert.equal(f.chat.style.color, 'red')
  assert.equal(f.frame.hasAttribute('data-rightbar-fullscreen'), true)
  f.dom.window.close()
})
