// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — scenes-base (Phaser engine phaser-1.12.0)
// The SHARED mechanics base for the faithful 5-level Dragonlance port. Each level
// (lv1.js..lv5.js) supplies `class LevelN extends DragonScene { super('levelN') }`
// with its bActN builders + step(); this file gives them the reusable act toolkit
// that the original canvas game layered on top of the platformer (familiars,
// walk-gate scripting, talk-NPCs, ring stealth, darkness zones, an air gauge, a
// fishing minigame, and the per-boss behavior attachers).
//
// Everything here is a CLASSIC-SCRIPT global (no import/export). It relies on the
// same shared global scope as engine.js/data.js/the modules: GameScene, Enemy,
// EnemyProj, MegaProj, HeroProj, FX, Music, D, G, I, Lang, TimingBar, d(),
// ENEMY_ATTACK_POSE, FollowFamiliar, MapKit, T, FPS, CW, CH, MAP_H.
//
// Load order (index.html): engine → data → strings → modules (map-kit,
// follow-familiar, fx, boss-taunts, stealth-watchers) → scenes-base → lv1..lv5.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

// ── Party rosters + hero display defs (name, hud/tint color) ──
const HERO_DEFS = {
  kote:    ['Kote', '#40aa88'],
  minerva: ['Minerva', '#cc44cc'],
  elber:   ['Elber', '#44aa44'],
  nesta:   ['Nesta', '#4488cc'],
  nick:    ['Nick', '#d0a066'],
};
// Full 5-hero party; PARTY4 drops Nesta (used by acts where she is absent from the
// scripted story — her fox familiar auto-hides when she is not in the roster).
const PARTY5 = ['kote', 'minerva', 'elber', 'nesta', 'nick'];
const PARTY4 = ['kote', 'minerva', 'elber', 'nick'];

// ── FAMILIARS — Nesta's black fox + Nick's little skeleton (Arturito). RD image if
// present (pet_fox / pet_skeleton), else a small drawn shape. Cosmetic Containers,
// destroyed by GameScene.beginAct (children.removeAll). No body → no collision. ──
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
class Fox extends Familiar { }      Fox.prototype._key = 'pet_fox';        Fox.prototype._col = 0x2a2a2a;
class Skeleton extends Familiar { } Skeleton.prototype._key = 'pet_skeleton'; Skeleton.prototype._col = 0xe0e0e0;

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON SCENE — the shared level base every level extends.
// ═══════════════════════════════════════════════════════════════════════════
class DragonScene extends GameScene {
  // Reset per-act helper state on every (re)build. super.beginAct() tears down the
  // world (destroys graphics/text/bodies via children.removeAll), so we only null
  // our references + reset flags. Levels call this.beginAct(n) at the top of bActN.
  beginAct(n) {
    super.beginAct(n);
    this.live = false; this._won = false;
    this._wgInit = false; this._wgDone = false;   // walk-gate
    this._npcObjs = null;                          // talk-NPCs
    this._darkZones = null; this._darkOverlay = null; this._darkHole = null;   // darkness
    this._air = null; this._airMax = null; this._airTxt = null;                // air gauge
    this._stType = null; this._stG = null; this._stFailed = false;             // stealth
    this._stAlert = false; this._stPrevAlert = false; this._stTimer = 2.5;
    this.fox = null; this.skel = null;
  }

  // Drive automatic per-frame mechanics that need no per-frame args (darkness zones).
  // Air/stealth/familiars/walk-gate need Lang keys / targets, so the LEVEL drives
  // those from its step(); dark zones are self-contained → ticked here for free.
  updateActors(dt) {
    super.updateActors(dt);
    if (this._darkZones) this._tickDark(dt);
  }

  // ── FAMILIARS ───────────────────────────────────────────────────────────
  // Spawn the fox (follows Nesta) + skeleton (follows Nick) at ground level gy.
  familiars(gy) {
    this.fox = new Fox(this, 6 * T, gy, { offsetX: 40, offsetY: 2, depth: 2 });
    this.skel = new Skeleton(this, 4 * T, gy, { offsetX: 52, offsetY: 2, depth: 2 });
  }
  // Trail each familiar behind its living owner; hide it when the owner is absent
  // (PARTY4 has no Nesta → the fox stays hidden) or dead. Call from step().
  updateFamiliars(dt) {
    const nesta = this.heroes.find(h => h.customType === 'nesta' && h.on);
    const nick = this.heroes.find(h => h.customType === 'nick' && h.on);
    if (this.fox && this.fox.go) {
      if (nesta) { this.fox.go.setVisible(true); this.fox.update(dt, nesta); } else this.fox.go.setVisible(false);
    }
    if (this.skel && this.skel.go) {
      if (nick) { this.skel.go.setVisible(true); this.skel.update(dt, nick); } else this.skel.go.setVisible(false);
    }
  }

