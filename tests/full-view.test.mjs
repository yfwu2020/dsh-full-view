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

function composerFixture() {
  const f = fixture()
  f.chat.innerHTML = `<div data-slot="main.conversation"><div data-conversation-content data-conversation-session="s1"><div data-conversation-scroll>
    <section data-conversation-region="messages"><div id="messages">已有回复</div></section>
    <div data-composer-seat><div><div><div data-composer-card>
      <div data-input-scroll><div><div id="draft" data-composer-input contenteditable="true" role="textbox">正在编辑的草稿</div></div></div>
      <div><div><button id="add" aria-haspopup="listbox">附件</button><button id="permission" aria-label="权限模式：完全权限"><span aria-hidden="true"><svg></svg></span><span id="permission-label">完全权限</span></button></div><div><button id="model">模型</button><button id="send">发送</button></div></div>
    </div><div id="input-footer"><span>用量统计</span></div></div></div></div>
  </div></div></div>`
  return f
}

function displayed(element, win) {
  for (let current = element; current; current = current.parentElement) {
    const css = win.getComputedStyle(current)
    if (css.display === 'none' || css.visibility === 'hidden') return false
  }
  return true
}

test('收起成输入条后仍能输入和发送，点击外缘切换聊天并保留原节点', async () => {
  const f = composerFixture()
  const draft = f.document.getElementById('draft')
  const messages = f.document.getElementById('messages')
  const preview = f.document.getElementById('preview')
  let sends = 0
  f.document.getElementById('send').addEventListener('click', () => sends++)
  const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const edge = f.document.querySelector('[data-dsh-full-view-edge]')
    assert.ok(edge, '小窗外缘应提供展开/收起入口')
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    assert.equal(edge.getAttribute('aria-expanded'), 'false')
    assert.equal(displayed(draft, f.dom.window), true)
    assert.equal(displayed(messages, f.dom.window), false)
    assert.equal(displayed(f.document.getElementById('input-footer'), f.dom.window), false)
    assert.equal(displayed(f.document.getElementById('permission-label'), f.dom.window), false)
    assert.equal(f.document.getElementById('permission').getAttribute('aria-label'), '权限模式：完全权限')
    draft.textContent = '继续编辑的草稿'
    draft.dispatchEvent(new f.dom.window.InputEvent('input', { bubbles: true }))
    for (const id of ['add', 'permission', 'model', 'send']) f.document.getElementById(id).click()
    assert.equal(sends, 1)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true, '草稿内容更新和原按钮动作不代替用户聚焦')
    messages.textContent += '，后台流式追加'
    edge.click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    assert.equal(edge.getAttribute('aria-expanded'), 'true')
    assert.equal(displayed(messages, f.dom.window), true)
    assert.equal(displayed(f.document.getElementById('input-footer'), f.dom.window), false, '展开后也不显示统计数字')
    assert.match(messages.textContent, /后台流式追加/)
    assert.equal(f.document.getElementById('draft'), draft)
    assert.equal(f.document.getElementById('preview'), preview)
    edge.click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    assert.equal(draft.textContent, '继续编辑的草稿')
    assert.equal(displayed(draft, f.dom.window), true)
  } finally { dispose(); f.dom.window.close() }
})

test('左上角减号隐藏聊天，恢复完整小窗时保留原草稿', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    assert.equal(f.document.querySelector('[data-dsh-minimize-chat]').title, '隐藏聊天，保留恢复入口')
    assert.equal(f.document.querySelector('[data-dsh-minimize-chat]').hasAttribute('aria-expanded'), false)
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    f.document.querySelector('[data-dsh-restore-chat]').click()
    assert.equal(f.document.activeElement, f.document.getElementById('draft'))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false, '恢复并聚焦直接显示完整小窗')
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    f.document.querySelector('[data-dsh-restore-chat]').click()
    assert.equal(f.document.getElementById('draft').textContent, '正在编辑的草稿')
  } finally { dispose(); f.dom.window.close() }
})

test('紧凑输入路径的原生方形背景透明化，展开与退出恢复宿主背景', async () => {
  const f = composerFixture()
  const root = f.document.querySelector('[data-conversation-content]')
  root.className = 'native-square-root'
  const hostStyle = f.document.createElement('style')
  hostStyle.textContent = '.native-square-root { background: rgb(255, 255, 255); }'
  f.document.head.append(hostStyle)
  const dispose = install(f.document)
  try {
    f.enter(); await settle()
    assert.equal(f.dom.window.getComputedStyle(root).backgroundColor, 'rgba(0, 0, 0, 0)')
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    assert.equal(f.dom.window.getComputedStyle(root).backgroundColor, 'rgb(255, 255, 255)')
    f.exit(); await settle()
    assert.equal(f.dom.window.getComputedStyle(root).backgroundColor, 'rgb(255, 255, 255)')
  } finally { dispose(); f.dom.window.close() }
})

test('模型按钮图标适配保留原菜单事件与辅助标签，原生重绘和退出后可还原', async () => {
  const f = composerFixture()
  const model = f.document.getElementById('model')
  model.setAttribute('aria-haspopup', 'menu')
  model.setAttribute('aria-label', '选择模型，当前测试模型')
  model.innerHTML = '<svg id="database-icon"></svg><span>测试模型</span><svg id="chevron"></svg>'
  const icon = f.document.getElementById('database-icon')
  let opened = 0; model.addEventListener('click', () => opened++)
  const dispose = install(f.document)
  try {
    f.enter(); await settle()
    assert.equal(f.dom.window.getComputedStyle(icon).display, 'none')
    assert.notEqual(f.dom.window.getComputedStyle(f.document.getElementById('chevron')).display, 'none')
    assert.equal(model.getAttribute('aria-label'), '选择模型，当前测试模型')
    model.click(); assert.equal(opened, 1)
    const replacement = model.cloneNode(true); model.replaceWith(replacement); await settle()
    assert.equal(f.dom.window.getComputedStyle(replacement.querySelector('svg')).display, 'none')
    f.exit(); await settle()
    assert.notEqual(f.dom.window.getComputedStyle(replacement.querySelector('svg')).display, 'none')
    assert.equal(f.document.querySelector('[data-dsh-full-view-model]'), null)
  } finally { dispose(); f.dom.window.close() }
})

