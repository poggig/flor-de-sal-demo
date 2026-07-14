// ═══════════════════════════════════════════════════════════════════════════
// FLOR DE SAL — scenes
// A personalized mini-game made for Guida. Heroes/boss (Guida / Teo / Senhor
// Bento) + painted backdrops (each scene sets its own) + Feijao the goat.
//   · L1 — the shop: water the wilted plants → shoo the aphids → give the last bunch.
//   · L2 — the garden: cross the beds to Joaquim's fig tree → shoo the beetles off
//     the dahlias + coax Feijao back.
//   · L3 — the plaza: a warm stand-off with Senhor Bento, who always concedes (he
//     never loses) → the retirement party + a heartfelt message + Feijao in a
//     flower crown → victory.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

// display name (falls back to the strings speaker key) + HUD color per hero type
const HERO_DEFS = {
  guida: ['Guida', '#6a8f6a'],
  teo:   ['Teo', '#3f5f8f'],
};

// Recolor the engine default tile rects to match each RD backdrop so the collision
// floor/ledges read as part of the painted scene (game-side; the engine draws solid
// v=1 as 0x44506a, decor v=2 as 0x3a3a5a, one-way v=3 as 0x6a5a3a). Called after
// buildMap. bgBot-warm ground + a lighter ledge/plat tone per level.
function tintGround(scene, ground, plat, W, H) {
  (scene.solidList || []).forEach(r => {
    if (typeof r.setFillStyle !== 'function') return;
    const c = r.fillColor;
    if (c === 0x44506a || c === 0x3a3a5a) r.setFillStyle(ground);
    else if (c === 0x6a5a3a) r.setFillStyle(plat);
    if (typeof r.setStrokeStyle === 'function') r.setStrokeStyle(1, 0x1a1410, 0.5);
  });
  if (W && H) blendGround(scene, ground, W, H);
}

// ─── FEIJAO — the goat, a follow-familiar loaded from the RD sprite (NOT drawn
// shapes). Trails the controlled hero and bobs (the FollowFamiliar bob). No physics
// body, never triggers enemies. `crown` draws a little marigold flower-crown for the
// finale. Graceful: if the texture is missing it falls back to a small drawn body. ───
class Feijao extends FollowFamiliar {
  build(scene) {
    if (scene.textures.exists('pet_feijao')) {
      const s = scene.add.image(0, 0, 'pet_feijao').setOrigin(0.5, 0.9);
      s.setScale(26 / s.height);              // ~26 px tall goat, native aspect
      if (this._flip) s.setFlipX(true);
      this.go.add(s);
      if (this._crown) {                      // a marigold flower-crown for the party
        const g = scene.add.graphics();
        for (let i = -6; i <= 6; i += 4) g.fillStyle(0xe8a33d, 1).fillCircle(i, -22, 2);
        this.go.add(g);
      }
    } else {
      const g = scene.add.graphics();
      g.fillStyle(0xbfa07a, 1).fillEllipse(0, -6, 22, 12);
      g.fillStyle(0xbfa07a, 1).fillEllipse(10, -12, 9, 8);
      g.fillStyle(0x161616, 1).fillCircle(13, -13, 1.5);
      this.go.add(g);
    }
  }
}

