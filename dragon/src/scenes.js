// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — scenes (Phaser engine phaser-1.10.0)
// Two showcase levels of the Dragonlance platformer, fully RD-arted:
//   L1 "The Arena" (castle) — the exam duel: fight goblins + a knight, then the
//      rival noble Bakaris (who concedes). Party of 5 with live swap (Tab / 1-5).
//   L2 "When the Home Burns" (ruins) — draconian ambush, then KANSALDI, the red
//      dragon: an unwinnable fire finale you SURVIVE (scripted escape → victory).
// Nesta's fox + Nick's skeleton familiar trail the party.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const HERO_DEFS = {
  kote:    ['Kote', '#40aa88'],
  minerva: ['Minerva', '#cc44cc'],
  elber:   ['Elber', '#44aa44'],
  nesta:   ['Nesta', '#4488cc'],
  nick:    ['Nick', '#d0a066'],
};
const PARTY = ['kote', 'minerva', 'elber', 'nesta', 'nick'];

// Tint the engine tile rects when NOT using tile textures is not needed here (we set
// this.tileTextures per scene). A soft ground-contact blend under the world tiles.
function groundBlend(scene, ground, W, H) {
  const surfaceY = (H - 3) * 16;
  const g = scene.add.graphics().setScrollFactor(1, 1).setDepth(-3);
  for (let i = 0; i < 14; i++) { g.fillStyle(ground, 0.7 * Math.pow(1 - i / 14, 1.5)); g.fillRect(0, surfaceY - (i + 1) * 2 - 1, W * 16, 2.4); }
}

// ─── FAMILIARS — Nesta's black fox + Nick's little skeleton (Arturito). RD sprites
// if present, else a small drawn shape. Trail the active hero and bob. ───
class Familiar extends FollowFamiliar {
  build(scene) {
    const key = this._key;
    if (key && scene.textures.exists(key)) {
      const s = scene.add.image(0, 0, key).setOrigin(0.5, 0.9);
      s.setScale(this._scale || (24 / s.height));
      this.go.add(s);
    } else {
      const g = scene.add.graphics();
      g.fillStyle(this._col || 0x222222, 1).fillEllipse(0, -6, 20, 11);
      g.fillStyle(this._col || 0x222222, 1).fillEllipse(9, -11, 8, 7);
      this.go.add(g);
    }
  }
}
class Fox extends Familiar { }      Fox.prototype._key = 'pet_fox';       Fox.prototype._col = 0x2a2a2a;
class Skeleton extends Familiar { } Skeleton.prototype._key = 'pet_skeleton'; Skeleton.prototype._col = 0xe0e0e0;

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 1 — THE ARENA (castle). music `castle`. RD backdrop bg_arena, castle tiles.
// ═══════════════════════════════════════════════════════════════════════════
class Level1 extends GameScene {
  constructor() {
    super('level1'); this.musicTheme = 'castle'; this.bgImage = 'bg_arena'; this.bgBot = 0x101830;
    this.tileTextures = { 1: 'tile_castle', 2: 'tile_castle', 3: 'tile_castle', 5: 'tile_castle' };
  }
  enter() { this.bAct1(); }

