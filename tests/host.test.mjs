import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:http'
import { apply } from '../src/index.js'
import { resolveConfig } from '../src/config.js'

test('部署配置经过真实 HTTP 路由传到浏览器，卸载后路由移除', async () => {
  const routes = new Map()
  let dispose
  apply({
    get: () => ({ register(route) { routes.set(route.path, route.handler); return () => routes.delete(route.path) } }),
    effect(factory) { dispose = factory() },
  }, { chatWidth: 480, chatHeight: 600, edgeGap: 12, rememberGeometry: false, compactIdleSeconds: 45 })
  const server = createServer((req, res) => {
    const route = routes.get(req.url)
    if (route) route(req, res)
    else { res.writeHead(404); res.end() }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}/dsh-full-view/api/config`
  try {
    assert.deepEqual(await (await fetch(url)).json(), { chatWidth: 480, chatHeight: 600, edgeGap: 12, rememberGeometry: false, compactIdleSeconds: 45 })
    dispose()
    assert.equal((await fetch(url)).status, 404)
  } finally { await new Promise(resolve => server.close(resolve)) }
})

test('错误的部署尺寸和存储选项在插件载入时明确拒绝', () => {
  assert.throws(() => resolveConfig({ chatWidth: 20 }), /chatWidth/)
  assert.throws(() => resolveConfig({ chatHeight: Infinity }), /chatHeight/)
  assert.throws(() => resolveConfig({ edgeGap: -1 }), /edgeGap/)
  assert.throws(() => resolveConfig({ rememberGeometry: 'yes' }), /rememberGeometry/)
  assert.throws(() => resolveConfig({ compactIdleSeconds: -1 }), /compactIdleSeconds/)
  assert.throws(() => resolveConfig({ compactIdleSeconds: Infinity }), /compactIdleSeconds/)
  assert.equal(resolveConfig({ compactIdleSeconds: 0 }).compactIdleSeconds, 0)
})