test('原生输入框重新渲染时重新适配，退出完整视图清理所有外缘与输入框标记', async () => {
  const f = composerFixture()
  const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const oldCard = f.document.querySelector('[data-composer-card]')
    const newCard = oldCard.cloneNode(true)
    oldCard.replaceWith(newCard)
    await settle()
    assert.equal(f.document.querySelectorAll('[data-dsh-full-view-edge]').length, 1)
    assert.equal(newCard.hasAttribute('data-dsh-full-view-composer-card'), true)
    f.exit(); await settle()
    assert.equal(f.document.querySelector('[data-dsh-full-view-edge]'), null)
    assert.equal(f.document.querySelector('[data-dsh-full-view-input-path]'), null)
    assert.equal(f.document.querySelector('[data-dsh-full-view-composer-card]'), null)
    assert.equal(newCard.hasAttribute('data-composer-card'), true)
    assert.equal(displayed(f.document.getElementById('messages'), f.dom.window), true)
  } finally { dispose(); f.dom.window.close() }
})

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

// These regressions exercise user actions on the original host DOM, not copied UI.
test('输入焦点直接展开完整聊天，隐藏恢复同样展开并保留草稿，分栏还原统计', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const draft = f.document.getElementById('draft')
    draft.blur()
    f.chat.dispatchEvent(new f.dom.window.Event('pointerenter'))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-chrome'), false)
    draft.focus()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-chrome'), true)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    assert.equal(displayed(f.document.getElementById('messages'), f.dom.window), true)
    assert.equal(displayed(f.document.getElementById('input-footer'), f.dom.window), false)
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(displayed(draft, f.dom.window), false)
    const restore = f.document.querySelector('[data-dsh-restore-chat]')
    assert.equal(displayed(restore, f.dom.window), true)
    restore.click()
    assert.equal(displayed(draft, f.dom.window), true)
    assert.equal(f.document.activeElement, draft)
    assert.equal(draft.textContent, '正在编辑的草稿')
    f.document.querySelector('[data-dsh-return-split]').click(); await settle()
    assert.equal(f.document.querySelector('[data-dsh-restore-chat]'), null)
    assert.equal(f.chat.hasAttribute('inert'), false)
    assert.equal(displayed(f.document.getElementById('input-footer'), f.dom.window), true, '普通分栏的统计恢复')
  } finally { dispose(); f.dom.window.close() }
})

test('外部点击与 Esc 收起，原生弹出菜单和输入法组合键不干扰', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  const down = node => node.dispatchEvent(new f.dom.window.MouseEvent('pointerdown', { bubbles: true, button: 0 }))
  const esc = (node, options = {}) => node.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...options }))
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-full-view-edge]').click()
    const menu = f.document.createElement('div'); menu.setAttribute('role', 'listbox'); f.document.body.append(menu)
    down(menu); esc(menu)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    menu.remove()
    esc(f.document.getElementById('draft'), { isComposing: true })
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    esc(f.document.getElementById('draft'))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    f.document.querySelector('[data-dsh-full-view-edge]').click(); down(f.document.getElementById('sidebar'))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
  } finally { dispose(); f.dom.window.close() }
})

test('其他插件藏在 display:none 父层里的对话框不阻止 Esc 和外部点击收起', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    const panel = f.document.createElement('div')
    panel.style.display = 'none'
    panel.innerHTML = '<div role="dialog" style="display:flex"><button>设置</button></div>'
    f.document.body.append(panel)
    f.enter(); await settle()
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.getElementById('draft').dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.getElementById('sidebar').dispatchEvent(new f.dom.window.MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    panel.style.display = 'block'
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.getElementById('draft').dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
  } finally { dispose(); f.dom.window.close() }
})

test('紧凑条遇到待办展开，鲸鱼球保留提醒，点击恢复待办并在处理后回到原状态', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const approval = f.document.createElement('section'); approval.setAttribute('data-approval-key', 'approval-1'); approval.innerHTML = '<button>批准执行</button>'
    f.document.querySelector('[data-composer-card]').prepend(approval); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    approval.remove(); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    f.document.querySelector('[data-composer-card]').prepend(approval); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    const badge = f.document.querySelector('[data-dsh-restore-chat]')
    assert.equal(badge.querySelector('[data-dsh-whale-status]').getAttribute('data-state'), 'warning')
    badge.click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    assert.equal(f.document.activeElement, approval.querySelector('button'))
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    approval.remove(); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
  } finally { dispose(); f.dom.window.close() }
})

test('消息与草稿变化不会再弹出新内容提示或触发运行动画', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    f.document.getElementById('draft').textContent += '草稿'
    f.document.getElementById('messages').textContent += '新增回复'; await settle()
    assert.equal(f.document.querySelector('[data-dsh-show-update]'), null)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-unread'), false)
    const badge = f.document.querySelector('[data-dsh-restore-chat]')
    assert.equal(badge.textContent, '')
    assert.ok(badge.querySelector('[data-dsh-whale-icon]'))
    assert.equal(badge.hasAttribute('data-dsh-running'), false)
    assert.equal(badge.getAttribute('title'), null)
  } finally { dispose(); f.dom.window.close() }
})

function activityFixture() {
  let snapshot = { running: false, pending: false, startedAt: null }
  const listeners = new Set()
  return {
    setSession(id) { this.id = id },
    getSnapshot: () => snapshot,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    update(next) { snapshot = next; for (const fn of listeners) fn() },
    get listenerCount() { return listeners.size },
  }
}

