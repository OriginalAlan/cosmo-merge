'use strict';

// ---- Configuración: todo el balance del juego se toca acá ----
// Medí cualquier cambio con `node tools/simular.js` (simula semanas de juego de distintos jugadores).
// Hoy: universo completo ~57 días gratis, ~44 días pagando USD 6, ~36 días pagando USD 20.
const CFG = {
  version: '0.6.1',
  testBuild: true,        // versión de prueba: lo muestra en ajustes y marca los eventos de analítica
  // Analítica (PostHog, gratis hasta 1M eventos/mes). Pegá acá la "Project API key" de tu proyecto.
  // Vacía = los eventos solo se ven en la consola.
  analytics: { posthogKey: '', host: 'https://us.i.posthog.com' },
  feedbackAfterMinutes: 15, // a los X minutos de juego se pide una opinión (una sola vez)
  cols: 5, rows: 6,
  incomeBase: 2,          // cada nivel produce x2 que el anterior (con más, la economía se dispara)
  spawnInterval: 8,       // segundos entre caídas gratis
  speedFactor: 0.85,      // cada mejora de velocidad multiplica el intervalo por esto
  minSpawnInterval: 1,
  multStep: 1.5,          // cada mejora de ganancias multiplica por esto
  buyBasePrice: 20,       // precio = producción del objeto * base * buyGrowth^(compras de ese nivel)
  buyGrowth: 1.25,
  upgCost: { speed: [80, 3.5], spawn: [3000, 150], mult: [400, 10] }, // [precio inicial, crecimiento]
  boostSeconds: 180, boostMult: 2,
  adSeconds: 5,           // duración del video simulado
  offlineCapHours: 2, offlineRate: 0.5, offlineAdMult: 3,
  offlineSpawnSeconds: 600, // con robot offline: mientras no jugás cae 1 objeto cada X s y el robot lo fusiona
  bangMinLevel: 8,        // nivel a alcanzar para habilitar el Big Bang
  bangBase: 2,            // energía = bangBase^(nivel máximo de la partida - bangMinLevel): 1, 2, 4, 8...
  runSpawnMax: 2,         // "Mejor caída" con monedas sube como mucho +2 niveles por partida
  bangAdMult: 2,
  // Laboratorio cósmico: se compra con ⚛️ y es permanente. [precio inicial, crecimiento]
  lab: { drop: [15, 11], mult: [6, 7], offline: [5, 3], offlineMax: 6 },
  startCells: 20,         // casilleros libres al empezar; el resto se desbloquea en la tienda
  gems: { daily: 10, adReward: 5, adsPerDay: 5, discovery: 10 }, // 💎 gratis
  shop: {                 // en 💎. Lo permanente sobrevive al Big Bang
    robot: { costs: [100, 300, 800, 2000], intervals: [6, 3, 1.5, 0.7] }, // fusiona solo cada X s
    space: { costs: [150, 600] },                                       // +1 fila cada una
    offlineRobot: { costs: [1000] },                                    // con el juego cerrado sigue cayendo y fusionando
    timeWarp: 30,         // consumible: 2 h de producción al instante
    turbo: { cost: 40, seconds: 300, interval: 0.3, perDay: 3 }, // robot a máxima velocidad un rato (funciona sin tener robot)
    rain: 25,             // consumible: llena los casilleros vacíos con objetos
    doubleEnergy: 50,     // consumible: x2 ⚛️ en el próximo Big Bang
  },
  // Compras con plata real. SIMULADAS: en la app las cobra Apple / Google.
  iap: [
    { id: 'gems_s', gems: 100, price: 'USD 0.99' },
    { id: 'gems_m', gems: 550, price: 'USD 4.99', tag: '+10%' },
    { id: 'gems_l', gems: 1200, price: 'USD 9.99', tag: '+20%' },
  ],
  // Paquetes de compra única: mucho más valor que los cristales sueltos, para que la primera compra sea fácil.
  packs: {
    starter: { name: 'Paquete inicial', icon: '🚀', price: 'USD 0.99', grants: { robot: 1, space: 1, gems: 100 } },
    galactic: { name: 'Pack galáctico', icon: '🌌', price: 'USD 4.99', grants: { robot: 2, space: 2, offlineRobot: 1, gems: 300 } },
  },
  // Estilo: solo cambia cómo se ve, no da ventaja. Es lo que compran los que ya tienen todo.
  cosmetics: {
    board: [
      { id: 'classic', name: 'Clásico', price: 0, sw: 'linear-gradient(135deg,#3a1d8a,#0e3a5c)', desc: 'El universo de siempre' },
      { id: 'nebula', name: 'Nebulosa rosa', price: 200, sw: 'linear-gradient(135deg,#a0287e,#3a1d8a)', desc: 'Fondo rosa y violeta' },
      { id: 'aurora', name: 'Aurora boreal', price: 300, sw: 'linear-gradient(135deg,#119c7f,#1d3a8a)', desc: 'Verdes y azules del polo' },
      { id: 'void', name: 'Vacío', price: 400, sw: 'linear-gradient(135deg,#000,#4a0a18)', desc: 'Negro total con brillo rojo' },
      { id: 'gold', name: 'Dorado', price: 800, sw: 'linear-gradient(135deg,#a8741a,#2a1a05)', desc: 'Tablero de lujo' },
      { id: 'rainbow', name: 'Arcoíris', price: 1500, sw: 'linear-gradient(135deg,#f55,#fd5,#5f8,#5af,#a5f)', desc: 'Legendario: el fondo cambia de color solo' },
    ],
    items: [
      { id: 'classic', name: 'Clásicos', price: 0, icon: '🟣', desc: 'Esferas de color' },
      { id: 'neon', name: 'Neón', price: 250, icon: '💡', desc: 'Contorno brillante sobre fondo oscuro' },
      { id: 'crystal', name: 'Cristal', price: 400, icon: '💠', desc: 'Transparentes como vidrio' },
      { id: 'candy', name: 'Caramelo', price: 400, icon: '🍬', desc: 'Rayas pastel' },
      { id: 'gold', name: 'Oro macizo', price: 1000, icon: '🥇', desc: 'Todos los objetos de oro' },
    ],
    fx: [
      { id: 'classic', name: 'Chispas', price: 0, icon: '✨', desc: 'Puntos de luz' },
      { id: 'stars', name: 'Estrellitas', price: 150, icon: '⭐', desc: 'Lluvia de estrellas' },
      { id: 'hearts', name: 'Corazones', price: 200, icon: '💖', desc: 'Corazones en cada fusión' },
      { id: 'confetti', name: 'Confeti', price: 300, icon: '🎊', desc: 'Festejo de colores' },
      { id: 'fireworks', name: 'Fuegos artificiales', price: 600, icon: '🎆', desc: 'Explosiones el doble de grandes' },
    ],
  },
  offerAtLevel: 6,        // al descubrir este nivel se ofrece el paquete inicial (una sola vez)
  vipPrice: 'USD 2.99',   // VIP: todas las recompensas de video sin ver el video
  saveKey: 'cosmo-merge-v2',
};

