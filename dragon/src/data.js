// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — game data (Phaser engine phaser-1.10.0)
// A rebuild of the Dragonlance platformer with FULLY AI-generated (Retro Diffusion)
// art: crisp rd_pro__platformer hero poses animated by rd_advanced_animation
// (walk/attack/idle) → sliced to engine atlases; rd_tile__tileset textured platforms;
// rd_plus__environment parallax backdrops; rd_pro__fantasy enemies + a red dragon.
// Bigger sprites (GAME_CONFIG.actorScale + heroBody). Party of 5 with live swap.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

// ═══ HERO STATS ═══ (per-1/60s-frame units) — the five misfit students.
const HERO_STATS = {
  kote:    { hp: 80,  spd: 2.7, jf: -10.0, atkDmg: 42, atkRange: 34, skillMult: 3.2, skillRange: 46, dashDur: 0.09 },        // glass-cannon melee
  minerva: { hp: 175, spd: 1.9, jf: -8.6,  atkDmg: 26, atkRange: 38, skillMult: 2.6, skillRange: 60, dashDur: 0.18 },        // tank, big cleave
  elber:   { hp: 120, spd: 2.1, jf: -9.0,  atkDmg: 30, atkRange: 34, skillMult: 2.6, skillRange: 58, dashDur: 0.14, ranged: true }, // amber bolts
  nesta:   { hp: 85,  spd: 2.9, jf: -10.0, atkDmg: 28, atkRange: 30, skillMult: 2.9, skillRange: 64, dashDur: 0.08, ranged: true }, // violet lightning
  nick:    { hp: 110, spd: 1.9, jf: -8.6,  atkDmg: 18, atkRange: 32, isHealer: true, healAmt: 32, dashDur: 0.16 },            // healer
};

// ═══ ENEMY HP TIERS ═══ (the dragon Kansaldi's HP is high; the fight ends in a
// scripted escape, not a kill — she's the "unwinnable" finale, but the player
// survives → victory. Bakaris is a forgiving mid-boss that concedes.)
const EHP = { goblin: 55, knight: 90, draconian: 120, miniboss: 160, boss: 900 };

// ═══ FALLBACK PALETTES ═══ (used ONLY if an atlas PNG fails to load; the shipped
// look is the RD atlas. 6-key hero schema / enemy shape+body+accent+eye.)
const FallbackPalettes = {
  heroes: {
    kote:    { skin: '#c98a5a', hair: '#241c18', top: '#3a7a55', bottom: '#5a5238', accent: '#c8c8d0', boots: '#2a2018' },
    minerva: { skin: '#e8c4a0', hair: '#c0392b', top: '#d4a830', bottom: '#8a8f98', accent: '#e8e0c8', boots: '#3a342a' },
    elber:   { skin: '#d8b088', hair: '#5a4030', top: '#4a7a3a', bottom: '#5a4a38', accent: '#c8a830', boots: '#3a3028' },
    nesta:   { skin: '#c8b8c0', hair: '#d0d0e0', top: '#3a2a5a', bottom: '#1a0a3a', accent: '#6a88ff', boots: '#241a34' },
    nick:    { skin: '#d0a066', hair: '#e0e0e8', top: '#1a1a3a', bottom: '#12122a', accent: '#44ff88', boots: '#2a2a3a' },
  },
  enemies: {
    goblin:    { shape: 'biped', body: '#4a8a4a', accent: '#c8b030', eye: '#ffee44' },
    knight:    { shape: 'biped', body: '#8a8f98', accent: '#c0392b', eye: '#161616' },
    draconian: { shape: 'biped', body: '#6a8844', accent: '#3a5a2a', eye: '#e8d060' },
    bakaris:   { shape: 'biped', body: '#c8a848', accent: '#c0392b', eye: '#3a2a20' },
    kansaldi:  { shape: 'brute', body: '#8a1a1a', accent: '#ff8844', eye: '#ffcc44' },
  },
};

// ═══ GAME CONFIG ═══
// - anims OBJECT form: attack held (repeat:0), idle slow-breath (fps:3).
// - actorScale: heroes 1.2× (bigger, owner ask); the dragon 2.4×.
// - heroBody [22,64]: sizes the hero collision body to the RD atlas cell (48×64) so
//   feet rest flush. Enemies size via their constructor w,h.
// - tile textures are set PER-SCENE (this.tileTextures) — castle vs ruins.
const GAME_CONFIG = {
  langButtons: 'off', scrollsPerRun: 3, physics: 'arcade', hazardDamage: true,
  anims: { fps: 8, clips: { attack: { repeat: 0, fps: 12 }, idle: { fps: 3 } } },
  actorScale: { hero: 1.2, kansaldi: 1.7 },
  heroBody: [22, 64],
  bgParallax: 0.5,
  // HUD face portraits (phaser-1.11.0) — surface the RD character art in the party bar,
  // keyed by hero TYPE; also disambiguates Nesta/Nick (both initial "N"). Baked from each
  // hero atlas's idle head via tools/bake-face.mjs. Absent → legacy initial badges.
  hudPortraits: {
    kote: 'assets/face_kote.png', minerva: 'assets/face_minerva.png', elber: 'assets/face_elber.png',
    nesta: 'assets/face_nesta.png', nick: 'assets/face_nick.png',
  },
};