test('真实运行状态驱动输入条耗时和鲸鱼动画，待办、完成、退出停止计时', async () => {
  const f = composerFixture(); const activity = activityFixture()
  let tick; let timers = 0
  f.dom.window.setInterval = fn => { tick = fn; timers++; return 7 }
  f.dom.window.clearInterval = () => { tick = null; timers-- }
  const dispose = install(f.document, {}, activity)
  try {
    f.enter(); await settle(); assert.equal(activity.id, 's1')
    const draft = f.document.getElementById('draft')
    draft.textContent = ''
    const placeholder = f.document.createElement('div'); placeholder.setAttribute('data-composer-placeholder', ''); placeholder.textContent = '发送消息'
    draft.parentElement.append(placeholder)
    activity.update({ running: true, pending: false, startedAt: Date.now() - 65000 }); await settle()
    const status = f.document.querySelector('[data-dsh-processing-status]')
    const badge = f.document.querySelector('[data-dsh-restore-chat]')
    assert.match(status.textContent, /^已处理 1 分 [56] 秒$/)
    assert.equal(status.parentElement, f.document.querySelector('[data-input-scroll]'))
    assert.equal(f.dom.window.getComputedStyle(placeholder).visibility, 'hidden')
    draft.textContent = '未发送草稿'; draft.dispatchEvent(new f.dom.window.InputEvent('input', { bubbles: true })); await settle()
    assert.equal(status.hidden, true); assert.equal(draft.textContent, '未发送草稿')
    draft.textContent = ''; draft.dispatchEvent(new f.dom.window.InputEvent('input', { bubbles: true })); await settle()
    assert.equal(status.hidden, false); assert.equal(timers, 1)
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(badge.hidden, false); assert.equal(badge.textContent, '')
    assert.equal(badge.hasAttribute('data-dsh-running'), true)
    activity.update({ running: true, pending: true, startedAt: Date.now() - 65000 }); await settle()
    assert.equal(badge.hasAttribute('data-dsh-running'), false)
    assert.equal(timers, 0); assert.equal(status.hidden, true)
    activity.update({ running: false, pending: false, startedAt: null }); await settle()
    assert.equal(status.hidden, true)
    activity.update({ running: true, pending: false, startedAt: null }); await settle()
    assert.equal(status.textContent, '处理中…'); assert.equal(timers, 0)
    activity.update({ running: true, pending: false, startedAt: Date.now() }); await settle()
    assert.equal(timers, 1)
    f.exit(); await settle(); assert.equal(timers, 0)
    assert.equal(f.document.querySelector('[data-dsh-processing-status]'), null)
    dispose(); assert.equal(activity.listenerCount, 0)
  } finally { dispose(); f.dom.window.close() }
})

function pointer(f, target, type, x, y) {
  const event = new f.dom.window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
  Object.defineProperty(event, 'pointerId', { value: 1 }); target.dispatchEvent(event)
}
function capture(target) {
  let held = false; target.setPointerCapture = () => { held = true }; target.hasPointerCapture = () => held; target.releasePointerCapture = () => { held = false }
}

test('拖动 Esc 或失去窗口焦点取消，拖动结束吸附边缘且不误展开', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle(); const edge = f.document.querySelector('[data-dsh-full-view-edge]'); capture(edge)
    const x = f.chat.style.getPropertyValue('--dsh-fv-x')
    pointer(f, edge, 'pointerdown', 800, 740); pointer(f, edge, 'pointermove', 620, 700)
    f.document.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-x'), x)
    assert.equal(f.frame.hasAttribute('data-dsh-fv-dragging'), false)
    pointer(f, edge, 'pointerdown', 800, 740); pointer(f, edge, 'pointermove', 620, 700)
    f.dom.window.dispatchEvent(new f.dom.window.Event('blur'))
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-x'), x)
    pointer(f, edge, 'pointerdown', 800, 740); pointer(f, edge, 'pointermove', 337, 740); pointer(f, edge, 'pointerup', 337, 740); edge.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, detail: 1 }))
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-x'), '300px')
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
  } finally { dispose(); f.dom.window.close() }
})

test('左侧缩放保持右边锚点，紧凑状态可调整宽度，卸载后不再响应快捷键', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle(); const left = f.document.querySelector('[data-dsh-resize-direction="w"]'); capture(left)
    const right = parseFloat(f.chat.style.getPropertyValue('--dsh-fv-x')) + parseFloat(f.chat.style.getPropertyValue('--dsh-fv-width'))
    pointer(f, left, 'pointerdown', 780, 740); pointer(f, left, 'pointermove', 730, 740); pointer(f, left, 'pointerup', 730, 740)
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-width'), '450px')
    assert.equal(parseFloat(f.chat.style.getPropertyValue('--dsh-fv-x')) + 450, right)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    dispose()
    f.document.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    assert.equal(f.document.querySelector('[data-dsh-restore-chat]'), null)
    assert.equal(f.frame.hasAttribute('data-dsh-fv-dragging'), false)
  } finally { dispose(); f.dom.window.close() }
})

test('轨迹视图的 composer-overlay 标记不被误判为待审批', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.document.getElementById('messages').setAttribute('data-conversation-composer-overlay', '')
    f.enter(); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.getElementById('sidebar').dispatchEvent(new f.dom.window.MouseEvent('pointerdown', { bubbles: true }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
  } finally { dispose(); f.dom.window.close() }
})


test('提问和计划确认替换整个原生输入框时仍保持可见，处理完恢复紧凑输入', async () => {
  for (const marker of ['data-question-key', 'data-plan-review-key']) {
    const f = composerFixture(); const dispose = install(f.document)
    try {
      f.enter(); await settle()
      const seat = f.document.querySelector('[data-composer-seat]'); const native = seat.firstElementChild
      const pending = f.document.createElement('div'); pending.setAttribute(marker, 'p1'); pending.textContent = '请确认'
      seat.replaceChildren(pending); await settle()
      assert.equal(displayed(pending, f.dom.window), true)
      assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
      seat.replaceChildren(native); await settle()
      assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
      assert.equal(displayed(f.document.getElementById('draft'), f.dom.window), true)
    } finally { dispose(); f.dom.window.close() }
  }
})

