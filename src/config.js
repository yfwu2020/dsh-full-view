/** Defaults and validation shared by the host route and browser adapter. */
export const defaults = Object.freeze({ chatWidth: 400, chatHeight: 540, edgeGap: 20, rememberGeometry: true })

/** Resolve deployment configuration; invalid values stop the plugin at load. */
export function resolveConfig(input = {}) {
  const config = { ...defaults, ...input }
  for (const [key, min, max] of [['chatWidth', 280, 800], ['chatHeight', 240, 1000], ['edgeGap', 0, 64]]) {
    if (!Number.isFinite(config[key]) || config[key] < min || config[key] > max) throw new Error(`dsh-full-view: ${key} must be between ${min} and ${max}`)
  }
  if (typeof config.rememberGeometry !== 'boolean') throw new Error('dsh-full-view: rememberGeometry must be a boolean')
  return Object.fromEntries(Object.keys(defaults).map(key => [key, config[key]]))
}
