import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const name = '@yfwu2020/dsh-full-view'
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '')
const untouched = '- set: another-plugin\n  config:\n    enabled: true\n'
const legacy = "# BEGIN dsh-full-view\n- insert:\n    - id: full-view\n      name: '@yfwu2020/dsh-full-view'\n# END dsh-full-view\n"

async function fixture(t, installed = false, patch = untouched) {
  const home = await mkdtemp(join(tmpdir(), 'dsh-full-view-install-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const dir = join(home, 'profiles', 'desktop')
  await mkdir(dir, { recursive: true })
  const manifest = { dependencies: { other: '1.0.0', ...(installed ? { [name]: `link:${root}` } : {}) }, dsh: { profile: { bundles: ['other'], extra: 'keep' } } }
  await writeFile(join(dir, 'package.json'), JSON.stringify(manifest))
  await writeFile(join(dir, 'cordis.patch.yml'), patch)
  return {
    dir,
    run(script) { execFileSync(process.execPath, [join(root, 'scripts', script), 'desktop'], { env: { ...process.env, DSH_HOME: home } }) },
    async manifest() { return JSON.parse(await readFile(join(dir, 'package.json'), 'utf8')) },
    patch() { return readFile(join(dir, 'cordis.patch.yml'), 'utf8') },
  }
}

test('fresh local installation uses the manager bundle selection, with no forced insert', async t => {
  const f = await fixture(t)
  f.run('install-local.mjs')
  let m = await f.manifest()
  assert.deepEqual(m.dsh.profile.bundles, ['other', name])
  assert.equal(await f.patch(), untouched)
  assert.equal(m.dsh.profile.extra, 'keep')
  // A user turns the plugin off in the manager; reinstall must respect that choice.
  m.dsh.profile.bundles = ['other']
  await writeFile(join(f.dir, 'package.json'), JSON.stringify(m))
  f.run('install-local.mjs')
  assert.deepEqual((await f.manifest()).dsh.profile.bundles, ['other'])
})

test('legacy migration removes forced loading while preserving the displayed off state', async t => {
  const f = await fixture(t, true, untouched + '\n' + legacy)
  f.run('install-local.mjs')
  assert.deepEqual((await f.manifest()).dsh.profile.bundles, ['other'])
  assert.equal((await f.patch()).trim(), untouched.trim())
})

test('removal clears the selected bundle and dependency while retaining other settings', async t => {
  const f = await fixture(t)
  f.run('install-local.mjs')
  f.run('uninstall-local.mjs')
  const m = await f.manifest()
  assert.deepEqual(m.dsh.profile.bundles, ['other'])
  assert.equal(m.dependencies[name], undefined)
  assert.equal(m.dependencies.other, '1.0.0')
  assert.equal(m.dsh.profile.extra, 'keep')
  assert.equal(await f.patch(), untouched)
})
