import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const config = runInNewContext(`${read('site-config.js')}\nsiteConfig`);
const html = read('becoming.html');
const seen = new Set();

function checkAsset(path) {
  const absolute = resolve(root, path.split(/[?#]/)[0]);
  assert(existsSync(absolute), `Missing asset: ${path}`);
  if (seen.has(absolute)) return;
  seen.add(absolute);
  const extension = extname(absolute);
  if (!['.js', '.css'].includes(extension)) return;
  const source = readFileSync(absolute, 'utf8');
  if (extension === '.js') {
    const result = spawnSync(process.execPath, ['--input-type=module', '--check'], {input:source, encoding:'utf8'});
    assert.equal(result.status, 0, `${path}: ${result.stderr}`);
  }
  // Follow local module imports, asset URLs and configuration paths.
  for (const match of source.matchAll(/['"](\.\/[^'"]+\.(?:js|css|json|ttf|png)(?:\?[^'"]*)?)['"]/g)) {
    checkAsset(resolve(dirname(absolute), match[1]));
  }
}

for (const match of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)) checkAsset(match[1]);
for (const path of Object.values(config.modules)) checkAsset(path);
for (const [key, page] of Object.entries(config.views)) {
  assert(html.includes(`id="nav-${key}"`), `Missing tab: ${key}`);
  assert(page.route.startsWith('/'), `Invalid route: ${key}`);
}
assert.equal(new Set(Object.values(config.views).map(page=>page.route)).size, Object.keys(config.views).length);
assert(html.indexOf('site-config.js') < html.indexOf('framework.js'), 'Config must load before framework');
for (const target of Object.values(config.aliases)) assert(config.views[target], 'Invalid route alias');

const styles = [...html.matchAll(/href="\.\/([^"?]+\.css)/g)].map(match=>match[1]);
assert(styles.indexOf('design-tokens.css') > styles.indexOf('terminal-theme.css'), 'Active tokens must override legacy theme');
assert.equal(styles.at(-1), 'ui-components.css', 'Shared component rules must load last');
for (const path of ['terminal-dashboard.css','identity-terminal.css','growth-roadmap.css','ui-components.css']) {
  const css = read(path).replace(/\/\*[\s\S]*?\*\//g, '');
  assert(!/#[0-9a-f]{3,8}\b/i.test(css), `Put palette values in design-tokens.css: ${path}`);
}

const {growthRoadmap} = await import(`data:text/javascript;base64,${Buffer.from(read('growth-roadmap.js')).toString('base64')}`);
const ids = new Set();
for (const column of growthRoadmap) {
  for (const card of column.cards) {
    for (const task of card.tasks) {
      assert(!ids.has(task.id), `Duplicate task: ${task.id}`);
      ids.add(task.id);
      if (task.status === 'done') assert.equal(task.progress, 100, task.id);
      else assert.equal(task.progress, undefined, `Unverified percentage: ${task.id}`);
      if (['if','reddot','muse','adesign','london','ny'].includes(task.logo)) checkAsset(`logo/${task.logo}.png`);
    }
  }
}
const awards = growthRoadmap.flatMap(column=>column.cards).find(card=>card.id==='awards');
const total = awards.tasks.filter(task=>task.status==='done').reduce((sum,task)=>sum+(task.awardCount||0),0);
assert(awards.desc.startsWith(`${total} international design awards`), 'Award summary does not match records');
console.log(`Site checks passed: ${seen.size} assets, ${ids.size} tasks, ${total} awards.`);
