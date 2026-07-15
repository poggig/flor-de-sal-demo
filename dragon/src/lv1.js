// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — LEVEL 1: SCHOOL DAY (castle). music `castle`.
// 5 acts, faithful to the original Lv1 (scenes.js:346):
//   A1 THE FINAL EXAM  — arena combat: Bakaris (phase-2 boss) + castle troops +
//                        goblins. Win = clear the arena.
//   A2 BLOOD AND GRUDGE — cutscene (Nesta scars Bakaris' face).
//   A3 HALLWAY RUMORS   — social walk: talk to 4 NPCs, then reach the door.
//   A4 NIGHT INFILTRATION — platform stealth past a knight guard + 6 mimics.
//   A5 DIVERGING PATHS  — cutscene → Level 2.
// Party of 5 (Nesta present → her fox familiar trails her). Classic-script global.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

class Level1 extends DragonScene {
  constructor() {
    super('level1');
    this.musicTheme = 'castle';
    this.bgImage = 'bg_arena';
    this.bgBot = 0x101830;
    this.tileTextures = { 1: 'tile_castle', 2: 'tile_castle', 3: 'tile_castle', 5: 'tile_castle' };
  }
  enter() { this.bAct1(); }

  // ── ACT 1 — THE FINAL EXAM (arena combat) ─────────────────────────────────
  bAct1(retry) {
    this.beginAct(1);
    this.musicTheme = 'castle'; Music.play('castle');
    const { W, H } = this.buildMap(240, buildCastleArena);
    this.groundBlend(0x1a1420, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(10 * T, gy, PARTY5);

    const bakaris = new Enemy(this, 1800, gy, 24, 36, 'Bakaris', '#aa5533', EHP.miniboss, 13, 'boss', 'bakaris');
    this.attachPhase2Proj(bakaris, { interval: 2.5, speed: 4, dmg: 8, color: '#ffcc55' });
    const ayik = new Enemy(this, 1120, gy, 28, 40, 'Ayik Ur', '#4466aa', EHP.soldier, 11, 'chase', 'castle_soldier');
    const hrigg = new Enemy(this, 1400, gy, 28, 40, 'Hrigg', '#668877', EHP.soldier, 11, 'patrol', 'castle_archer');
    const iriad = new Enemy(this, 1600, gy, 28, 40, 'Iriad', '#8a7a5a', EHP.soldier, 11, 'chase', 'hideout_fighter');
    const tower = new Enemy(this, (W - 15) * T, gy, 28, 40, 'Tower Guard', '#446688', EHP.soldier, 11, 'static', 'castle_archer');
    [ayik, hrigg, iriad, tower].forEach(e => { e.spd = 0.9; });
    this.spawnEnemies([
      bakaris, ayik, hrigg, iriad, tower,
      new Enemy(this, 900, gy, 20, 28, 'Goblin', '#4a7c3f', EHP.grunt, 12, 'patrol', 'goblin'),
      new Enemy(this, 1500, gy, 20, 28, 'Goblin', '#4a7c3f', EHP.grunt, 12, 'patrol', 'goblin'),
      new Enemy(this, 2200, gy, 20, 28, 'Goblin', '#4a7c3f', EHP.grunt, 12, 'patrol', 'goblin'),
    ]);
    this.familiars(gy);
    this.setHint('l1a1_hint');
    if (retry) { this.live = true; return; }
    this.say([
      d('narrator', 'l1a1_1'), d('narrator', 'l1a1_2'), d('narrator', 'l1a1_tut'),
      d('bakaris', 'l1a1_bak'), d('narrator', 'l1a1_go'),
    ], () => { this.live = true; });
  }

  // ── ACT 2 — BLOOD AND GRUDGE (cutscene) ───────────────────────────────────
  bAct2() {
    this.beginAct(2);
    this.cutscene([
      d('narrator', 'l1a2_1'), d('bakaris', 'l1a2_2'), d('nesta', 'l1a2_3'),
      d('narrator', 'l1a2_4'), d('narrator', 'l1a2_5'), d('narrator', 'l1a2_6'), d('narrator', 'l1a2_7'),
    ], () => this.bAct3());
  }

  // ── ACT 3 — HALLWAY RUMORS (social exploration) ───────────────────────────
  bAct3(retry) {
    this.beginAct(3);
    const { W, H } = this.buildMap(300, buildCastleArena);
    this.groundBlend(0x1a1420, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(10 * T, gy, PARTY5);
    this.spawnEnemies([]);
    this.familiars(gy);
    this._npcs = [
      { x: 600, name: 'Levna', lines: ['l1a3_levna1', 'l1a3_levna2', 'l1a3_levna3', 'l1a3_levna4'] },
      { x: 1000, name: 'Clystran', lines: ['l1a3_cly1', 'l1a3_cly2', 'l1a3_cly3', 'l1a3_cly4'] },
      { x: 1400, name: 'Darrett', lines: ['l1a3_dar1', 'l1a3_dar2', 'l1a3_dar3', 'l1a3_dar4'] },
      { x: 1700, name: 'Andir', lines: ['l1a3_and1', 'l1a3_and2', 'l1a3_and3', 'l1a3_and4'] },
    ];
    this.setHint('l1a3_hint');
  }

  // ── ACT 4 — NIGHT INFILTRATION (platform stealth) ─────────────────────────
  bAct4(retry) {
    this.beginAct(4);
    this.musicTheme = 'stealth'; Music.play('stealth');
    const { W, H } = this.buildMap(300, buildCastleStealth);
    this.groundBlend(0x120c1e, W, H);
    const gy = (H - 4) * T;
    this.spawnParty(10 * T, gy, PARTY5);

    const guard = new Enemy(this, 900, gy, 28, 40, 'Guard', '#4466aa', EHP.soldier, 11, 'patrol', 'knight');
    guard.spd = 0.8;
    this.spawnEnemies([
      guard,
      new Enemy(this, 1200, gy, 16, 20, 'Mimic Book', '#8844aa', EHP.grunt, 8, 'static', 'mimic'),
      new Enemy(this, 1400, gy, 16, 20, 'Mimic Book', '#8844aa', EHP.grunt, 8, 'static', 'mimic'),
      new Enemy(this, 1800, gy, 24, 28, 'Mimic Book', '#6b3a8c', EHP.soldier, 14, 'patrol', 'mimic'),
      new Enemy(this, 2400, gy, 24, 28, 'Mimic Book', '#6b3a8c', EHP.soldier, 14, 'patrol', 'mimic'),
      new Enemy(this, 2900, gy, 24, 28, 'Mimic Book', '#6b3a8c', EHP.soldier, 14, 'patrol', 'mimic'),
      new Enemy(this, 3400, gy, 24, 28, 'Mimic Book', '#6b3a8c', EHP.soldier, 14, 'patrol', 'mimic'),
    ]);
    this.setupStealth('knight');
    this.familiars(gy);
    this.setHint('l1a4_hint');
    if (retry) { this.live = true; return; }
    this.say([
      d('narrator', 'l1a4_1'), d('narrator', 'l1a4_2'), d('nesta', 'l1a4_3'), d('nesta', 'l1a4_4'),
    ], () => { this.live = true; });
  }

  // ── ACT 5 — DIVERGING PATHS (cutscene → Level 2) ──────────────────────────
  bAct5() {
    this.beginAct(5);
    this.cutscene([
      d('narrator', 'l1a5_1'), d('narrator', 'l1a5_2'), d('Ispin', 'l1a5_3'),
      d('narrator', 'l1a5_4'), d('narrator', 'l1a5_5'), d('narrator', 'l1a5_6'), d('narrator', 'l1a5_7'),
    ], () => this.nextLevel('level2'));
  }

  step(dt) {
    this.updateFamiliars(dt);
    if (this.act === 1) {
      this.combatWin(() => this.bAct2(), 'l1a1_win');
    } else if (this.act === 3) {
      this.talkNPCs(dt, this._npcs);
      this.walkGate(dt, 1800, () => this.say([d('narrator', 'l1a3_done')], () => this.bAct4()), 'l1a3_1', 'l1a3_2');
    } else if (this.act === 4) {
      this.updateStealth(dt, 'l1a4_caught1', 'l1a4_caught2');
      if (this.live && !this._won) {
        const mimicsDead = this.enemies.filter(e => e.customType === 'mimic').every(e => !e.on);
        const h = this.heroes[this.ai];
        if (mimicsDead && h && h.on && h.x > 1400) {
          this._won = true; this.act = -1;
          this.say([d('narrator', 'l1a4_win')], () => this.bAct5());
        }
      }
    }
  }
}

if (typeof window !== 'undefined') window.Level1 = Level1;
