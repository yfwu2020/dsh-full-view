import { readFile, writeFile, lstat, readlink, unlink, rename } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const name = '@yfwu2020/dsh-full-view'
const profile = process.argv[2] ?? 'desktop'
if (!/^[\w-]+$/.test(profile)) throw new Error('Invalid profile name')
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '')
const dir = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'profiles', profile)
const manifestPath = join(dir, 'package.json')
const patchPath = join(dir, 'cordis.patch.yml')
const originalManifest = await readFile(manifestPath, 'utf8')
const originalPatch = await readFile(patchPath, 'utf8')
const manifest = JSON.parse(originalManifest)
const owned = manifest.dependencies?.[name] === `link:${root}`
if (owned) {
  delete manifest.dependencies[name]
  if (manifest.dsh?.profile?.bundles) manifest.dsh.profile.bundles = manifest.dsh.profile.bundles.filter(item => item !== name)
}
const patch = originalPatch.replace(/\n?# BEGIN dsh-full-view\n[\s\S]*?# END dsh-full-view\n?/, '\n')
if (await readFile(manifestPath, 'utf8') !== originalManifest || await readFile(patchPath, 'utf8') !== originalPatch) throw new Error('Profile changed during removal; rerun')
if (patch !== originalPatch) {
  await writeFile(patchPath + '.full-view.tmp', patch)
  await rename(patchPath + '.full-view.tmp', patchPath)
}
if (owned) {
  await writeFile(manifestPath + '.full-view.tmp', JSON.stringify(manifest, null, 2) + '\n')
  await rename(manifestPath + '.full-view.tmp', manifestPath)
  const link = join(dir, 'node_modules', '@yfwu2020', 'dsh-full-view')
  try {
    if ((await lstat(link)).isSymbolicLink() && resolve(link, '..', await readlink(link)) === resolve(root)) await unlink(link)
  } catch (error) { if (error.code !== 'ENOENT') throw error }
}
console.log(`Removed local ${name} entries from ${profile}; other profile settings were retained`)
