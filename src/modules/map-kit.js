// ═══════════════════════════════════════════════════════════════════════════
// MODULE (Phaser era): map-kit — tile-layout primitives for custom builders.
// Re-derived from templates/modules/map-kit.js (D20). Provenance: 11+ hand-
// rolled builders across sofia-bday-30 + the five baseline eval games.
//
// This module BARELY changes on Phaser, by design: builders write into the
// engine's TM grid (identical set/get/sol/solUp API), and the Phaser engine's
// GameScene.buildMap() realizes that grid into merged Arcade STATIC bodies with
// real swept collision (rest-gap==0, no tunnel). So the layout vocabulary ports
// verbatim; only what consumes the grid downstream changed (immediate-mode
// tm.draw() → retained Arcade static bodies). Layouts stay per-game (that IS
// the personalization); the primitives don't have to.
//
// Tile legend (engine TM): 0 air · 1 solid · 2 decor-solid · 3 one-way
// platform · 4 hazard · 5 rubble. Maps must be ≥ MAP_H (34) tiles tall.
//
// Usage in a game's data.js (builders run BEFORE Phaser bodies exist — pure grid):
//   function buildTavern(tm,W,H){
//     MapKit.groundBand(tm,W,H);                       // the universal floor
//     MapKit.platform(tm,18,H-7,6);                    // a long table (one-way)
//     MapKit.block(tm,25,H-5,2,2);                     // crates (solid cover)
//     MapKit.stairs(tm,58,H-4,8);                      // stairs up, rightward
//     MapKit.profile(tm,W,H,x=>H-4-Math.min(7,x/9|0));// rising trail
//   }
// Compose freely with raw tm.set for one-off details — MapKit is a vocabulary,
// not a cage.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const MapKit = {
  // The universal floor: `rows` solid rows across the full width.
  groundBand(tm, W, H, rows, tile) {
    rows = rows === undefined ? 3 : rows; tile = tile === undefined ? 1 : tile;
    for (let x = 0; x < W; x++) for (let r = 1; r <= rows; r++) tm.set(x, H - r, tile);
  },
  // One-way platform run (tables, ledges, piers, sofas, desks).
  platform(tm, x, y, w) { for (let i = 0; i < w; i++) tm.set(x + i, y, 3); },
  // Solid rect anchored at its TOP-left (counters, crates, gift piles, walls).
  block(tm, x, y, w, h, tile) {
    tile = tile === undefined ? 2 : tile;
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) tm.set(x + dx, y + dy, tile);
  },
  // Vertical pillar rising `h` tiles from (and excluding) the row `yBottom`.
  pillar(tm, x, yBottom, h, w, tile) {
    w = w === undefined ? 2 : w; tile = tile === undefined ? 2 : tile;
    for (let y = yBottom - 1; y > yBottom - 1 - h; y--) for (let i = 0; i < w; i++) tm.set(x + i, y, tile);
  },
  // Solid staircase: `steps` 1-tile risers from (x, yBase) going up-right
  // (dir=1) or up-left (dir=-1); each column fills down to yBase.
  stairs(tm, x, yBase, steps, dir, tile) {
    dir = dir === undefined ? 1 : dir; tile = tile === undefined ? 1 : tile;
    for (let s = 0; s <= steps; s++) for (let y = yBase - s; y <= yBase; y++) tm.set(x + s * dir, y, tile);
  },
  // Terrain from a top-height function: fills solid from topFn(x) to bottom.
  // (Trails, dunes, hills — the dolomite/beach pattern.)
  profile(tm, W, H, topFn, tile) {
    tile = tile === undefined ? 1 : tile;
    for (let x = 0; x < W; x++) { const top = topFn(x); for (let y = top; y < H; y++) tm.set(x, y, tile); }
  },
  // Rubble pile (tile 5): blockable, diggable-looking debris.
  rubble(tm, x, y, w, h) { this.block(tm, x, y, w, h, 5); },
  // Hazard row (tile 4): spikes, lava, slippery holds (engine overlap-damage).
  hazards(tm, x, y, w) { for (let i = 0; i < w; i++) tm.set(x + i, y, 4); },
};

if (typeof window !== 'undefined') window.MapKit = MapKit;
