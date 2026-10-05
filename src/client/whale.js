/*! Original static whale path: DeepSeek Harness RunningWhaleTail, ui-chat 0.2.0-rc.2.
MIT License

Copyright (c) 2026 DeepSeek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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

// The host's vector fallback keeps the same silhouette at any display density.
const nativeStill = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\"><path d=\"M8.844 13.742C8.967 12.328 8.45 10.4 8.45 9.65C8.45 8.94 8.88 8.43 9.6 8.43C11.285 8.43 12.106 8.281 12.685 8.104C13.71 7.791 14.585 6.768 15.055 5.945C15.137 5.803 14.99 5.641 14.829 5.671C13.829 5.86 12.828 5.376 11.827 4.978C10.659 4.514 9.491 4.707 8.935 4.876C8.805 4.915 8.658 4.819 8.636 4.686C8.468 3.643 7.405 2.615 5.498 2.238C4.54 2.048 3.748 1.574 3.347 1.202C3.252 1.113 3.088 1.125 3.03 1.242C2.628 2.059 2.168 3.82 5.248 6.115C5.82 6.494 6.31 6.785 6.574 7.637C6.72 8.104 6.157 9.168 6.061 9.368C5.157 11.27 5.089 12.19 4.926 13.742\" stroke=\"currentColor\" stroke-width=\"1\"/></svg>")}")`

/** Preserve the host's animated APNG; use its original SVG for a crisp resting icon. */
export function syncNativeWhale(doc, badge) {
  if (badge.style.getPropertyValue('--dsh-fv-whale-still') !== nativeStill) badge.style.setProperty('--dsh-fv-whale-still', nativeStill)
  const motion = doc.querySelector(hostSheet)?.textContent.match(/mask:\s*url\((data:image\/png;base64,[A-Za-z0-9+/=]+)\)/)?.[1]
  if (motion && badge.style.getPropertyValue('--dsh-fv-whale-motion') !== `url("${motion}")`) badge.style.setProperty('--dsh-fv-whale-motion', `url("${motion}")`)
}
