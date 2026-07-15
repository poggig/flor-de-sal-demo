// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — LEVEL 4: YURTHGREEN MASQUERADE (Phaser phaser-1.12.0)
// A 5-act, mostly-narrative interlude: two "mingle & talk" walk beats framing one
// shadow-agent combat, plus three pure-dialogue ceremony/vision scenes (Minerva's
// knighting, Nesta's pact with Lohezet, Ispin's pearl-scrying). Castle tileset,
// LIBRARY music (deliberate). The full 5-hero party re-forms — Nesta rejoins.
//   A1 Mingle & Talk (6 masquerade NPCs incl. the masked "???" = Bakaris)
//   A2 Minerva's Knighting          (cutscene)
//   A3 Nesta's Pact + Shadow Combat (cutscene → 6 shadow agents)
//   A4 Ispin's Pearl Vision         (cutscene, gold scry particles)
//   A5 Masquerade Ends              (cutscene → nextLevel('level5'))
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

class Level4 extends DragonScene {
  constructor() {
    super('level4');
    this.musicTheme = 'library';        // masquerade deliberately plays the library theme
    this.bgImage = 'bg_masquerade';
    this.bgBot = 0x0d2847;              // deep-blue night hall
    this.tileTextures = { 1: 'tile_castle', 2: 'tile_castle', 3: 'tile_castle', 5: 'tile_castle' };
  }
  enter() { this.bAct1(); }

  // ── ACT 1 — Mingle & Talk ──────────────────────────────────────────────────
  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(110, buildMasqueradeHall);
    this.groundBlend(0x141d2e, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(60, gy, PARTY5);       // Nesta rejoins — full party of 5
    this.familiars(gy);
    this._npcs = [
      { x: 300,  name: 'npc_masked',   lines: ['l4a1_bak'] },   // masked "???" — Bakaris, scar under the mask
      { x: 500,  name: 'npc_levna',    lines: ['l4a1_levna'] },
      { x: 700,  name: 'npc_clystran', lines: ['l4a1_cly'] },
      { x: 900,  name: 'npc_becklin',  lines: ['l4a1_beck'] },
      { x: 1100, name: 'npc_cudgel',   lines: ['l4a1_cud'] },
      { x: 1300, name: 'npc_tem',      lines: ['l4a1_tem'] },
    ];
    this.setHint('l4a1_hint');
    // walk-gate (below) plays the intro on first frame, then advances past x>1600.
  }

  // ── ACT 2 — Minerva's Knighting (pure dialogue) ────────────────────────────
  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(110, buildMasqueradeHall);   // keep the hall as a backdrop
    this.groundBlend(0x141d2e, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(60, gy, PARTY5);
    this.familiars(gy);
    FX.burst(this, this.cameras.main.scrollX + CW / 2, CH / 2 - 20, { count: 24, tint: [0xffe08a, 0xfff2c0, 0xffffff], speedMax: 120 });
    this.cutscene([
      d('narrator', 'l4a2_1'), d('herald', 'l4a2_2'), d('regent', 'l4a2_3'),
      d('regent', 'l4a2_4'), d('minerva', 'l4a2_5'), d('regent', 'l4a2_6'),
      d('narrator', 'l4a2_7'), d('minerva', 'l4a2_8'), d('kote', 'l4a2_9'),
    ], () => this.bAct3());
  }