test('恢复后焦点返回原编辑器，键盘切换不被上一次拖动屏蔽', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    const badge = f.document.querySelector('[data-dsh-restore-chat]'); badge.focus(); badge.click()
    assert.equal(f.document.activeElement, f.document.getElementById('draft'))
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    const edge = f.document.querySelector('[data-dsh-full-view-edge]'); capture(edge)
    pointer(f, edge, 'pointerdown', 800, 740); pointer(f, edge, 'pointermove', 700, 740); pointer(f, edge, 'pointerup', 700, 740)
    edge.click() // keyboard/native .click() has detail 0, unlike a pointer click.
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
  } finally { dispose(); f.dom.window.close() }
})

test('视觉视口变小时小窗保持可见，恢复视口后保留用户的尺寸偏好', async () => {
  const f = composerFixture(); const viewport = new f.dom.window.EventTarget()
  Object.assign(viewport, { offsetLeft: 0, offsetTop: 0, width: 1200, height: 800 })
  Object.defineProperty(f.dom.window, 'visualViewport', { value: viewport })
  const dispose = install(f.document)
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-full-view-edge]').click()
    Object.assign(viewport, { width: 660, height: 420 }); viewport.dispatchEvent(new f.dom.window.Event('resize')); await settle()
    const read = name => parseFloat(f.chat.style.getPropertyValue('--dsh-fv-' + name))
    assert.ok(read('x') >= 280 && read('x') + read('width') <= 660)
    assert.ok(read('y') >= 0 && read('y') + read('height') <= 420)
    Object.assign(viewport, { width: 1200, height: 800 }); viewport.dispatchEvent(new f.dom.window.Event('resize')); await settle()
    assert.equal(read('width'), 400); assert.equal(read('height'), 540)
  } finally { dispose(); f.dom.window.close() }
})

test('角落第一次点击不会先收起，双击能在原位置恢复尺寸', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-full-view-edge]').click()
    const corner = f.document.querySelector('[data-dsh-resize-direction="se"]')
    corner.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    corner.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, detail: 1 }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    corner.dispatchEvent(new f.dom.window.MouseEvent('dblclick', { bubbles: true }))
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-width'), '400px')
  } finally { dispose(); f.dom.window.close() }
})

test('标题栏双击复位不会在第一次点击时移动目标，卸载取消待处理单击', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle(); const title = f.document.querySelector('[data-dsh-full-view-title]')
    title.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, detail: 1 }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    title.dispatchEvent(new f.dom.window.MouseEvent('dblclick', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 300))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    title.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, detail: 1 })); dispose()
    await new Promise(resolve => setTimeout(resolve, 300))
    assert.equal(f.document.querySelector('[data-dsh-full-view-toolbar]'), null)
  } finally { dispose(); f.dom.window.close() }
})

test('左缘键盘缩放保持右端位置，窄视口约束不会改变另一端锚点', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const left = f.document.querySelector('[data-dsh-resize-direction="w"]')
    f.document.querySelector('[data-dsh-move-chat]').dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    const read = key => parseFloat(f.chat.style.getPropertyValue('--dsh-fv-' + key))
    const right = read('x') + read('width')
    left.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    assert.equal(read('width'), 416)
    assert.equal(read('x') + read('width'), right)
  } finally { dispose(); f.dom.window.close() }
})

test('内嵌子会话不会抢走当前会话输入框或触发当前会话待办', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    const nested = f.document.createElement('div'); nested.setAttribute('data-conversation-session', 'child')
    nested.innerHTML = '<div data-composer-seat><div data-composer-card><div data-input-scroll><div data-composer-input contenteditable="true">子会话</div></div><div><div></div><div></div></div></div><div data-question-key="child-question">子会话提问</div></div>'
    f.document.querySelector('[data-conversation-region="messages"]').prepend(nested)
    f.enter(); await settle()
    const draft = f.document.getElementById('draft'); draft.focus()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    f.document.querySelector('[data-dsh-minimize-chat]').click(); f.document.querySelector('[data-dsh-restore-chat]').click()
    assert.equal(f.document.activeElement, draft)
    assert.equal(f.document.querySelector('[data-dsh-full-view-composer-card]').contains(draft), true)
  } finally { dispose(); f.dom.window.close() }
})

test('紧凑状态双击边缘恢复默认尺寸时保持输入条底部位置', async () => {
  const f = composerFixture(); f.dom.window.localStorage.setItem('dsh.full-view.geometry.v1', JSON.stringify({x:400,y:80,width:600,height:640}))
  const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const bottom = () => parseFloat(f.chat.style.getPropertyValue('--dsh-fv-y')) + parseFloat(f.chat.style.getPropertyValue('--dsh-fv-collapsed-height'))
    const previous = bottom()
    f.document.querySelector('[data-dsh-resize-direction="w"]').dispatchEvent(new f.dom.window.MouseEvent('dblclick', { bubbles: true }))
    assert.equal(bottom(), previous)
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-width'), '400px')
  } finally { dispose(); f.dom.window.close() }
})

// Catch the case where Esc collapses the panel but the original editor retains focus.
test('Esc 收起后点击已聚焦输入框可展开，外缘收起归还焦点不反弹', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    const draft = f.document.getElementById('draft')
    draft.focus()
    draft.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    assert.equal(f.document.activeElement, draft)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    assert.equal(displayed(f.document.querySelector('[data-dsh-full-view-toolbar]'), f.dom.window), false)
    draft.dispatchEvent(new f.dom.window.MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    const edge = f.document.querySelector('[data-dsh-full-view-edge]')
    edge.focus(); edge.click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true, '点击外缘收起后程序归还输入焦点不能再次展开')
    assert.equal(f.document.activeElement, draft)
    assert.equal(displayed(f.document.querySelector('[data-dsh-full-view-toolbar]'), f.dom.window), false)
  } finally { dispose(); f.dom.window.close() }
})


