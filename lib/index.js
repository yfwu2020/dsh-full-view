import { resolveConfig } from './config.js'

export const name = '@yfwu2020/dsh-full-view'
export const inject = ['webServer']

/** Expose layout configuration without reading or writing any conversation data. */
export function apply(ctx, input) {
  const config = resolveConfig(input)
  const server = ctx.get('webServer')
  ctx.effect(() => server.register({
    kind: 'exact',
    path: '/dsh-full-view/api/config',
    handler(_req, res) {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify(config))
    },
  }), 'dsh-full-view: configuration route')
}
