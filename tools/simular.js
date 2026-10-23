// Simulador de balance por días.
// Modela a una persona real: entra varias veces por día unos minutos, hace ~1 acción por
// segundo (fusionar o comprar), gana offline entre sesiones y hace Big Bang cuando le conviene.
// Lee CFG directamente de www/game.js, así que mide el balance real del juego.
//
// Uso:  node tools/simular.js
// Para probar otros valores sin tocar el juego:
//       CFG='{"buyGrowth":1.3}' node tools/simular.js

const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../www/game.js'), 'utf8');
const CFG = Object.assign(
  eval('(' + src.match(/const CFG = (\{[\s\S]*?\n\});/)[1] + ')'),
  JSON.parse(process.env.CFG || '{}')
);
const LEVELS_E = [...src.match(/const LEVELS = \[([\s\S]*?)\n\];/)[1].matchAll(/e: '([^']+)'/g)].map((m) => m[1]);
const LEVELS = LEVELS_E.length, CELLS = CFG.cols * CFG.rows;
const PLAYER = { sessionsPerDay: 4, sessionMinutes: [4, 8], actionsPerSec: 1, hoursBetween: [3, 7], days: 120 };
const TRIALS = 7; // cada perfil se simula varias veces con sesiones de duración variable y se toma la mediana

// Generador pseudoaleatorio con semilla, para que los resultados sean repetibles.
let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const between = ([a, b]) => a + rand() * (b - a);

// Perfiles de jugador: cuántos cristales consigue por día y con cuántos arranca.
// `packs` son los paquetes de compra única de CFG.packs que compra el día 1.
const withAds = CFG.gems.daily + CFG.gems.adReward * CFG.gems.adsPerDay;
const PROFILES = {
  'Gratis, sin videos': { gemsPerDay: CFG.gems.daily, startGems: 0, packs: [] },
  'Gratis, mira videos': { gemsPerDay: withAds, startGems: 0, packs: [] },
  'Paga USD 0.99 (inicial)': { gemsPerDay: withAds, startGems: 0, packs: ['starter'] },
  'Paga USD 5.98 (inicial + galáctico)': { gemsPerDay: withAds, startGems: 0, packs: ['starter', 'galactic'] },
  'Paga USD 20 (packs + 1200 💎 + VIP)': { gemsPerDay: withAds, startGems: 1200, packs: ['starter', 'galactic'], turbo: true },
  'Paga USD 50 (packs + 4800 💎)': { gemsPerDay: withAds, startGems: 4800, packs: ['starter', 'galactic'], turbo: true },
};