// Advance only plugin-owned window timers; leave jsdom rendering/observer turns real.
function virtualTimers(win) {
  let now = 0, serial = 0
  const tasks = new Map()
  win.setTimeout = (callback, delay = 0) => { const id = ++serial; tasks.set(id, { callback, at: now + delay }); return id }
  win.clearTimeout = id => tasks.delete(id)
  return {
    advance(ms) {
      const end = now + ms
      for (;;) {
        const next = [...tasks].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0]
        if (!next) break
        now = next[1].at; tasks.delete(next[0]); next[1].callback()
      }
      now = end
    },
    get count() { return tasks.size },
  }
}

test('紧凑条闲置 30 秒回收；用户操作重新计时，流式回复不延期且不抢工作区焦点', async () => {
  const f = composerFixture(), timers = virtualTimers(f.dom.window), dispose = install(f.document)
  try {
    f.enter(); await settle()
    timers.advance(29000)
    f.document.getElementById('add').dispatchEvent(new f.dom.window.MouseEvent('pointermove', { bubbles: true }))
    timers.advance(20000)
    f.document.getElementById('messages').textContent += '，流式更新'
    await settle()
    const working = f.document.querySelector('[data-sidebar-right-mode]'); working.focus()
    timers.advance(9999)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    timers.advance(1)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    assert.equal(f.document.activeElement, working)
    assert.equal(f.document.getElementById('draft').textContent, '正在编辑的草稿')
    f.document.querySelector('[data-dsh-restore-chat]').click()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    timers.advance(60000)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false, '完整小窗不自动隐藏')
  } finally { dispose(); f.dom.window.close() }
})

test('菜单、拖动、中文组合输入和待办暂停回收，退出与卸载清理，配置可关闭回收', async () => {
  const f = composerFixture(), timers = virtualTimers(f.dom.window), dispose = install(f.document)
  try {
    f.enter(); await settle(); timers.advance(29000)
    const menu = f.document.createElement('div'); menu.setAttribute('role', 'listbox'); f.document.body.append(menu); await settle()
    timers.advance(60000); assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    menu.remove(); await settle()
    const approval = f.document.createElement('div'); approval.setAttribute('data-approval-key', 'idle-check')
    f.document.querySelector('[data-conversation-content]').append(approval); await settle()
    timers.advance(60000)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false, '待办展开完整小窗且不自动回收')
    approval.remove(); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    const edge = f.document.querySelector('[data-dsh-full-view-edge]'); capture(edge)
    pointer(f, edge, 'pointerdown', 900, 740)
    timers.advance(60000); assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    pointer(f, edge, 'pointerup', 900, 740)
    const draft = f.document.getElementById('draft')
    draft.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart', { bubbles: true }))
    timers.advance(60000); assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    draft.dispatchEvent(new f.dom.window.CompositionEvent('compositionend', { bubbles: true }))
    timers.advance(29999); assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    timers.advance(1); assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    f.exit(); await settle(); assert.equal(timers.count, 0)
    f.enter(); await settle(); timers.advance(29000)
    dispose(); assert.equal(timers.count, 0)
    const off = install(f.document, { compactIdleSeconds: 0 })
    timers.advance(120000); assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
    off()
  } finally { dispose(); f.dom.window.close() }
})

test('完整小窗的标题和空白只拖动，单击不切换；标题方向键也可移动', async () => {
  const f = composerFixture(), dispose = install(f.document)
  try {
    f.enter(); await settle(); f.document.getElementById('draft').focus()
    const title = f.document.querySelector('[data-dsh-full-view-title]'), toolbar = f.document.querySelector('[data-dsh-full-view-toolbar]')
    title.click(); toolbar.click()
    await new Promise(resolve => setTimeout(resolve, 300))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    assert.equal(title.hasAttribute('aria-expanded'), false)
    assert.match(title.getAttribute('aria-label'), /移动聊天小窗/)
    capture(title)
    const before = parseFloat(f.chat.style.getPropertyValue('--dsh-fv-x'))
    pointer(f, title, 'pointerdown', 900, 260); pointer(f, title, 'pointermove', 800, 280); pointer(f, title, 'pointerup', 800, 280)
    title.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, detail: 1 }))
    assert.equal(parseFloat(f.chat.style.getPropertyValue('--dsh-fv-x')), before - 100)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    title.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    assert.equal(parseFloat(f.chat.style.getPropertyValue('--dsh-fv-x')), before - 116)
    assert.equal(f.document.getElementById('draft').textContent, '正在编辑的草稿')
  } finally { dispose(); f.dom.window.close() }
})

