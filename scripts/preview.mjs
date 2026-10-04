import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apply } from '../lib/index.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const routes = new Map()
const disposers = []
apply({ get: () => ({ register(route) { routes.set(route.path, route.handler); return () => routes.delete(route.path) } }), effect(factory) { disposers.push(factory()) } }, {})
const types = { '.html': 'text/html', '.js': 'text/javascript' }
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const route = routes.get(path)
  if (route) return route(req, res)
  const file = resolve(root, '.' + (path === '/' ? '/preview/index.html' : path))
  if (!file.startsWith(root) || !types[extname(file)]) { res.writeHead(404); res.end(); return }
  try { const data = await readFile(file); res.writeHead(200, { 'content-type': types[extname(file)] + '; charset=utf-8', 'cache-control': 'no-store' }); res.end(data) }
  catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); res.end('Preview file unavailable') }
})
server.listen(4198, '127.0.0.1', () => console.log('Plugin preview: http://127.0.0.1:4198'))
process.on('SIGTERM', () => { for (const dispose of disposers) dispose(); server.close() })
