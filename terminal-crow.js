let assetPromise;

function loadFrames() {
  if (!assetPromise) {
    assetPromise = fetch(new URL('./terminal-crow-frames.json', import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error(`Crow assets: ${response.status}`);
        return response.json();
      }).catch(error => {
        assetPromise = null;
        throw error;
      });
  }
  return assetPromise;
}

const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const cellsMarkup = cells => cells.map(cell =>
  `<span style="left:${cell.c * 16}px;top:${cell.r * 16}px;color:${cell.color};${cell.fill ? `background:${cell.fill};` : ''}">${escape(cell.glyph)}</span>`
).join('');

function frameMarkup(frame) {
  if (frame.renderCells) return cellsMarkup(frame.renderCells);
  if (frame.layers) return frame.layers.map(layer =>
    `<div class="crow-layer" style="transform:matrix(${layer.matrix.join(',')})">${cellsMarkup(layer.cells)}</div>`
  ).join('');
  return `<div class="crow-layer" style="transform:rotate(${frame.angle || 0}deg);transform-origin:780px 544px">${cellsMarkup(frame.cells)}</div>`;
}

// Reuse existing poses on a 30-second / 720-tick timeline. No new morphs.
function timeline(frames) {
  const groups = ['cruise', 'glide', 'fast', 'bank', 'tuck', 'cruise'];
  return groups.flatMap(group => {
    const poses = frames.filter(frame => frame.group === group);
    return Array.from({length: 120}, (_, tick) => {
      const index = group === 'cruise' || group === 'fast'
        ? tick % poses.length
        : Math.min(poses.length - 1, Math.floor(tick * poses.length / 120));
      return poses[index];
    });
  });
}

export async function createCrow(host, {paused = false, isCurrent = () => true} = {}) {
  const [data] = await Promise.all([
    loadFrames(),
    document.fonts.load('600 14px TerminalCrow')
  ]);
  // A cancelled login or tab request must not touch a newer scene.
  if (!isCurrent()) return null;
  let destroyed = false, request = 0, elapsed = 0, lastTime = null, current = -1;
  const sequence = timeline(data.frames);
  const cache = new Map();
  host.replaceChildren();
  host.classList.add('terminal-crow-scene');
  const forest = document.createElement('div');
  forest.className = 'crow-forest';
  forest.setAttribute('aria-hidden', 'true');
  const treeLayers = [0, 1, 2].map(depth => {
    const layer = document.createElement('div');
    layer.className = `crow-tree-layer depth-${depth}`;
    const rows = Array.from({length: 22}, (_, row) =>
      Array.from({length: 100}, (_, col) => {
        const tree = (col + depth * 7) % 24;
        const crown = row > 3 + depth && row < 16 && Math.abs(tree - 12) < Math.min(8, row / 2);
        return tree === 12 && row > 8 ? '木' : crown ? (row + col) % 3 === 0 ? '枝' : '林' : '　';
      }).join('')
    ).join('\n');
    layer.textContent = rows + '\n';
    forest.append(layer);
    return layer;
  });
  const floating = document.createElement('div');
  floating.className = 'crow-floating';
  const viewport = document.createElement('div');
  viewport.className = 'crow-viewport';
  const bird = document.createElement('div');
  bird.className = 'crow-glyph-frame';
  bird.setAttribute('aria-hidden', 'true');
  viewport.append(bird);
  floating.append(viewport);
  host.append(forest, floating);
  const observer = new ResizeObserver(() => {
    const size = Math.min(host.clientWidth, host.clientHeight, 620);
    viewport.style.width = `${size}px`;
    bird.style.transform = `scale(${size / 1024})`;
  });
  observer.observe(host);

  function paint() {
    const tick = Math.floor(elapsed * 24) % 720;
    const frame = sequence[tick];
    if (current !== frame.number) {
      if (!cache.has(frame.number)) cache.set(frame.number, frameMarkup(frame));
      bird.innerHTML = cache.get(frame.number);
      current = frame.number;
      host.dataset.frame = String(frame.number);
      host.dataset.action = frame.group;
    }
    host.dataset.tick = String(tick);
    floating.style.transform = `translateY(${Math.sin(elapsed * 1.7) * 5}px)`;
    treeLayers.forEach((layer, depth) => {
      layer.style.transform = `translateX(${-elapsed * (8 + depth * 10) % 336}px)`;
    });
  }
  function run(time) {
    request = 0;
    if (destroyed || paused || document.hidden) return;
    if (lastTime !== null) elapsed += Math.min((time - lastTime) / 1000, .1);
    lastTime = time;
    paint();
    request = requestAnimationFrame(run);
  }
  function sync() {
    cancelAnimationFrame(request);
    request = 0;
    lastTime = null;
    if (!destroyed && !paused && !document.hidden) request = requestAnimationFrame(run);
  }
  document.addEventListener('visibilitychange', sync);
  paint();
  sync();
  return {
    setPaused(value) { paused = Boolean(value); sync(); },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(request);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      forest.remove();
      floating.remove();
    }
  };
}
