import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createActivitySource, processingLabel } from '../src/client/activity.js'

function store(value) {
  const listeners = new Set()
  return { getSnapshot: () => value, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }, set(next) { value = next; for (const fn of listeners) fn() }, get subscribers() { return listeners.size } }
}
const entry = (type, time, turn) => ({ event: { type, time, data: { turn } } })

test('借用宿主状态和回合时间，旧回合、子会话与待办不会产生错误耗时', () => {
  const status = store(new Map([['s1', { running: true }], ['s2', { running: false }]]))
  const feed = store({ entries: [entry('turn/start', 1000, 1), entry('turn/end', 5000, 1)] })
  const session = store({ running: true })
  const list = store({})
  const bindings = new Map([['s1', { session, eventSource: feed }]])
  const ctx = { get(name) { return name === 'sessions' ? { list, binding: id => bindings.get(id) } : { sessionStatus: status } } }
  const source = createActivitySource(ctx)
  let updates = 0
  const off = source.subscribe(() => updates++)
  source.setSession('s1')
  assert.deepEqual(source.getSnapshot(), { running: true, pending: false, pendingKind: null, completed: false, completionId: '[1,5000]', completionUnread: false, startedAt: null })
  feed.set({ entries: [...feed.getSnapshot().entries, entry('turn/start', 6000, 2)] })
  assert.equal(source.getSnapshot().startedAt, 6000)
  assert.equal(updates, 1)
  status.set(new Map([['s1', { running: true, pendingInteraction: { kind: 'approval' } }]]))
  assert.equal(source.getSnapshot().pending, true)
  source.setSession('s2')
  assert.equal(source.getSnapshot().running, false)
  assert.equal(source.getSnapshot().startedAt, null)
  assert.equal(feed.subscribers, 0); assert.equal(session.subscribers, 0)
  source.setSession('s1')
  const nextFeed = store({ entries: [entry('turn/start', 9000, 3)] })
  bindings.set('s1', { session, eventSource: nextFeed }); list.set({})
  assert.equal(source.getSnapshot().startedAt, 9000)
  assert.equal(feed.subscribers, 0)
  source.dispose(); off()
  for (const s of [list, status, feed, nextFeed, session]) assert.equal(s.subscribers, 0)
})

test('处理耗时取回合真实时间，未知时间不编造秒数', () => {
  assert.equal(processingLabel(null, 65000), '处理中…')
  assert.equal(processingLabel(1000, 66000), '已处理 1 分 5 秒')
  assert.equal(processingLabel(1000, 3666000), '已处理 1 小时 1 分 5 秒')
  assert.equal(processingLabel(70000, 66000), '已处理 0 秒')
})


test('已读的当前会话也区分完成与空闲，新的运行及会话切换不会继承完成状态', () => {
  const feed = store({ entries: [entry('turn/start', 1000, 1), entry('turn/end', 5000, 1)] })
  const session = store({ running: false }), list = store({})
  const status = store(new Map([['s1', { running: false, completionUnread: false }]]))
  const source = createActivitySource({ get(name) { return name === 'sessions' ? { list, binding: id => id === 's1' ? { session, eventSource: feed } : undefined } : { sessionStatus: status } } })
  try {
    source.setSession('s1'); assert.equal(source.getSnapshot().completed, true)
    status.set(new Map([['s1', { running: true, completionUnread: true }]]))
    assert.equal(source.getSnapshot().completed, false, '下一回合开始前旧结束事件不能显示完成')
    status.set(new Map([['s1', { running: true, pendingInteraction: { kind: 'question' } }]]))
    assert.equal(source.getSnapshot().pendingKind, 'question')
    source.setSession('s2'); assert.equal(source.getSnapshot().completed, false)
    assert.equal(source.getSnapshot().pendingKind, null)
  } finally { source.dispose() }
})


test('完成回合有稳定身份，下一次完成换身份，并保留宿主的未读标记', () => {
  const feed = store({ entries: [entry('turn/start', 1000, 1), entry('turn/end', 5000, 1)] })
  const session = store({ running: false }), list = store({})
  const status = store(new Map([['s1', { running: false, completionUnread: true }]]))
  const source = createActivitySource({ get(name) { return name === 'sessions' ? { list, binding: () => ({ session, eventSource: feed }) } : { sessionStatus: status } } })
  try {
    source.setSession('s1')
    const previous = source.getSnapshot().completionId
    assert.ok(previous)
    assert.equal(source.getSnapshot().completionId, previous)
    assert.equal(source.getSnapshot().completionUnread, true)
    feed.set({ entries: [...feed.getSnapshot().entries, entry('turn/start', 6000, 2)] })
    assert.equal(source.getSnapshot().completionId, null, '没有匹配结束事件时不沿用旧回合身份')
    feed.set({ entries: [...feed.getSnapshot().entries, entry('turn/end', 9000, 2)] })
    assert.notEqual(source.getSnapshot().completionId, previous)
  } finally { source.dispose() }
})
