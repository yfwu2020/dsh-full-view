import { build } from 'esbuild'
import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
await mkdir(new URL('lib/', root), { recursive: true })
await copyFile(new URL('src/index.js', root), new URL('lib/index.js', root))
await copyFile(new URL('src/config.js', root), new URL('lib/config.js', root))
const result = await build({ entryPoints: [new URL('src/client/index.js', root).pathname], bundle: true, format: 'cjs', platform: 'browser', target: 'es2022', write: false })
const { name } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
await writeFile(new URL('lib/client.js', root), `window.__ModuleLoader__.load({id:${JSON.stringify(name)},factory:(require)=>{const module={exports:{}};const exports=module.exports;\n${result.outputFiles[0].text}\nreturn {apply:module.exports.apply,inject:module.exports.inject};}});\n`)
console.log('Built host and browser plugin entries')
