import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('../scripts/check-release.mjs', import.meta.url));

function check(tag, { version = '0.2.0', lockVersion = version, rootVersion = version, name = '@yfwu2020/dsh-full-view' } = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'dsh-release-'));
  try {
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name, version }));
    writeFileSync(join(cwd, 'package-lock.json'), JSON.stringify({ name, version: lockVersion, packages: { '': { name, version: rootVersion } } }));
    return spawnSync(process.execPath, [script, ...(tag ? [tag] : [])], { cwd, encoding: 'utf8' });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

test('accepts a stable tag matching both manifests', () => {
  const result = check('v0.2.0');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), '0.2.0');
});

test('rejects a release tag that differs from the package', () => {
  const result = check('v0.2.1');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /tag.*package version/i);
});

test('rejects prereleases, missing tags and malformed versions', () => {
  for (const tag of ['v0.2.0-beta.1', '0.2.0', 'v00.2.0', undefined]) {
    const result = check(tag);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /stable.*vX\.Y\.Z/i);
  }
});

test('rejects either lockfile version being out of sync', () => {
  for (const fixture of [{ lockVersion: '0.1.9' }, { rootVersion: '0.1.9' }]) {
    const result = check('v0.2.0', fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /lockfile.*package version/i);
  }
});

test('rejects a package with the wrong name', () => {
  const result = check('v0.2.0', { name: '@someone/another-plugin' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /package name/i);
});