const LEVELS = [
  { e: '✨', n: 'Polvo estelar', h: 50 },
  { e: '🪨', n: 'Roca espacial', h: 25 },
  { e: '🌠', n: 'Meteoro', h: 205 },
  { e: '☄️', n: 'Cometa', h: 190 },
  { e: '🌑', n: 'Luna', h: 230 },
  { e: '🌍', n: 'Planeta', h: 140 },
  { e: '🪐', n: 'Gigante gaseoso', h: 30 },
  { e: '☀️', n: 'Estrella', h: 45 },
  { e: '🔴', n: 'Gigante roja', h: 0 },
  { e: '⚪', n: 'Enana blanca', h: 220 },
  { e: '🌟', n: 'Supernova', h: 300 },
  { e: '💫', n: 'Púlsar', h: 270 },
  { e: '🌀', n: 'Nebulosa', h: 210 },
  { e: '✴️', n: 'Cuásar', h: 20 },
  { e: '🌌', n: 'Galaxia', h: 255 },
  { e: '🌐', n: 'Cúmulo de galaxias', h: 180 },
  { e: '🕳️', n: 'Agujero negro', h: 280 },
  { e: '🫧', n: 'Universo burbuja', h: 190 },
  { e: '♾️', n: 'Multiverso', h: 320 },
  { e: '🔮', n: 'Origen', h: 290 },
];

const $ = (s) => document.querySelector(s);
const gridEl = $('#grid');
const todayStr = () => new Date().toISOString().slice(0, 10);

// ---- Estado y guardado ----
// Lo de la partida actual: se reinicia en cada Big Bang.
function newRun(dropLevel) {
  const grid = Array(CFG.cols * CFG.rows).fill(0);
  grid[11] = dropLevel; grid[13] = dropLevel; // dos iguales para la primera fusión
  return {
    coins: 20, grid, maxLevel: dropLevel, runEarned: 0,
    upg: { speed: 0, spawn: 0, mult: 0 }, buys: {}, spawnT: 0,
  };
}

function newState() {
  return {
    ...newRun(1),
    // Permanente:
    energy: 0, bestLevel: 1, gems: 0, vip: false, doubleNext: false,
    lab: { drop: 0, mult: 0, offline: 0 },
    perks: { robot: 0, space: 0, offlineRobot: 0 }, packs: {}, offerShown: false,
    owned: { board: ['classic'], items: ['classic'], fx: ['classic'] },
    equipped: { board: 'classic', items: 'classic', fx: 'classic' },
    turboUntil: 0, turboDay: { day: '', n: 0 },
    boostUntil: 0, lastSeen: Date.now(), lastDaily: '', adGems: { day: '', n: 0 },
    stats: { merges: 0, ads: 0, taps: 0, shares: 0, sessions: 0, bigBangs: 0, purchases: 0, playSecs: 0, days: [] },
    feedbackAsked: false,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(CFG.saveKey);
    if (raw) {
      const s = JSON.parse(raw), d = newState();
      return {
        ...d, ...s,
        upg: { ...d.upg, ...s.upg }, lab: { ...d.lab, ...s.lab }, perks: { ...d.perks, ...s.perks },
        owned: { ...d.owned, ...s.owned }, equipped: { ...d.equipped, ...s.equipped },
        stats: { ...d.stats, ...s.stats },
      };
    }
  } catch (e) { /* guardado corrupto o storage bloqueado: arrancamos de cero */ }
  return newState();
}

let resetting = false;
function save() {
  if (resetting) return;
  S.lastSeen = Date.now();
  try { localStorage.setItem(CFG.saveKey, JSON.stringify(S)); } catch (e) { }
}

const S = load();

// ---- Analítica ----
// Datos anónimos de uso para saber si el juego funciona: retención, videos, compras, opiniones.
// Cada dispositivo tiene un id al azar; no se guarda nada personal.
const deviceId = (() => {
  try {
    let id = localStorage.getItem('cosmo-device');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem('cosmo-device', id);
    }
    return id;
  } catch (e) { return 'sin-storage'; }
})();
// Eventos muy frecuentes: no se mandan uno por uno, van resumidos en el evento 'progress'.
const NOISY = new Set(['merge', 'buy', 'gems_earned', 'upgrade']);
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let queue = [];

function track(event, data) {
  console.log('[track]', event, data || '');
  if (!CFG.analytics.posthogKey || NOISY.has(event)) return;
  const first = S.stats.days[0] || todayStr();
  queue.push({
    event,
    timestamp: new Date().toISOString(),
    properties: {
      distinct_id: deviceId, ...data,
      version: CFG.version, test_build: CFG.testBuild, installed: standalone(),
      day: Math.round((Date.parse(todayStr()) - Date.parse(first)) / 864e5) + 1,
      sessions: S.stats.sessions, best_level: S.bestLevel, big_bangs: S.stats.bigBangs,
      gems: S.gems, vip: S.vip, purchases: S.stats.purchases, robot: S.perks.robot,
      play_minutes: Math.round(S.stats.playSecs / 60),
    },
  });
  if (queue.length >= 20) flushAnalytics();
}

function flushAnalytics() {
  if (!queue.length || !CFG.analytics.posthogKey) return;
  const body = JSON.stringify({ api_key: CFG.analytics.posthogKey, batch: queue });
  queue = [];
  // text/plain evita el preflight de CORS; keepalive deja terminar el envío aunque se cierre la pestaña.
  fetch(CFG.analytics.host + '/batch/', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } })
    .catch(() => { /* sin conexión: se pierde este lote, no es grave */ });
}
setInterval(flushAnalytics, 15000);

// ---- Fórmulas ----
const itemIncome = (l) => Math.pow(CFG.incomeBase, l - 1);
const boostActive = () => Date.now() < S.boostUntil;
const labMult = () => Math.pow(2, S.lab.mult);
const multiplier = () => Math.pow(CFG.multStep, S.upg.mult) * labMult();
const baseIncome = () => S.grid.reduce((a, l) => (l ? a + itemIncome(l) : a), 0) * multiplier();
const income = () => baseIncome() * (boostActive() ? CFG.boostMult : 1);
const dropBase = () => 1 + S.lab.drop;
const spawnLevel = () => dropBase() + S.upg.spawn;
const spawnInterval = () => Math.max(CFG.minSpawnInterval, CFG.spawnInterval * Math.pow(CFG.speedFactor, S.upg.speed));
const buyLevel = () => spawnLevel();
const buyPrice = () => itemIncome(buyLevel()) * CFG.buyBasePrice * Math.pow(CFG.buyGrowth, S.buys[buyLevel()] || 0);
const cells = () => CFG.startCells + S.perks.space * CFG.cols;
const isOpen = (i) => i < cells();
const hasSpace = () => S.grid.some((l, i) => !l && isOpen(i));
const offlineHours = () => CFG.offlineCapHours + S.lab.offline;
const bangPoints = () => (S.maxLevel < CFG.bangMinLevel ? 0 : Math.round(Math.pow(CFG.bangBase, S.maxLevel - CFG.bangMinLevel)));
const bangReady = () => bangPoints() > 0;
const turboActive = () => Date.now() < S.turboUntil;
const robotOn = () => S.perks.robot > 0 || turboActive();
const robotInterval = () => (turboActive() ? CFG.shop.turbo.interval : S.perks.robot ? CFG.shop.robot.intervals[S.perks.robot - 1] : 0);

function upgCost(u) {
  const [base, growth] = CFG.upgCost[u];
  return base * Math.pow(growth, S.upg[u]);
}
function upgMaxed(u) {
  if (u === 'speed') return spawnInterval() <= CFG.minSpawnInterval;
  if (u === 'spawn') return S.upg.spawn >= CFG.runSpawnMax || spawnLevel() >= Math.min(S.maxLevel - 1, LEVELS.length - 1);
  return false;
}
function labCost(k) {
  const [base, growth] = CFG.lab[k];
  return Math.round(base * Math.pow(growth, S.lab[k]));
}
function labMaxed(k) {
  if (k === 'drop') return dropBase() >= LEVELS.length - 2;
  if (k === 'offline') return S.lab.offline >= CFG.lab.offlineMax;
  return false;
}