// Soften the seam where the flat collision floor meets the painted RD backdrop
// (visual-QA nit): a soft vertical haze in the ground color, opaque at the walk
// surface and fading UP into the scene over ~28px, so the backdrop dissolves into
// the floor instead of a hard color line. Decorative only (depth -5: over the
// backdrop, behind the tiles + actors). Moves with the world (scrollFactor 1).
function blendGround(scene, ground, W, H) {
  const surfaceY = (H - 3) * T;
  const g = scene.add.graphics().setScrollFactor(1, 1).setDepth(-5);
  const N = 15;
  for (let i = 0; i < N; i++) {
    const a = 0.82 * Math.pow(1 - i / N, 1.5);
    g.fillStyle(ground, a);
    g.fillRect(0, surfaceY - (i + 1) * 2 - 1, W * T, 2.4);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 1 — FLOR DE SAL (the shop). RD backdrop bg_shop. Party = [guida, teo] with
// live hero-swap (Tab / 1-2) — Teo helps in the shop. music `library` (calm, warm).
// ═══════════════════════════════════════════════════════════════════════════
class Level1 extends GameScene {
  constructor() { super('level1'); this.musicTheme = 'library'; this.bgImage = 'bg_shop'; this._gc = 0x5a3d28; this._pc = 0x71492c; this.bgBot = 0x3a2418; }
  enter() { this.bAct1(); }

  // A1 — the tutorial: reach the wilted plants and water them (static "wilt" targets
  // → Guida's held marigold-scatter reads). Guida parked STILL after the intro so her
  // idle-breath clip plays. → enemiesAllDead → A2.
  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(90, buildShopA1);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(16 * T, gy, ['guida', 'teo']);
    const w1 = new Enemy(this, 30 * T, gy, 18, 22, Lang.t('narrator'), '#8a9a6a', EHP.wilt, 0, 'static', 'wilt');
    const w2 = new Enemy(this, 50 * T, gy, 18, 22, Lang.t('narrator'), '#8a9a6a', EHP.wilt, 0, 'static', 'wilt');
    const w3 = new Enemy(this, 70 * T, gy, 18, 22, Lang.t('narrator'), '#8a9a6a', EHP.wilt, 0, 'static', 'wilt');
    this.spawnEnemies([w1, w2, w3]);
    this._won = false; this.live = false;
    this.setHint('l1a1_hint');
    if (retry) { this.live = true; return; }
    this.say([
      d('narrator', 'l1a1_1'), d('teo', 'l1a1_2'), d('narrator', 'l1a1_tut'),
      d('guida', 'l1a1_3'), d('teo', 'l1a1_4'),
    ], () => { this.live = true; });
  }

  // A2 — closing time: shoo the aphids that got in among the buckets, then give the
  // last bunch away free → nextLevel('level2').
  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(90, buildShopA2);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(14 * T, gy, ['guida', 'teo']);
    const a1 = new Enemy(this, 34 * T, gy, 16, 18, Lang.t('narrator'), '#7ba05a', EHP.aphid, 3, 'static', 'aphid');
    const a2 = new Enemy(this, 50 * T, gy, 16, 18, Lang.t('narrator'), '#7ba05a', EHP.aphid, 3, 'static', 'aphid');
    const a3 = new Enemy(this, 66 * T, gy, 16, 18, Lang.t('narrator'), '#7ba05a', EHP.aphid, 3, 'static', 'aphid');
    [a1, a2, a3].forEach(e => e.spd = 0.5);
    this.spawnEnemies([a1, a2, a3]);
    this._won = false; this.live = false;
    this.setHint('l1a2_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l1a2_1'), d('guida', 'l1a2_2')], () => { this.live = true; });
  }

  step(dt) {
    if (this.act === 1) {
      if (this.live && !this._won && this.enemiesAllDead()) {
        this._won = true; this.act = -1;
        this.say([d('narrator', 'l1a1_win'), d('guida', 'l1a1_win2')], () => this.bAct2());
      }
    } else if (this.act === 2) {
      if (this.live && !this._won && this.enemiesAllDead()) {
        this._won = true; this.act = -1;
        this.say([d('narrator', 'l1a2_win'), d('guida', 'l1a2_win2')], () => this.nextLevel('level2'));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 2 — O JARDIM (the community garden, golden hour). RD backdrop bg_garden.
// Party = [guida] (Teo tends the shop). Feijao the goat bobs along. music `castle`.
//  A1 = cross the raised beds to Joaquim's fig tree (POSITIONAL win).
//  A2 = shoo the beetles off the prize dahlias, coax Feijao back → level3.
// ═══════════════════════════════════════════════════════════════════════════
class Level2 extends GameScene {
  constructor() { super('level2'); this.musicTheme = 'castle'; this.bgImage = 'bg_garden'; this._gc = 0x6a5236; this._pc = 0x7c6142; this.bgBot = 0x8a5a2a; }
  enter() { this.bAct1(); }

  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(110, buildGardenA1);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(8 * T, gy, ['guida']);
    this.spawnEnemies([]);
    this.feijao = new Feijao(this, 4 * T, gy, { nameKey: 'feijao', offsetX: 34, offsetY: 2, depth: 2 });
    this._won = false; this._winX = (W - 12) * T;
    this.setHint('l2a1_hint');
    if (retry) return;
    this.say([d('narrator', 'l2a1_1'), d('guida', 'l2a1_2')], () => { });
  }

  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(100, buildGardenA2);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(10 * T, gy, ['guida']);
    const b1 = new Enemy(this, 40 * T, gy, 18, 18, Lang.t('narrator'), '#4a3f38', EHP.beetle, 3, 'static', 'beetle');
    const b2 = new Enemy(this, 58 * T, gy, 18, 18, Lang.t('narrator'), '#4a3f38', EHP.beetle, 3, 'static', 'beetle');
    [b1, b2].forEach(e => e.spd = 0.5);
    this.spawnEnemies([b1, b2]);
    this.feijao = new Feijao(this, 36 * T, gy, { nameKey: 'feijao', offsetX: 30, offsetY: 2, depth: 2 });
    this._won = false; this.live = false;
    this.setHint('l2a2_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l2a2_1'), d('guida', 'l2a2_2')], () => { this.live = true; });
  }

  step(dt) {
    if (this.feijao) this.feijao.update(dt, this.heroes[this.ai]);
    const h = this.heroes[this.ai];
    if (this.act === 1) {
      if (!this._won && h.x > this._winX) {
        this._won = true; this.act = -1;
        this.say([d('narrator', 'l2a1_win'), d('guida', 'l2a1_win2')], () => this.bAct2());
      }
    } else if (this.act === 2) {
      if (this.live && !this._won && this.enemiesAllDead()) {
        this._won = true; this.act = -1;
        this.say([d('narrator', 'l2a2_win'), d('guida', 'l2a2_win2')], () => this.nextLevel('level3'));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 3 — A PRACA (the town plaza at dusk). RD backdrop bg_plaza. The retirement
// party. EXACTLY three acts (the boss fight is ONE act): A1 banter (Bento static) ·
// A2 the affectionate at-bat with a THRESHOLD-CONCEDE so Bento NEVER dies · A3 the
// party + Ines's VERBATIM message + Feijao in a flower crown → G.victory().
// music `boss` for A1-A2, then `castle` for the warm A3 carry-off.
// ═══════════════════════════════════════════════════════════════════════════
class Level3 extends GameScene {
  constructor() { super('level3'); this.musicTheme = 'boss'; this.bgImage = 'bg_plaza'; this._gc = 0x6a4a3c; this._pc = 0x7a5a48; this.bgBot = 0x241830; }
  enter() { this.bAct1(); }

  // A1 — arrival / banter cutscene. Senhor Bento blocks the plaza with his citation
  // book ("You can't set up flowers here without a permit!"). He stands as a
  // decorative static enemy (dmg 0) — NOT the boss entity.
  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(96, buildPlazaArena);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(14 * T, gy, ['guida']);
    const stand = new Enemy(this, 66 * T, gy, 24, 36, Lang.t('bento'), '#565b66', EHP.miniboss, 0, 'static', 'bento');
    stand.setFlipX(true);
    this.spawnEnemies([stand]);
    this._done = false;
    this.setHint('l3a1_hint');
    this.say([
      d('narrator', 'l3a1_1'), d('bento', 'l3a1_2'), d('guida', 'l3a1_3'),
      d('narrator', 'l3a1_4'), d('bento', 'l3a1_5'),
    ], () => { this._done = true; });
  }

  // A2 — THE affectionate at-bat, one act, one Bento entity. Phase 1 → engine
  // auto-sets _phase2 at hp≤50% → BossTaunts scheduler posts his good-natured jabs →
  // THRESHOLD-CONCEDE at hp≤30% (he freezes invulnerable + harmless above hp 0, lowers
  // the book, pulls out marigolds — ALL in A2 while he's present) → bAct3().
  // He NEVER reaches hp 0 (EHP.boss=180 → threshold 54 > Guida's max single hit 48).
  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(96, buildPlazaArena);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(14 * T, gy, ['guida']);
    this.bento = new Enemy(this, 66 * T, gy, 24, 36, Lang.t('bento'), '#565b66', EHP.boss, 5, 'boss', 'bento');
    this.bento.setFlipX(true);
    this.bento.spd = 0.5;                          // unhurried, dignified pace
    this.spawnEnemies([this.bento]);
    this.taunts = new BossTaunts(this, {
      boss: this.bento, enterKey: 'l3_bento_enter',
      lines: ['l3_bento_1', 'l3_bento_2', 'l3_bento_3'], interval: 2.8, color: '#e8c8a0',
    });
    this._conceded = false;
    this.setHint('l3a2_hint');
    if (retry) return;
    this.say([d('narrator', 'l3a2_1'), d('guida', 'l3a2_2')], () => { });
  }

  // A3 — the retirement party finale (NO Bento — conceded in A2). Dona Rosa cheers,
  // Teo takes the shop keys, Feijao runs in wearing a marigold crown, Ines's VERBATIM
  // message lands here and ONLY here (surprise-preserve), the street lifts Guida on a
  // slow rise tween, confetti → G.victory(). music → `castle` (warm, resolved).
  bAct3(retry) {
    this.beginAct(3);
    const { W, H } = this.buildMap(72, buildPlazaFinale);
    tintGround(this, this._gc, this._pc, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(20 * T, gy, ['guida']);
    this.spawnEnemies([]);
    this.feijao = new Feijao(this, 12 * T, gy, { nameKey: 'feijao', offsetX: 28, offsetY: 2, depth: 2, crown: true });
    this.musicTheme = 'castle'; Music.play('castle');
    const cx = 22 * T, cy = (H - 10) * T;
    FX.burst(this, cx, cy, { count: 26, tint: [0xe8a33d, 0xffffff, 0x6a8f6a] });
    this.setHint('l3a3_hint');
    this.say([
      d('narrator', 'l3a3_1'), d('rosa', 'l3a3_2'), d('teo', 'l3a3_3'),
      d('narrator', 'l3a3_4'), d(null, 'l3a3_ines'), d('guida', 'l3a3_5'),
      d('narrator', 'l3a3_6'),
    ], () => {
      FX.burst(this, cx, cy, { count: 60, tint: [0xe8a33d, 0xffffff, 0x6a8f6a] });
      FX.burst(this, cx + 8 * T, cy - T, { count: 40, tint: [0xf0d060, 0xffffff, 0xe88a3a] });
      const h = this.heroes[this.ai];
      if (h && h.body) { h.body.setAllowGravity(false); h.body.setVelocity(0, 0); }
      this.tweens.add({ targets: h, y: h.y - 38, duration: 1200, ease: 'Quad.out' });
      G.victory();
    });
  }

  // Crown Feijao when the party begins (a marigold flower-crown, raw #6).
  _crownFeijao() { /* the crown is drawn in Feijao.build via the {crown:true} option */ }

  step(dt) {
    if (this.feijao) this.feijao.update(dt, this.heroes[this.ai]);
    if (this.act === 1) {
      if (this._done) { this._done = false; this.act = -1; this.bAct2(); }
    } else if (this.act === 2) {
      const b = this.bento;
      if (!b) return;
      // THRESHOLD-CONCEDE — Bento must NEVER die (D29). At hp≤30% freeze him
      // invulnerable + harmless above hp 0, stop the taunts, warm concede → A3.
      if (!this._conceded && b.on && b.hp <= b.mhp * 0.3) {
        this._conceded = true;
        b.inv = 9999; b.ai = 'static'; b._aiOrig = 'static'; b.dmg = 0;
        if (b.body) b.body.setVelocity(0, 0);
        this.say([
          d('narrator', 'l3a2_concede_1'), d('bento', 'l3a2_concede_2'),
          d('bento', 'l3a2_concede_3'), d('narrator', 'l3a2_concede_4'),
        ], () => { this.act = -1; this.bAct3(); });
        return;
      }
      if (this._conceded) return;
      this.taunts.update(dt);
    }
  }
}

// ─── LEVEL REGISTRY — the title builds one button per entry. ───
const GAME_LEVELS = [
  { nameKey: 'lvl1', key: 'level1', cls: Level1, music: 'library' },
  { nameKey: 'lvl2', key: 'level2', cls: Level2, music: 'castle' },
  { nameKey: 'lvl3', key: 'level3', cls: Level3, music: 'boss' },
];
