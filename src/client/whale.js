const hostSheet = 'style[data-plugin-css="@deepseek-ai/dsh-client-ui-chat/ChatView.module.css"]'

/** Remove animation-only PNG chunks; keep the host image's first frame and original CRCs. */
export function stillFrame(bytes) {
  if (![137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)) return null
  const chunks = [bytes.slice(0, 8)]
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const size = view.getUint32(offset)
    if (size > bytes.length - offset - 12) return null
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8))
    if (!['acTL', 'fcTL', 'fdAT'].includes(type)) chunks.push(bytes.slice(offset, offset + size + 12))
    offset += size + 12
    if (type === 'IEND') return chunks.reduce((all, chunk) => [...all, ...chunk], [])
  }
  return null
}

/** Reuse the installed Harness animation asset. No brand image is bundled in this plugin. */
export function syncNativeWhale(doc, badge) {
  const motion = doc.querySelector(hostSheet)?.textContent.match(/mask:\s*url\((data:image\/png;base64,[A-Za-z0-9+/=]+)\)/)?.[1]
  if (!motion || badge.style.getPropertyValue('--dsh-fv-whale-motion') === `url("${motion}")`) return
  const win = doc.defaultView
  const bytes = Uint8Array.from(win.atob(motion.split(',')[1]), char => char.charCodeAt(0))
  const still = stillFrame(bytes)
  if (!still) return
  const image = `data:image/png;base64,${win.btoa(String.fromCharCode(...still))}`
  badge.style.setProperty('--dsh-fv-whale-motion', `url("${motion}")`)
  badge.style.setProperty('--dsh-fv-whale-still', `url("${image}")`)
}