// ---- Formato ----
const UNITS = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
function fmt(n) {
  if (n < 1000) return String(Math.floor(n));
  let i = -1;
  while (n >= 1000 && i < UNITS.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + UNITS[i];
}
function fmtTime(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
  return h ? `${h} h ${m} min` : `${Math.max(1, m)} min`;
}

// ---- Sonido y vibración ----
let ac;
function initAudio() {
  if (ac) return;
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { }
}
function beep(level, kind = 'merge') {
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  const f = (kind === 'tap' ? 440 : 220) * Math.pow(2, level / 8);
  o.type = kind === 'tap' ? 'sine' : 'triangle';
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(f * (kind === 'tap' ? 1.1 : 1.6), t + 0.12);
  const vol = kind === 'tap' ? 0.08 : 0.22;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'tap' ? 0.1 : 0.3));
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + 0.35);
}
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }

// ---- Render ----
function renderGrid() {
  const dragLevel = drag && drag.moved ? S.grid[drag.from] : 0;
  gridEl.innerHTML = S.grid.map((l, i) => {
    if (!isOpen(i)) return `<div class="cell locked" data-i="${i}">${i % CFG.cols === 2 ? '🔒' : ''}</div>`;
    const cls = ['cell'];
    if (dragLevel) {
      if (i === drag.from) cls.push('dragging');
      else if (l === dragLevel && l < LEVELS.length) cls.push('match');
    }
    const item = l
      ? `<div class="item" style="--h:${LEVELS[l - 1].h}"><span class="emo">${LEVELS[l - 1].e}</span><span class="lvl">${l}</span></div>`
      : '';
    return `<div class="${cls.join(' ')}" data-i="${i}">${item}</div>`;
  }).join('');
}

function animate(i, cls) {
  const el = gridEl.children[i] && gridEl.children[i].querySelector('.item');
  if (el) el.classList.add(cls);
}

function renderCollection() {
  $('#collection').innerHTML = LEVELS.map((L, i) => {
    const on = i < S.bestLevel;
    return `<span class="${on ? 'on' : ''} ${i === S.maxLevel - 1 ? 'top' : ''}" title="${on ? L.n : '???'}">${on ? L.e : '❓'}</span>`;
  }).join('');
}

function renderHint() {
  const el = $('#hint');
  el.classList.toggle('hidden', S.stats.merges > 0);
  el.textContent = '👆 Arrastrá un ✨ encima del otro ✨ para fusionarlos';
}

function updateHUD() {
  $('#coins').textContent = '🪙 ' + fmt(S.coins);
  $('#income').textContent = `+${fmt(income())}/s` + (boostActive() ? '  ⚡x' + CFG.boostMult : '') + (turboActive() ? '  🚀' : S.perks.robot ? '  🤖' : '');
  $('#gemsBtn').textContent = '💎 ' + fmt(S.gems);

  const full = !hasSpace();
  $('#spawnFill').style.width = full ? '100%' : `${(S.spawnT / spawnInterval()) * 100}%`;
  $('#spawnText').textContent = full
    ? 'Tablero lleno — ¡fusioná para hacer lugar!'
    : `Próximo ${LEVELS[spawnLevel() - 1].e} en ${Math.ceil(spawnInterval() - S.spawnT)}s`;

  const bl = buyLevel(), bp = buyPrice(), buyBtn = $('#buyBtn');
  buyBtn.innerHTML = `Comprar ${LEVELS[bl - 1].e} <span>🪙 ${fmt(bp)}</span>`;
  buyBtn.disabled = S.coins < bp || full;

  document.querySelectorAll('.upg').forEach((b) => {
    const u = b.dataset.u, cost = upgCost(u), maxed = upgMaxed(u);
    let title, sub;
    if (u === 'speed') { title = '⚡ Velocidad'; sub = `cada ${spawnInterval().toFixed(1)}s`; }
    if (u === 'spawn') { title = '⬆️ Mejor caída'; sub = `caen ${LEVELS[spawnLevel() - 1].e}`; }
    if (u === 'mult') { title = '💰 Ganancias'; sub = `x${multiplier() < 100 ? +multiplier().toFixed(2) : fmt(multiplier())}`; }
    b.innerHTML = `<div class="u-t">${title}</div><div class="u-s">${sub}</div><div class="u-p">${maxed ? 'MÁX' : '🪙 ' + fmt(cost)}</div>`;
    b.disabled = maxed || S.coins < cost;
  });

  const boostBtn = $('#boostBtn'), left = Math.ceil((S.boostUntil - Date.now()) / 1000);
  boostBtn.classList.toggle('active', left > 0);
  boostBtn.innerHTML = left > 0
    ? `⚡ x${CFG.boostMult} activo — ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
    : `${S.vip ? '👑' : '🎬 Ver video:'} <b>x${CFG.boostMult} ganancias</b> por ${CFG.boostSeconds / 60} min`;

  const ready = bangReady(), bangBtn = $('#bangBtn');
  bangBtn.classList.toggle('ready', ready);
  bangBtn.innerHTML = ready ? `💥 <span>+${bangPoints()} ⚛️</span>` : '💥';
}

// ---- Efectos visuales ----
function cellCenter(i) {
  const r = gridEl.children[i].getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}
function floatText(x, y, text) {
  const el = document.createElement('div');
  el.className = 'float';
  el.style.left = x + 'px'; el.style.top = y + 'px';
  el.textContent = text;
  $('#fx').appendChild(el);
  setTimeout(() => el.remove(), 900);
}
let previewFx = null; // efecto que se está probando en la tienda de estilo
const FX_GLYPH = { stars: '✦', hearts: '💖' };
function sparks(x, y, hue, count = 10) {
  const fx = previewFx || S.equipped.fx, big = fx === 'fireworks';
  if (big) count *= 2;
  for (let k = 0; k < count; k++) {
    const el = document.createElement('div'), a = (Math.PI * 2 * k) / count, d = (40 + Math.random() * 30) * (big ? 2 : 1);
    const h = fx === 'confetti' || big ? Math.floor(Math.random() * 360) : hue;
    el.className = 'spark' + (FX_GLYPH[fx] ? ' glyph' : fx === 'confetti' ? ' confetti' : '');
    if (FX_GLYPH[fx]) el.textContent = FX_GLYPH[fx];
    el.style.cssText = `left:${x - 4}px;top:${y - 4}px;--h:${h};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    $('#fx').appendChild(el);
    setTimeout(() => el.remove(), 600);
  }
}
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
function bumpCoins() {
  const el = $('#coins');
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}

// ---- Modal ----
// Cada botón: { label, cls, fn, keep, disabled }. `keep` deja el modal abierto (fn decide qué mostrar).
function openModal(html, buttons) {
  $('#modalCard').innerHTML = html + (buttons.length ? '<div class="actions"></div>' : '');
  const box = $('#modalCard .actions');
  buttons.forEach((b) => box.appendChild(makeButton(b)));
  $('#modalCard').querySelectorAll('[data-row]').forEach((el) => {
    const b = rowButtons[el.dataset.row];
    if (b) el.appendChild(makeButton(b));
  });
  rowButtons = {};
  $('#modal').classList.remove('hidden');
}
function makeButton(b) {
  const el = document.createElement('button');
  el.className = 'btn ' + (b.cls || 'primary');
  el.innerHTML = b.label;
  el.disabled = !!b.disabled;
  el.onclick = () => { initAudio(); if (!b.keep) closeModal(); b.fn && b.fn(); };
  return el;
}
function closeModal() { $('#modal').classList.add('hidden'); }