test('浮窗隐藏聊天和草稿滚动条并释放占位，原滚动容器及分栏样式保持', async () => {
  const f = composerFixture(), hostStyle = f.document.createElement('style')
  hostStyle.textContent = '[data-conversation-scroll] { overflow-y: auto; scrollbar-gutter: stable; scrollbar-width: auto; margin-right: 2px; } [data-input-scroll] { overflow-y: auto; scrollbar-gutter: stable; scrollbar-width: auto; }'
  f.document.head.append(hostStyle)
  const conversationScroll = f.document.querySelector('[data-conversation-scroll]'), inputScroll = f.document.querySelector('[data-input-scroll]')
  conversationScroll.scrollTop = 130; inputScroll.scrollTop = 24
  const dispose = install(f.document)
  try {
    f.enter(); await settle()
    for (const node of [conversationScroll, inputScroll]) {
      assert.equal(f.dom.window.getComputedStyle(node).scrollbarWidth, 'none')
      assert.equal(f.dom.window.getComputedStyle(node).scrollbarGutter, 'auto')
      assert.equal(f.dom.window.getComputedStyle(node).overflowY, 'auto', '隐藏轨道不能关闭原滚动能力')
    }
    assert.equal(f.dom.window.getComputedStyle(conversationScroll).marginRight, '0px')
    f.document.getElementById('draft').focus()
    assert.equal(f.dom.window.getComputedStyle(conversationScroll).scrollbarWidth, 'none')
    assert.equal(conversationScroll.scrollTop, 130)
    assert.equal(inputScroll.scrollTop, 24)
    f.exit(); await settle()
    for (const node of [conversationScroll, inputScroll]) {
      assert.equal(f.dom.window.getComputedStyle(node).scrollbarWidth, 'auto')
      assert.equal(f.dom.window.getComputedStyle(node).scrollbarGutter, 'stable')
    }
    assert.equal(f.document.querySelector('[data-conversation-scroll]'), conversationScroll)
    assert.equal(f.document.querySelector('[data-input-scroll]'), inputScroll)
    assert.equal(f.dom.window.getComputedStyle(conversationScroll).marginRight, '2px')
  } finally { dispose(); f.dom.window.close() }
})


test('鲸鱼右上状态点使用标题原生色：待回应优先于运行，完成与空闲可区分', async () => {
  const f = composerFixture(), activity = activityFixture(), dispose = install(f.document, {}, activity)
  const native = f.document.createElement('span'); f.document.body.append(native)
  const hostTheme = f.document.createElement('style')
  hostTheme.textContent = ':root { --dsw-alias-label-tertiary: rgb(120, 121, 122); --dsw-alias-state-success-primary: rgb(30, 160, 60); --dsw-alias-state-warn-primary: rgb(190, 130, 20); --dsw-alias-state-idle-primary: rgb(140, 140, 140); }'
  f.document.head.append(hostTheme)
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-minimize-chat]').click()
    const badge = f.document.querySelector('[data-dsh-restore-chat]'), dot = badge.querySelector('[data-dsh-whale-status]')
    assert.ok(dot); assert.equal(dot.getAttribute('aria-hidden'), 'true')
    const check = (state, token) => {
      assert.equal(dot.getAttribute('data-state'), state)
      native.style.color = `var(${token})`
      assert.equal(f.dom.window.getComputedStyle(dot).color, f.dom.window.getComputedStyle(native).color)
    }
    check('idle', '--dsw-alias-state-idle-primary')
    assert.equal(f.dom.window.getComputedStyle(dot).width, '6px')
    assert.equal(f.dom.window.getComputedStyle(dot).top, '7px')
    assert.equal(f.dom.window.getComputedStyle(dot).right, '7px')
    activity.update({ running: true, completed: true, pending: false }); await settle()
    check('ongoing', '--dsw-alias-label-tertiary'); assert.equal(badge.hasAttribute('data-dsh-running'), true)
    activity.update({ running: true, completed: true, pending: true, pendingKind: 'question' }); await settle()
    check('warning', '--dsw-alias-state-warn-primary'); assert.match(badge.getAttribute('aria-label'), /等待回答/)
    assert.equal(badge.hasAttribute('data-dsh-running'), false)
    activity.update({ running: false, pending: false, completed: true }); await settle()
    check('done', '--dsw-alias-state-success-primary'); assert.match(badge.getAttribute('aria-label'), /已完成/)
    hostTheme.textContent = ':root { --dsw-alias-state-success-primary: rgb(80, 200, 100); }'; await settle()
    check('done', '--dsw-alias-state-success-primary')
    activity.update({ running: false, pending: false, completed: false }); await settle()
    assert.equal(dot.getAttribute('data-state'), 'idle')
    assert.equal(badge.textContent, ''); assert.equal(badge.hasAttribute('title'), false)
    dispose(); assert.equal(f.document.querySelector('[data-dsh-whale-status]'), null)
  } finally { dispose(); f.dom.window.close() }
})


test('隐藏鲸鱼球区分问题和计划确认，恢复时聚焦原待办输入并可键盘移动', async () => {
  const f = composerFixture(); const dispose = install(f.document)
  try {
    f.enter(); await settle()
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    const question = f.document.createElement('section')
    question.setAttribute('data-question-key', 'q1')
    question.innerHTML = '<textarea aria-label="回答"></textarea><button>提交回答</button>'
    f.document.querySelector('[data-composer-card]').prepend(question); await settle()
    const badge = f.document.querySelector('[data-dsh-restore-chat]')
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    assert.equal(badge.getAttribute('aria-label'), '恢复聊天，等待回答')
    const before = badge.style.left
    badge.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }))
    assert.notEqual(badge.style.left, before)
    badge.click()
    assert.equal(f.document.activeElement, question.querySelector('textarea'))
    question.remove(); await settle()
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    const plan = f.document.createElement('section')
    plan.setAttribute('data-plan-review-key', 'p1'); plan.innerHTML = '<button>确认计划</button>'
    f.document.querySelector('[data-composer-card]').prepend(plan); await settle()
    assert.equal(badge.getAttribute('aria-label'), '恢复聊天，等待计划确认')
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    badge.click()
    assert.equal(f.document.activeElement, plan.querySelector('button'))
  } finally { dispose(); f.dom.window.close() }
})

function motionClock(f, reduced = false) {
  let next = 0
  const callbacks = new Map()
  f.dom.window.matchMedia = () => ({ matches: reduced })
  f.dom.window.requestAnimationFrame = fn => { callbacks.set(++next, fn); return next }
  f.dom.window.cancelAnimationFrame = id => callbacks.delete(id)
  return time => {
    const batch = [...callbacks.values()]; callbacks.clear()
    for (const fn of batch) fn(time)
  }
}

