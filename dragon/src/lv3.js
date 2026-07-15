// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — LEVEL 3: LIBRARY OF SECRETS (Phaser phaser-1.12.0)
// A faithful port of the original canvas Lv3 (5 acts, library theme, PARTY4 —
// Nesta is absent, rejoins in Lv4). The signature stealth mechanic returns in A1
// (the Library Censor), then a vertical climb (A2), an animated-weapons combat
// wave (A3), the teleporting Spectator miniboss (A4), and an escape run into Lv4.
//   A1 SILENCE THRESHOLD — corridor stealth past the Library Censor (win x>2000)
//   A2 THE RESTRICTED ARCHIVE — climb the bookshelf balcony (win hero.y < (H-14)*T)
//   A3 ECHOES OF THE PAST — animated swords + a cursed gauntlet (clear the wave)
//   A4 DECEPTIONS AND DEPTHS — the Spectator (teleports) + cursed watchers
//   A5 ESCAPE — Becklin's farewell, run for the doors → nextLevel('level4')
// Extends DragonScene (scenes-base.js): familiars, ring stealth, walk-gate,
// talk-NPCs, combat-win, and attachSpectator all come from the shared base.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

class Level3 extends DragonScene {
  constructor() {
    super('level3');
    this.musicTheme = 'stealth';
    this.bgImage = 'bg_library';
    this.bgBot = 0x080818;
    this.tileTextures = { 1: 'tile_library', 2: 'tile_library', 3: 'tile_library', 5: 'tile_library' };
  }
  enter() { this.bAct1(); }

  // ── ACT 1 — SILENCE THRESHOLD (corridor stealth) ─────────────────────────
  // The Library Censor is the ONLY detector (lib_censor guardFilter); the three
  // Censor Guards are plain melee hazards. Slip past on the upper balcony and get
  // the controlled hero past world-x 2000. Getting caught restarts the whole act.
  bAct1(retry) {
    this.beginAct(1);
    const { W, H } = this.buildMap(240, buildLibraryHalls);
    this.groundBlend(0x0a0a18, W, H);
    Music.play('stealth');
    const gy = (H - 4) * T;
    this.spawnParty(3 * T, gy, PARTY4);
    const censor = new Enemy(this, 1200, gy, 28, 60, 'Library Censor', '#4466aa', EHP.elite, 11, 'patrol', 'lib_censor');
    censor.spd = 0.8;
    this.spawnEnemies([
      censor,
      new Enemy(this, 2500, gy, 26, 58, 'Censor Guard', '#556688', EHP.soldier, 12, 'patrol', 'castle_soldier'),
      new Enemy(this, 3000, gy, 26, 58, 'Censor Guard', '#556688', EHP.soldier, 12, 'chase', 'castle_soldier'),
      new Enemy(this, 3500, gy, 26, 58, 'Censor Guard', '#556688', EHP.soldier, 12, 'patrol', 'castle_soldier'),
    ]);
    this.setupStealth('lib_censor');
    this.familiars(gy);
    this.setHint('l3a1_hint');
    this._introA1 = retry ? [] : ['l3a1_1', 'l3a1_2', 'l3a1_3', d('kote', 'l3a1_4')];
  }