  // ── GROUND CONTACT BLEND ──────────────────────────────────────────────────
  // A soft darkening band under the world tiles (depth -3, behind actors). Cosmetic.
  groundBlend(ground, W, H) {
    const surfaceY = (H - 3) * T;
    const g = this.add.graphics().setScrollFactor(1, 1).setDepth(-3);
    for (let i = 0; i < 14; i++) { g.fillStyle(ground, 0.7 * Math.pow(1 - i / 14, 1.5)); g.fillRect(0, surfaceY - (i + 1) * 2 - 1, W * T, 2.4); }
  }

  // ── CUTSCENE ACT ──────────────────────────────────────────────────────────
  // A pure-dialogue act: keep combat inert (live=false), say the lines, then nextFn.
  // `lines` is an array of d(speaker,key). Sets act=-1 so no step logic fires mid-turn.
  cutscene(lines, nextFn) {
    this.live = false;
    this.say(lines, () => { this.act = -1; if (nextFn) nextFn(); });
  }

  // ── COMBAT-WIN WATCHER ────────────────────────────────────────────────────
  // Call in step(): when the act is live and every enemy is dead, float the win
  // line (optional) then advance via nextFn. Fires once (guarded by _won).
  combatWin(nextFn, winKey) {
    if (this.live && !this._won && this.enemiesAllDead()) {
      this._won = true; this.act = -1;
      const go = () => { if (nextFn) nextFn(); };
      if (winKey) this.say([d('narrator', winKey)], go); else go();
    }
  }

  // ── WALK-GATE ─────────────────────────────────────────────────────────────
  // Advance the act once the ACTIVE hero walks past world-x `xPx`. On the first
  // call, if intro lines are supplied, they play (holding the act until dismissed);
  // otherwise the act goes live immediately. introLines accept Lang keys (spoken by
  // 'narrator') or full d(...) objects. Call every frame from step().
  walkGate(dt, xPx, nextFn, ...introLines) {
    if (this._wgDone) return;
    if (!this._wgInit) {
      this._wgInit = true;
      if (introLines.length) {
        this.live = false;
        const lines = introLines.map(l => (l && typeof l === 'object' && 'tx' in l) ? l : d('narrator', l));
        this.say(lines, () => { this.live = true; });
      } else this.live = true;
    }
    if (this.live) {
      const h = this.heroes[this.ai];
      if (h && h.on && h.x > xPx) { this._wgDone = true; this.act = -1; if (nextFn) nextFn(); }
    }
  }