// Filas de tienda: texto a la izquierda y un botón a la derecha.
let rowButtons = {};
function row(id, icon, title, sub, button) {
  rowButtons[id] = { cls: 'small primary', keep: true, ...button };
  return `<div class="row" data-row="${id}"><div class="row-i">${icon}</div><div class="row-t"><b>${title}</b><span>${sub}</span></div></div>`;
}

// ---- Acciones del juego ----
function spawn(level) {
  const empty = [];
  S.grid.forEach((l, i) => { if (!l && isOpen(i)) empty.push(i); });
  if (!empty.length) return false;
  const i = empty[Math.floor(Math.random() * empty.length)];
  S.grid[i] = level;
  renderGrid();
  animate(i, 'spawn');
  return true;
}

function moveOrMerge(a, b) {
  const A = S.grid[a], B = S.grid[b];
  if (!B) {
    S.grid[b] = A; S.grid[a] = 0;
  } else if (A === B && A < LEVELS.length) {
    S.grid[b] = A + 1; S.grid[a] = 0;
    renderGrid();
    onMerge(b, A + 1);
    return;
  } else {
    S.grid[a] = B; S.grid[b] = A;
  }
  renderGrid();
}

function onMerge(i, level, byRobot) {
  S.stats.merges++;
  animate(i, 'pop');
  beep(level);
  if (!byRobot) buzz(15);
  const [x, y] = cellCenter(i);
  sparks(x, y, LEVELS[level - 1].h, 8 + Math.min(level, 12));
  floatText(x, y - 20, (byRobot ? '🤖 ' : '') + `+${fmt(itemIncome(level) * multiplier())}/s`);
  track('merge', { level, byRobot: !!byRobot });
  renderHint();
  if (level > S.maxLevel) {
    S.maxLevel = level;
    if (level > S.bestLevel) {
      S.bestLevel = level;
      S.gems += CFG.gems.discovery;
      track('discover', { level });
      setTimeout(() => showDiscovery(level), 350);
    } else if (level === CFG.bangMinLevel) {
      toast('💥 ¡Ya podés hacer otro Big Bang!');
    }
    renderCollection();
    save();
  }
}

// Fusiona el par de MAYOR nivel del tablero. Devuelve { i, level } o null.
// Si buscara el de menor nivel, los ✨ que caen todo el tiempo lo tendrían siempre ocupado
// y nunca llegaría a fusionar los objetos grandes.
function mergeHighestPair(skip) {
  for (let l = LEVELS.length - 1; l >= 1; l--) {
    const idx = [];
    S.grid.forEach((x, i) => { if (x === l && i !== skip) idx.push(i); });
    if (idx.length >= 2) {
      S.grid[idx[1]] = l + 1; S.grid[idx[0]] = 0;
      return { i: idx[1], level: l + 1 };
    }
  }
  return null;
}

function robotMerge() {
  const m = mergeHighestPair(drag ? drag.from : -1);
  if (!m) return;
  renderGrid();
  onMerge(m.i, m.level, true);
}

// Robot offline: mientras no jugaste cayó 1 objeto cada CFG.offlineSpawnSeconds y el robot los fusionó.
function offlineRobotWork(secs) {
  if (!S.perks.offlineRobot || !S.perks.robot) return null;
  const res = { dropped: 0, merges: 0, found: [] };
  for (let k = Math.floor(secs / CFG.offlineSpawnSeconds); k > 0; k--) {
    const empty = S.grid.findIndex((l, i) => !l && isOpen(i));
    if (empty >= 0) { S.grid[empty] = spawnLevel(); res.dropped++; }
    let m;
    while ((m = mergeHighestPair(-1))) {
      res.merges++;
      S.stats.merges++;
      if (m.level > S.maxLevel) S.maxLevel = m.level;
      if (m.level > S.bestLevel) { S.bestLevel = m.level; S.gems += CFG.gems.discovery; res.found.push(m.level); }
    }
  }
  track('offline_robot', res);
  renderGrid();
  renderCollection();
  return res;
}

function earn(amount) {
  S.coins += amount;
  S.runEarned += amount;
}

function tapItem(i) {
  const l = S.grid[i];
  if (!l) return;
  const gain = itemIncome(l) * multiplier() * (boostActive() ? CFG.boostMult : 1);
  earn(gain);
  S.stats.taps++;
  animate(i, 'tap');
  beep(l, 'tap');
  buzz(5);
  const [x, y] = cellCenter(i);
  floatText(x, y - 20, '+' + fmt(gain));
}

function buy() {
  const price = buyPrice(), lvl = buyLevel();
  if (S.coins < price || !spawn(lvl)) return;
  S.coins -= price;
  S.buys[lvl] = (S.buys[lvl] || 0) + 1;
  beep(lvl, 'tap');
  track('buy', { lvl, price });
}

function upgrade(u) {
  const cost = upgCost(u);
  if (upgMaxed(u) || S.coins < cost) return;
  S.coins -= cost;
  S.upg[u]++;
  beep(6);
  buzz(10);
  track('upgrade', { u, level: S.upg[u] });
  save();
}

function give(amount) {
  earn(amount);
  bumpCoins();
  const r = $('#coins').getBoundingClientRect();
  floatText(r.left + r.width / 2, r.bottom, '+' + fmt(amount));
  save();
}

function giveGems(n, why) {
  S.gems += n;
  track('gems_earned', { n, why });
  save();
}

// Video con premio SIMULADO. En la app nativa esto se reemplaza por AdMob / AppLovin MAX.
// Con VIP la recompensa llega directo, sin video.
function showRewardedAd(placement, onReward) {
  if (S.vip) {
    track('ad_skipped_vip', { placement });
    closeModal();
    onReward();
    return;
  }
  track('ad_start', { placement });
  let t = CFG.adSeconds;
  openModal(`<div class="muted">Publicidad (simulada)</div><div class="ad-box">📺</div><div id="adCount">La recompensa llega en ${t}s</div>`, []);
  const iv = setInterval(() => {
    t--;
    if (t > 0) { $('#adCount').textContent = `La recompensa llega en ${t}s`; return; }
    clearInterval(iv);
    S.stats.ads++;
    track('ad_complete', { placement });
    closeModal();
    onReward();
  }, 1000);
}
const adLabel = (text) => (S.vip ? '👑 ' : '🎬 ') + text + (S.vip ? '' : ' mirando un video');

// Compra con plata real SIMULADA. En la app nativa: RevenueCat → Apple / Google.
function fakePurchase(name, price, onSuccess) {
  openModal(
    `<div class="disc-emoji">🧾</div><h2>${name}</h2><div class="big">${price}</div>
     <p class="muted">Compra simulada: no se cobra nada. En la app real la cobran Apple o Google.</p>`,
    [
      { label: 'Confirmar compra', cls: 'primary', fn: () => {
        S.stats.purchases++;
        track('purchase', { name, price });
        onSuccess();
        save();
      } },
      { label: 'Cancelar', cls: 'danger', fn: showShop },
    ]
  );
}

function showDiscovery(l) {
  const L = LEVELS[l - 1];
  const last = l === LEVELS.length;
  openModal(
    `<div class="disc-label">${last ? '¡Universo completo!' : '¡Nuevo descubrimiento!'}</div>
     <div class="disc-emoji">${L.e}</div>
     <h2>${L.n}</h2>
     <p>Cada uno produce 🪙 ${fmt(itemIncome(l))}/s</p>
     <p class="gem-line">+${CFG.gems.discovery} 💎</p>
     <p class="muted">${l} de ${LEVELS.length} descubiertos</p>`,
    [
      { label: '📤 Compartir', cls: 'secondary', keep: true, fn: () => share(l) },
      { label: '¡Genial!', cls: 'primary', fn: () => { if (l >= CFG.offerAtLevel) maybeShowStarterOffer(); } },
    ]
  );
}

