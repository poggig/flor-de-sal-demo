// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — LEVEL 2 "Kingfisher Festival" (Phaser phaser-1.12.0)
// A faithful 4-act port of the original Lv2. Nesta sits this level out → PARTY4
// (her black fox familiar auto-hides). Acts:
//   A1 RIVER AMBUSH   — underwater swim combat vs 4 Darkmantles under a 90s AIR
//                       gauge; a Darkmantle's first hit punches a darkness pool.
//   A2 THE FESTIVAL   — a village social walk: chat with the Mayor + Ispin, then
//                       walk east to leave the festival.
//   A3 FISHING        — a 3-round timing-bar fishing minigame (tightening zones).
//   A4 SHADOW ON ROAD — the Draconian Kapak miniboss + 4 scouts → Level 3.
// Extends DragonScene (scenes-base.js): familiars / walk-gate / talk-NPCs /
// darkness zones / air gauge / fishing all come from the shared base.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

class Level2 extends DragonScene {
  constructor() {
    super('level2');
    this.musicTheme = 'underwater';
    this.bgImage = 'bg_river';
    this.bgBot = 0x08182c;
    this.tileTextures = { 1: 'tile_castle', 2: 'tile_castle', 3: 'tile_castle', 5: 'tile_castle' };
  }
  enter() { this.bAct1(); }

  // ── ACT 1 — RIVER AMBUSH (underwater combat + AIR gauge + darkness) ──
  bAct1(retry) {
    this.beginAct(1);
    this.bgImage = 'bg_river'; this.bgBot = 0x08182c;
    this.tileTextures = { 1: 'tile_castle', 2: 'tile_castle', 3: 'tile_castle', 5: 'tile_castle' };
    const { W, H } = this.buildMap(300, buildUnderwaterArena);
    const gy = (H - 4) * 16;
    this.spawnParty(40, (H - 9) * 16, PARTY4);
    this.enterSwim();                       // buoyant Arcade swim (opt-in, after spawnParty)
    this.spawnEnemies([
      new Enemy(this, 800,  (H - 5) * 16, 20, 24, 'Darkmantle', '#334455', EHP.soldier, 17, 'chase',  'darkmantle'),
      new Enemy(this, 1000, (H - 8) * 16, 20, 24, 'Darkmantle', '#334455', EHP.soldier, 17, 'patrol', 'darkmantle'),
      new Enemy(this, 1300, (H - 9) * 16, 20, 24, 'Darkmantle', '#334455', EHP.soldier, 20, 'chase',  'darkmantle'),
      new Enemy(this, 1760, (H - 8) * 16, 20, 24, 'Darkmantle', '#442266', EHP.soldier, 17, 'static', 'darkmantle'),
    ]);
    this.enemies.forEach(e => { e.spd = 0.9; });
    this.spawnDarkZones();                  // arm each darkmantle's one-shot light-hole
    this.startAir(90);                      // 90s oxygen → 0 = total party wipe
    this.familiars(gy);
    this.setHint('l2a1_hint');
    this.live = false;
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l2a1_1'), d('kote', 'l2a1_2'), d('narrator', 'l2a1_3'), d('narrator', 'l2a1_4')], () => { this.live = true; });
  }

  // ── ACT 2 — THE FESTIVAL (village social walk) ──
  bAct2(retry) {
    this.beginAct(2);
    this.bgImage = 'bg_festival'; this.bgBot = 0x14101e;
    this.tileTextures = { 1: 'tile_garden', 2: 'tile_garden', 3: 'tile_garden', 5: 'tile_garden' };
    const { W, H } = this.buildMap(300, buildGardenPath);
    this.groundBlend(0x1a2414, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(50, gy, PARTY4);
    this.spawnEnemies([]);
    this._festNPCs = [
      { x: 800,  name: 'Mayor', lines: ['l2a2_mayor'] },
      { x: 1000, name: 'Ispin', lines: ['l2a2_ispin'] },
    ];
    this.familiars(gy);
    this.setHint('l2a2_hint');
  }

  // ── ACT 3 — FISHING MINIGAME (3 timing-bar rounds) ──
  bAct3(retry) {
    this.beginAct(3);
    this.bgImage = 'bg_festival'; this.bgBot = 0x14101e;
    this.tileTextures = { 1: 'tile_garden', 2: 'tile_garden', 3: 'tile_garden', 5: 'tile_garden' };
    const { W, H } = this.buildMap(300, buildGardenPath);
    this.groundBlend(0x1a2414, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(50, gy, PARTY4);
    this.spawnEnemies([]);
    this.familiars(gy);
    this.setHint('l2a3_hint');
    this.live = false;
    if (retry) { this.fishing(() => this.bAct4()); return; }
    this.say([d('narrator', 'l2a3_1'), d('narrator', 'l2a3_2')], () => { this.fishing(() => this.bAct4()); });
  }

  // ── ACT 4 — SHADOW ON THE ROAD (Draconian Kapak miniboss) ──
  bAct4(retry) {
    this.beginAct(4);
    this.bgImage = 'bg_festival'; this.bgBot = 0x14101e;
    this.tileTextures = { 1: 'tile_garden', 2: 'tile_garden', 3: 'tile_garden', 5: 'tile_garden' };
    this.musicTheme = 'library'; Music.play('library');
    const { W, H } = this.buildMap(300, buildGardenPath);
    this.groundBlend(0x1a2414, W, H);
    const gy = (H - 4) * 16;
    this.spawnParty(50, gy, PARTY4);
    const kapak = new Enemy(this, 1000, gy, 28, 56, 'Draconian Kapak', '#4a6622', EHP.miniboss, 20, 'boss', 'draconian_kapak');
    kapak.setFlipX(true); kapak.spd = 0.9;
    this.spawnEnemies([
      kapak,
      new Enemy(this, 1200, gy, 24, 36, 'Draconian Scout', '#6a8844', EHP.soldier, 12, 'chase',  'draconian'),
      new Enemy(this, 1800, gy, 24, 36, 'Draconian Scout', '#6a8844', EHP.soldier, 12, 'patrol', 'draconian'),
      new Enemy(this, 2400, gy, 24, 36, 'Draconian Scout', '#6a8844', EHP.soldier, 12, 'chase',  'draconian'),
      new Enemy(this, 3200, gy, 24, 36, 'Draconian Scout', '#6a8844', EHP.soldier, 12, 'patrol', 'draconian'),
    ]);
    this.familiars(gy);
    this.setHint('l2a4_hint');
    this.live = false;
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l2a4_1'), d('narrator', 'l2a4_2'), d('narrator', 'l2a4_3')], () => { this.live = true; });
  }

  // ── PER-FRAME ACT LOGIC ──
  step(dt) {
    this.updateFamiliars(dt);
    if (this.act === 1) {
      this.updateAir(dt);
      this.combatWin(() => this.bAct2(), 'l2a1_win');
    } else if (this.act === 2) {
      this.talkNPCs(dt, this._festNPCs);
      this.walkGate(dt, 1600,
        () => { this.say([d('narrator', 'l2a2_done1'), d('Ispin', 'l2a2_done2')], () => this.bAct3()); },
        d('narrator', 'l2a2_1'), d('Mayor', 'l2a2_2'), d('Ispin', 'l2a2_3'));
    } else if (this.act === 4) {
      this.combatWin(() => this.nextLevel('level3'), 'l2a4_win');
    }
  }
}

if (typeof window !== 'undefined') window.Level2 = Level2;
