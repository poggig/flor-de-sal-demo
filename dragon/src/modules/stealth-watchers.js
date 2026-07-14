// ═══════════════════════════════════════════════════════════════════════════
// MODULE (Phaser era): stealth-watchers — scene-level watchers for stealth acts.
// Re-derived from templates/modules/stealth-watchers.js (D20). Provenance:
// sofia-bday-30 L3-A1 ("don't spoil your own surprise party").
//
// Watchers are NOT Enemy instances: harmless, only the CONTROLLED hero can be
// spotted (companions never trigger detection), and getting caught fires the
// caller's onCaught (usually a dialogue → restartAct()).
//
// Idiomatic Phaser changes:
//  · Each watcher is a retained Phaser Container (figure) + a Graphics vision
//    cone that redraws every frame to show facing and the caught/searching
//    color; both are destroyed by GameScene.beginAct(). No immediate-mode draw.
//  · Detection stays exact GEOMETRY, not an Arcade overlap box: a vision cone
//    is a triangle, so an AABB overlap would over/under-report at the edges.
//    The cheap dx/facing test with CONTINUOUS grace (breaking line-of-sight
//    resets it) is both exact and 4 lines. Cover zones are plain x-ranges
//    (they could be Arcade zones, but a range check needs no bodies).
//  · Phaser sprites have origin 0.5 → hero.x is already the body CENTER, so the
//    old `hero.x + hero.w/2` centering is gone.
//
// Usage in bActN:
//   this.watchers = new StealthWatchers(this, {
//     spots:[[29,1],[51,-1],[72,1]],        // [tileX, initialFacing] pairs
//     y:(H-3)*T,                            // watcher feet y (floor top, px)
//     coverZones:[[24*T,27*T],[46*T,49*T]], // x-ranges that are always safe
//     nameKey:'guest_name',
//     onCaught:()=>{ this.say([d('narrator','caught_key')],()=>this.restartAct()); },
//   });
// In step()/update() (act-gated): this.watchers.update(dt, this.heroes[this.ai]);
// Rebuilding the act (bActN → beginAct) destroys + recreates it — no reset call.
//
// Tuning: range (default 110px), grace (default 0.6s CONTINUOUS sight),
// flipEvery (default 2.5s facing flip), staggered per-watcher phase so cones
// never move in lockstep.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

class StealthWatchers {
  constructor(scene, o) {
    this.scene = scene;
    this.range = o.range === undefined ? 110 : o.range;
    this.grace = o.grace === undefined ? 0.6 : o.grace;
    this.flipEvery = o.flipEvery === undefined ? 2.5 : o.flipEvery;
    this.coverZones = o.coverZones || [];
    this.nameKey = o.nameKey || null;
    this.onCaught = o.onCaught;
    this.caught = false;
    this.ws = o.spots.map((c, i) => {
      const wx = c[0] * T, wy = o.y;
      const cone = scene.add.graphics().setDepth(-2);      // behind the figure, in world space
      const fig = scene.add.container(wx, wy).setDepth(2);
      const g = scene.add.graphics();
      g.fillStyle(0x9a6a7a, 1).fillRect(-6, -22, 12, 20);  // body (party guest)
      g.fillStyle(0xd8b088, 1).fillRect(-5, -32, 10, 10);  // head
      g.fillStyle(0x2a1a20, 1).fillRect(-5, -34, 10, 4);   // hair
      fig.add(g);
      const label = this.nameKey ? scene.add.text(wx, wy - 44, Lang.t(this.nameKey), { fontFamily: 'monospace', fontSize: '8px', color: '#c8a0a0' }).setOrigin(0.5).setDepth(3) : null;
      const alert = scene.add.text(wx, wy - 54, '', { fontFamily: 'monospace', fontSize: '13px', color: '#ff6666' }).setOrigin(0.5).setDepth(3);
      return { x: wx, y: wy, face: c[1], t: i * 0.8, det: 0, cone, fig, label, alert };
    });
  }
  update(dt, hero) {
    if (this.caught || !hero) return;
    const hx = hero.x;                                     // Phaser body center
    const inCover = this.coverZones.some(z => hx >= z[0] && hx <= z[1]);
    for (const w of this.ws) {
      w.t += dt;
      if (w.t >= this.flipEvery) { w.t -= this.flipEvery; w.face *= -1; }
      const dx = hx - w.x;
      const seen = !inCover && Math.abs(dx) < this.range && ((dx > 0 && w.face > 0) || (dx < 0 && w.face < 0));
      w.det = seen ? w.det + dt : 0;                       // CONTINUOUS grace
      this._draw(w);
      if (w.det >= this.grace) {
        this.caught = true;
        if (this.onCaught) this.onCaught();
        return;
      }
    }
  }
  _draw(w) {
    const g = w.cone; g.clear();
    g.fillStyle(w.det > 0 ? 0xff5a5a : 0xffe68c, w.det > 0 ? 0.28 : 0.14);
    g.beginPath();
    g.moveTo(w.x, w.y - 16);
    g.lineTo(w.x + w.face * this.range, w.y - 30);
    g.lineTo(w.x + w.face * this.range, w.y - 2);
    g.closePath(); g.fillPath();
    w.fig.setScale(w.face < 0 ? -1 : 1, 1);
    if (w.alert) w.alert.setText(w.det > 0 ? '!' : '');
  }
  destroy() {
    for (const w of this.ws) { w.cone.destroy(); w.fig.destroy(); if (w.label) w.label.destroy(); if (w.alert) w.alert.destroy(); }
    this.ws = [];
  }
}

if (typeof window !== 'undefined') window.StealthWatchers = StealthWatchers;