// ---- Paquetes de compra única ----
function packValue(id) {
  const g = CFG.packs[id].grants, sh = CFG.shop;
  const sum = (arr, n) => arr.slice(0, n).reduce((a, b) => a + b, 0);
  return sum(sh.robot.costs, g.robot || 0) + sum(sh.space.costs, g.space || 0) +
    (g.offlineRobot ? sh.offlineRobot.costs[0] : 0) + (g.gems || 0);
}
function packItems(id) {
  const g = CFG.packs[id].grants, out = [];
  if (g.robot) out.push(`🤖 Robot de fusión Nv ${g.robot}`);
  if (g.space) out.push(`🔓 +${g.space} fila${g.space > 1 ? 's' : ''} de espacio`);
  if (g.offlineRobot) out.push('🛰️ El robot trabaja con el juego cerrado');
  if (g.gems) out.push(`💎 ${g.gems} cristales`);
  return out;
}
function grantPack(id) {
  const g = CFG.packs[id].grants;
  S.packs[id] = true;
  if (g.robot) S.perks.robot = Math.max(S.perks.robot, g.robot);
  if (g.space) S.perks.space = Math.max(S.perks.space, g.space);
  if (g.offlineRobot) S.perks.offlineRobot = 1;
  if (g.gems) giveGems(g.gems, 'pack');
  renderGrid();
  toast(`${CFG.packs[id].icon} ¡${CFG.packs[id].name} activado!`);
}
function buyPack(id, after) {
  const p = CFG.packs[id];
  fakePurchase(`${p.icon} ${p.name}`, p.price, () => { grantPack(id); after && after(); });
}

function maybeShowStarterOffer() {
  if (S.offerShown || S.packs.starter) return;
  S.offerShown = true;
  track('offer_shown', { id: 'starter' });
  save();
  showPackOffer('starter');
}
function showPackOffer(id) {
  const p = CFG.packs[id];
  openModal(
    `<div class="disc-label">Oferta única</div>
     <div class="disc-emoji">${p.icon}</div>
     <h2>${p.name}</h2>
     <ul class="pack-list">${packItems(id).map((x) => `<li>${x}</li>`).join('')}</ul>
     <p class="muted">Vale 💎 ${packValue(id)} comprado por separado</p>`,
    [
      { label: `Comprar por ${p.price}`, cls: 'small money big-btn', keep: true, fn: () => buyPack(id) },
      { label: 'Ahora no', cls: 'danger' },
    ]
  );
}

