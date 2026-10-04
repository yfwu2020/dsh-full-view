import { resolveConfig } from '../config.js'
import { style } from './style.js'

const geometryKey = 'dsh.full-view.geometry.v1'
const cleanupKey = Symbol.for('@yfwu2020/dsh-full-view.cleanup')

/** Locate the resident chat beside the semantic right-column marker; no CSS hashes. */
function findSurface(doc) {
  for (const right of doc.querySelectorAll('[data-rightbar-col]')) {
    const frame = right.parentElement
    const chat = right.previousElementSibling
    const panel = right.querySelector('[data-sidebar-right-panel="fullscreen"][data-sidebar-right-open]')
    const content = chat?.querySelector('[data-conversation-session], [data-conversation-root]')
    if (frame?.hasAttribute('data-rightbar-fullscreen') && panel && !panel.closest('[hidden]') && content) {
      const panelSession = panel.closest('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session')
      const chatSession = content.getAttribute('data-conversation-session')
      if (chatSession && panelSession && chatSession !== panelSession) continue
      return { frame, chat, panel, sidebar: chat.previousElementSibling }
    }
  }
  return null
}

/** Install one reversible DOM presentation effect over the existing host components. */
export function installFullView(doc, input = {}) {
  const config = resolveConfig(input)
  const win = doc.defaultView
  if (!win) throw new Error('dsh-full-view: no browser document')
  win[cleanupKey]?.()
  const sheet = doc.createElement('style')
  sheet.setAttribute('data-dsh-full-view-style', '')
  sheet.textContent = style
  doc.head.append(sheet)
  let surface = null
  let toolbar = null
  let resize = null
  let edge = null
  let composer = null
  let composerMarks = []
  let collapsedHeight = 48
  let suppressEdgeClick = false
  let title = null
  let minimize = null
  let header = null
  let raf = null
  let disposed = false
  let minimized = false
  let drag = null
  let preferred = { width: config.chatWidth, height: config.chatHeight }
  if (config.rememberGeometry) {
    try {
      const stored = JSON.parse(win.localStorage.getItem(geometryKey) ?? 'null')
      if (stored && ['width', 'height'].every(key => Number.isFinite(stored[key]) && stored[key] > 0) && ['x', 'y'].every(key => stored[key] === undefined || Number.isFinite(stored[key]))) preferred = stored
    } catch { /* Unavailable storage or invalid persisted JSON leaves default geometry. */ }
  }
  const setStyle = (element, key, value) => {
    if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value)
  }
  const bounds = () => {
    const box = surface.frame.getBoundingClientRect()
    const sidebar = surface.sidebar?.getBoundingClientRect()
    const left = Math.min(box.width, Math.max(0, (sidebar?.right ?? box.left) - box.left))
    const chromeTop = Number.parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue('--dsh-frame-chrome-top')) || 0
    return { left, top: chromeTop, width: box.width - left, height: box.height - chromeTop }
  }
  const geometry = () => {
    const b = bounds()
    const gap = Math.min(config.edgeGap, Math.max(0, Math.min(b.width, b.height) / 8))
    const width = Math.max(0, Math.min(Math.max(280, preferred.width), b.width - 2 * gap))
    const height = Math.max(0, Math.min(Math.max(240, preferred.height), b.height - 2 * gap))
    const visibleHeight = minimized ? (composer ? collapsedHeight : 36) : height
    const offset = minimized && composer ? height - visibleHeight : 0
    return {
      width, height,
      x: Math.min(Math.max(preferred.x ?? b.left + b.width - width - gap, b.left + gap), b.left + b.width - width - gap),
      y: Math.min(Math.max(preferred.y === undefined ? b.top + b.height - visibleHeight - gap : preferred.y + offset, b.top + gap), b.top + b.height - visibleHeight - gap),
    }
  }
  const persist = () => {
    if (!config.rememberGeometry) return
    try { win.localStorage.setItem(geometryKey, JSON.stringify(preferred)) } catch { /* Browser storage policy may forbid saving viewing preferences. */ }
  }
  const updateGeometry = () => {
    if (!surface) return
    if (composer) {
      collapsedHeight = Math.max(48, composer.seat.getBoundingClientRect().height + 2)
      setStyle(surface.chat, '--dsh-fv-collapsed-height', `${collapsedHeight}px`)
    }
    const b = bounds()
    const g = geometry()
    setStyle(surface.frame, '--dsh-fv-content-width', `${b.width}px`)
    for (const [key, value] of Object.entries(g)) setStyle(surface.chat, `--dsh-fv-${key}`, `${value}px`)
  }
  const returnSplit = () => {
    const button = surface?.panel.querySelector('[data-sidebar-right-mode="push"]') ?? surface?.panel.querySelector('[data-sidebar-right-mode]')
    button?.click()
  }
  const toggleMinimize = () => {
    minimized = !minimized
    surface?.chat.toggleAttribute('data-dsh-chat-minimized', minimized)
    minimize.setAttribute('aria-label', minimized ? '展开聊天' : '收起聊天')
    minimize.setAttribute('title', minimized ? '展开聊天' : '收起聊天')
    minimize.setAttribute('aria-expanded', String(!minimized))
    edge.setAttribute('aria-label', minimized ? '展开聊天' : '收起聊天')
    edge.title = minimized ? '点击外缘展开聊天，拖动移动' : '点击外缘收起聊天，拖动移动'
    edge.setAttribute('aria-expanded', String(!minimized))
    updateGeometry()
  }
  const pointerDown = event => {
    if (event.button !== 0 || (event.currentTarget !== edge && event.target.closest('button'))) return
    event.preventDefault()
    const target = event.currentTarget
    const g = geometry()
    drag = { target, pointerId: event.pointerId, resize: target === resize, startX: event.clientX, startY: event.clientY, geometry: g }
    if (target === edge) suppressEdgeClick = false
    target.setPointerCapture(event.pointerId)
    surface.frame.setAttribute('data-dsh-fv-dragging', '')
  }
  const pointerMove = event => {
    if (!drag || event.pointerId !== drag.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (drag.target === edge && Math.hypot(dx, dy) > 4) suppressEdgeClick = true
    const offset = minimized && composer ? drag.geometry.height - collapsedHeight : 0
    preferred = drag.resize
      ? { ...drag.geometry, width: drag.geometry.width + dx, height: drag.geometry.height + dy }
      : { ...drag.geometry, x: drag.geometry.x + dx, y: drag.geometry.y + dy - offset }
    const constrained = geometry()
    preferred = { ...constrained, y: constrained.y - offset }
    updateGeometry()
  }
  const pointerEnd = event => {
    if (!drag || event.pointerId !== drag.pointerId) return
    const held = drag
    drag = null
    surface?.frame.removeAttribute('data-dsh-fv-dragging')
    if (held.target.hasPointerCapture(held.pointerId)) held.target.releasePointerCapture(held.pointerId)
    persist()
  }
  const button = (label, marker, path, handler) => {
    const element = doc.createElement('button')
    element.type = 'button'
    element.setAttribute('aria-label', label)
    element.title = label
    element.setAttribute(marker, '')
    element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${path}"/></svg>`
    element.addEventListener('click', handler)
    return element
  }
  const buildChrome = () => {
    toolbar = doc.createElement('div')
    toolbar.setAttribute('data-dsh-full-view-toolbar', '')
    toolbar.setAttribute('role', 'toolbar')
    toolbar.setAttribute('aria-label', '聊天小窗')
    title = doc.createElement('span')
    title.setAttribute('data-dsh-full-view-title', '')
    title.textContent = '聊天'
    minimize = button('收起聊天', 'data-dsh-minimize-chat', 'M5 12h14', toggleMinimize)
    minimize.setAttribute('aria-expanded', 'true')
    toolbar.append(title, minimize, button('返回分栏视图', 'data-dsh-return-split', 'M4 5h16v14H4z M10 5v14', returnSplit))
    edge = doc.createElement('button')
    edge.type = 'button'
    edge.setAttribute('data-dsh-full-view-edge', '')
    edge.setAttribute('aria-label', '收起聊天')
    edge.setAttribute('aria-expanded', 'true')
    edge.title = '点击外缘收起聊天，拖动移动'
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const segment = doc.createElement('span')
      segment.setAttribute('data-dsh-edge-side', side)
      segment.setAttribute('aria-hidden', 'true')
      edge.append(segment)
    }
    edge.addEventListener('click', () => {
      if (suppressEdgeClick) { suppressEdgeClick = false; return }
      toggleMinimize()
    })
    resize = doc.createElement('div')
    resize.setAttribute('data-dsh-full-view-resize', '')
    resize.setAttribute('role', 'separator')
    resize.setAttribute('aria-label', '调整聊天小窗大小，双击恢复默认尺寸')
    resize.title = '拖动调整大小，双击恢复默认尺寸'
    resize.tabIndex = 0
    resize.addEventListener('dblclick', () => {
      preferred = { ...geometry(), width: config.chatWidth, height: config.chatHeight }
      updateGeometry(); persist()
    })
    resize.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
      event.preventDefault()
      const g = geometry()
      const step = event.shiftKey ? 48 : 16
      preferred = { ...g, width: g.width + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), height: g.height + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0) }
      updateGeometry(); persist()
    })
    for (const element of [toolbar, resize, edge]) {
      element.addEventListener('pointerdown', pointerDown)
      element.addEventListener('pointermove', pointerMove)
      element.addEventListener('pointerup', pointerEnd)
      element.addEventListener('pointercancel', pointerEnd)
      element.addEventListener('lostpointercapture', pointerEnd)
    }
    toolbar.addEventListener('dblclick', event => {
      if (event.target.closest('button')) return
      preferred = { width: config.chatWidth, height: config.chatHeight }
      updateGeometry(); persist()
    })
  }
  const clearComposer = () => {
    if (composer) resizeObserver?.unobserve?.(composer.seat)
    for (const [element, marker] of composerMarks) element.removeAttribute(marker)
    composerMarks = []
    composer = null
    surface?.chat.removeAttribute('data-dsh-chat-composer')
  }
  const syncComposer = () => {
    const seat = surface.chat.querySelector('[data-composer-seat]')
    const card = seat?.querySelector('[data-composer-card]')
    const scroll = card?.querySelector('[data-input-scroll]')
    const row = scroll?.nextElementSibling
    const footer = card?.nextElementSibling
    if (composer?.seat === seat && composer?.card === card && composer?.row === row && composer?.footer === footer && composer?.tools === row?.firstElementChild && composer?.trailing === row?.lastElementChild) return
    clearComposer()
    if (!seat || !card || !scroll || !row) return
    composer = { seat, card, row, footer, tools: row.firstElementChild, trailing: row.lastElementChild }
    const mark = (element, marker) => {
      if (!element) return
      element.setAttribute(marker, '')
      composerMarks.push([element, marker])
    }
    for (let node = seat; node && node !== surface.chat; node = node.parentElement) mark(node, 'data-dsh-full-view-input-path')
    for (let node = card.parentElement; node && node !== seat; node = node.parentElement) mark(node, 'data-dsh-full-view-input-shell')
    mark(card, 'data-dsh-full-view-composer-card')
    mark(row, 'data-dsh-full-view-input-row')
    mark(footer, 'data-dsh-full-view-input-footer')
    mark(composer.tools, 'data-dsh-full-view-input-tools')
    mark(composer.trailing, 'data-dsh-full-view-input-trailing')
    surface.chat.setAttribute('data-dsh-chat-composer', '')
    resizeObserver?.observe(seat)
  }
  const resizeObserver = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(() => schedule()) : null
  const restore = () => {
    if (!surface) return
    if (drag) pointerEnd({ pointerId: drag.pointerId })
    clearComposer()
    resizeObserver?.disconnect()
    surface.frame.removeAttribute('data-dsh-full-view')
    surface.frame.style.removeProperty('--dsh-fv-content-width')
    surface.chat.removeAttribute('data-dsh-floating-chat')
    surface.chat.removeAttribute('data-dsh-chat-minimized')
    surface.chat.style.removeProperty('--dsh-fv-collapsed-height')
    for (const key of ['x', 'y', 'width', 'height']) surface.chat.style.removeProperty(`--dsh-fv-${key}`)
    header?.removeAttribute('data-dsh-floating-header')
    toolbar?.remove(); resize?.remove(); edge?.remove()
    toolbar = resize = edge = title = minimize = header = null
    surface = null
    minimized = false
  }
  const sync = () => {
    raf = null
    if (disposed) return
    const next = findSurface(doc)
    if (!next || next.chat !== surface?.chat || next.panel !== surface?.panel) {
      restore()
      if (!next) return
      surface = next
      buildChrome()
      surface.frame.setAttribute('data-dsh-full-view', '')
      surface.chat.setAttribute('data-dsh-floating-chat', '')
      syncComposer()
      if (composer) toggleMinimize()
      resizeObserver?.observe(surface.frame)
      if (surface.sidebar) resizeObserver?.observe(surface.sidebar)
    }
    if (!surface) return
    if (toolbar.parentElement !== surface.chat) surface.chat.prepend(toolbar)
    if (resize.parentElement !== surface.chat) surface.chat.append(resize)
    if (edge.parentElement !== surface.chat) surface.chat.append(edge)
    syncComposer()
    const nextHeader = surface.chat.querySelector('[data-conversation-header-leading]')?.closest('header')
    if (nextHeader !== header) { header?.removeAttribute('data-dsh-floating-header'); header = nextHeader; header?.setAttribute('data-dsh-floating-header', '') }
    const currentTitle = doc.title.replace(/\s*[—–-]\s*DeepSeek Harness\s*$/, '') || '聊天'
    if (title.textContent !== currentTitle) title.textContent = currentTitle
    updateGeometry()
  }
  function schedule() {
    if (!disposed && raf === null) raf = win.requestAnimationFrame(sync)
  }
  const observer = new win.MutationObserver(records => {
    if (records.some(record => record.type === 'childList' || !record.attributeName.startsWith('data-dsh-'))) schedule()
  })
  observer.observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-rightbar-fullscreen', 'data-sidebar-right-panel', 'data-sidebar-right-open', 'data-conversation-session', 'hidden', 'data-sidebar-collapsed'] })
  win.addEventListener('resize', schedule)
  sync()
  const dispose = () => {
    if (disposed) return
    disposed = true
    observer.disconnect()
    win.removeEventListener('resize', schedule)
    if (raf !== null) win.cancelAnimationFrame(raf)
    restore()
    sheet.remove()
    if (win[cleanupKey] === dispose) delete win[cleanupKey]
  }
  win[cleanupKey] = dispose
  return dispose
}

export const inject = ['sidebarRight', 'layout']

/** Cordis owns cancellation and all DOM writes, including hot-reload cleanup. */
export function apply(ctx) {
  ctx.effect(() => {
    const lifetime = new AbortController()
    let cleanup = () => {}
    void fetch('/dsh-full-view/api/config', { signal: lifetime.signal })
      .then(response => {
        if (!response.ok) throw new Error(`dsh-full-view config: HTTP ${response.status}`)
        return response.json()
      })
      .then(config => { if (!lifetime.signal.aborted) cleanup = installFullView(document, config) })
      .catch(error => { if (!lifetime.signal.aborted) console.error('[dsh-full-view] 无法加载完整视图配置', error) })
    return () => { lifetime.abort(); cleanup() }
  }, 'dsh-full-view: resident chat presentation')
}
