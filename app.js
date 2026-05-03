/* ══════════════════════════════════════════════════════
   BATTLE OPTIMIZER — TACTICAL RPG
   app.js
   ══════════════════════════════════════════════════════ */

"use strict";

// ── STATE ──────────────────────────────────────────────
const STATE = {
  troops: 100,
  enemies: [],
  nextEnemyId: 1,
  simRunning: false,
  sessionStats: { battles: 0, wins: 0, totalTroopsLost: 0, bestEfficiency: 0 },
  algoDP: true,
  algoGreedy: true,
  hudHP: 100,
  hudMP: 75,
  hudXP: 40,
  score: 0,
  simIdCounter: 0,
};

// ── SPRITE DATA ────────────────────────────────────────
const SPRITES = {
  commander: (ctx, w, h) => {
    // Pixel art commander sprite
    const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * 4, y * 4, 4, 4); };
    // Helmet
    px(2, 0, '#4caf50'); px(3, 0, '#4caf50'); px(4, 0, '#4caf50'); px(5, 0, '#4caf50');
    px(1, 1, '#388e3c'); px(2, 1, '#66bb6a'); px(3, 1, '#66bb6a'); px(4, 1, '#66bb6a'); px(5, 1, '#388e3c'); px(6, 1, '#388e3c');
    // Face
    px(2, 2, '#ffcc80'); px(3, 2, '#ffcc80'); px(4, 2, '#ffcc80'); px(5, 2, '#ffcc80');
    px(2, 3, '#ffb74d'); px(3, 3, '#222'); px(4, 3, '#ffb74d'); px(5, 3, '#222');
    px(2, 4, '#ffcc80'); px(3, 4, '#ffcc80'); px(4, 4, '#ffcc80'); px(5, 4, '#ffcc80');
    // Body / armor
    px(1, 5, '#1565c0'); px(2, 5, '#1976d2'); px(3, 5, '#1976d2'); px(4, 5, '#1976d2'); px(5, 5, '#1976d2'); px(6, 5, '#1565c0');
    px(1, 6, '#1565c0'); px(2, 6, '#0d47a1'); px(3, 6, '#ffd600'); px(4, 6, '#0d47a1'); px(5, 6, '#1565c0'); px(6, 6, '#1565c0');
    px(1, 7, '#1565c0'); px(2, 7, '#1976d2'); px(3, 7, '#1976d2'); px(4, 7, '#1976d2'); px(5, 7, '#1976d2'); px(6, 7, '#1565c0');
    // Legs
    px(2, 8, '#263238'); px(3, 8, '#263238'); px(4, 8, '#37474f'); px(5, 8, '#37474f');
    px(2, 9, '#263238'); px(5, 9, '#263238');
    // Boots
    px(2, 10, '#212121'); px(3, 10, '#212121'); px(4, 10, '#212121'); px(5, 10, '#212121');
    // Sword
    px(7, 3, '#bdbdbd'); px(7, 4, '#bdbdbd'); px(7, 5, '#bdbdbd'); px(7, 6, '#ffd600'); px(7, 7, '#795548');
  },

  ally: (ctx, scale = 2) => {
    const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * scale, y * scale, scale, scale); };
    px(2,0,'#4caf50'); px(3,0,'#4caf50');
    px(1,1,'#66bb6a'); px(2,1,'#e0e0e0'); px(3,1,'#e0e0e0'); px(4,1,'#66bb6a');
    px(2,2,'#ffb74d'); px(3,2,'#ffb74d');
    px(1,3,'#1976d2'); px(2,3,'#1976d2'); px(3,3,'#1976d2'); px(4,3,'#1976d2');
    px(2,4,'#263238'); px(3,4,'#263238');
    px(2,5,'#212121'); px(3,5,'#212121');
  },

  enemy: (ctx, scale = 2) => {
    const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * scale, y * scale, scale, scale); };
    px(2,0,'#b71c1c'); px(3,0,'#b71c1c'); px(4,0,'#b71c1c');
    px(1,1,'#c62828'); px(2,1,'#424242'); px(3,1,'#424242'); px(4,1,'#424242'); px(5,1,'#c62828');
    px(2,2,'#ffb74d'); px(3,2,'#ffb74d'); px(4,2,'#ffb74d');
    px(1,2,'#b71c1c');
    px(2,3,'#c62828'); px(3,3,'#c62828'); px(4,3,'#c62828');
    px(1,3,'#b71c1c'); px(5,3,'#b71c1c');
    px(2,4,'#37474f'); px(3,4,'#37474f'); px(4,4,'#37474f');
    px(2,5,'#212121'); px(4,5,'#212121');
  },

  bigAlly: (ctx, scale = 3) => SPRITES.ally(ctx, scale),
  bigEnemy: (ctx, scale = 3) => SPRITES.enemy(ctx, scale),
};

