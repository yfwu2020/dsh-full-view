const clamp = value => Math.max(0, Math.min(1, value))
const ease = value => 1 - (1 - clamp(value)) ** 3
const mix = (from, to, progress) => from + (to - from) * progress

/** Animate an owned background shell, keeping the host chat's content at its original size. */
export function createWhaleMorph(win) {
  let active = null
  let raf = null
  const clearFrame = () => {
    if (raf !== null) win.cancelAnimationFrame(raf)
    raf = null
  }
  const cancel = () => {
    clearFrame()
    if (!active) return
    active.shell.remove()
    for (const node of [active.chat, active.badge]) node.removeAttribute('data-dsh-whale-morphing')
    for (const key of ['content-opacity', 'content-x', 'content-y', 'clip-right', 'clip-bottom', 'radius']) active.chat.style.removeProperty(`--dsh-morph-${key}`)
    for (const key of ['whale-opacity', 'whale-x', 'whale-y']) active.badge.style.removeProperty(`--dsh-morph-${key}`)
    active = null
  }
  const finish = () => {
    const onFinish = active?.onFinish
    cancel()
    onFinish?.()
  }
  const start = ({ frame, chat, badge, full, ball, hide, onFinish }) => {
    if (!win.matchMedia || win.matchMedia('(prefers-reduced-motion: reduce)').matches) { cancel(); return false }
    clearFrame()
    const previous = active
    const shell = previous?.shell ?? win.document.createElement('div')
    shell.setAttribute('data-dsh-whale-morph-shell', '')
    shell.setAttribute('aria-hidden', 'true')
    if (!previous) frame.append(shell)
    badge.style.setProperty('--dsh-morph-whale-x', `${ball.x - parseFloat(badge.style.left)}px`)
    badge.style.setProperty('--dsh-morph-whale-y', `${ball.y - parseFloat(badge.style.top)}px`)
    const from = previous?.box ?? (hide ? full : ball)
    const to = hide ? ball : full
    const initialContent = previous?.contentOpacity ?? (hide ? 1 : 0)
    const initialWhale = previous?.whaleOpacity ?? (hide ? 0 : 1)
    active = { shell, chat, badge, box: from, contentOpacity: initialContent, whaleOpacity: initialWhale, onFinish }
    chat.setAttribute('data-dsh-whale-morphing', '')
    badge.setAttribute('data-dsh-whale-morphing', '')
    const render = progress => {
      const geometry = ease(hide ? (progress - .07) / .93 : progress)
      const box = Object.fromEntries(['x', 'y', 'width', 'height', 'radius'].map(key => [key, mix(from[key], to[key], geometry)]))
      const contentOpacity = mix(initialContent, hide ? 0 : 1, ease(hide ? progress / .24 : (progress - .76) / .24))
      const whaleOpacity = mix(initialWhale, hide ? 1 : 0, ease(hide ? (progress - .65) / .35 : progress / .35))
      Object.assign(shell.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px`, borderRadius: `${box.radius}px` })
      chat.style.setProperty('--dsh-morph-content-opacity', String(contentOpacity))
      chat.style.setProperty('--dsh-morph-content-x', `${box.x - full.x}px`)
      chat.style.setProperty('--dsh-morph-content-y', `${box.y - full.y}px`)
      chat.style.setProperty('--dsh-morph-clip-right', `${Math.max(0, full.width - box.width)}px`)
      chat.style.setProperty('--dsh-morph-clip-bottom', `${Math.max(0, full.height - box.height)}px`)
      chat.style.setProperty('--dsh-morph-radius', `${box.radius}px`)
      badge.style.setProperty('--dsh-morph-whale-opacity', String(whaleOpacity))
      Object.assign(active, { box, contentOpacity, whaleOpacity })
    }
    render(0)
    let startedAt = null
    const tick = now => {
      if (!active) return
      if (startedAt === null) startedAt = now
      const progress = clamp((now - startedAt) / 440)
      render(progress)
      if (progress === 1) { finish(); return }
      raf = win.requestAnimationFrame(tick)
    }
    raf = win.requestAnimationFrame(tick)
    return true
  }
  return { start, cancel, finish, get running() { return !!active } }
}