  // ── TALK-NPCs ─────────────────────────────────────────────────────────────
  // npcs = [{ x:<worldPx>, name:<Lang key>, lines:[Lang keys or d(...)], y?:<worldPx> }].
  // Draws a standing figure + name label per NPC (once), shows a [Z] prompt when the
  // active hero is within 100px, and on Z speaks that NPC's lines ONCE (name shown as
  // the speaker). Call every frame from step().
  talkNPCs(dt, npcs) {
    if (!this._npcObjs) {
      const gy = (this.tm ? this.tm.h : MAP_H) * T - 4 * T;
      this._npcObjs = npcs.map(n => {
        const x = n.x, y = (n.y != null ? n.y : gy);
        const cont = this.add.container(x, y).setDepth(2);
        const g = this.add.graphics();
        g.fillStyle(0x2a2a3a, 1).fillRect(-7, -30, 14, 22);   // robed body
        g.fillStyle(0xd8b088, 1).fillRect(-6, -42, 12, 12);   // head
        g.fillStyle(0x3a2a20, 1).fillRect(-6, -44, 12, 4);    // hair
        cont.add(g);
        const label = this.add.text(x, y - 52, Lang.t(n.name), { fontFamily: 'monospace', fontSize: '9px', color: '#e8d8a8' }).setOrigin(0.5).setDepth(3);
        const prompt = this.add.text(x, y - 64, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffee88' }).setOrigin(0.5).setDepth(3);
        return { x, y, name: n.name, lines: n.lines, talked: false, cont, label, prompt };
      });
    }
    const h = this.heroes[this.ai];
    for (const npc of this._npcObjs) {
      const near = h && h.on && Math.abs(h.x - npc.x) < 100;
      if (npc.prompt) npc.prompt.setText(near && !npc.talked ? Lang.t('talk_prompt') : '');
      if (near && !npc.talked && I.pr('KeyZ')) {
        npc.talked = true; if (npc.prompt) npc.prompt.setText('');
        const lines = npc.lines.map(l => (l && typeof l === 'object' && 'tx' in l) ? l : d(npc.name, l));
        this.say(lines, () => { });
      }
    }
  }

  // ── STEALTH (ring detection, faithful to the original) ─────────────────────
  // setupStealth(guardType): mark which enemy TYPE are guards + create the ring
  // overlay. Radii ALERT_R=180 / CAUGHT_R=70 around each guard, measured to the
  // CONTROLLED hero only (companions never trip it). Entering CAUGHT_R, or lingering
  // inside ALERT_R for 2.5s, fails → restartAct(). Any hero _invis fully bypasses
  // detection (Nesta's ult). Guards freeze (ai='static') while they hold an alert.
  setupStealth(guardType) {
    this._stType = guardType;
    this._stAlert = false; this._stPrevAlert = false; this._stTimer = 2.5; this._stFailed = false;
    this._stG = this.add.graphics().setDepth(8);
  }
  updateStealth(dt, caughtKey, timeoutKey) {
    const g = this._stG; if (g) g.clear();
    const guards = this.enemies.filter(e => e.customType === this._stType && e.on);
    // Invisibility defeats detection entirely: clear alert + restore any frozen guard.
    if (this.heroes.some(h => h.on && h._invis)) {
      this._stAlert = false; this._stPrevAlert = false;
      guards.forEach(e => { if (e._savedAi !== undefined) { e.ai = e._savedAi; e._savedAi = undefined; } });
      return;
    }
    const h = this.heroes[this.ai];
    if (!h || !h.on || this._stFailed) return;
    const ALERT_R = 180, CAUGHT_R = 70;
    let anyAlert = false;
    for (const e of guards) {
      const dist = Math.hypot(e.x - h.x, e.y - h.y);
      if (g) {
        g.lineStyle(1, this._stAlert ? 0xffee66 : 0xc8a84e, 0.45).strokeCircle(e.x, e.y, ALERT_R);
        g.lineStyle(1, 0xff4444, 0.6).strokeCircle(e.x, e.y, CAUGHT_R);
      }
      if (dist < CAUGHT_R) {
        this._stFailed = true;
        this.say([d('guard', caughtKey)], () => { this._stFailed = false; this.restartAct(); });
        return;
      }
      if (dist < ALERT_R) {
        anyAlert = true;
        if (!this._stPrevAlert) this._stTimer = 2.5;      // rising edge → (re)start the countdown
        this._stAlert = true;
        e.rt = h.x > e.x; e.setFlipX(!e.rt);
        if (e._savedAi === undefined) e._savedAi = e.ai;  // freeze while alerted
        e.ai = 'static'; if (e.body) e.body.setVelocityX(0);
      }
    }
    if (!anyAlert) {   // hero left every ring → clear + un-freeze guards
      this._stAlert = false;
      guards.forEach(e => { if (e._savedAi !== undefined) { e.ai = e._savedAi; e._savedAi = undefined; } });
    }
    this._stPrevAlert = anyAlert;
    if (this._stAlert) {
      this._stTimer -= dt;
      if (g) {   // alert-progress bar above the nearest alerting guard
        const ag = guards.find(e => Math.hypot(e.x - h.x, e.y - h.y) < ALERT_R);
        if (ag) { const by = (ag.body ? ag.body.y : ag.y) - 14; g.fillStyle(0xffcc33, 0.9).fillRect(ag.x - 30, by, 60 * (this._stTimer / 2.5), 4); }
      }
      if (this._stTimer <= 0 && !this._stFailed) {
        this._stFailed = true;
        this.say([d('guard', timeoutKey)], () => { this._stFailed = false; this.restartAct(); });
      }
    }
  }

  // ── DARKNESS ZONES (Lv2 underwater) ────────────────────────────────────────
  // spawnDarkZones(): arm every `darkmantle` enemy so its first landed hit punches a
  // 320px-radius, 15s pool of light into a screen-covering black overlay (everything
  // outside 320px of a live zone center is blacked out at 93%). Ticked automatically
  // by updateActors — the level only calls spawnDarkZones() once (after spawnEnemies).
  spawnDarkZones() {
    this._darkZones = [];
    this._darkOverlay = this.add.rectangle(0, 0, CW, CH, 0x000000, 0.93).setOrigin(0, 0).setScrollFactor(0).setDepth(15).setVisible(false);
    this._darkHole = this.add.graphics().setScrollFactor(0).setVisible(false);
    const mask = this._darkHole.createGeometryMask(); mask.invertAlpha = true;   // overlay shows OUTSIDE the holes
    this._darkOverlay.setMask(mask);
    this.enemies.forEach(e => {
      if (e.customType === 'darkmantle') {
        e._darkUsed = false;
        e._bossBeh = (edt, hero, visible) => {
          // engine sets e._atkAnimT > 0 the frame AFTER a landed melee hit (telegraph);
          // _bossBeh runs before that frame's hit test, so a fresh strike is visible here.
          if (!e._darkUsed && e._atkAnimT > 0) { e._darkUsed = true; this._darkZones.push({ x: e.x, y: e.y, r: 320, life: 15 }); }
        };
      }
    });
  }
  _tickDark(dt) {
    this._darkZones.forEach(z => z.life -= dt);
    this._darkZones = this._darkZones.filter(z => z.life > 0);
    const active = this._darkZones.length > 0;
    if (this._darkOverlay) this._darkOverlay.setVisible(active);
    const g = this._darkHole; if (!g) return;
    g.clear();
    if (!active) return;
    const cam = this.cameras.main;
    g.fillStyle(0xffffff, 1);
    for (const z of this._darkZones) g.fillCircle(z.x - cam.scrollX, z.y - cam.scrollY, z.r);   // screen-space holes
  }

  // ── AIR / OXYGEN GAUGE (Lv2 underwater survival) ───────────────────────────
  // startAir(90): begin a 90s countdown with a HUD readout. updateAir(dt): drain it;
  // at 0 every living hero dies (→ engine game-over). Call updateAir from step().
  startAir(seconds) {
    this._air = seconds == null ? 90 : seconds;
    this._airMax = this._air;
    this._airTxt = this.add.text(CW / 2, 24, '', { fontFamily: 'monospace', fontSize: '13px', color: '#9fe0ff', stroke: '#04121e', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(40);
  }
  updateAir(dt) {
    if (this._air == null) return;
    this._air -= dt;
    if (this._airTxt) {
      const s = Math.max(0, Math.ceil(this._air));
      this._airTxt.setColor(this._air < 20 ? '#ff6a6a' : '#9fe0ff').setText(Lang.t('air') + ': ' + s);
    }
    if (this._air <= 0) {
      this._air = 0;
      this.heroes.forEach(hh => { if (hh.on) { hh.hp = 0; hh.on = false; hh.setVisible(false); if (hh.body) { hh.body.setVelocity(0, 0); hh.body.enable = false; } } });
    }
  }

  // ── FISHING MINIGAME ───────────────────────────────────────────────────────
  // 3 rounds of the engine TimingBar with progressively tighter hit zones
  // (0.30 → 0.20 → 0.12), each needing one on-beat Z. onDoneFn fires after round 3.
  fishing(onDoneFn) {
    const zones = [0.30, 0.20, 0.12];
    const run = i => {
      if (i >= zones.length) { if (onDoneFn) onDoneFn(); return; }
      this.addBar(new TimingBar(this, {
        period: 1.6, zone: zones[i], need: 1, instrKey: 'fishing_hint',
        onDone: () => run(i + 1),
      }));
    };
    run(0);
  }

  // ── BOSS BEHAVIOR ATTACHERS (set enemy._bossBeh; the engine calls it each frame) ──
  // Aim helper: unit vector from the enemy toward the hero (falls back to facing).
  _aimAt(e, hero, fallback) {
    const h = hero || this.heroes[this.ai];
    if (!h || !h.on) { const dir = e.rt ? 1 : -1; return { x: dir, y: 0 }; }
    const dx = h.x - e.x, dy = h.y - e.y, len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  // SIVAK — a ground-pound every 3.5s: AoE damage 12 to any hero within |dx|<90;
  // ENRAGES at ≤30% hp (faster stomps + speed up + red tint).
  attachSivak(e) {
    e._stompT = 3.5; e._enraged = false;
    e._bossBeh = (dt, hero, visible) => {
      if (!e.on) return;
      e._stompT -= dt;
      if (e._stompT <= 0) {
        e._stompT = e._enraged ? 2.2 : 3.5;
        this.heroes.forEach(h => { if (h.on && Math.abs(h.x - e.x) < 90) h.hurt(12); });
        FX.burst(this, e.x, e.body ? e.body.bottom : e.y, { count: 14, tint: [0x99aa66, 0xccddaa, 0xffffff], speedMax: 170 });
        e._atkAnimT = ENEMY_ATTACK_POSE;
      }
      if (!e._enraged && e.hp <= e.mhp * 0.3) { e._enraged = true; e.spd *= 1.5; e.setTint(0xff8844); }
    };
  }

  // BOILERDRAK — lobs a homing-aimed fireball EnemyProj every 3s (dmg = e.dmg).
  attachBoilerdrak(e) {
    e._fireT = 3.0;
    e._bossBeh = (dt, hero, visible) => {
      if (!e.on) return;
      e._fireT -= dt;
      if (e._fireT <= 0) {
        e._fireT = 3.0;
        const a = this._aimAt(e, hero), sp = 4 * FPS;
        this.enemyProjectiles.push(new EnemyProj(this, e.x, e.y, a.x * sp, a.y * sp, e.dmg, 0xff8844, 12, 10));
        e._atkAnimT = ENEMY_ATTACK_POSE;
      }
    };
  }

  // SPECTATOR — every 4s, if the hero closes within 80px, blinks 200–250px AWAY.
  attachSpectator(e) {
    e._tpT = 4.0;
    e._bossBeh = (dt, hero, visible) => {
      if (!e.on) return;
      e._tpT -= dt;
      const h = hero;
      if (e._tpT <= 0 && h && h.on && Math.abs(h.x - e.x) < 80) {
        e._tpT = 4.0;
        const away = h.x > e.x ? -1 : 1;
        const worldW = (this.tm ? this.tm.w * T : e.x + 400);
        let nx = e.x + away * (200 + Math.random() * 50);
        nx = Math.max(2 * T, Math.min(worldW - 2 * T, nx));
        if (e.body) e.body.reset(nx, e.y); else e.x = nx;
        FX.burst(this, e.x, e.y, { count: 12, tint: [0xaa66ff, 0xff66ff, 0xffffff], speedMax: 150 });
        e._atkAnimT = ENEMY_ATTACK_POSE;
      }
    };
  }

  // KANSALDI — a wide fire-breath: every ~6s the breath is ACTIVE for 1.2s; while
  // active, any hero within 300px takes 8 dmg (paced to ~2 hits by the hero's inv).
  attachKansaldiBreath(e) {
    e._breathCd = 6.0; e._breathT = 0;
    e._bossBeh = (dt, hero, visible) => {
      if (!e.on) return;
      if (e._breathT > 0) {
        e._breathT -= dt;
        this.heroes.forEach(h => { if (h.on && Math.abs(h.x - e.x) < 300) h.hurt(8); });
        e._atkAnimT = ENEMY_ATTACK_POSE;
      } else {
        e._breathCd -= dt;
        if (e._breathCd <= 0) {
          e._breathCd = 6.0; e._breathT = 1.2;
          FX.burst(this, e.x + (e.rt ? 46 : -46), e.y, { count: 22, tint: [0xff5522, 0xff8844, 0xffcc44], speedMax: 260 });
        }
      }
    };
  }

  // GENERIC PHASE-2 PROJECTILE — once a boss enters phase 2 (engine sets _phase2 at
  // ≤50% hp), fire a homing-aimed EnemyProj on an interval. opts: { interval, speed,
  // dmg, color }. Dormant until phase 2.
  attachPhase2Proj(e, opts = {}) {
    const interval = opts.interval || 2.4;
    e._p2T = interval;
    e._bossBeh = (dt, hero, visible) => {
      if (!e.on || e._phase2 !== true) return;
      e._p2T -= dt;
      if (e._p2T <= 0) {
        e._p2T = interval;
        const a = this._aimAt(e, hero), sp = (opts.speed || 3.5) * FPS;
        this.enemyProjectiles.push(new EnemyProj(this, e.x, e.y, a.x * sp, a.y * sp, opts.dmg || Math.round(e.dmg * 0.8), opts.color || 0xff6688));
        e._atkAnimT = ENEMY_ATTACK_POSE;
      }
    };
  }
}

// Expose the classic-script globals the level files + playtester resolve against.
if (typeof window !== 'undefined') {
  window.DragonScene = DragonScene;
  window.HERO_DEFS = HERO_DEFS; window.PARTY5 = PARTY5; window.PARTY4 = PARTY4;
  window.Familiar = Familiar; window.Fox = Fox; window.Skeleton = Skeleton;
}