  _familiars(gy) {
    this.fox = new Fox(this, 6 * 16, gy, { offsetX: 40, offsetY: 2, depth: 2 });
    this.skel = new Skeleton(this, 4 * 16, gy, { offsetX: 52, offsetY: 2, depth: 2 });
  }

  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(100, buildArenaA1);
    groundBlend(this, 0x1a1420, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(14 * 16, gy, PARTY);
    this.spawnEnemies([
      new Enemy(this, 40 * 16, gy, 28, 60, 'Goblin', '#4a8a4a', EHP.goblin, 8, 'patrol', 'goblin'),
      new Enemy(this, 54 * 16, gy, 28, 60, 'Goblin', '#4a8a4a', EHP.goblin, 8, 'chase', 'goblin'),
      new Enemy(this, 70 * 16, gy, 30, 62, 'Knight', '#8a8f98', EHP.knight, 11, 'patrol', 'knight'),
      new Enemy(this, 84 * 16, gy, 28, 60, 'Goblin', '#4a8a4a', EHP.goblin, 8, 'chase', 'goblin'),
    ]);
    this._familiars(gy); this._won = false; this.live = false;
    this.setHint('l1a1_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l1a1_1'), d('kote', 'l1a1_2'), d('narrator', 'l1a1_tut'), d('minerva', 'l1a1_3')], () => { this.live = true; });
  }

  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(96, buildArenaA2);
    groundBlend(this, 0x1a1420, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(12 * 16, gy, PARTY);
    this.bakaris = new Enemy(this, 70 * 16, gy, 30, 62, 'Bakaris', '#c8a848', EHP.miniboss, 12, 'boss', 'bakaris');
    this.bakaris.setFlipX(true); this.bakaris.spd = 0.7;
    this.spawnEnemies([this.bakaris]);
    this.taunts = new BossTaunts(this, { boss: this.bakaris, enterKey: 'l1_bak_enter', lines: ['l1_bak_1', 'l1_bak_2', 'l1_bak_3'], interval: 3.0, color: '#ffd98a' });
    this._familiars(gy); this._conceded = false;
    this.setHint('l1a2_hint');
    if (retry) return;
    this.say([d('narrator', 'l1a2_1'), d('bakaris', 'l1a2_2')], () => { });
  }

  step(dt) {
    if (this.fox) this.fox.update(dt, this.heroes[this.ai]);
    if (this.skel) this.skel.update(dt, this.heroes[this.ai]);
    if (this.act === 1) {
      if (this.live && !this._won && this.enemiesAllDead()) { this._won = true; this.act = -1; this.say([d('narrator', 'l1a1_win')], () => this.bAct2()); }
    } else if (this.act === 2) {
      const b = this.bakaris; if (!b) return;
      if (!this._conceded && b.on && b.hp <= b.mhp * 0.3) {
        this._conceded = true; b.inv = 9999; b.ai = 'static'; b._aiOrig = 'static'; b.dmg = 0; if (b.body) b.body.setVelocity(0, 0);
        this.say([d('narrator', 'l1a2_concede_1'), d('bakaris', 'l1a2_concede_2'), d('narrator', 'l1a2_concede_3')], () => { this.act = -1; this.nextLevel('level2'); });
        return;
      }
      if (this._conceded) return;
      this.taunts.update(dt);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 2 — WHEN THE HOME BURNS (ruins). music `boss`. RD backdrop bg_ruins.
// A1 draconian ambush → A2 KANSALDI the red dragon (survive-the-fire finale).
// ═══════════════════════════════════════════════════════════════════════════
class Level2 extends GameScene {
  constructor() {
    super('level2'); this.musicTheme = 'boss'; this.bgImage = 'bg_ruins'; this.bgBot = 0x2a0e08;
    this.tileTextures = { 1: 'tile_ruins', 2: 'tile_ruins', 3: 'tile_ruins', 5: 'tile_ruins' };
  }
  enter() { this.bAct1(); }
  _familiars(gy) {
    this.fox = new Fox(this, 6 * 16, gy, { offsetX: 40, offsetY: 2, depth: 2 });
    this.skel = new Skeleton(this, 4 * 16, gy, { offsetX: 52, offsetY: 2, depth: 2 });
  }

  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(100, buildRuinsA1);
    groundBlend(this, 0x2a1008, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(12 * 16, gy, PARTY);
    this.spawnEnemies([
      new Enemy(this, 40 * 16, gy, 28, 60, 'Draconian', '#6a8844', EHP.draconian, 12, 'chase', 'draconian'),
      new Enemy(this, 58 * 16, gy, 28, 60, 'Draconian', '#6a8844', EHP.draconian, 12, 'patrol', 'draconian'),
      new Enemy(this, 76 * 16, gy, 28, 60, 'Draconian', '#6a8844', EHP.draconian, 12, 'chase', 'draconian'),
    ]);
    this._familiars(gy); this._won = false; this.live = false;
    this.setHint('l2a1_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l2a1_1'), d('nesta', 'l2a1_2')], () => { this.live = true; });
  }

  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(96, buildDragonArena);
    groundBlend(this, 0x2a1008, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(10 * 16, gy, PARTY);
    this.dragon = new Enemy(this, 74 * 16, gy - 40, 96, 84, 'Kansaldi', '#8a1a1a', EHP.boss, 16, 'boss', 'kansaldi');
    this.dragon.setFlipX(false); this.dragon.spd = 0.45;
    this.spawnEnemies([this.dragon]);
    this.taunts = new BossTaunts(this, { boss: this.dragon, enterKey: 'l2_dragon_enter', lines: ['l2_dragon_1', 'l2_dragon_2', 'l2_dragon_3'], interval: 2.6, color: '#ff8844' });
    this._familiars(gy); this._escaped = false; this._t = 0;
    this.setHint('l2a2_hint');
    if (retry) return;
    this.say([d('narrator', 'l2a2_1'), d('kote', 'l2a2_2')], () => { });
  }

  bAct3(retry) {   // the escape / survival finale — no dragon; the party flees, victory
    this.beginAct(3);
    const { W, H } = this.buildMap(64, buildDragonArena);
    groundBlend(this, 0x2a1008, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(18 * 16, gy, PARTY);
    this.spawnEnemies([]); this._familiars(gy);
    this.musicTheme = 'castle'; Music.play('castle');
    FX.burst(this, 22 * 16, (H - 9) * 16, { count: 30, tint: [0xff8844, 0xffcc66, 0xffffff] });
    this.setHint('l2a3_hint');
    this.say([
      d('narrator', 'l2a3_1'), d('nick', 'l2a3_2'), d('narrator', 'l2a3_3'),
      d('minerva', 'l2a3_4'), d('narrator', 'l2a3_5'),
    ], () => {
      FX.burst(this, 22 * 16, (H - 9) * 16, { count: 50, tint: [0xffcc66, 0xffffff, 0x8ab4d4] });
      const h = this.heroes[this.ai]; if (h && h.body) { h.body.setAllowGravity(false); h.body.setVelocity(0, 0); }
      this.tweens.add({ targets: h, y: h.y - 30, duration: 1200, ease: 'Quad.out' });
      G.victory();
    });
  }

  step(dt) {
    if (this.fox) this.fox.update(dt, this.heroes[this.ai]);
    if (this.skel) this.skel.update(dt, this.heroes[this.ai]);
    if (this.act === 1) {
      if (this.live && !this._won && this.enemiesAllDead()) { this._won = true; this.act = -1; this.say([d('narrator', 'l2a1_win')], () => this.bAct2()); }
    } else if (this.act === 2) {
      const b = this.dragon; if (!b) return;
      this._t += dt;
      // survive-the-dragon: whittle her below 55% OR hold out ~22s → she unleashes the
      // fire and the party FLEES (she's unbeatable, but you survive) → escape act.
      if (!this._escaped && b.on && (b.hp <= b.mhp * 0.55 || this._t > 22)) {
        this._escaped = true; b.inv = 9999; b.dmg = 0; b.ai = 'static'; b._aiOrig = 'static'; if (b.body) b.body.setVelocity(0, 0);
        FX.burst(this, b.x, b.y, { count: 40, tint: [0xff5522, 0xff8844, 0xffcc44] });
        this.say([d('narrator', 'l2a2_flee_1'), d('kansaldi', 'l2a2_flee_2'), d('narrator', 'l2a2_flee_3')], () => { this.act = -1; this.bAct3(); });
        return;
      }
      if (this._escaped) return;
      this.taunts.update(dt);
    }
  }
}

const GAME_LEVELS = [
  { nameKey: 'lvl1', key: 'level1', cls: Level1, music: 'castle' },
  { nameKey: 'lvl2', key: 'level2', cls: Level2, music: 'boss' },
];
