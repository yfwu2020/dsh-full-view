/** Read host-owned state and timed turn boundaries without retaining or changing a session. */
export function createActivitySource(ctx) {
  const sessions = ctx.get('sessions')
  const status = ctx.get('uiSession').sessionStatus
  let id = null
  let binding = null
  let offBinding = []
  const listeners = new Set()
  const notify = () => { for (const listener of listeners) listener() }
  const bind = () => {
    const next = id ? sessions.binding(id) : undefined
    if (next === binding) return
    for (const off of offBinding) off()
    binding = next
    offBinding = [binding?.session.subscribe(notify), binding?.eventSource.subscribe(notify)].filter(Boolean)
  }
  const offRoot = [sessions.list.subscribe(() => { bind(); notify() }), status.subscribe(notify)]
  return {
    setSession(next) { id = next; bind() },
    getSnapshot() {
      const state = status.getSnapshot().get(id)
      const running = state?.running ?? binding?.session.getSnapshot().running ?? false
      const pending = !!state?.pendingInteraction
      let end = null
      let start = null
      const entries = binding?.eventSource.getSnapshot().entries ?? []
      for (let i = entries.length - 1; i >= 0; i--) {
        const event = entries[i].event
        if (event.type === 'turn/end' && !end) end = event
        if (event.type === 'turn/start') { start = event; break }
      }
      // A completed previous turn must never become the clock for a queued next turn.
      const completed = start && end && end.data.turn === start.data.turn
      const startedAt = running && !completed && Number.isFinite(start?.time) ? start.time : null
      return { running, pending, startedAt }
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    dispose() {
      for (const off of [...offRoot, ...offBinding]) off()
      offBinding = []; listeners.clear(); binding = null
    },
  }
}

export function processingLabel(startedAt, now) {
  if (!Number.isFinite(startedAt)) return '处理中…'
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor(seconds / 60) % 60
  const rest = seconds % 60
  return `已处理 ${hours ? `${hours} 小时 ` : ''}${minutes ? `${minutes} 分 ` : ''}${rest} 秒`
}
