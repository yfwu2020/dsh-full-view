import { resolveConfig } from '../config.js'
import { style } from './style.js'
import { createActivitySource, processingLabel } from './activity.js'
import { syncNativeWhale } from './whale.js'

const geometryKey = 'dsh.full-view.geometry.v1'
const pendingSelector = '[data-approval-key], [data-question-key], [data-plan-review-key]'
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
export function installFullView(doc, input = {}, activity = null) {
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
  let handles = []
  let badge = null
  let processing = null
  let clock = null
  let approvalState = null
  let savedAccessibility = null
  let sessionId = null
  let suppressChromeClick = false
  let edgeClickTimer = null
  let idleTimer = null
  let composing = false
  let mode = 'expanded'
  let edge = null
  let composer = null
  let composerMarks = []
  let modelTrigger = null
  let modelIcon = null
  let collapsedHeight = 48
  let returningFocus = false
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
    const viewport = win.visualViewport
    const chromeTop = Number.parseFloat(win.getComputedStyle(doc.documentElement).getPropertyValue('--dsh-frame-chrome-top')) || 0
    const left = Math.max(0, (sidebar?.right ?? box.left) - box.left, (viewport?.offsetLeft ?? 0) - box.left)
    const top = Math.max(chromeTop, (viewport?.offsetTop ?? 0) - box.top)
    const right = Math.min(box.width, viewport ? viewport.offsetLeft + viewport.width - box.left : box.width)
    const bottom = Math.min(box.height, viewport ? viewport.offsetTop + viewport.height - box.top : box.height)
    return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }
  }
  const geometry = () => {
    const b = bounds()
    const gap = Math.min(config.edgeGap, Math.max(0, Math.min(b.width, b.height) / 8))
    const width = Math.max(0, Math.min(Math.max(280, preferred.width), b.width - 2 * gap))
    const height = Math.max(0, Math.min(Math.max(240, preferred.height), b.height - 2 * gap))
    const visibleHeight = Math.min(height, !minimized ? height : composer ? collapsedHeight : 36)
    const offset = minimized && composer ? height - visibleHeight : 0
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)))
    return {
      width, height, visibleHeight, offset,
      x: clamp(preferred.x ?? b.left + b.width - width - gap, b.left + gap, b.left + b.width - width - gap),
      y: clamp(preferred.y === undefined ? b.top + b.height - visibleHeight - gap : preferred.y + offset, b.top + gap, b.top + b.height - visibleHeight - gap),
    }
  }
  const persist = () => {
    if (!config.rememberGeometry) return
    try { win.localStorage.setItem(geometryKey, JSON.stringify(preferred)) } catch { /* Storage may be unavailable. */ }
  }
  const conversation = () => surface?.chat.querySelector('[data-conversation-session], [data-conversation-root]')
  const belongsToConversation = node => node.closest('[data-conversation-session], [data-conversation-root]') === conversation()
  const composerSeat = () => [...(surface?.chat.querySelectorAll('[data-composer-seat]') ?? [])].find(belongsToConversation)
  const editor = () => composer?.card.querySelector('[data-composer-input], textarea') ?? (!composerSeat() ? conversation()?.querySelector('textarea') : null)
  const focusEditor = () => {
    returningFocus = true
    try {
      const pending = [...(surface?.chat.querySelectorAll(pendingSelector) ?? [])].find(belongsToConversation)
      const target = pending?.querySelector('textarea, input:not([type="hidden"]):not(:disabled), [contenteditable="true"]')
        ?? pending?.querySelector('button:not(:disabled), [tabindex]:not([tabindex="-1"])')
        ?? editor()
      target?.focus({ preventScroll: true })

    } finally { returningFocus = false }
  }
  const withinChat = node => node instanceof win.Node && surface?.chat.contains(node)
  const popupSelector = '[role="dialog"], [role="menu"], [role="listbox"], [data-trigger-menu], [data-overlay-owner], [data-content-search-bar], [data-approval-key], [data-question-key], [data-plan-review-key]'
  const popupOpen = () => [...doc.querySelectorAll(popupSelector)].some(node => {
    if (node.matches(pendingSelector) && surface?.chat.contains(node) && !belongsToConversation(node)) return false
    if (node.closest('[hidden], [inert], [aria-hidden="true"]')) return false
    const css = win.getComputedStyle(node)
    if (css.visibility === 'hidden' || css.visibility === 'collapse') return false
    // Other plugins keep dialog children mounted inside display:none panels.
    // A child's own computed display remains flex in that hidden subtree.
    for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
      if (win.getComputedStyle(ancestor).display === 'none') return false
    }
    return true
  })
  const clearIdle = () => {
    if (idleTimer !== null) win.clearTimeout(idleTimer)
    idleTimer = null
  }
  const canRecycle = () => surface && mode === 'compact' && composer && config.compactIdleSeconds > 0 && !approvalState && !activity?.getSnapshot().pending && !drag && !composing && !popupOpen()
  // Mutation/activity refreshes maintain an existing deadline; only user input resets it.
  const syncIdle = () => {
    if (!canRecycle()) { clearIdle(); return }
    if (idleTimer !== null) return
    idleTimer = win.setTimeout(() => {
      idleTimer = null
      if (canRecycle()) setMode('hidden', { focusRecovery: false })
    }, config.compactIdleSeconds * 1000)
  }
  const userActivity = event => {
    if (mode !== 'compact' || !withinChat(event.target)) return
    clearIdle(); syncIdle()
  }
  const inputChanged = event => { userActivity(event); schedule() }
  const compositionChanged = event => {
    if (!withinChat(event.target)) return
    composing = event.type === 'compositionstart'
    clearIdle(); syncIdle(); schedule()
  }
  const updateGeometry = () => {
    if (!surface) return
    const chrome = !minimized || !composer
    surface.chat.toggleAttribute('data-dsh-chat-chrome', chrome)
    if (composer) collapsedHeight = Math.max(48, composer.seat.getBoundingClientRect().height + 2)
    const b = bounds()
    const g = geometry()
    setStyle(surface.chat, '--dsh-fv-collapsed-height', `${g.visibleHeight}px`)
    setStyle(surface.frame, '--dsh-fv-content-width', `${b.width}px`)
    for (const key of ['x', 'y', 'width', 'height']) setStyle(surface.chat, `--dsh-fv-${key}`, `${g[key]}px`)
    // Recovery controls live beside, rather than inside, the inert hidden chat.
    if (badge.hidden !== (mode !== 'hidden')) badge.hidden = mode !== 'hidden'
    setStyle(badge, 'left', `${g.x + Math.max(0, g.width - 40)}px`)
    setStyle(badge, 'top', `${g.y + Math.max(0, g.visibleHeight - 40)}px`)
    for (const handle of handles) {
      const vertical = ['n', 's'].includes(handle.getAttribute('data-dsh-resize-direction'))
      handle.setAttribute('aria-valuemin', '0')
      handle.setAttribute('aria-valuemax', String(Math.round(vertical ? b.height : b.width)))
      handle.setAttribute('aria-valuenow', String(Math.round(vertical ? g.height : g.width)))
      handle.setAttribute('aria-valuetext', `${Math.round(g.width)} × ${Math.round(g.height)} 像素`)
    }
    minimize.disabled = !!approvalState
    minimize.title = approvalState ? '请先处理会话中的待办提示' : '隐藏聊天，保留恢复入口'
    const label = minimized ? '展开聊天' : '收起聊天'
    if (edge.getAttribute('aria-expanded') !== String(!minimized)) edge.setAttribute('aria-expanded', String(!minimized))
    edge.setAttribute('aria-label', label)
    title.setAttribute('aria-label', `移动聊天小窗：${title.textContent}，方向键移动`)
    title.removeAttribute('title')
    edge.title = approvalState ? '请先处理会话中的待办提示' : `点击外缘${minimized ? '展开' : '收起'}聊天，拖动移动`
  }
  const setMode = (next, { focus = false, force = false, focusRecovery = true } = {}) => {
    if (!surface || (approvalState && next !== 'expanded' && !force)) return
    const active = doc.activeElement
    clearIdle()
    mode = next
    // Hiding changes visibility, not the presentation that is currently fading out.
    if (mode !== 'hidden') minimized = mode === 'compact'
    surface.chat.toggleAttribute('data-dsh-chat-minimized', minimized)
    surface.chat.toggleAttribute('data-dsh-chat-hidden', mode === 'hidden')
    if (mode === 'hidden') {
      if (withinChat(active)) active.blur()
      surface.chat.setAttribute('inert', '')
      surface.chat.setAttribute('aria-hidden', 'true')
    } else {
      for (const key of ['inert', 'aria-hidden']) {
        const value = savedAccessibility?.[key]
        if (value === null || value === undefined) surface.chat.removeAttribute(key)
        else surface.chat.setAttribute(key, value)
      }
    }
    updateGeometry()
    if (mode === 'hidden' && focusRecovery) badge.focus({ preventScroll: true })
    else if (focus || (mode === 'compact' && withinChat(active) && !composer?.seat.contains(active))) focusEditor()
    syncIdle()
  }
  const returnSplit = () => {
    const button = surface?.panel.querySelector('[data-sidebar-right-mode="push"]') ?? surface?.panel.querySelector('[data-sidebar-right-mode]')
    button?.click()
  }
  const toggleMinimize = () => setMode(mode === 'expanded' ? 'compact' : 'expanded', { focus: mode !== 'expanded' })
  const resetSize = (position = false) => {
    const g = geometry()
    const b = bounds(), gap = Math.min(config.edgeGap, Math.min(b.width, b.height) / 8)
    const restoredHeight = Math.max(0, Math.min(config.chatHeight, b.height - 2 * gap))
    const y = mode === 'expanded' ? g.y : g.y + g.visibleHeight - restoredHeight
    preferred = position ? { width: config.chatWidth, height: config.chatHeight } : { x: g.x, y, width: config.chatWidth, height: config.chatHeight }
    updateGeometry(); persist()
  }
  const clearEdgeClick = () => {
    if (edgeClickTimer !== null) win.clearTimeout(edgeClickTimer)
    edgeClickTimer = null
  }
  const delayedToggle = event => {
    clearEdgeClick()
    if (event.detail === 0) { toggleMinimize(); return }
    edgeClickTimer = win.setTimeout(() => { edgeClickTimer = null; toggleMinimize() }, 260)
  }
  const pointerDown = event => {
    if (event.button !== 0 || drag || (event.currentTarget === toolbar && event.target.closest('button'))) return
    event.preventDefault()
    clearEdgeClick()
    const target = event.currentTarget
    drag = { target, pointerId: event.pointerId, direction: target.getAttribute('data-dsh-resize-direction'), startX: event.clientX, startY: event.clientY, geometry: geometry(), preferred: { ...preferred }, moved: false }
    suppressEdgeClick = suppressChromeClick = false
    syncIdle()
    target.setPointerCapture(event.pointerId)
    surface.frame.setAttribute('data-dsh-fv-dragging', '')
  }
  const resizedGeometry = (g, direction, dx, dy) => {
    const b = bounds(), gap = Math.min(config.edgeGap, Math.min(b.width, b.height) / 8)
    const west = direction.includes('w'), north = direction.includes('n')
    const maxWidth = west ? g.x + g.width - b.left - gap : b.left + b.width - gap - g.x
    const maxHeight = north ? g.y + g.height - b.top - gap : b.top + b.height - gap - g.y
    const width = direction.includes('e') || west ? Math.min(maxWidth, Math.max(280, g.width + (west ? -dx : dx))) : g.width
    const height = direction.includes('s') || north ? Math.min(maxHeight, Math.max(240, g.height + (north ? -dy : dy))) : g.height
    return { width, height, x: g.x + (west ? g.width - width : 0), y: g.y - g.offset + (north ? g.height - height : 0) }
  }
  const pointerMove = event => {
    if (!drag || event.pointerId !== drag.pointerId) return
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) <= 4) return
    drag.moved = true
    suppressEdgeClick = suppressChromeClick = true
    const g = drag.geometry
    preferred = drag.direction ? resizedGeometry(g, drag.direction, dx, dy) : { width: g.width, height: g.height, x: g.x + dx, y: g.y + dy - g.offset }
    const constrained = geometry()
    preferred = { width: constrained.width, height: constrained.height, x: constrained.x, y: constrained.y - constrained.offset }
    updateGeometry()
  }
  const finishPointer = (event, cancel = false) => {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.pointerId)) return
    const held = drag
    drag = null
    surface?.frame.removeAttribute('data-dsh-fv-dragging')
    if (cancel) preferred = held.preferred
    else if (held.moved && !held.direction) {
      const b = bounds(), g = geometry(), gap = Math.min(config.edgeGap, Math.min(b.width, b.height) / 8)
      const threshold = 24
      let x = g.x, y = g.y
      const right = b.left + b.width - g.width - gap, bottom = b.top + b.height - g.visibleHeight - gap
      if (Math.abs(x - b.left - gap) <= threshold) x = b.left + gap
      if (Math.abs(x - right) <= threshold) x = right
      if (Math.abs(y - b.top - gap) <= threshold) y = b.top + gap
      if (Math.abs(y - bottom) <= threshold) y = bottom
      preferred = { width: g.width, height: g.height, x, y: y - g.offset }
    }
    if (held.target.hasPointerCapture(held.pointerId)) held.target.releasePointerCapture(held.pointerId)
    updateGeometry()
    if (!cancel && held.moved) persist()
    clearIdle(); syncIdle()
  }
  const pointerEnd = event => finishPointer(event)
  const button = (label, marker, path, handler) => {
    const element = doc.createElement('button')
    element.type = 'button'
    element.setAttribute('aria-label', label)
    element.title = label
    element.setAttribute(marker, '')
    // Reuse the plugin's existing glyphs; new actions use plain text labels.
    if (path) element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${path}"/></svg>`
    element.addEventListener('click', handler)
    return element
  }
  const moveWithKeyboard = event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault(); event.stopPropagation()
    const g = geometry(), step = event.shiftKey ? 48 : 16
    preferred = { width: g.width, height: g.height, x: g.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: g.y - g.offset + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0) }
    const result = geometry()
    preferred.x = result.x; preferred.y = result.y - result.offset
    updateGeometry(); persist()
  }
  const buildChrome = () => {
    toolbar = doc.createElement('div')
    toolbar.setAttribute('data-dsh-full-view-toolbar', '')
    toolbar.setAttribute('role', 'toolbar')
    toolbar.setAttribute('aria-label', '聊天小窗')
    title = button('移动聊天小窗', 'data-dsh-full-view-title', null, () => {})
    title.addEventListener('keydown', moveWithKeyboard)
    title.textContent = '聊天'
    minimize = button('隐藏聊天，保留恢复入口', 'data-dsh-minimize-chat', 'M5 12h14', () => setMode('hidden'))
    const grip = button('移动聊天小窗：方向键移动，Shift 加大步长', 'data-dsh-move-chat', null, () => {})
    grip.textContent = '⠿'
    grip.addEventListener('keydown', moveWithKeyboard)
    toolbar.append(minimize, title, button('返回分栏视图', 'data-dsh-return-split', 'M4 5h16v14H4z M10 5v14', returnSplit), grip)
    edge = button('展开聊天', 'data-dsh-full-view-edge', null, event => {
      if (suppressEdgeClick && event.detail !== 0) { suppressEdgeClick = false; return }
      toggleMinimize()
    })
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const segment = doc.createElement('span')
      segment.setAttribute('data-dsh-edge-side', side)
      segment.setAttribute('aria-hidden', 'true')
      edge.append(segment)
    }
    handles = ['se', 'w', 'e', 'n', 's', 'nw', 'ne', 'sw'].map(direction => {
      const handle = doc.createElement('div')
      handle.setAttribute('data-dsh-full-view-resize', '')
      handle.setAttribute('data-dsh-resize-direction', direction)
      handle.setAttribute('role', 'separator')
      handle.setAttribute('aria-orientation', direction === 'n' || direction === 's' ? 'horizontal' : 'vertical')
      handle.setAttribute('aria-label', `调整聊天${direction === 'w' || direction === 'e' ? '宽度' : '大小'}，双击恢复默认尺寸`)
      handle.title = '拖动调整大小，双击恢复默认尺寸'
      handle.tabIndex = 0
      handle.addEventListener('dblclick', () => { clearEdgeClick(); resetSize() })
      handle.addEventListener('click', event => {
        if (suppressEdgeClick && event.detail !== 0) { suppressEdgeClick = false; return }
        if (direction.length !== 1) return
        // Distinguish a single edge click from a double click that resets size.
        delayedToggle(event)
      })
      handle.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
        event.preventDefault(); event.stopPropagation()
        const g = geometry(), step = event.shiftKey ? 48 : 16
        const dw = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0
        const dh = mode !== 'expanded' ? 0 : event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0
        preferred = resizedGeometry(g, direction, direction.includes('w') ? -dw : dw, direction.includes('n') ? -dh : dh)
        updateGeometry(); persist()
      })
      return handle
    })
    resize = handles[0]
    badge = button('恢复聊天', 'data-dsh-restore-chat', null, event => {
      if (suppressChromeClick && event.detail !== 0) { suppressChromeClick = false; return }
      setMode('expanded', { focus: true })
    })
    badge.hidden = true
    badge.addEventListener('keydown', moveWithKeyboard)
    badge.removeAttribute('title')
    const whale = doc.createElement('span')
    whale.setAttribute('data-dsh-whale-icon', '')
    whale.setAttribute('aria-hidden', 'true')
    badge.append(whale)
    const statusDot = doc.createElement('span')
    statusDot.setAttribute('data-dsh-whale-status', '')
    statusDot.setAttribute('aria-hidden', 'true')
    badge.append(statusDot)
    syncNativeWhale(doc, badge)
    processing = doc.createElement('div')
    processing.setAttribute('data-dsh-processing-status', '')
    processing.setAttribute('role', 'status')
    // Do not announce each second to assistive technology.
    processing.setAttribute('aria-live', 'off')
    processing.hidden = true
    for (const element of [toolbar, title, edge, ...handles, badge, grip]) {
      element.addEventListener('pointerdown', pointerDown)
      element.addEventListener('pointermove', pointerMove)
      element.addEventListener('pointerup', pointerEnd)
      element.addEventListener('pointercancel', event => finishPointer(event, true))
      element.addEventListener('lostpointercapture', event => finishPointer(event, true))
    }
    const resetOnDoubleClick = event => {
      if (event.target.closest('button') && event.target !== title) return
      clearEdgeClick(); resetSize(true)
    }
    toolbar.addEventListener('dblclick', resetOnDoubleClick)
  }
  const clearModel = () => {
    modelTrigger?.removeAttribute('data-dsh-full-view-model')
    modelIcon?.removeAttribute('data-dsh-full-view-model-icon')
    modelTrigger = modelIcon = null
  }
  const syncModel = () => {
    const next = composer?.trailing?.querySelector('button[aria-haspopup="menu"]') ?? null
    const icon = next?.querySelector(':scope > svg:first-of-type') ?? null
    if (next === modelTrigger && icon === modelIcon) return
    clearModel()
    if (!next || !icon) return
    modelTrigger = next; modelIcon = icon
    // Keep the host button, SVG, accessible name and menu handlers intact.
    modelTrigger.setAttribute('data-dsh-full-view-model', '')
    modelIcon.setAttribute('data-dsh-full-view-model-icon', '')
  }
  const clearComposer = () => {
    clearModel()
    processing?.remove()
    composer?.card.removeAttribute('data-dsh-processing')
    if (composer) resizeObserver?.unobserve?.(composer.seat)
    for (const [element, marker] of composerMarks) element.removeAttribute(marker)
    composerMarks = []
    composer = null
    surface?.chat.removeAttribute('data-dsh-chat-composer')
  }
  const syncComposer = () => {
    const seat = composerSeat()
    const card = seat?.querySelector('[data-composer-card]')
    const scroll = card?.querySelector('[data-input-scroll]')
    const row = scroll?.nextElementSibling
    const footer = card?.nextElementSibling
    if (composer?.seat === seat && composer?.card === card && composer?.scroll === scroll && composer?.row === row && composer?.footer === footer && composer?.tools === row?.firstElementChild && composer?.trailing === row?.lastElementChild) { syncModel(); return }
    clearComposer()
    if (!seat || !card || !scroll || !row) return
    composer = { seat, card, scroll, row, footer, tools: row.firstElementChild, trailing: row.lastElementChild }
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
    syncModel()
    resizeObserver?.observe(seat)
  }
  const stopClock = () => {
    if (clock !== null) win.clearInterval(clock)
    clock = null
  }
  const syncActivity = () => {
    if (!surface) return
    activity?.setSession(sessionId)
    syncNativeWhale(doc, badge)
    const state = activity?.getSnapshot() ?? { running: false }
    const running = state.running && !state.pending && !approvalState
    badge.toggleAttribute('data-dsh-running', running)
    const status = state.pending || approvalState ? 'warning' : running ? 'ongoing' : state.completed ? 'done' : 'idle'
    badge.querySelector('[data-dsh-whale-status]').setAttribute('data-state', status)
    const pendingKind = state.pendingKind ?? approvalState?.kind
    const statusLabel = status === 'warning' ? pendingKind === 'question' ? '等待回答' : pendingKind === 'plan-review' ? '等待计划确认' : '等待确认'
      : status === 'ongoing' ? '正在处理' : status === 'done' ? '已完成' : '空闲'
    badge.setAttribute('aria-label', `恢复聊天，${statusLabel}`)
    const input = editor()
    const hasDraft = !!(input?.matches('textarea') ? input.value : input?.textContent)?.trim()
    const hidden = !running || !composer || hasDraft
    composer?.card.toggleAttribute('data-dsh-processing', !hidden)
    if (processing.hidden !== hidden) processing.hidden = hidden
    const label = processingLabel(state.startedAt, Date.now())
    if (processing.textContent !== label) processing.textContent = label
    if (composer && processing.parentElement !== composer.scroll) composer.scroll.append(processing)
    if (running && Number.isFinite(state.startedAt)) {
      if (clock === null) clock = win.setInterval(syncActivity, 1000)
    } else stopClock()
  }
  const resizeObserver = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(() => schedule()) : null
  const restore = () => {
    if (!surface) return
    if (drag) finishPointer(null, true)
    clearEdgeClick()
    clearIdle()
    composing = false
    stopClock()
    activity?.setSession(null)
    clearComposer()
    resizeObserver?.disconnect()
    surface.frame.removeAttribute('data-dsh-full-view')
    surface.frame.style.removeProperty('--dsh-fv-content-width')
    for (const marker of ['floating-chat', 'chat-minimized', 'chat-hidden', 'chat-chrome', 'chat-unread']) surface.chat.removeAttribute(`data-dsh-${marker}`)
    for (const key of ['inert', 'aria-hidden']) {
      const value = savedAccessibility?.[key]
      if (value === null || value === undefined) surface.chat.removeAttribute(key)
      else surface.chat.setAttribute(key, value)
    }
    for (const key of ['x', 'y', 'width', 'height', 'collapsed-height']) surface.chat.style.removeProperty(`--dsh-fv-${key}`)
    header?.removeAttribute('data-dsh-floating-header')
    const focusWasChrome = [badge, toolbar, ...handles].some(node => node?.contains(doc.activeElement))
    toolbar?.remove(); edge?.remove(); badge?.remove(); processing?.remove()
    for (const handle of handles) handle.remove()
    if (focusWasChrome) focusEditor()
    toolbar = resize = edge = title = minimize = header = badge = processing = null
    handles = []
    surface = null
    mode = 'expanded'; minimized = false
    approvalState = savedAccessibility = sessionId = null
  }
  const syncApproval = () => {
    const seat = composerSeat()
    // Pending interactions replace the native composer. Trajectory overlays do not.
    const pending = [...surface.chat.querySelectorAll(pendingSelector)].find(belongsToConversation)
    const blocked = !!pending || !!(seat?.childElementCount && !composer)
    const kind = pending?.hasAttribute('data-question-key') ? 'question' : pending?.hasAttribute('data-plan-review-key') ? 'plan-review' : 'approval'
    if (blocked && !approvalState) {
      const previous = mode
      approvalState = { previous, kind }
      // An already hidden chat signals via the whale dot; opening it reveals the original prompt.
      if (previous !== 'hidden') setMode('expanded', { force: true })
    } else if (blocked && approvalState) {
      approvalState.kind = kind
    } else if (!blocked && approvalState) {
      const previous = approvalState.previous
      approvalState = null
      setMode(previous, { force: true })
    }
  }
  const sync = () => {
    raf = null
    if (disposed) return
    const next = findSurface(doc)
    if (!next || next.chat !== surface?.chat || next.panel !== surface?.panel) {
      restore()
      if (!next) return
      surface = next
      savedAccessibility = Object.fromEntries(['inert', 'aria-hidden'].map(key => [key, surface.chat.getAttribute(key)]))
      sessionId = surface.chat.querySelector('[data-conversation-session]')?.getAttribute('data-conversation-session')
      buildChrome()
      surface.frame.append(badge)
      surface.frame.setAttribute('data-dsh-full-view', '')
      surface.chat.setAttribute('data-dsh-floating-chat', '')
      syncComposer()
      setMode(composerSeat() ? 'compact' : 'expanded')
      resizeObserver?.observe(surface.frame)
      if (surface.sidebar) resizeObserver?.observe(surface.sidebar)
    }
    if (!surface) return
    if (toolbar.parentElement !== surface.chat) surface.chat.prepend(toolbar)
    for (const handle of handles) if (handle.parentElement !== surface.chat) surface.chat.append(handle)
    if (edge.parentElement !== surface.chat) surface.chat.append(edge)
    syncComposer()
    const nextSession = surface.chat.querySelector('[data-conversation-session]')?.getAttribute('data-conversation-session')
    if (nextSession !== sessionId) { composing = false; sessionId = nextSession; approvalState = null; setMode(composer ? 'compact' : 'expanded', { force: true }) }
    syncApproval()
    syncActivity()
    const nextHeader = surface.chat.querySelector('[data-conversation-header-leading]')?.closest('header')
    if (nextHeader !== header) { header?.removeAttribute('data-dsh-floating-header'); header = nextHeader; header?.setAttribute('data-dsh-floating-header', '') }
    const currentTitle = doc.title.replace(/\s*[—–-]\s*DeepSeek Harness\s*$/, '') || '聊天'
    if (title.textContent !== currentTitle) title.textContent = currentTitle
    updateGeometry()
    syncIdle()
  }
  function schedule() {
    if (!disposed && raf === null) raf = win.requestAnimationFrame(sync)
  }
  const outsidePointer = event => {
    if (!surface || drag) return
    if (mode === 'compact' && editor()?.contains(event.target)) { setMode('expanded'); return }
    if (mode !== 'expanded' || approvalState || withinChat(event.target) || popupOpen()) return
    setMode('compact')
  }
  const focusChanged = event => {
    if (!surface) return
    if (mode === 'compact' && !returningFocus && editor()?.contains(event.target)) setMode('expanded')
    else updateGeometry()
  }
  const keydown = event => {
    if (!surface || event.key !== 'Escape' || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return
    if (drag) { event.preventDefault(); event.stopPropagation(); finishPointer(null, true); return }
    if (mode !== 'expanded' || approvalState || popupOpen() || !withinChat(event.target)) return
    event.preventDefault(); event.stopPropagation()
    setMode('compact', { focus: true })
  }
  const windowBlur = () => {
    if (drag) finishPointer(null, true)
    // Iframe clicks do not bubble into the parent document.
    if (surface && mode === 'expanded' && doc.activeElement?.tagName === 'IFRAME' && !withinChat(doc.activeElement) && !popupOpen()) setMode('compact')
  }
  const observer = new win.MutationObserver(records => {
    if (records.some(record => record.type === 'childList' || record.type === 'characterData' || !record.attributeName.startsWith('data-dsh-'))) schedule()
  })
  observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-rightbar-fullscreen', 'data-sidebar-right-panel', 'data-sidebar-right-open', 'data-conversation-session', 'data-approval-key', 'data-question-key', 'data-plan-review-key', 'hidden', 'data-sidebar-collapsed', 'aria-hidden', 'aria-expanded', 'inert', 'style', 'class'] })
  observer.observe(doc.head, { childList: true, subtree: true, characterData: true })
  win.addEventListener('resize', schedule)
  win.addEventListener('blur', windowBlur)
  win.visualViewport?.addEventListener('resize', schedule)
  win.visualViewport?.addEventListener('scroll', schedule)
  doc.addEventListener('pointerdown', outsidePointer, true)
  doc.addEventListener('focusin', focusChanged)
  doc.addEventListener('focusout', schedule)
  doc.addEventListener('input', inputChanged)
  for (const type of ['pointerdown', 'pointermove', 'keydown', 'wheel']) doc.addEventListener(type, userActivity, { capture: true, passive: true })
  for (const type of ['compositionstart', 'compositionend']) doc.addEventListener(type, compositionChanged)
  doc.addEventListener('keydown', keydown)
  const offActivity = activity?.subscribe(schedule)
  sync()
  const dispose = () => {
    if (disposed) return
    disposed = true
    observer.disconnect()
    offActivity?.()
    win.removeEventListener('resize', schedule)
    win.removeEventListener('blur', windowBlur)
    win.visualViewport?.removeEventListener('resize', schedule)
    win.visualViewport?.removeEventListener('scroll', schedule)
    doc.removeEventListener('pointerdown', outsidePointer, true)
    doc.removeEventListener('focusin', focusChanged)
    doc.removeEventListener('focusout', schedule)
    doc.removeEventListener('input', inputChanged)
    for (const type of ['pointerdown', 'pointermove', 'keydown', 'wheel']) doc.removeEventListener(type, userActivity, true)
    for (const type of ['compositionstart', 'compositionend']) doc.removeEventListener(type, compositionChanged)
    doc.removeEventListener('keydown', keydown)
    if (raf !== null) win.cancelAnimationFrame(raf)
    restore()
    sheet.remove()
    if (win[cleanupKey] === dispose) delete win[cleanupKey]
  }
  win[cleanupKey] = dispose
  return dispose
}

export const inject = ['sidebarRight', 'layout', 'sessions', 'uiSession']

/** Cordis owns cancellation and all DOM writes, including hot-reload cleanup. */
export function apply(ctx) {
  ctx.effect(() => {
    const lifetime = new AbortController()
    let cleanup = () => {}
    const activity = createActivitySource(ctx)
    void fetch('/dsh-full-view/api/config', { signal: lifetime.signal })
      .then(response => {
        if (!response.ok) throw new Error(`dsh-full-view config: HTTP ${response.status}`)
        return response.json()
      })
      .then(config => { if (!lifetime.signal.aborted) cleanup = installFullView(document, config, activity) })
      .catch(error => { if (!lifetime.signal.aborted) console.error('[dsh-full-view] 无法加载完整视图配置', error) })
    return () => { lifetime.abort(); cleanup(); activity.dispose() }
  }, 'dsh-full-view: resident chat presentation')
}
