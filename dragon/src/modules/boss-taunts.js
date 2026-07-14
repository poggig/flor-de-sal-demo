// ═══════════════════════════════════════════════════════════════════════════
// MODULE (Phaser era): boss-taunts — a phase-2 taunt/brag scheduler for a boss.
// PROMOTED M9 on 2nd use (promotion queue: use #1 = dnd-recap's Malachar +
// farewell's PROD-1092, both hand-rolled game-side "check boss.hp/_phase2 in your
// update"; use #2 = measure-twice-sol-50's Chef Renard). The recurring pattern:
// once a `boss` archetype crosses into PHASE 2 (engine sets `boss._phase2=true`
// at hp ≤ 50%), it should periodically SHOUT scheduled brags while the fight
// continues — non-blocking, so it must NOT use `this.say` (which freezes physics).
//
// Idiomatic Phaser: each taunt is a self-contained rising/fading Text float above
// the boss's head (same shape as fx.js / acceptance-finale floats), so the fight
// never pauses. Lines are Lang keys, cycled on an interval; an optional one-shot
// `enterKey` fires the instant phase 2 begins; an optional `onTaunt(key,n)`
// callback lets the game sync a flourish (e.g. lob a flour-puff EnemyProj).
//
// Usage (boss act):
//   this.taunts = new BossTaunts(this, {
//     boss: this.renard,
//     enterKey: 'l3_taunt_enter',                 // floated ONCE at phase-2 entry
//     lines: ['l3_taunt_1','l3_taunt_2','l3_taunt_3'],  // cycled
//     interval: 2.8,                              // seconds between taunts
//     color: '#ffd24a',
//     onTaunt: (key, n) => { /* e.g. this.enemyProjectiles.push(new EnemyProj(...)) */ },
//   });
//   // in step()/update() (after updateActors):  this.taunts.update(dt);
// Dormant until instantiated + the boss is in phase 2 (phase2Only default true);
// a boss that never enters phase 2, or a game that never news it, sees nothing.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

class BossTaunts {
  constructor(scene, o = {}) {
    this.scene = scene;
    this.boss = o.boss || null;
    this.lines = o.lines || [];                 // Lang keys, cycled
    this.enterKey = o.enterKey || null;         // Lang key floated ONCE at phase-2 entry
    this.interval = o.interval === undefined ? 2.8 : o.interval;   // seconds between taunts
    this.phase2Only = o.phase2Only !== false;   // default: only taunt in phase 2
    this.color = o.color || '#ffd24a';
    this.dy = o.dy === undefined ? -8 : o.dy;   // extra px above the boss's head
    this.onTaunt = o.onTaunt || null;           // (key, n) => void — optional flourish
    this.i = 0;
    this.t = o.firstDelay === undefined ? 0.8 : o.firstDelay;
    this._entered = false;
  }
  _armed() {
    const b = this.boss;
    if (!b || !b.on) return false;
    return this.phase2Only ? b._phase2 === true : true;
  }
  _headY(b) {
    const bh = b.body ? b.body.height : (b.height || 28);
    const by = b.body ? b.body.y : (b.y - bh / 2);
    return by + this.dy;
  }
  update(dt) {
    const b = this.boss;
    if (!this._armed()) return;
    if (!this._entered) {                        // first frame in phase 2
      this._entered = true;
      if (this.enterKey) BossTaunts.float(this.scene, b.x, this._headY(b), Lang.t(this.enterKey), this.color, 15);
      this.t = Math.min(this.t, 1.0);            // ease into the regular cadence
    }
    this.t -= dt;
    if (this.t <= 0) {
      this.t = this.interval;
      const key = this.lines.length ? this.lines[this.i % this.lines.length] : null;
      const n = ++this.i;
      if (key) BossTaunts.float(this.scene, b.x, this._headY(b), Lang.t(key), this.color, 13);
      if (this.onTaunt) this.onTaunt(key, n);
    }
  }
  // Self-contained rising/fading taunt text (stroked for readability over the fight).
  static float(scene, x, y, txt, color, size) {
    const t = scene.add.text(x, y, txt, {
      fontFamily: 'monospace', fontSize: (size || 13) + 'px', color: color || '#ffd24a',
      fontStyle: 'bold', stroke: '#2a1608', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(31);
    scene.tweens.add({ targets: t, y: y - 22, alpha: 0, duration: 1300, ease: 'Quad.out', onComplete: () => t.destroy() });
    return t;
  }
}

if (typeof window !== 'undefined') window.BossTaunts = BossTaunts;