const shareUrl = () => location.origin + location.pathname;
async function share(l) {
  const L = LEVELS[l - 1];
  const chain = LEVELS.slice(0, l).map((x) => x.e).join('') + '❓'.repeat(LEVELS.length - l);
  const text = `Llegué a ${L.e} ${L.n} en Cosmo Merge 🚀\n${chain}\n¿Llegás más lejos?`;
  S.stats.shares++;
  track('share', { level: l });
  if (navigator.share) {
    try { await navigator.share({ text, url: shareUrl() }); } catch (e) { }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${shareUrl()}`);
    toast('¡Copiado! Pegalo donde quieras');
  } catch (e) {
    toast('No se pudo compartir');
  }
}

function checkOffline() {
  const secs = Math.min((Date.now() - S.lastSeen) / 1000, offlineHours() * 3600);
  S.lastSeen = Date.now();
  if (secs < 60) return false;
  const amount = baseIncome() * secs * CFG.offlineRate;
  if (amount < 1) return false;
  track('offline_reward', { secs: Math.round(secs), amount });
  const robot = offlineRobotWork(secs);
  const robotLine = robot && (robot.dropped || robot.merges)
    ? `<p>🤖 Cayeron ${robot.dropped} objetos y el robot hizo ${robot.merges} fusiones` +
      (robot.found.length ? `<br><b>¡Descubrió ${robot.found.map((l) => LEVELS[l - 1].e + ' ' + LEVELS[l - 1].n).join(', ')}!</b> <span class="gem-line">+${robot.found.length * CFG.gems.discovery} 💎</span>` : '') + '</p>'
    : '';
  openModal(
    `<div class="disc-emoji">🛰️</div>
     <h2>Mientras no estabas</h2>
     <p>Tu universo produjo</p>
     <div class="big">🪙 ${fmt(amount)}</div>
     ${robotLine}
     <p class="muted">${fmtTime(secs)} afuera (máx. ${offlineHours()} h)</p>`,
    [
      { label: adLabel(`x${CFG.offlineAdMult}`), cls: 'secondary', keep: true,
        fn: () => showRewardedAd('offline', () => give(amount * CFG.offlineAdMult)) },
      { label: 'Recoger', cls: 'primary', fn: () => give(amount) },
    ]
  );
  return true;
}

function checkDaily(modalOpen) {
  if (S.lastDaily === todayStr()) return;
  S.lastDaily = todayStr();
  giveGems(CFG.gems.daily, 'daily');
  if (modalOpen) toast(`🎁 Regalo diario: +${CFG.gems.daily} 💎`);
  else openModal(`<div class="disc-emoji">🎁</div><h2>Regalo diario</h2><div class="big">+${CFG.gems.daily} 💎</div><p class="muted">Volvé mañana por más</p>`, [{ label: '¡Gracias!', cls: 'primary' }]);
}

// ---- Tienda (💎) ----
function buyWithGems(cost, fn) {
  if (S.gems < cost) { toast('Te faltan 💎'); return; }
  S.gems -= cost;
  fn();
  beep(10);
  buzz(20);
  save();
}

function showShop() {
  const adsLeft = S.adGems.day === todayStr() ? CFG.gems.adsPerDay - S.adGems.n : CFG.gems.adsPerDay;
  const rc = CFG.shop.robot.costs, sc = CFG.shop.space.costs, r = S.perks.robot, sp = S.perks.space;
  const robotSub = r < rc.length
    ? `${r ? `Nv ${r}: cada ${robotInterval()}s → ` : 'Fusiona solo '}cada ${CFG.shop.robot.intervals[r]}s`
    : `Nv ${r}: fusiona cada ${robotInterval()}s (máx.)`;

  let html = `<h2>Tienda</h2><div class="big">💎 ${fmt(S.gems)}</div>`;
  const offers = Object.keys(CFG.packs).filter((id) => !S.packs[id]);
  if (offers.length) {
    html += `<div class="section">Ofertas de una sola vez</div>`;
    offers.forEach((id) => {
      const p = CFG.packs[id];
      html += row('pack_' + id, p.icon, p.name, packItems(id).join(' · ') + `<br><b class="gem-line">Vale 💎 ${packValue(id)}</b>`,
        { label: p.price, cls: 'small money', fn: () => buyPack(id, showShop) });
    });
  }
  html += `<div class="section">Estilo</div>`;
  const ownedCount = Object.values(S.owned).reduce((a, l) => a + l.length - 1, 0);
  html += row('style', '🎨', 'Estilo del universo', `Tableros, objetos y efectos · ${ownedCount ? `tenés ${ownedCount}` : 'nuevos'}`,
    { label: 'Ver', cls: 'small secondary', fn: showStyle });
  html += `<div class="section">Ventajas permanentes</div>`;
  html += row('robot', '🤖', 'Robot de fusión', robotSub,
    r < rc.length ? { label: `💎 ${rc[r]}`, disabled: S.gems < rc[r], fn: () => buyWithGems(rc[r], () => {
      S.perks.robot++; track('shop', { item: 'robot', level: S.perks.robot }); toast('🤖 ¡Robot mejorado!'); showShop();
    }) } : { label: 'MÁX', disabled: true });
  html += row('space', '🔓', 'Más espacio', sp < sc.length ? `+1 fila (${cells()} → ${cells() + CFG.cols} casilleros)` : `${cells()} casilleros (máx.)`,
    sp < sc.length ? { label: `💎 ${sc[sp]}`, disabled: S.gems < sc[sp], fn: () => buyWithGems(sc[sp], () => {
      S.perks.space++; track('shop', { item: 'space', level: S.perks.space }); renderGrid(); toast('🔓 ¡Nueva fila!'); showShop();
    }) } : { label: 'MÁX', disabled: true });

  const oc = CFG.shop.offlineRobot.costs[0];
  html += row('offrobot', '🛰️', 'Robot nocturno', S.perks.offlineRobot
      ? 'Activo: con el juego cerrado siguen cayendo objetos y el robot los fusiona'
      : `Con el juego cerrado cae 1 objeto cada ${CFG.offlineSpawnSeconds / 60} min y el robot lo fusiona${S.perks.robot ? '' : ' (necesita el robot)'}`,
    S.perks.offlineRobot ? { label: 'Activo', disabled: true } : { label: `💎 ${oc}`, disabled: S.gems < oc || !S.perks.robot,
      fn: () => buyWithGems(oc, () => { S.perks.offlineRobot = 1; track('shop', { item: 'offlineRobot' }); toast('🛰️ ¡Robot nocturno activado!'); showShop(); }) });

  html += `<div class="section">Consumibles</div>`;
  const t = CFG.shop.turbo, turboLeft = S.turboDay.day === todayStr() ? t.perDay - S.turboDay.n : t.perDay;
  const turboSecs = Math.ceil((S.turboUntil - Date.now()) / 1000);
  html += row('turbo', '🚀', 'Turbo robot', turboActive()
      ? `Activo: quedan ${Math.floor(turboSecs / 60)}:${String(turboSecs % 60).padStart(2, '0')}`
      : `Fusiona cada ${t.interval} s durante ${t.seconds / 60} min${S.perks.robot ? '' : ' (¡aunque no tengas robot!)'} · ${turboLeft} de ${t.perDay} hoy`,
    turboActive() ? { label: 'Activo', disabled: true } : { label: `💎 ${t.cost}`, disabled: S.gems < t.cost || turboLeft <= 0,
      fn: () => buyWithGems(t.cost, () => {
        if (S.turboDay.day !== todayStr()) S.turboDay = { day: todayStr(), n: 0 };
        S.turboDay.n++;
        S.turboUntil = Date.now() + t.seconds * 1000;
        track('shop', { item: 'turbo' });
        closeModal();
        toast(`🚀 ¡Turbo robot por ${t.seconds / 60} minutos!`);
      }) });
  const empties = S.grid.filter((l, i) => !l && isOpen(i)).length;
  html += row('rain', '🌧️', 'Lluvia de objetos', empties ? `Llena los ${empties} casilleros vacíos con ${LEVELS[spawnLevel() - 1].e}` : 'No hay casilleros vacíos',
    { label: `💎 ${CFG.shop.rain}`, disabled: S.gems < CFG.shop.rain || !empties, fn: () => buyWithGems(CFG.shop.rain, () => {
      track('shop', { item: 'rain', empties });
      closeModal();
      for (let k = 0; k < empties; k++) setTimeout(() => spawn(spawnLevel()), k * 70);
    }) });
  const warp = baseIncome() * 7200;
  html += row('warp', '⏩', 'Salto temporal', `2 h de producción ya: 🪙 ${fmt(warp)}`,
    { label: `💎 ${CFG.shop.timeWarp}`, disabled: S.gems < CFG.shop.timeWarp, fn: () => buyWithGems(CFG.shop.timeWarp, () => {
      track('shop', { item: 'timeWarp' }); closeModal(); give(warp);
    }) });
  html += row('double', '⚛️', 'Doble energía', S.doubleNext ? 'Activo para el próximo Big Bang' : 'x2 ⚛️ en el próximo Big Bang',
    S.doubleNext ? { label: 'Activo', disabled: true } : { label: `💎 ${CFG.shop.doubleEnergy}`, disabled: S.gems < CFG.shop.doubleEnergy,
      fn: () => buyWithGems(CFG.shop.doubleEnergy, () => { S.doubleNext = true; track('shop', { item: 'doubleEnergy' }); showShop(); }) });

  html += `<div class="section">Cristales</div>`;
  html += row('adgems', S.vip ? '👑' : '🎬', `+${CFG.gems.adReward} 💎 gratis`, `${adsLeft} de ${CFG.gems.adsPerDay} por hoy`,
    { label: S.vip ? 'Recibir' : 'Ver video', cls: 'small secondary', disabled: adsLeft <= 0, fn: () => showRewardedAd('gems', () => {
      if (S.adGems.day !== todayStr()) S.adGems = { day: todayStr(), n: 0 };
      S.adGems.n++;
      giveGems(CFG.gems.adReward, 'ad');
      toast(`+${CFG.gems.adReward} 💎`);
      showShop();
    }) });
  CFG.iap.forEach((p) => {
    html += row(p.id, '💎', `${p.gems} cristales`, p.tag ? `${p.tag} de regalo` : 'Paquete chico',
      { label: p.price, cls: 'small money', fn: () => fakePurchase(`${p.gems} 💎`, p.price, () => {
        giveGems(p.gems, 'iap'); toast(`+${p.gems} 💎`); showShop();
      }) });
  });
  html += row('vip', '👑', 'VIP', S.vip ? 'Activo: recompensas sin videos' : 'Todas las recompensas sin ver videos, para siempre',
    S.vip ? { label: 'Activo', disabled: true } : { label: CFG.vipPrice, cls: 'small money', fn: () => fakePurchase('VIP 👑', CFG.vipPrice, () => {
      S.vip = true; toast('👑 ¡Sos VIP!'); showShop();
    }) });

  openModal(html, [{ label: 'Cerrar', cls: 'primary' }]);
}

// ---- Estilo (cosméticos) ----
function applyStyle(eq) {
  document.documentElement.dataset.board = eq.board;
  document.documentElement.dataset.items = eq.items;
}
function equip(kind, id) {
  S.equipped[kind] = id;
  applyStyle(S.equipped);
  save();
}
function cosmeticIcon(c) {
  return c.sw ? `<span class="swatch" style="background:${c.sw}"></span>` : c.icon;
}

function showStyle() {
  const section = (kind, title) => `<div class="section">${title}</div>` + CFG.cosmetics[kind].map((c) => {
    const owned = S.owned[kind].includes(c.id), on = S.equipped[kind] === c.id;
    const button = on ? { label: 'En uso', disabled: true }
      : owned ? { label: 'Usar', cls: 'small secondary', fn: () => { equip(kind, c.id); showStyle(); } }
      : { label: `💎 ${c.price}`, fn: () => showCosmetic(kind, c) };
    return row(`st_${kind}_${c.id}`, cosmeticIcon(c), c.name, owned ? (on ? 'En uso' : 'Tuyo') : c.desc, button);
  }).join('');
  openModal(
    `<h2>🎨 Estilo</h2><div class="big">💎 ${fmt(S.gems)}</div>
     <p class="muted">Solo cambia cómo se ve. Lo que comprás es tuyo para siempre.</p>` +
    section('board', 'Tablero') + section('items', 'Objetos') + section('fx', 'Efecto de fusión'),
    [{ label: 'Volver a la tienda', cls: 'secondary', keep: true, fn: showShop }, { label: 'Cerrar', cls: 'primary' }]
  );
}

function showCosmetic(kind, c) {
  const enough = S.gems >= c.price;
  openModal(
    `<div class="disc-emoji">${c.sw ? `<span class="swatch big" style="background:${c.sw}"></span>` : c.icon}</div>
     <h2>${c.name}</h2><p>${c.desc}</p><div class="big">💎 ${c.price}</div>`,
    [
      { label: '👁️ Probar 4 segundos', cls: 'secondary', fn: () => previewCosmetic(kind, c) },
      { label: `Comprar por 💎 ${c.price}`, cls: 'primary', disabled: !enough, fn: () => buyWithGems(c.price, () => {
        S.owned[kind].push(c.id);
        equip(kind, c.id);
        track('cosmetic', { kind, id: c.id, price: c.price });
        toast(`🎨 ¡${c.name} es tuyo!`);
        showStyle();
      }) },
      enough ? null : { label: 'Conseguir 💎', cls: 'small money big-btn', keep: true, fn: showShop },
      { label: 'Volver', cls: 'danger', keep: true, fn: showStyle },
    ].filter(Boolean)
  );
}

function previewCosmetic(kind, c) {
  track('cosmetic_preview', { kind, id: c.id });
  if (kind === 'fx') {
    previewFx = c.id;
    const r = gridEl.getBoundingClientRect();
    [0, 700, 1400, 2100, 2800].forEach((ms) => setTimeout(() => {
      sparks(r.left + r.width * (0.25 + Math.random() * 0.5), r.top + r.height * (0.25 + Math.random() * 0.5), Math.random() * 360, 14);
      beep(8 + Math.floor(Math.random() * 6));
    }, ms));
  } else {
    applyStyle({ ...S.equipped, [kind]: c.id });
  }
  toast(`👁️ Vista previa: ${c.name}`);
  setTimeout(() => { previewFx = null; applyStyle(S.equipped); showCosmetic(kind, c); }, 4000);
}

// ---- Big Bang y laboratorio (⚛️) ----
function showBigBang() {
  const pts = bangPoints() * (S.doubleNext ? 2 : 1);
  const labBtn = { label: `🧪 Laboratorio (⚛️ ${S.energy})`, cls: 'secondary', keep: true, fn: showLab };
  if (!bangReady()) {
    const L = LEVELS[CFG.bangMinLevel - 1];
    openModal(
      `<div class="disc-emoji">💥</div><h2>Big Bang</h2>
       <p>Reiniciá el universo y ganá <b>energía cósmica ⚛️</b> para mejoras permanentes en el laboratorio.</p>
       <p class="muted">Creá una ${L.e} <b>${L.n}</b> en esta partida para poder hacerlo. Cuanto más lejos llegues, más energía: se duplica con cada nivel.</p>`,
      [labBtn, { label: 'Entendido', cls: 'primary' }]
    );
    return;
  }
  const next = LEVELS[Math.min(S.maxLevel, LEVELS.length - 1)];
  openModal(
    `<div class="disc-emoji">💥</div><h2>¿Hacer el Big Bang?</h2>
     <p>Ganás</p><div class="big">⚛️ ${pts}${S.doubleNext ? ' <small>(x2)</small>' : ''}</div>
     <p class="muted">Si llegás a ${next.e} ${next.n} antes, ganás el doble.</p>
     <p class="muted">Se reinician el tablero, las monedas y las mejoras. Se conservan la colección, el laboratorio y la tienda.</p>`,
    [
      { label: adLabel(`x${CFG.bangAdMult} energía`), cls: 'secondary', keep: true,
        fn: () => showRewardedAd('bigbang', () => bigBang(pts * CFG.bangAdMult)) },
      { label: `💥 Big Bang (+${pts} ⚛️)`, cls: 'primary', fn: () => bigBang(pts) },
      labBtn,
      { label: 'Todavía no', cls: 'danger' },
    ]
  );
}

function bigBang(pts) {
  const keep = {};
  ['energy', 'bestLevel', 'gems', 'vip', 'feedbackAsked', 'lab', 'perks', 'packs', 'offerShown', 'owned', 'equipped', 'turboUntil', 'turboDay', 'boostUntil', 'lastSeen', 'lastDaily', 'adGems', 'stats'].forEach((k) => { keep[k] = S[k]; });
  keep.energy += pts;
  keep.doubleNext = false;
  Object.assign(S, newRun(1 + S.lab.drop), keep);
  S.stats.bigBangs++;
  track('big_bang', { pts, energy: S.energy, n: S.stats.bigBangs });
  save();

  const flash = document.createElement('div');
  flash.className = 'flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1200);
  [0, 90, 180, 270].forEach((ms, k) => setTimeout(() => beep(14 - k * 3), ms));
  buzz([30, 40, 60]);

  renderGrid();
  renderCollection();
  updateHUD();
  setTimeout(() => { toast(`⚛️ +${pts} de energía`); showLab(); }, 900);
}

function showLab() {
  const nextDrop = LEVELS[Math.min(dropBase(), LEVELS.length - 1)];
  const item = (k, icon, title, sub) => {
    const cost = labCost(k), maxed = labMaxed(k);
    return row('lab_' + k, icon, title, sub, maxed ? { label: 'MÁX', disabled: true } : {
      label: `⚛️ ${cost}`, disabled: S.energy < cost, fn: () => {
        if (S.energy < cost) return;
        S.energy -= cost;
        S.lab[k]++;
        track('lab', { k, level: S.lab[k] });
        beep(12); buzz(20);
        save(); renderGrid(); showLab();
      },
    });
  };
  const html = `<h2>🧪 Laboratorio cósmico</h2><div class="big">⚛️ ${S.energy}</div>
    <p class="muted">Mejoras permanentes: no se pierden con el Big Bang.</p>` +
    item('drop', '⬆️', 'Caída base', `Caen ${LEVELS[dropBase() - 1].e} → ${nextDrop.e} desde el arranque`) +
    item('mult', '💰', 'Ganancias x2', `Ahora x${fmt(labMult())} → x${fmt(labMult() * 2)}`) +
    item('offline', '🛰️', 'Más tiempo offline', `Ahora ${offlineHours()} h → ${offlineHours() + 1} h`);
  openModal(html, [{ label: 'Listo', cls: 'primary' }]);
}

// ---- Opinión de los testers ----
function showFeedback(trigger) {
  let stars = 0;
  track('feedback_shown', { trigger });
  openModal(
    `<h2>¿Qué te parece Cosmo Merge?</h2>
     <p class="muted">Es una versión de prueba: tu opinión decide qué cambia.</p>
     <div class="stars">${[1, 2, 3, 4, 5].map((n) => `<button class="star" data-n="${n}" aria-label="${n} estrellas">☆</button>`).join('')}</div>
     <textarea id="fbText" maxlength="500" placeholder="¿Qué te gustó? ¿Qué te aburrió o confundió? ¿Pagarías por algo?"></textarea>`,
    [
      { label: 'Enviar', cls: 'primary', fn: () => {
        const text = $('#fbText').value.trim();
        if (!stars && !text) return;
        track('feedback', { stars, text, trigger });
        flushAnalytics();
        toast('¡Gracias! 💜');
      } },
      { label: 'Ahora no', cls: 'danger' },
    ]
  );
  document.querySelectorAll('.star').forEach((b) => {
    b.onclick = () => {
      stars = +b.dataset.n;
      document.querySelectorAll('.star').forEach((x) => { x.textContent = +x.dataset.n <= stars ? '★' : '☆'; });
    };
  });
}

// ---- Instalar en el celular ----
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
window.addEventListener('appinstalled', () => track('installed'));
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function showSettings() {
  openModal(
    `<h2>Ajustes</h2>
     <p class="muted">Fusiones: ${S.stats.merges} · Videos: ${S.stats.ads}<br>
     Toques: ${S.stats.taps} · Días jugados: ${S.stats.days.length}<br>
     Big Bangs: ${S.stats.bigBangs} · Energía: ⚛️ ${S.energy} · Compras: ${S.stats.purchases}</p>
     ${!standalone() && !installPrompt && isIOS() ? '<p class="tip">📲 Para instalarlo: tocá <b>Compartir</b> y después <b>Agregar a inicio</b>.</p>' : ''}
     <p class="muted small">${CFG.testBuild ? 'Versión de prueba' : 'Versión'} ${CFG.version}. Se guardan datos anónimos de uso para mejorar el juego.</p>`,
    [
      installPrompt && !standalone() ? { label: '📲 Instalar en el celular', cls: 'small money big-btn', fn: async () => {
        installPrompt.prompt();
        const r = await installPrompt.userChoice;
        track('install_prompt', { outcome: r.outcome });
        installPrompt = null;
      } } : null,
      { label: '💬 Dar mi opinión', cls: 'secondary', keep: true, fn: () => showFeedback('settings') },
      { label: '🎨 Estilo', cls: 'secondary', keep: true, fn: showStyle },
      { label: 'Reiniciar progreso', cls: 'danger', fn: () => {
        if (!confirm('¿Seguro? Se borra todo el progreso.')) return;
        resetting = true;
        try { localStorage.removeItem(CFG.saveKey); } catch (e) { }
        location.reload();
      } },
      { label: 'Cerrar', cls: 'primary' },
    ].filter(Boolean)
  );
}

// ---- Arrastrar y soltar (mouse y touch) ----
let drag = null;
const cellAt = (x, y) => {
  const el = document.elementFromPoint(x, y);
  const cell = el && el.closest('.cell');
  return cell && isOpen(+cell.dataset.i) ? +cell.dataset.i : null;
};

gridEl.addEventListener('pointerdown', (e) => {
  initAudio();
  const cell = e.target.closest('.cell');
  if (!cell || drag) return;
  const i = +cell.dataset.i;
  if (!isOpen(i)) { showShop(); return; }
  if (!S.grid[i]) return;
  e.preventDefault();
  drag = { from: i, x: e.clientX, y: e.clientY, moved: false, ghost: null, over: null };
});

window.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (!drag.moved) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
    drag.moved = true;
    const src = gridEl.children[drag.from].querySelector('.item'), r = src.getBoundingClientRect();
    drag.ghost = src.cloneNode(true);
    drag.ghost.classList.add('ghost');
    drag.ghost.style.width = r.width + 'px';
    drag.ghost.style.height = r.height + 'px';
    document.body.appendChild(drag.ghost);
    renderGrid();
  }
  drag.ghost.style.left = e.clientX + 'px';
  drag.ghost.style.top = e.clientY + 'px';
  const t = cellAt(e.clientX, e.clientY);
  if (t !== drag.over) {
    if (drag.over != null && gridEl.children[drag.over]) gridEl.children[drag.over].classList.remove('over');
    drag.over = t;
    if (t != null && t !== drag.from) gridEl.children[t].classList.add('over');
  }
});

function endDrag(e, cancelled) {
  if (!drag) return;
  const d = drag;
  drag = null;
  if (d.ghost) d.ghost.remove();
  if (cancelled || !S.grid[d.from]) { renderGrid(); return; }
  if (!d.moved) { tapItem(d.from); return; }
  const t = cellAt(e.clientX, e.clientY);
  if (t != null && t !== d.from) moveOrMerge(d.from, t);
  else renderGrid();
}
window.addEventListener('pointerup', (e) => endDrag(e, false));
window.addEventListener('pointercancel', (e) => endDrag(e, true));

// ---- Botones ----
$('#buyBtn').addEventListener('click', () => { initAudio(); buy(); });
document.querySelectorAll('.upg').forEach((b) => b.addEventListener('click', () => { initAudio(); upgrade(b.dataset.u); }));
$('#boostBtn').addEventListener('click', () => {
  initAudio();
  if (boostActive()) return;
  showRewardedAd('boost', () => {
    S.boostUntil = Date.now() + CFG.boostSeconds * 1000;
    toast(`¡x${CFG.boostMult} activado por ${CFG.boostSeconds / 60} minutos!`);
    save();
  });
});
$('#settingsBtn').addEventListener('click', showSettings);
$('#bangBtn').addEventListener('click', () => { initAudio(); showBigBang(); });
$('#gemsBtn').addEventListener('click', () => { initAudio(); showShop(); });

// ---- Loop principal ----
let last = performance.now(), hudT = 0, robotT = 0, progressT = 0;
let lastReport = { merges: S.stats.merges, ads: S.stats.ads, taps: S.stats.taps };
function reportProgress() {
  const st = S.stats;
  track('progress', {
    merges: st.merges - lastReport.merges, ads: st.ads - lastReport.ads, taps: st.taps - lastReport.taps,
    max_level: S.maxLevel, energy: S.energy, coins_per_sec: Math.round(income()),
  });
  lastReport = { merges: st.merges, ads: st.ads, taps: st.taps };
}
function tick(now) {
  const dt = Math.min(1, (now - last) / 1000);
  last = now;
  earn(income() * dt);
  if (hasSpace()) {
    S.spawnT += dt;
    if (S.spawnT >= spawnInterval()) { S.spawnT = 0; spawn(spawnLevel()); }
  }
  if (robotOn()) {
    robotT += dt;
    if (robotT >= robotInterval()) { robotT = 0; robotMerge(); }
  }
  S.stats.playSecs += dt;
  progressT += dt;
  if (progressT >= 120) { progressT = 0; reportProgress(); }
  if (!S.feedbackAsked && S.stats.playSecs >= CFG.feedbackAfterMinutes * 60 && $('#modal').classList.contains('hidden') && !drag) {
    S.feedbackAsked = true;
    showFeedback('auto');
  }
  hudT += dt;
  if (hudT > 0.1) { hudT = 0; updateHUD(); }
  requestAnimationFrame(tick);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); reportProgress(); track('session_pause'); flushAnalytics(); }
  else { last = performance.now(); checkDaily(checkOffline()); }
});
setInterval(() => { if (!document.hidden) save(); }, 5000);

// ---- Inicio ----
if (!S.stats.days.includes(todayStr())) S.stats.days.push(todayStr());
S.stats.sessions++;
track('session_start', { session: S.stats.sessions, days: S.stats.days.length });

applyStyle(S.equipped);
renderGrid();
renderCollection();
renderHint();
updateHUD();
checkDaily(checkOffline());
requestAnimationFrame(tick);

// Atajos de prueba en la consola (game.give(1e6), game.giveGems(500)): solo en localhost o con ?debug en la URL.
if (location.hostname === 'localhost' || location.search.includes('debug')) window.game = { S, CFG, give, giveGems };

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js?v=' + CFG.version).catch(() => { /* sin modo offline, el juego anda igual */ });
}