// ── DOM HELPERS ────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = (tag, cls, html = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildStarField();
  drawCommanderSprite();
  drawArenaSprites();
  initEnemyList();
  bindControls();
  startHUDPulse();
  addLog('sys', 'Battle Optimizer v2.4 initialized');
  addLog('sys', 'All systems nominal. Awaiting orders...');
  addLog('sys', 'Load enemy roster and set troop count to begin.');
  renderSessionStrip();
});

// ── STAR FIELD ─────────────────────────────────────────
function buildStarField() {
  const field = $('starField');
  if (!field) return;
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'px-star';
    const sz = Math.random() < 0.7 ? 1 : 2;
    s.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      --lo:${(Math.random() * 0.4 + 0.2).toFixed(2)};
      --d:${(Math.random() * 3 + 1.5).toFixed(1)}s;
      --delay:-${(Math.random() * 3).toFixed(1)}s;
    `;
    field.appendChild(s);
  }
}

// ── SPRITES ────────────────────────────────────────────
function drawCommanderSprite() {
  const c = $('commanderCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  SPRITES.commander(ctx, c.width, c.height);
}

function drawArenaSprites() {
  ['allyCanvas', 'enemyCanvas'].forEach(id => {
    const c = $(id);
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    if (id === 'allyCanvas') SPRITES.bigAlly(ctx, 4);
    else SPRITES.bigEnemy(ctx, 4);
  });
}

function drawMiniEnemySprite(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  SPRITES.enemy(ctx, 3);
}

// ── ENEMY LIST ─────────────────────────────────────────
function initEnemyList() {
  // Default enemies
  [
    { name: 'GOBLIN SCOUT', hp: 40, atk: 8 },
    { name: 'ORC WARRIOR', hp: 80, atk: 15 },
    { name: 'DARK ARCHER', hp: 55, atk: 22 },
  ].forEach(e => addEnemy(e));
}

function addEnemy({ name = 'UNKNOWN ENEMY', hp = 50, atk = 10 } = {}) {
  const id = STATE.nextEnemyId++;
  const enemy = { id, name, hp, atk };
  STATE.enemies.push(enemy);
  renderEnemyCard(enemy);
  updateEnemyCount();
  return enemy;
}

function renderEnemyCard(enemy) {
  const list = $('enemyList');
  if (!list) return;

  const noMsg = list.querySelector('.no-enemy-msg');
  if (noMsg) noMsg.remove();

  const card = el('div', 'enemy-card');
  card.dataset.id = enemy.id;
  card.innerHTML = `
    <div class="enemy-card-header">
      <canvas class="enemy-mini-sprite" width="24" height="28"></canvas>
      <span class="enemy-num-badge">E${String(enemy.id).padStart(3,'0')}</span>
      <input class="enemy-name-input" value="${enemy.name}" maxlength="20" spellcheck="false">
      <button class="enemy-del-btn" title="Remove">✕</button>
    </div>
    <div class="enemy-stats-row">
      <div class="enemy-stat-field">
        <span class="enemy-stat-lbl">HP</span>
        <input class="enemy-stat-input" type="number" min="1" max="9999" value="${enemy.hp}">
      </div>
      <div class="enemy-stat-field">
        <span class="enemy-stat-lbl">ATK</span>
        <input class="enemy-stat-input" type="number" min="1" max="9999" value="${enemy.atk}">
      </div>
    </div>
    <div class="enemy-ratio">
      <span class="enemy-ratio-lbl">EFFICIENCY RATIO</span>
      <span class="enemy-ratio-val">${(enemy.atk / enemy.hp).toFixed(3)}</span>
    </div>
    <div class="enemy-hp-bar-wrap">
      <div class="enemy-hp-display"><div class="enemy-hp-display-fill" style="width:${Math.min(100, enemy.hp / 2)}%"></div></div>
    </div>
  `;

  // Draw mini sprite
  drawMiniEnemySprite(card.querySelector('.enemy-mini-sprite'));

  // Bind inputs
  const nameIn = card.querySelector('.enemy-name-input');
  const hpIn = card.querySelectorAll('.enemy-stat-input')[0];
  const atkIn = card.querySelectorAll('.enemy-stat-input')[1];
  const ratioVal = card.querySelector('.enemy-ratio-val');
  const hpFill = card.querySelector('.enemy-hp-display-fill');

  const refresh = () => {
    const e = STATE.enemies.find(x => x.id === enemy.id);
    if (!e) return;
    e.name = nameIn.value;
    e.hp = Math.max(1, parseInt(hpIn.value) || 1);
    e.atk = Math.max(1, parseInt(atkIn.value) || 1);
    ratioVal.textContent = (e.atk / e.hp).toFixed(3);
    hpFill.style.width = `${Math.min(100, e.hp / 2)}%`;
  };

  nameIn.addEventListener('input', refresh);
  hpIn.addEventListener('input', refresh);
  atkIn.addEventListener('input', refresh);

  card.querySelector('.enemy-del-btn').addEventListener('click', () => {
    STATE.enemies = STATE.enemies.filter(x => x.id !== enemy.id);
    card.style.animation = 'none';
    card.style.transform = 'translateX(20px)';
    card.style.opacity = '0';
    card.style.transition = 'all .2s';
    setTimeout(() => { card.remove(); updateEnemyCount(); checkNoEnemies(); }, 200);
    addLog('sys', `Enemy E${String(enemy.id).padStart(3,'0')} removed from roster.`);
  });

  list.appendChild(card);
}

function checkNoEnemies() {
  const list = $('enemyList');
  if (!list) return;
  if (STATE.enemies.length === 0) {
    const msg = el('div', 'no-enemy-msg', '[ NO ENEMIES LOADED ]<br>ADD ENEMIES TO BEGIN<br>TACTICAL ANALYSIS');
    list.appendChild(msg);
  }
}

function updateEnemyCount() {
  const badge = $('enemyCountBadge');
  if (badge) badge.textContent = `${STATE.enemies.length} UNITS`;
}

// ── CONTROLS ───────────────────────────────────────────
function bindControls() {
  const troopInput = $('troopCount');
  if (troopInput) {
    troopInput.addEventListener('input', () => {
      STATE.troops = Math.max(1, parseInt(troopInput.value) || 1);
      updateFormation();
    });
    troopInput.addEventListener('change', () => {
      STATE.troops = Math.max(1, parseInt(troopInput.value) || 1);
      troopInput.value = STATE.troops;
    });
  }

  $('addEnemyBtn')?.addEventListener('click', () => {
    addEnemy();
    addLog('sys', `New enemy unit added. Total: ${STATE.enemies.length}`);
  });

  $('resetBtn')?.addEventListener('click', resetAll);
  $('runSimBtn')?.addEventListener('click', runSimulation);
  $('clearLogBtn')?.addEventListener('click', () => {
    const body = $('logBody');
    if (body) body.innerHTML = '';
    addLog('sys', 'Log cleared.');
  });

  $('algoDP')?.addEventListener('click', e => {
    STATE.algoDP = !STATE.algoDP;
    e.target.classList.toggle('on', STATE.algoDP);
    addLog('sys', `DP algorithm ${STATE.algoDP ? 'ENABLED' : 'DISABLED'}`);
  });

  $('algoGreedy')?.addEventListener('click', e => {
    STATE.algoGreedy = !STATE.algoGreedy;
    e.target.classList.toggle('on', STATE.algoGreedy);
    addLog('sys', `Greedy algorithm ${STATE.algoGreedy ? 'ENABLED' : 'DISABLED'}`);
  });

  $('victoryClose')?.addEventListener('click', () => {
    $('victoryOverlay')?.classList.remove('show');
  });

  updateFormation();
}

// ── FORMATION ──────────────────────────────────────────
function updateFormation() {
  const grid = $('formationGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const count = Math.min(STATE.troops, 200);
  for (let i = 0; i < count; i++) {
    const c = document.createElement('canvas');
    c.className = 'troop-pixel';
    c.width = 10; c.height = 14;
    c.style.setProperty('--d', `${(Math.random() * 1.5 + 0.5).toFixed(2)}s`);
    const ctx = c.getContext('2d');
    SPRITES.ally(ctx, 2);
    grid.appendChild(c);
  }
}

// ── LOGGING ────────────────────────────────────────────
function addLog(type, msg) {
  const body = $('logBody');
  if (!body) return;
  const line = el('div', `log-line log-${type}`, msg);
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

// ── ALGORITHMS ────────────────────────────────────────
function greedyOptimize(troops, enemies) {
  // Sort by ATK/HP ratio descending — highest value targets first
  const sorted = [...enemies].sort((a, b) => (b.atk / b.hp) - (a.atk / a.hp));
  let troopsLeft = troops;
  let totalDamageNeutralized = 0;
  const taken = [];
  const skipped = [];

  for (const e of sorted) {
    const cost = Math.ceil(e.hp / 10); // troops needed to defeat
    if (troopsLeft >= cost) {
      troopsLeft -= cost;
      totalDamageNeutralized += e.atk;
      taken.push({ ...e, cost, ratio: (e.atk / e.hp).toFixed(3) });
    } else {
      skipped.push({ ...e, cost, ratio: (e.atk / e.hp).toFixed(3) });
    }
  }

  return {
    algo: 'GREEDY',
    troopsUsed: troops - troopsLeft,
    troopsRemaining: troopsLeft,
    damageNeutralized: totalDamageNeutralized,
    efficiency: troops > 0 ? ((totalDamageNeutralized / troops) * 100).toFixed(1) : 0,
    taken,
    skipped,
  };
}

function dpOptimize(troops, enemies) {
  // Knapsack DP: capacity = troops, weight = ceil(hp/10), value = atk
  const capacity = Math.min(troops, 500); // cap for performance
  const n = enemies.length;
  const items = enemies.map(e => ({ ...e, weight: Math.ceil(e.hp / 10), value: e.atk }));

  const dp = new Array(capacity + 1).fill(0);
  const choice = Array.from({ length: n }, () => new Array(capacity + 1).fill(false));

  for (let i = 0; i < n; i++) {
    for (let w = capacity; w >= items[i].weight; w--) {
      const withItem = dp[w - items[i].weight] + items[i].value;
      if (withItem > dp[w]) {
        dp[w] = withItem;
        choice[i][w] = true;
      }
    }
  }

  // Backtrack
  let w = capacity;
  const taken = [], skipped = [];
  for (let i = n - 1; i >= 0; i--) {
    if (choice[i][w]) {
      taken.push({ ...items[i], cost: items[i].weight, ratio: (items[i].atk / items[i].hp).toFixed(3) });
      w -= items[i].weight;
    } else {
      skipped.push({ ...items[i], cost: items[i].weight, ratio: (items[i].atk / items[i].hp).toFixed(3) });
    }
  }

  const troopsUsed = capacity - w;

  return {
    algo: 'DP',
    troopsUsed,
    troopsRemaining: troops - troopsUsed,
    damageNeutralized: dp[capacity],
    efficiency: troops > 0 ? ((dp[capacity] / troops) * 100).toFixed(1) : 0,
    taken,
    skipped,
  };
}

// ── SIMULATION ────────────────────────────────────────
async function runSimulation() {
  if (STATE.simRunning) return;
  if (STATE.enemies.length === 0) { addLog('sys', 'ERROR: No enemies in roster!'); return; }
  if (!STATE.algoDP && !STATE.algoGreedy) { addLog('sys', 'ERROR: Enable at least one algorithm!'); return; }

  STATE.simRunning = true;
  STATE.simIdCounter++;
  const simId = `SIM-${String(STATE.simIdCounter).padStart(4, '0')}`;

  const runBtn = $('runSimBtn');
  if (runBtn) { runBtn.classList.add('running'); runBtn.textContent = '[ CALCULATING... ]'; }
  $('battleStatus')?.setAttribute('data-text', 'PROCESSING...');
  if ($('battleStatus')) $('battleStatus').textContent = 'PROCESSING TACTICAL DATA...';
  if ($('simIdDisplay')) $('simIdDisplay').textContent = simId;

  addLog('sys', `▶ ${simId} initiated. Troops: ${STATE.troops}`);
  addLog('sys', `Analyzing ${STATE.enemies.length} enemy unit(s)...`);

  await delay(400);

  const results = {};

  if (STATE.algoDP) {
    addLog('dp', 'Running Dynamic Programming optimizer...');
    await delay(300);
    results.dp = dpOptimize(STATE.troops, STATE.enemies);
    addLog('dp', `DP complete. Damage neutralized: ${results.dp.damageNeutralized} | Efficiency: ${results.dp.efficiency}%`);
  }

  if (STATE.algoGreedy) {
    addLog('greedy', 'Running Greedy Ratio optimizer...');
    await delay(300);
    results.greedy = greedyOptimize(STATE.troops, STATE.enemies);
    addLog('greedy', `Greedy complete. Damage neutralized: ${results.greedy.damageNeutralized} | Efficiency: ${results.greedy.efficiency}%`);
  }

  await runBattleAnimation(results);
  await delay(400);

  renderResults(results);
  updateHUD(results);
  STATE.sessionStats.battles++;

  const bestResult = getBestResult(results);
  if (bestResult) {
    const eff = parseFloat(bestResult.efficiency);
    if (eff > STATE.sessionStats.bestEfficiency) STATE.sessionStats.bestEfficiency = eff;
    STATE.sessionStats.totalTroopsLost += bestResult.troopsUsed;
    if (bestResult.troopsRemaining > 0) STATE.sessionStats.wins++;
    STATE.score += Math.floor(bestResult.damageNeutralized * 10 + bestResult.troopsRemaining * 5);
    if ($('scoreDisplay')) $('scoreDisplay').textContent = String(STATE.score).padStart(8, '0');
    addLog('win', `BATTLE COMPLETE. Score: +${Math.floor(bestResult.damageNeutralized * 10)}`);
    setTimeout(() => showVictory(bestResult), 600);
  }

  renderSessionStrip();

  if (runBtn) { runBtn.classList.remove('running'); runBtn.textContent = '[ ▶ OPTIMIZE BATTLE ]'; }
  if ($('battleStatus')) $('battleStatus').textContent = 'STANDBY — AWAITING ORDERS';
  STATE.simRunning = false;
}

function getBestResult(results) {
  const opts = Object.values(results);
  if (opts.length === 0) return null;
  return opts.reduce((a, b) => parseFloat(a.damageNeutralized) >= parseFloat(b.damageNeutralized) ? a : b);
}

// ── BATTLE ANIMATION ──────────────────────────────────
async function runBattleAnimation(results) {
  const best = getBestResult(results);
  if (!best) return;

  const allyHPFill = $('allyHPFill');
  const enemyHPFill = $('enemyHPFill');
  const allySprite = $('allySprite');
  const enemySprite = $('enemySprite');
  const allySide = $('allySide');
  const enemyCount = $('enemyCountDisplay');
  const allyCount = $('allyCountDisplay');

  let allyHP = 100;
  let enemyHP = 100;

  const rounds = Math.min(best.taken.length + 2, 6);

  for (let i = 0; i < rounds; i++) {
    await delay(350);

    // Ally attacks
    allySprite?.classList.add('attack-anim');
    setTimeout(() => allySprite?.classList.remove('attack-anim'), 450);
    enemyHP = Math.max(0, enemyHP - Math.floor(Math.random() * 20 + 10));
    if (enemyHPFill) enemyHPFill.style.width = `${enemyHP}%`;
    spawnDmgNum(enemySprite, Math.floor(Math.random() * 30 + 10), '#ff6b6b');
    if (enemyCount) enemyCount.textContent = `${Math.max(0, STATE.enemies.length - i - 1)} REMAINING`;

    await delay(300);

    // Enemy attacks (if any survive)
    if (enemyHP > 0 && i < rounds - 1) {
      enemySprite?.classList.add('hurt-anim');
      allySprite?.classList.add('hurt-anim');
      setTimeout(() => { allySprite?.classList.remove('hurt-anim'); enemySprite?.classList.remove('hurt-anim'); }, 350);
      allyHP = Math.max(10, allyHP - Math.floor(Math.random() * 12 + 5));
      if (allyHPFill) allyHPFill.style.width = `${allyHP}%`;
      spawnDmgNum(allySprite, Math.floor(Math.random() * 15 + 5), '#ffd600');
      flashHit(allySide);
    }
  }

  // Victory — full HP restore animation
  await delay(400);
  if (allyHPFill) allyHPFill.style.width = '100%';
  if (enemyHPFill) enemyHPFill.style.width = '0%';
  const remaining = Math.floor((best.troopsRemaining / STATE.troops) * 100);
  if (allyCount) allyCount.textContent = `${best.troopsRemaining} REMAINING`;
  if ($('battleStatus')) $('battleStatus').textContent = `VICTORY — ${best.troopsRemaining} TROOPS SURVIVED`;
}

function spawnDmgNum(nearEl, val, color) {
  const arena = document.querySelector('.battle-sky');
  if (!nearEl || !arena) return;
  const rect = nearEl.getBoundingClientRect?.() || { left: 400, top: 200 };
  const arenaRect = arena.getBoundingClientRect?.() || { left: 0, top: 0 };
  const num = el('div', 'dmg-num', `-${val}`);
  num.style.cssText = `color:${color};left:${rect.left - arenaRect.left + Math.random() * 20}px;top:${rect.top - arenaRect.top}px;`;
  arena.appendChild(num);
  setTimeout(() => num.remove(), 1000);
}

function flashHit(container) {
  if (!container) return;
  const flash = el('div', 'hit-flash');
  container.appendChild(flash);
  setTimeout(() => flash.remove(), 350);
}

// ── RESULTS RENDER ────────────────────────────────────
function renderResults(results) {
  const section = $('resultsSection');
  if (!section) return;
  section.innerHTML = '';

  const header = el('div', 'results-header');
  header.innerHTML = `
    <span class="section-num">04</span>
    <span class="section-title">OPTIMIZATION RESULTS</span>
    <span class="sim-id-display">${$('simIdDisplay')?.textContent || ''}</span>
  `;
  section.appendChild(header);

  const best = getBestResult(results);
  const maxDmg = Math.max(...Object.values(results).map(r => r.damageNeutralized), 1);

  const grid = el('div', 'results-grid');

  Object.values(results).forEach(r => {
    const isWinner = r === best;
    const cell = el('div', `result-cell${isWinner ? ' winner' : ''}`);
    cell.innerHTML = `
      <div class="rc-algo ${r.algo === 'DP' ? '' : 'blue'}">${r.algo} ALGORITHM</div>
      <div class="rc-val-big">${r.damageNeutralized}</div>
      <div class="rc-val-sub">DAMAGE NEUTRALIZED</div>
      <div class="rc-mini-bar"><div class="rc-mini-fill ${r.algo === 'DP' ? 'green' : 'blue'}" style="width:0%"></div></div>
      <div class="rc-small-stats">
        <div><div class="rc-ss">TROOPS USED</div><div class="rc-ss-val">${r.troopsUsed}</div></div>
        <div><div class="rc-ss">REMAINING</div><div class="rc-ss-val">${r.troopsRemaining}</div></div>
        <div><div class="rc-ss">TARGETS HIT</div><div class="rc-ss-val">${r.taken.length}</div></div>
        <div><div class="rc-ss">EFFICIENCY</div><div class="rc-ss-val">${r.efficiency}%</div></div>
      </div>
    `;
    grid.appendChild(cell);
    // Animate bar
    requestAnimationFrame(() => {
      setTimeout(() => {
        cell.querySelector('.rc-mini-fill').style.width = `${(r.damageNeutralized / maxDmg) * 100}%`;
      }, 50);
    });
  });

  section.appendChild(grid);

  // Target table for best result
  if (best && best.taken.length > 0) {
    const tableSection = el('div', 'target-table-section');
    tableSection.innerHTML = `
      <div style="font-family:var(--font);font-size:5px;color:var(--text-dim);letter-spacing:2px;margin-bottom:6px;">
        OPTIMAL TARGET SEQUENCE — ${best.algo}
      </div>
      <table class="target-table">
        <thead>
          <tr><th>TARGET</th><th>HP</th><th>ATK</th><th>RATIO</th><th>COST</th><th>STATUS</th></tr>
        </thead>
        <tbody>
          ${[...best.taken.map(e => `
            <tr class="t-taken">
              <td>${e.name}</td><td>${e.hp}</td><td>${e.atk}</td>
              <td><span class="ratio-px">${e.ratio}</span></td>
              <td>${e.cost}</td><td>✓ ENGAGE</td>
            </tr>`),
            ...best.skipped.map(e => `
            <tr class="t-skip">
              <td>${e.name}</td><td>${e.hp}</td><td>${e.atk}</td>
              <td><span class="ratio-px">${e.ratio}</span></td>
              <td>${e.cost}</td><td>✗ SKIP</td>
            </tr>`)
          ].join('')}
        </tbody>
      </table>
    `;
    section.appendChild(tableSection);
  }
}

// ── HUD UPDATE ─────────────────────────────────────────
function updateHUD(results) {
  const best = getBestResult(results);
  if (!best) return;
  const hpPct = Math.max(10, Math.round((best.troopsRemaining / STATE.troops) * 100));
  STATE.hudHP = hpPct;
  STATE.hudMP = Math.max(20, STATE.hudMP - 10);
  STATE.hudXP = Math.min(100, STATE.hudXP + 15);
  const hpFill = $('hudHP');
  const mpFill = $('hudMP');
  const xpFill = $('hudXP');
  if (hpFill) hpFill.style.width = `${STATE.hudHP}%`;
  if (mpFill) mpFill.style.width = `${STATE.hudMP}%`;
  if (xpFill) xpFill.style.width = `${STATE.hudXP}%`;
  if ($('cmdStatFill')) $('cmdStatFill').style.width = `${Math.min(100, parseFloat(best.efficiency))}%`;
  if ($('cmdStatVal')) $('cmdStatVal').textContent = `${best.efficiency}%`;
}

// ── VICTORY SCREEN ────────────────────────────────────
function showVictory(result) {
  const overlay = $('victoryOverlay');
  if (!overlay) return;
  if ($('vTroopsSurv')) $('vTroopsSurv').textContent = result.troopsRemaining;
  if ($('vDmgNeutral')) $('vDmgNeutral').textContent = result.damageNeutralized;
  if ($('vEfficiency')) $('vEfficiency').textContent = `${result.efficiency}%`;
  if ($('vAlgo')) $('vAlgo').textContent = result.algo;
  overlay.classList.add('show');
}

// ── SESSION STRIP ──────────────────────────────────────
function renderSessionStrip() {
  const strip = $('sessionStrip');
  if (!strip) return;
  if (STATE.sessionStats.battles === 0) return;
  strip.style.display = 'grid';
  const { battles, wins, totalTroopsLost, bestEfficiency } = STATE.sessionStats;
  const winRate = battles > 0 ? Math.round((wins / battles) * 100) : 0;
  const cells = strip.querySelectorAll('.sess-val');
  if (cells[0]) cells[0].textContent = battles;
  if (cells[1]) cells[1].textContent = `${winRate}%`;
  if (cells[2]) cells[2].textContent = totalTroopsLost;
  if (cells[3]) cells[3].textContent = `${bestEfficiency.toFixed(1)}%`;
}

// ── RESET ─────────────────────────────────────────────
function resetAll() {
  STATE.enemies = [];
  STATE.nextEnemyId = 1;
  STATE.hudHP = 100; STATE.hudMP = 75; STATE.hudXP = 40;
  const list = $('enemyList');
  if (list) list.innerHTML = '<div class="no-enemy-msg">[ NO ENEMIES LOADED ]<br>ADD ENEMIES TO BEGIN<br>TACTICAL ANALYSIS</div>';
  const results = $('resultsSection');
  if (results) results.innerHTML = `<div class="await-state"><div class="pixel-spinner"></div>AWAITING SIMULATION DATA</div>`;
  if ($('hudHP')) $('hudHP').style.width = '100%';
  if ($('hudMP')) $('hudMP').style.width = '75%';
  if ($('hudXP')) $('hudXP').style.width = '40%';
  if ($('battleStatus')) $('battleStatus').textContent = 'STANDBY — AWAITING ORDERS';
  if ($('allyHPFill')) $('allyHPFill').style.width = '100%';
  if ($('enemyHPFill')) $('enemyHPFill').style.width = '100%';
  addLog('sys', 'All data cleared. System reset complete.');
  updateEnemyCount();
}

// ── HUD PULSE ──────────────────────────────────────────
function startHUDPulse() {
  // Subtle XP bar tick
  setInterval(() => {
    STATE.hudXP = Math.min(100, STATE.hudXP + 0.5);
    if ($('hudXP')) $('hudXP').style.width = `${STATE.hudXP}%`;
  }, 5000);
}

// ── UTILS ──────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));
