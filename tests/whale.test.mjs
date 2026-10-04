import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { stillFrame, syncNativeWhale } from '../src/client/whale.js'

const signature = [137,80,78,71,13,10,26,10]
function chunk(type, data = []) {
  const buffer = Buffer.alloc(12 + data.length)
  buffer.writeUInt32BE(data.length); buffer.write(type,4); buffer.set(data,8)
  return [...buffer]
}
const bytes = Uint8Array.from([...signature,...chunk('IHDR',new Array(13).fill(0)),...chunk('acTL',[0,0,0,2]),...chunk('fcTL',[1]),...chunk('IDAT',[4,5,6]),...chunk('fcTL',[2]),...chunk('fdAT',[7,8]),...chunk('IEND')])
const motion = `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`

test('静止图保留宿主 PNG 第一帧，去掉后续 APNG 帧及动画控制块', () => {
  const expected = [...signature,...chunk('IHDR',new Array(13).fill(0)),...chunk('IDAT',[4,5,6]),...chunk('IEND')]
  assert.deepEqual(stillFrame(bytes), expected)
  assert.equal(stillFrame(bytes.slice(0,-1)), null)
  assert.equal(stillFrame(Uint8Array.from([0,1,2])), null)
})

test('鲸鱼图形直接引用宿主样式中的动画，换宿主资源时同步且不写入宿主', () => {
  const dom = new JSDOM('<head></head><body><button></button></body>')
  const {document} = dom.window
  const badge = document.querySelector('button')
  const style = document.createElement('style')
  style.setAttribute('data-plugin-css','@deepseek-ai/dsh-client-ui-chat/ChatView.module.css')
  style.textContent = `.hostIcon{mask:url(${motion}) 50%/100% 100% no-repeat alpha}`
  document.head.append(style)
  syncNativeWhale(document,badge)
  assert.equal(badge.style.getPropertyValue('--dsh-fv-whale-motion'), `url("${motion}")`)
  const still = badge.style.getPropertyValue('--dsh-fv-whale-still').match(/base64,([^" ]+)/)[1]
  assert.deepEqual([...Buffer.from(still,'base64')], stillFrame(bytes))
  assert.equal(style.textContent, `.hostIcon{mask:url(${motion}) 50%/100% 100% no-repeat alpha}`)
  style.remove(); syncNativeWhale(document,badge)
  assert.equal(badge.style.getPropertyValue('--dsh-fv-whale-motion'), `url("${motion}")`)
  dom.window.close()
})