// ═══ ASSET MANIFEST ═══ (RD-generated, sliced/copied into assets/. Hero + enemy
// atlases animate via GAME_CONFIG.anims; images = tilesets + backdrops + familiars.)
const SpriteConfig = {};
const ASSET_MANIFEST = [
  { type: 'atlas', key: 'atlas_hero_kote',    texture: 'assets/hero_kote.png',    frames: 'assets/hero_kote.json' },
  { type: 'atlas', key: 'atlas_hero_minerva', texture: 'assets/hero_minerva.png', frames: 'assets/hero_minerva.json' },
  { type: 'atlas', key: 'atlas_hero_elber',   texture: 'assets/hero_elber.png',   frames: 'assets/hero_elber.json' },
  { type: 'atlas', key: 'atlas_hero_nesta',   texture: 'assets/hero_nesta.png',   frames: 'assets/hero_nesta.json' },
  { type: 'atlas', key: 'atlas_hero_nick',    texture: 'assets/hero_nick.png',    frames: 'assets/hero_nick.json' },
  { type: 'atlas', key: 'atlas_enemy_goblin',    texture: 'assets/enemy_goblin.png',    frames: 'assets/enemy_goblin.json' },
  { type: 'atlas', key: 'atlas_enemy_knight',    texture: 'assets/enemy_knight.png',    frames: 'assets/enemy_knight.json' },
  { type: 'atlas', key: 'atlas_enemy_draconian', texture: 'assets/enemy_draconian.png', frames: 'assets/enemy_draconian.json' },
  { type: 'atlas', key: 'atlas_enemy_bakaris',   texture: 'assets/enemy_bakaris.png',   frames: 'assets/enemy_bakaris.json' },
  { type: 'atlas', key: 'atlas_enemy_kansaldi',  texture: 'assets/enemy_kansaldi.png',  frames: 'assets/enemy_kansaldi.json' },
  { type: 'image', key: 'bg_arena', path: 'assets/bg_arena.png' },
  { type: 'image', key: 'bg_ruins', path: 'assets/bg_ruins.png' },
  { type: 'image', key: 'tile_castle', path: 'assets/tile_castle.png' },
  { type: 'image', key: 'tile_ruins',  path: 'assets/tile_ruins.png' },
  { type: 'image', key: 'pet_fox',      path: 'assets/pet_fox.png' },
  { type: 'image', key: 'pet_skeleton', path: 'assets/pet_skeleton.png' },
];

// ═══ MAP ═══ (H = MAP_H = 34; flat + forgiving, gentle platforming)
const MAP_H = 34;

// Left + right boundary walls so no one runs off the world (studio lane-end pattern).
function bounds(tm, W, H) { MapKit.block(tm, 0, H - 12, 1, 9); MapKit.block(tm, W - 2, H - 12, 2, 9); }

// LEVEL 1 — THE ARENA (castle). Flat combat ground + a couple of one-way ledges.
function buildArenaA1(tm, W, H) {
  MapKit.groundBand(tm, W, H, 3);
  MapKit.platform(tm, 22, H - 8, 6); MapKit.platform(tm, 46, H - 10, 6); MapKit.platform(tm, 68, H - 8, 6);
  bounds(tm, W, H);
}
function buildArenaA2(tm, W, H) {
  MapKit.groundBand(tm, W, H, 3);
  MapKit.platform(tm, 30, H - 9, 6); MapKit.platform(tm, 60, H - 9, 6);
  bounds(tm, W, H);
}
// LEVEL 2 — WHEN THE HOME BURNS (ruins). Flat arena for the boss rush + dragon.
function buildRuinsA1(tm, W, H) {
  MapKit.groundBand(tm, W, H, 3);
  MapKit.platform(tm, 26, H - 9, 6); MapKit.platform(tm, 52, H - 11, 6); MapKit.platform(tm, 74, H - 9, 6);
  bounds(tm, W, H);
}
function buildDragonArena(tm, W, H) {   // wide + flat — the dragon needs room
  MapKit.groundBand(tm, W, H, 3);
  bounds(tm, W, H);
}