function simulate(profile, trial) {
  seed = 1 + trial * 7919;
  const P = { gems: profile.startGems, energy: 0, bestLevel: 1, perks: { robot: 0, space: 0, offlineRobot: 0 }, lab: { drop: 0, mult: 0, offline: 0 }, bangs: 0 };
  for (const id of profile.packs) {
    const g = CFG.packs[id].grants;
    P.gems += g.gems || 0;
    for (const k of ['robot', 'space', 'offlineRobot']) if (g[k]) P.perks[k] = Math.max(P.perks[k], g[k]);
  }
  let R;
  const freshRun = () => {
    const s = 1 + P.lab.drop;
    R = { coins: 20, grid: Array(CELLS).fill(0), maxLevel: s, runEarned: 0, upg: { speed: 0, spawn: 0, mult: 0 }, buys: {}, spawnT: 0, robotT: 0, stall: 0 };
    R.grid[0] = s; R.grid[1] = s;
  };
  freshRun();

  const cells = () => CFG.startCells + P.perks.space * CFG.cols;
  const inc = (l) => Math.pow(CFG.incomeBase, l - 1);
  const mult = () => Math.pow(CFG.multStep, R.upg.mult) * Math.pow(2, P.lab.mult);
  const spawnLvl = () => 1 + P.lab.drop + R.upg.spawn;
  const interval = () => Math.max(CFG.minSpawnInterval, CFG.spawnInterval * Math.pow(CFG.speedFactor, R.upg.speed));
  const price = () => inc(spawnLvl()) * CFG.buyBasePrice * Math.pow(CFG.buyGrowth, R.buys[spawnLvl()] || 0);
  const cost = (u) => CFG.upgCost[u][0] * Math.pow(CFG.upgCost[u][1], R.upg[u]);
  const maxed = (u) => (u === 'speed' ? interval() <= CFG.minSpawnInterval : u === 'spawn' ? R.upg.spawn >= CFG.runSpawnMax || spawnLvl() >= R.maxLevel - 1 : false);
  const income = () => R.grid.reduce((a, l) => (l ? a + inc(l) : a), 0) * mult();
  const put = (l) => { const i = R.grid.slice(0, cells()).indexOf(0); if (i < 0) return false; R.grid[i] = l; return true; };
  const points = () => (R.maxLevel < CFG.bangMinLevel ? 0 : Math.round(Math.pow(CFG.bangBase, R.maxLevel - CFG.bangMinLevel)));
  const mergeOne = () => {
    for (let l = 1; l < LEVELS; l++) {
      const idx = R.grid.flatMap((x, i) => (x === l ? [i] : []));
      if (idx.length >= 2) {
        R.grid[idx[0]] = l + 1; R.grid[idx[1]] = 0;
        if (l + 1 > R.maxLevel) R.maxLevel = l + 1;
        if (l + 1 > P.bestLevel) { P.bestLevel = l + 1; P.gems += CFG.gems.discovery; }
        return true;
      }
    }
    return false;
  };
  const buyPerks = () => {
    // Orden en que un jugador razonable compraría las ventajas.
    for (const k of ['space', 'robot', 'robot', 'offlineRobot', 'space', 'robot', 'robot']) {
      const list = CFG.shop[k].costs, n = P.perks[k];
      if (n < list.length && P.gems >= list[n]) { P.gems -= list[n]; P.perks[k]++; }
    }
  };
  const labCost = (k) => CFG.lab[k][0] * Math.pow(CFG.lab[k][1], P.lab[k]);
  const spendEnergy = () => {
    let bought = true;
    while (bought) {
      bought = false;
      const k = ['drop', 'mult', 'offline'].filter((k) => k !== 'offline' || P.lab.offline < CFG.lab.offlineMax).sort((a, b) => labCost(a) - labCost(b))[0];
      if (P.energy >= labCost(k)) { P.energy -= labCost(k); P.lab[k]++; bought = true; }
    }
  };

  const reached = {};
  for (let day = 1; day <= PLAYER.days; day++) {
    P.gems += profile.gemsPerDay;
    let turbosToday = 0;
    for (let s = 0; s < PLAYER.sessionsPerDay; s++) {
      buyPerks();
      let turbo = 0;
      const allPerks = ['robot', 'space', 'offlineRobot'].every((k) => P.perks[k] >= CFG.shop[k].costs.length);
      if (profile.turbo && allPerks && turbosToday < CFG.shop.turbo.perDay && P.gems >= CFG.shop.turbo.cost) {
        P.gems -= CFG.shop.turbo.cost; turbosToday++; turbo = CFG.shop.turbo.seconds;
      }
      const lvlBefore = R.maxLevel;
      for (let t = 0, len = Math.round(between(PLAYER.sessionMinutes) * 60); t < len; t++) {
        const g = income(); R.coins += g; R.runEarned += g;
        if (R.grid.slice(0, cells()).includes(0) && ++R.spawnT >= interval()) { R.spawnT = 0; put(spawnLvl()); }
        if (turbo > 0) { turbo--; for (let k = 0; k < 1 / CFG.shop.turbo.interval; k++) mergeOne(); }
        else if (P.perks.robot && ++R.robotT >= CFG.shop.robot.intervals[P.perks.robot - 1]) { R.robotT = 0; mergeOne(); }
        let acts = PLAYER.actionsPerSec;
        while (acts > 0 && mergeOne()) acts--;
        for (const u of ['mult', 'speed', 'spawn']) if (!maxed(u) && R.coins >= cost(u)) { R.coins -= cost(u); R.upg[u]++; }
        while (acts > 0 && R.coins >= price() && put(spawnLvl())) { R.coins -= price(); R.buys[spawnLvl()] = (R.buys[spawnLvl()] || 0) + 1; acts--; }
        if (!reached[P.bestLevel]) reached[P.bestLevel] = day;
      }
      const off = Math.round(Math.min(between(PLAYER.hoursBetween), CFG.offlineCapHours + P.lab.offline) * 3600);
      if (P.perks.offlineRobot && P.perks.robot) {
        // Con robot offline, el tablero sigue funcionando: caen objetos y el robot fusiona.
        for (let t = 0; t < off; t++) {
          const g = income() * CFG.offlineRate; R.coins += g; R.runEarned += g;
          if (t % CFG.offlineSpawnSeconds === 0) { put(spawnLvl()); while (mergeOne()); }
        }
      } else {
        const g = income() * off * CFG.offlineRate; R.coins += g; R.runEarned += g;
      }
      // Big Bang cuando la partida se estancó (2 sesiones sin nivel nuevo) y la energía alcanza para una mejora.
      R.stall = R.maxLevel > lvlBefore ? 0 : R.stall + 1;
      const cheapest = Math.min(...['drop', 'mult'].map(labCost));
      if (points() > 0 && R.stall >= 2 && P.energy + points() >= cheapest) {
        let pts = points();
        if (P.gems >= CFG.shop.doubleEnergy + 600) { P.gems -= CFG.shop.doubleEnergy; pts *= 2; } // el que paga duplica
        P.energy += pts; P.bangs++; spendEnergy(); freshRun();
      }
    }
    if (P.bestLevel >= LEVELS) break;
  }
  return { reached, P };
}

const median = (xs) => { const v = xs.filter((x) => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
for (const [name, profile] of Object.entries(PROFILES)) {
  const runs = Array.from({ length: TRIALS }, (_, k) => simulate(profile, k));
  const cells = [];
  for (let l = 7; l <= LEVELS; l++) {
    const d = median(runs.map((r) => r.reached[l]));
    cells.push(`${LEVELS_E[l - 1]} ${d ? 'día ' + d : '—'}`);
  }
  const all = runs.map((r) => r.reached[LEVELS] || '—').join(', ');
  console.log(`\n${name}`);
  console.log('  ' + cells.join(' · '));
  console.log(`  universo completo en cada simulación: ${all}`);
}