  // ── ACT 3 — Nesta's Pact + Shadow Combat ───────────────────────────────────
  bAct3(retry) {
    this.beginAct(3);
    const { W, H } = this.buildMap(210, buildMasqueradeHall);   // wide combat hall
    this.groundBlend(0x141d2e, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(60, gy, PARTY5);
    const shadows = [
      new Enemy(this, 760,  gy, 24, 36, 'Shadow Agent', '#222244', EHP.soldier, 14, 'chase',  'hideout_fighter'),
      new Enemy(this, 1160, gy, 24, 36, 'Shadow Agent', '#222244', EHP.soldier, 14, 'patrol', 'hideout_fighter'),
      new Enemy(this, 1560, gy, 16, 24, 'Shadow Scout', '#334455', EHP.grunt,   10, 'chase',  'castle_archer'),
      new Enemy(this, 2000, gy, 24, 36, 'Shadow Agent', '#222244', EHP.soldier, 13, 'patrol', 'hideout_fighter'),
      new Enemy(this, 2600, gy, 24, 36, 'Shadow Agent', '#222244', EHP.soldier, 13, 'chase',  'hideout_fighter'),
      new Enemy(this, 3200, gy, 16, 24, 'Shadow Scout', '#334455', EHP.grunt,   10, 'patrol', 'castle_archer'),
    ];
    shadows.forEach(e => { e.spd = 0.9; });
    this.spawnEnemies(shadows);
    this.familiars(gy);
    this.setHint('l4a3_hint');
    if (retry) { this.live = true; return; }   // retry skips the pact cutscene, straight to combat
    this.say([
      d('lohezet', 'l4a3_1'), d('nesta', 'l4a3_2'), d('lohezet', 'l4a3_3'),
      d('nesta', 'l4a3_4'), d('lohezet', 'l4a3_5'), d('lohezet', 'l4a3_6'),
      d('nesta', 'l4a3_7'), d('lohezet', 'l4a3_8'), d('nesta', 'l4a3_9'),
      d('narrator', 'l4a3_10'), d('lohezet', 'l4a3_prove'),
    ], () => { this.live = true; });
  }

  // ── ACT 4 — Ispin's Pearl Vision (pure dialogue, gold scry) ────────────────
  bAct4(retry) {
    this.beginAct(4);
    const { W, H } = this.buildMap(110, buildMasqueradeHall);
    this.groundBlend(0x141d2e, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(60, gy, PARTY5);
    this.familiars(gy);
    FX.burst(this, this.cameras.main.scrollX + CW / 2, CH / 2, { count: 34, tint: [0xffd54a, 0xffee88, 0xfff6c8], speedMax: 150 });
    this.cutscene([
      d('ispin', 'l4a4_1'), d('narrator', 'l4a4_2'), d('ispin', 'l4a4_3'),
      d('ispin', 'l4a4_4'), d('kote', 'l4a4_5'), d('ispin', 'l4a4_6'),
      d('narrator', 'l4a4_7'), d('ispin', 'l4a4_8'), d('kote', 'l4a4_9'),
      d('narrator', 'l4a4_10'),
    ], () => this.bAct5());
  }

  // ── ACT 5 — Masquerade Ends (pure dialogue → Level 5) ──────────────────────
  bAct5(retry) {
    this.beginAct(5);
    const { W, H } = this.buildMap(110, buildMasqueradeHall);
    this.groundBlend(0x141d2e, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(60, gy, PARTY5);
    this.familiars(gy);
    this.cutscene([
      d('narrator', 'l4a5_1'), d('minerva', 'l4a5_2'), d('elber', 'l4a5_3'),
      d('kote', 'l4a5_4'), d('nesta', 'l4a5_5'), d('narrator', 'l4a5_6'),
    ], () => this.nextLevel('level5'));
  }

  // ── PER-FRAME ───────────────────────────────────────────────────────────────
  step(dt) {
    this.updateFamiliars(dt);
    if (this.act === 1) {
      // intro plays on first frame, then advance once the active hero walks past x>1600.
      this.walkGate(dt, 1600, () => this.bAct2(), 'l4a1_1', 'l4a1_2');
      this.talkNPCs(dt, this._npcs);
    } else if (this.act === 3) {
      if (this.live && !this._won && this.enemiesAllDead()) {
        this._won = true; this.act = -1;
        FX.burst(this, this.cameras.main.scrollX + CW / 2, CH / 2, { count: 32, tint: [0x4488cc, 0x66aaff, 0xffffff], speedMax: 200 });
        this.say([d('narrator', 'l4a3_win1'), d('nesta', 'l4a3_win2')], () => this.bAct4());
      }
    }
  }
}

if (typeof window !== 'undefined') window.Level4 = Level4;
