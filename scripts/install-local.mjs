import { readFile, writeFile, mkdir, symlink, lstat, readlink, rename } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const name = '@yfwu2020/dsh-full-view'
const profile = process.argv[2] ?? 'desktop'
if (!/^[\w-]+$/.test(profile)) throw new Error('Invalid profile name')
const root = fileURLToPath(new URL('../', import.meta.url))
const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const dir = join(home, 'profiles', profile)
const manifestPath = join(dir, 'package.json')
const patchPath = join(dir, 'cordis.patch.yml')
const originalManifest = await readFile(manifestPath, 'utf8')
const originalPatch = await readFile(patchPath, 'utf8')
const manifest = JSON.parse(originalManifest)
const linkPath = join(dir, 'node_modules', '@yfwu2020', 'dsh-full-view')
let linkExists = false
try {
  const info = await lstat(linkPath)
  if (!info.isSymbolicLink() || resolve(linkPath, '..', await readlink(linkPath)) !== resolve(root)) throw new Error('A different installation already occupies ' + linkPath)
  linkExists = true
} catch (error) { if (error.code !== 'ENOENT') throw error }
if (manifest.dependencies?.[name] && manifest.dependencies[name] !== `link:${root.replace(/\/$/, '')}`) throw new Error('Profile already declares a different full-view plugin')
const marker = '# BEGIN dsh-full-view\n'
if (!originalPatch.includes(marker) && /(?:id:\s*full-view\b|name:\s*['"]?@yfwu2020\/dsh-full-view)/.test(originalPatch)) throw new Error('A full-view entry already exists outside this installer')
// Bundle selection is the manager's enable/disable authority. Migrate the old
// forced insert without overriding an existing installation's selected state.
const fresh = !manifest.dependencies?.[name] && !originalPatch.includes(marker)
const previous = manifest.dsh?.profile?.bundles ?? []
const bundles = fresh && !previous.includes(name) ? [...previous, name] : previous
manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles } }
const patch = originalPatch.replace(/\n?# BEGIN dsh-full-view\n[\s\S]*?# END dsh-full-view\n?/, '\n')
const backup = join(home, 'backups', 'full-view', String(Date.now()))
await mkdir(backup, { recursive: true })
await writeFile(join(backup, 'package.json'), originalManifest)
await writeFile(join(backup, 'cordis.patch.yml'), originalPatch)
await mkdir(join(dir, 'node_modules', '@yfwu2020'), { recursive: true })
if (!linkExists) await symlink(root, linkPath, 'dir')
manifest.dependencies ??= {}
manifest.dependencies[name] = `link:${root.replace(/\/$/, '')}`
if (await readFile(manifestPath, 'utf8') !== originalManifest || await readFile(patchPath, 'utf8') !== originalPatch) throw new Error('Profile changed during installation; rerun to preserve concurrent edits')
if (patch !== originalPatch) {
  await writeFile(patchPath + '.full-view.tmp', patch)
  await rename(patchPath + '.full-view.tmp', patchPath)
}
await writeFile(manifestPath + '.full-view.tmp', JSON.stringify(manifest, null, 2) + '\n')
await rename(manifestPath + '.full-view.tmp', manifestPath)
console.log(`Installed ${name} in ${profile}; enabled: ${bundles.includes(name)}; backup: ${backup}`)