test('完整小窗连续缩入球：内容不重排、外框收拢到同一锚点、鱼尾在末段出现', async () => {
  const f = composerFixture(); const step = motionClock(f); const dispose = install(f.document)
  try {
    f.enter(); await settle(); step(0)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    const draft = f.document.getElementById('draft')
    const y = f.chat.style.getPropertyValue('--dsh-fv-y')
    f.document.querySelector('[data-dsh-minimize-chat]').click(); step(0)
    const shell = f.document.querySelector('[data-dsh-whale-morph-shell]')
    assert.ok(shell, '由连续外框衔接原小窗和鲸鱼球')
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), false)
    assert.equal(f.chat.style.getPropertyValue('--dsh-fv-y'), y)
    const right = parseFloat(shell.style.left) + parseFloat(shell.style.width)
    const bottom = parseFloat(shell.style.top) + parseFloat(shell.style.height)
    const initialWidth = parseFloat(shell.style.width)
    step(140)
    assert.ok(parseFloat(shell.style.width) < initialWidth)
    assert.ok(parseFloat(shell.style.width) > 40)
    assert.ok(Math.abs(parseFloat(shell.style.left) + parseFloat(shell.style.width) - right) < .1)
    assert.ok(Math.abs(parseFloat(shell.style.top) + parseFloat(shell.style.height) - bottom) < .1)
    assert.equal(f.chat.style.getPropertyValue('--dsh-morph-content-opacity'), '0')
    assert.equal(f.document.querySelector('[data-dsh-restore-chat]').style.getPropertyValue('--dsh-morph-whale-opacity'), '0')
    step(370)
    assert.ok(Number(f.document.querySelector('[data-dsh-restore-chat]').style.getPropertyValue('--dsh-morph-whale-opacity')) > 0)
    step(460)
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    assert.equal(f.chat.hasAttribute('inert'), true)
    assert.equal(f.document.getElementById('draft'), draft)
  } finally { dispose(); f.dom.window.close() }
})

test('连续缩入可在半途中反向恢复，完成后归还原输入焦点；退出取消全部动画', async () => {
  const f = composerFixture(); const step = motionClock(f); const dispose = install(f.document)
  try {
    f.enter(); await settle(); step(0)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.querySelector('[data-dsh-minimize-chat]').click(); step(0); step(140)
    const shell = f.document.querySelector('[data-dsh-whale-morph-shell]')
    assert.ok(shell)
    const current = [shell.style.left, shell.style.top, shell.style.width, shell.style.height]
    f.document.querySelector('[data-dsh-restore-chat]').click(); step(140)
    assert.deepEqual([shell.style.left, shell.style.top, shell.style.width, shell.style.height], current, '反向从当前帧继续')
    step(600)
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.chat.hasAttribute('inert'), false)
    assert.equal(f.document.activeElement, f.document.getElementById('draft'))
    f.document.querySelector('[data-dsh-minimize-chat]').click(); step(600)
    f.exit(); await settle(); step(620); step(1100)
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.document.querySelector('[data-dsh-whale-morphing]'), null)
    assert.equal(f.chat.hasAttribute('inert'), false)
    assert.equal(f.chat.style.getPropertyValue('--dsh-morph-content-opacity'), '')
  } finally { dispose(); f.dom.window.close() }
})

test('减少动态效果直接切换鲸鱼球，恢复不等待动画且仍保留草稿', async () => {
  const f = composerFixture(); const step = motionClock(f, true); const dispose = install(f.document)
  try {
    f.enter(); await settle(); step(0)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), true)
    f.document.querySelector('[data-dsh-restore-chat]').click()
    assert.equal(f.document.activeElement, f.document.getElementById('draft'))
    assert.equal(f.document.getElementById('draft').textContent, '正在编辑的草稿')
  } finally { dispose(); f.dom.window.close() }
})

test('紧凑条自动回收也连续缩入，动画不抢工作区焦点', async () => {
  const f = composerFixture(); const step = motionClock(f)
  let idle
  f.dom.window.setTimeout = fn => { idle = fn; return 10 }
  f.dom.window.clearTimeout = () => { idle = null }
  const dispose = install(f.document, { compactIdleSeconds: 10 })
  try {
    f.enter(); await settle(); step(0)
    const work = f.document.createElement('button'); f.frame.append(work); work.focus()
    idle(); step(0)
    const shell = f.document.querySelector('[data-dsh-whale-morph-shell]')
    assert.ok(shell)
    assert.equal(shell.style.height, '48px')
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    step(200)
    assert.ok(parseFloat(shell.style.width) > 40)
    assert.equal(f.document.activeElement, work)
    step(500)
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.document.activeElement, work)
  } finally { dispose(); f.dom.window.close() }
})

test('动画中工作区改变尺寸会安全结束动画，恢复聊天不残留 inert 或旧外框', async () => {
  const f = composerFixture(); const step = motionClock(f); const dispose = install(f.document)
  try {
    f.enter(); await settle(); step(0)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.querySelector('[data-dsh-minimize-chat]').click(); step(0); step(500)
    f.document.querySelector('[data-dsh-restore-chat]').click(); step(500); step(600)
    assert.ok(f.document.querySelector('[data-dsh-whale-morph-shell]'))
    f.frame.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1000, bottom: 640, width: 1000, height: 640 })
    f.dom.window.dispatchEvent(new f.dom.window.Event('resize')); step(620)
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.chat.hasAttribute('inert'), false)
    assert.equal(f.document.activeElement, f.document.getElementById('draft'))
    assert.equal(f.chat.hasAttribute('data-dsh-chat-hidden'), false)
  } finally { dispose(); f.dom.window.close() }
})