  // ── ACT 2 — THE RESTRICTED ARCHIVE (vertical climb) ──────────────────────
  // No enemies. Climb the bookshelf ledges to the full-width top balcony
  // (row H-15). Win when the active hero rises above y = (H-14)*T.
  bAct2(retry) {
    this.beginAct(2);
    const { W, H } = this.buildMap(240, buildLibraryHalls);
    this.groundBlend(0x0a0a18, W, H);
    Music.play('library');
    const gy = (H - 4) * T;
    this.spawnParty(3 * T, gy, PARTY4);
    this.spawnEnemies([]);
    this.familiars(gy);
    this._climbY = (H - 14) * T;
    this.setHint('l3a2_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l3a2_1'), d('narrator', 'l3a2_2')], () => { this.live = true; });
  }

  // ── ACT 3 — ECHOES OF THE PAST (animated weapons combat) ─────────────────
  // Force-fallback procedural types (animated_sword / gauntlet — no atlas; the
  // engine bakes them). Clear the whole wave to advance.
  bAct3(retry) {
    this.beginAct(3);
    const { W, H } = this.buildMap(240, buildLibraryHalls);
    this.groundBlend(0x0a0a18, W, H);
    Music.play('library');
    const gy = (H - 4) * T;
    this.spawnParty(3 * T, gy, PARTY4);
    const wave = [
      new Enemy(this, 1344, gy, 28, 60, 'Animated Sword', '#9944ff', EHP.elite, 14, 'static', 'animated_sword'),
      new Enemy(this, 800, (H - 8) * T, 24, 56, 'Cursed Gauntlet', '#443322', EHP.elite, 13, 'static', 'gauntlet'),
      new Enemy(this, 800, gy, 24, 56, 'Animated Sword', '#9944ff', EHP.soldier, 12, 'patrol', 'animated_sword'),
      new Enemy(this, 1400, gy, 24, 56, 'Animated Sword', '#9944ff', EHP.soldier, 12, 'chase', 'animated_sword'),
      new Enemy(this, 2000, gy, 24, 56, 'Animated Sword', '#9944ff', EHP.soldier, 12, 'patrol', 'animated_sword'),
      new Enemy(this, 2600, gy, 24, 56, 'Animated Sword', '#9944ff', EHP.soldier, 12, 'chase', 'animated_sword'),
      new Enemy(this, 3200, gy, 24, 56, 'Animated Sword', '#9944ff', EHP.soldier, 12, 'patrol', 'animated_sword'),
    ];
    wave.forEach(e => { e.spd = 0.9; });
    this.spawnEnemies(wave);
    this.familiars(gy);
    this.setHint('l3a3_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l3a3_1'), d('narrator', 'l3a3_2'), d('narrator', 'l3a3_3')], () => { this.live = true; });
  }

  // ── ACT 4 — DECEPTIONS AND DEPTHS (Spectator miniboss) ───────────────────
  // The Spectator blinks 200–250px away when a hero closes within 80px
  // (attachSpectator). Four cursed watchers (gauntlets) guard it. Clear all.
  bAct4(retry) {
    this.beginAct(4);
    const { W, H } = this.buildMap(240, buildLibraryHalls);
    this.groundBlend(0x0a0a18, W, H);
    Music.play('library');
    const gy = (H - 4) * T;
    this.spawnParty(3 * T, gy, PARTY4);
    const spectator = new Enemy(this, 1984, (H - 8) * T, 26, 44, 'The Spectator', '#6644aa', EHP.miniboss, 16, 'static', 'spectator');
    this.attachSpectator(spectator);
    const watchers = [
      new Enemy(this, 800, gy, 24, 56, 'Cursed Watcher', '#6644aa', EHP.soldier, 12, 'patrol', 'gauntlet'),
      new Enemy(this, 1400, gy, 24, 56, 'Cursed Watcher', '#6644aa', EHP.soldier, 12, 'chase', 'gauntlet'),
      new Enemy(this, 2600, gy, 24, 56, 'Cursed Watcher', '#6644aa', EHP.soldier, 12, 'chase', 'gauntlet'),
      new Enemy(this, 3200, gy, 24, 56, 'Cursed Watcher', '#6644aa', EHP.soldier, 12, 'patrol', 'gauntlet'),
    ];
    this.spawnEnemies([spectator, ...watchers]);
    this.familiars(gy);
    this.setHint('l3a4_hint');
    if (retry) { this.live = true; return; }
    this.say([d('narrator', 'l3a4_1'), d('narrator', 'l3a4_2'), d('narrator', 'l3a4_3')], () => { this.live = true; });
  }

  // ── ACT 5 — ESCAPE (Becklin's farewell → Level 4) ────────────────────────
  // No combat. Becklin waits down the hall; run the controlled hero past
  // world-x 3000 to escape the library into the masquerade.
  bAct5(retry) {
    this.beginAct(5);
    const { W, H } = this.buildMap(240, buildLibraryHalls);
    this.groundBlend(0x0a0a18, W, H);
    Music.play('stealth');
    const gy = (H - 4) * T;
    this.spawnParty(3 * T, gy, PARTY4);
    this.spawnEnemies([]);
    this.familiars(gy);
    this.setHint('l3a5_hint');
    this._introA5 = retry ? [] : ['l3a5_1'];
  }

  // ── PER-FRAME ────────────────────────────────────────────────────────────
  step(dt) {
    this.updateFamiliars(dt);
    if (this.act === 1) {
      this.updateStealth(dt, 'l3a1_caught', 'l3a1_caught2');
      this.walkGate(dt, 2000,
        () => this.say([d('narrator', 'l3a1_win')], () => this.bAct2()),
        ...(this._introA1 || []));
    } else if (this.act === 2) {
      if (this.live && !this._won) {
        const h = this.heroes[this.ai];
        if (h && h.on && h.y < this._climbY) {
          this._won = true; this.act = -1;
          this.say([d('narrator', 'l3a2_win')], () => this.bAct3());
        }
      }
    } else if (this.act === 3) {
      this.combatWin(() => this.bAct4(), 'l3a3_win');
    } else if (this.act === 4) {
      this.combatWin(() => this.bAct5(), 'l3a4_win');
    } else if (this.act === 5) {
      this.talkNPCs(dt, [{ x: 3200, name: 'becklin', lines: ['l3a5_beck'] }]);
      this.walkGate(dt, 3000,
        () => this.say([d('narrator', 'l3a5_win')], () => this.nextLevel('level4')),
        ...(this._introA5 || []));
    }
  }
}

if (typeof window !== 'undefined') window.Level3 = Level3;