test('动画中切换会话直接清理旧外框，不延迟夺走新会话之外的焦点', async () => {
  const f = composerFixture(); const step = motionClock(f); const dispose = install(f.document)
  try {
    f.enter(); await settle(); step(0)
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.querySelector('[data-dsh-minimize-chat]').click(); step(0); step(140)
    const work = f.document.createElement('button'); f.frame.append(work); work.focus()
    f.chat.querySelector('[data-conversation-session]').setAttribute('data-conversation-session', 's2')
    f.panel.closest('[data-sidebar-right-session]').setAttribute('data-sidebar-right-session', 's2')
    await settle(); step(160)
    assert.equal(f.document.querySelector('[data-dsh-whale-morph-shell]'), null)
    assert.equal(f.chat.hasAttribute('inert'), false)
    assert.equal(f.chat.hasAttribute('data-dsh-chat-minimized'), true)
    step(700)
    assert.equal(f.document.activeElement, work)
  } finally { dispose(); f.dom.window.close() }
})

test('完整小窗隐藏后鲸鱼球仍可移动到工作区左上边缘，恢复窗口保持在工作区内', async () => {
  const f = composerFixture(); const dispose = install(f.document, { edgeGap: 16 })
  try {
    f.enter(); await settle()
    f.document.querySelector('[data-dsh-full-view-edge]').click()
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    const badge = f.document.querySelector('[data-dsh-restore-chat]')
    for (let i = 0; i < 30; i++) {
      for (const key of ['ArrowUp', 'ArrowLeft']) badge.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key, shiftKey: true, bubbles: true, cancelable: true }))
    }
    assert.equal(badge.style.left, '296px')
    assert.equal(badge.style.top, '16px')
    badge.click()
    assert.ok(parseFloat(f.chat.style.getPropertyValue('--dsh-fv-x')) >= 296)
    assert.ok(parseFloat(f.chat.style.getPropertyValue('--dsh-fv-y')) >= 16)
    assert.equal(f.document.activeElement, f.document.getElementById('draft'))
  } finally { dispose(); f.dom.window.close() }
})

test('完成小点只提醒未查看回合：打开后再收起不重现，新回合完成重新提示', async () => {
  const f = composerFixture(), activity = activityFixture(), dispose = install(f.document, {}, activity)
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-minimize-chat]').click()
    const badge = f.document.querySelector('[data-dsh-restore-chat]'), dot = badge.querySelector('[data-dsh-whale-status]')
    activity.update({ running: false, completed: true, completionId: 'turn-1', completionUnread: false }); await settle()
    assert.equal(dot.hidden, false, '隐藏时刚完成，即使宿主清除 unread 仍需提醒')
    badge.click()
    assert.equal(dot.hidden, true, '打开查看即清除完成提醒')
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    activity.update({ running: false, completed: true, completionId: 'turn-1', completionUnread: false }); await settle()
    assert.equal(dot.hidden, true, '同一结束事件或重绘不重发提醒')
    activity.update({ running: true, completed: false, completionId: null }); await settle()
    assert.equal(dot.hidden, false)
    assert.equal(dot.getAttribute('data-state'), 'ongoing')
    activity.update({ running: false, completed: true, completionId: 'turn-2', completionUnread: false }); await settle()
    assert.equal(dot.hidden, false)
    assert.equal(dot.getAttribute('data-state'), 'done')
    badge.click()
    activity.update({ running: false, completed: true, completionId: 'turn-2', pending: true, pendingKind: 'question' }); await settle()
    assert.equal(dot.hidden, false, '待回应提示不随完成提醒一起被清除')
    assert.equal(dot.getAttribute('data-state'), 'warning')
  } finally { dispose(); f.dom.window.close() }
})

test('历史已读完成和展开时完成不显示完成点，宿主明确未读仍可提示', async () => {
  const f = composerFixture(), activity = activityFixture()
  activity.update({ running: false, completed: true, completionId: 'old', completionUnread: false })
  const dispose = install(f.document, {}, activity)
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-minimize-chat]').click()
    const badge = f.document.querySelector('[data-dsh-restore-chat]'), dot = badge.querySelector('[data-dsh-whale-status]')
    assert.equal(dot.hidden, true, '不能把历史完成当成未读')
    badge.click()
    activity.update({ running: true, completed: false }); await settle()
    activity.update({ running: false, completed: true, completionId: 'new', completionUnread: false }); await settle()
    f.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(dot.hidden, true, '完整小窗正在展示的结果已查看')
  } finally { dispose(); f.dom.window.close() }
  const g = composerFixture(), host = activityFixture()
  host.update({ running: false, completed: true, completionId: 'unread', completionUnread: true })
  const close = install(g.document, {}, host)
  try {
    g.enter(); await settle(); g.document.querySelector('[data-dsh-minimize-chat]').click()
    assert.equal(g.document.querySelector('[data-dsh-whale-status]').hidden, false)
  } finally { close(); g.dom.window.close() }
})

test('点击切换到会话也清除它的完成提醒，不与其他会话串状态', async () => {
  const f = composerFixture(), activity = activityFixture(), dispose = install(f.document, {}, activity)
  try {
    f.enter(); await settle(); f.document.querySelector('[data-dsh-minimize-chat]').click()
    activity.update({ running: false, completed: true, completionId: 's1-turn-1' }); await settle()
    assert.equal(f.document.querySelector('[data-dsh-whale-status]').hidden, false)
    for (const [id, turn] of [['s2', 's2-turn-1'], ['s1', 's1-turn-1']]) {
      activity.update({ running: false, completed: true, completionId: turn, completionUnread: true })
      f.chat.querySelector('[data-conversation-session]').setAttribute('data-conversation-session', id)
      f.panel.closest('[data-sidebar-right-session]').setAttribute('data-sidebar-right-session', id)
      await settle()
      f.document.querySelector('[data-dsh-minimize-chat]').click()
      assert.equal(f.document.querySelector('[data-dsh-whale-status]').hidden, true, '选中会话即视为已查看')
    }
  } finally { dispose(); f.dom.window.close() }
})
