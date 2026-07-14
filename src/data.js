// ═══════════════════════════════════════════════════════════════════════════
// FLOR DE SAL — game data
// A personalized mini-game made for Guida, celebrating forty years of her flower
// shop. Heroes/boss (Guida / Teo / Senhor Bento) + painted scene backdrops
// (shop / garden / plaza) + Feijao the goat. GAME_CONFIG.anims plays each actor's
// per-state clip; the attack clip holds its last frame (a decisive, held gesture).
// Strings live in strings.js; each scene sets its own painted backdrop.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

// ═══ HERO STATS ═══ (per-1/60s-frame units — spd/jf px/frame; engine scales by FPS)
// guida: the player — steady, nurturing. Z = a decisive marigold-scatter (her held
//        attack pose); Q = "os meus solinhos", a bigger marigold-burst skill
//        (skillMult 2.4 → max single hit 20*2.4 = 48). PER-STATE ANIMATED ATLAS.
// teo:   grandson companion, on-field in L1 (helps in the shop). Basic swing, no
//        skill. PER-STATE ANIMATED ATLAS.
const HERO_STATS = {
  guida: { hp: 150, spd: 2.1, jf: -8.8, atkDmg: 20, atkRange: 34, skillMult: 2.4, skillRange: 52, dashDur: 0.12 },
  teo:   { hp: 120, spd: 2.2, jf: -8.8, atkDmg: 18, atkRange: 30 },
};

// ═══ ENEMY HP TIERS ═══ (very forgiving — wilts/aphids/beetles fall in a hit or two.
// Bento's boss HP is tuned so the 30% concede threshold (54) is GREATER than Guida's
// biggest single hit (the marigold-burst skill, atkDmg 20 × skillMult 2.4 = 48). So
// no single blow can carry Bento from above the threshold to hp≤0 — the concede
// freeze (L3-A2 step) ALWAYS fires first and Bento NEVER dies. 180 → 30% = 54 > 48.)
const EHP = { wilt: 10, aphid: 16, beetle: 16, miniboss: 90, boss: 180 };

// ═══ FALLBACK PALETTES ═══
// guida/teo MUST use the EXACT atlas bake params so the procedural fallback matches
// the studio-baked per-state atlas. bento's fallback (enemy body/accent/eye schema)
// is used ONLY if the PNG fails — the SHIPPED look is atlas_enemy_bento, baked from
// HERO palette keys (F27). wilt/aphid/beetle are procedural single-frame (no atlas).
const FallbackPalettes = {
  heroes: {
    guida: { skin: '#e8c4a0', hair: '#d8d8de', top: '#6a8f6a', bottom: '#46583f', accent: '#e8a33d', boots: '#6a4a32' },
    teo:   { skin: '#d8a878', hair: '#2e2118', top: '#3f5f8f', bottom: '#8a7a5a', accent: '#cdd8e4', boots: '#4a3a2a' },
  },
  enemies: {
    // Senhor Bento — PNG-FAIL fallback ONLY (shipped look = atlas_enemy_bento).
    bento:  { shape: 'brute', body: '#565b66', accent: '#b03030', eye: '#161616' },
    // garden pests — procedural single-frame, small.
    wilt:   { shape: 'biped', body: '#8a9a6a', accent: '#b08a3a', eye: '#3a2a20' },
    aphid:  { shape: 'biped', body: '#7ba05a', accent: '#c8d888', eye: '#1a2410' },
    beetle: { shape: 'biped', body: '#4a3f38', accent: '#8a6a3a', eye: '#e8d060' },
  },
};

// ═══ GAME CONFIG ═══ (PT default + EN toggle via langButtons:'auto'; forgiving —
// 5 second-winds/run; anims OBJECT form (D31): global fps:8; `attack` clip repeat:0
// (play ONCE and HOLD) at fps:12 — Guida's marigold-scatter + Bento's citation
// wind-up connect-and-hold; `idle` fps:4 — a slow calm breath. bgParallax 0.5 for
// the RD image backdrops. NO hazards — this is a warm garden, nothing dangerous.)
const GAME_CONFIG = {
  langButtons: 'auto', scrollsPerRun: 5, physics: 'arcade', hazardDamage: true,
  anims: { fps: 8, clips: { attack: { repeat: 0, fps: 12 }, idle: { fps: 4 } } },
  bgParallax: 0.5,
};

// ═══ SPRITE / ASSET MANIFEST ═══ (RD-generated, pre-baked into assets/. Atlases:
// guida/teo/bento animate (mode-per-type). Images: the three RD scene backdrops
// (wired via this.bgImage → the phaser-1.9.0 image-backdrop path) + the RD goat.)
const SpriteConfig = {};
const ASSET_MANIFEST = [
  { type: 'atlas', key: 'atlas_hero_guida', texture: 'assets/hero_guida.png', frames: 'assets/hero_guida.json' },
  { type: 'atlas', key: 'atlas_hero_teo',   texture: 'assets/hero_teo.png',   frames: 'assets/hero_teo.json' },
  { type: 'atlas', key: 'atlas_enemy_bento', texture: 'assets/enemy_bento.png', frames: 'assets/enemy_bento.json' },
  { type: 'image', key: 'bg_shop',   path: 'assets/bg_shop.png' },
  { type: 'image', key: 'bg_garden', path: 'assets/bg_garden.png' },
  { type: 'image', key: 'bg_plaza',  path: 'assets/bg_plaza.png' },
  { type: 'image', key: 'pet_feijao', path: 'assets/pet_feijao.png' },
];

// ═══ MAP ═══ (all H = MAP_H = 34; flat + forgiving — Guida has never played a game)
const MAP_H = 34;

// Left + right BOUNDARY walls at the world edges (past every objective) so neither
// the recipient nor a stray input can walk off the end of the world into the void
// (the studio lane-end pattern). Tall enough not to be hopped; tinted per-scene.
function bounds(tm, W, H) {
  MapKit.block(tm, 0, H - 11, 1, 8);            // left boundary
  MapKit.block(tm, W - 2, H - 11, 2, 8);        // right boundary
}

// ─── LEVEL 1 — FLOR DE SAL (the shop interior). Flat, safe. The RD backdrop
// (bg_shop) supplies ALL the scenery (shelves, pots, buckets, the window), so the
// gameplay grid stays MINIMAL: the floor + a couple of one-way shelf-ledges (which
// never block the walking lane) + one LOW hop block. NO tall solids in the lane
// (they would wall off the recipient — a florist should never hit a wall), NO
// hazards. The walking lane is clear straight through so every plant is reachable. ───

// A1 — the tutorial: walk the lane and water the three wilted plants at 30/50/70
// (static "wilt" targets → Guida's held marigold-scatter reads). Flat, clear lane.
function buildShopA1(tm, W, H) {
  MapKit.groundBand(tm, W, H);                 // tiled shop floor
  MapKit.platform(tm, 20, H - 7, 5);           // a shelf-ledge to hop (one-way, never blocks)
  MapKit.platform(tm, 58, H - 8, 5);           // a higher shelf-ledge (one-way)
  bounds(tm, W, H);
}

// A2 — closing time: walk the lane and shoo the aphids at 34/50/66. Flat, clear.
function buildShopA2(tm, W, H) {
  MapKit.groundBand(tm, W, H);
  MapKit.platform(tm, 24, H - 7, 5);           // shelf-ledge (one-way)
  MapKit.platform(tm, 56, H - 8, 5);           // shelf-ledge (one-way)
  bounds(tm, W, H);
}

// ─── LEVEL 2 — O JARDIM (the community garden). Golden hour. Gentle platforming
// over raised flower beds (one-way ledges — never block); the fig tree at the far
// end is the goal. RD backdrop (bg_garden) supplies the trees/beds/rooftops. ───

// A1 — walk/hop the beds to the fig tree (POSITIONAL win at the far side). Clear lane.
function buildGardenA1(tm, W, H) {
  MapKit.groundBand(tm, W, H);                 // garden path
  MapKit.platform(tm, 18, H - 7, 6);           // bed-ledge (one-way)
  MapKit.platform(tm, 34, H - 9, 6);           // higher bed-ledge (one-way)
  MapKit.platform(tm, 52, H - 7, 6);           // bed-ledge (one-way)
  MapKit.platform(tm, 74, H - 8, 6);           // bed-ledge (one-way)
  bounds(tm, W, H);
}

// A2 — shoo the beetles at 40/58 off the dahlias, coax Feijao back. Flat, clear.
function buildGardenA2(tm, W, H) {
  MapKit.groundBand(tm, W, H);
  MapKit.platform(tm, 22, H - 7, 6);           // bed-ledge (one-way)
  MapKit.platform(tm, 52, H - 8, 6);           // bed-ledge (one-way)
  bounds(tm, W, H);
}

// ─── LEVEL 3 — A PRACA (the town plaza at dusk). The retirement party. FLAT (the
// boss needs room to pace; no slopes). RD backdrop (bg_plaza) supplies the fountain,
// arches, string lights. Bunting strands are one-way (never block); no tall solids
// in the lane, nothing overlaps the spawn. ───

// The plaza arena — used for A1 (banter) and A2 (the boss). Wide + flat + clear.
function buildPlazaArena(tm, W, H) {
  MapKit.groundBand(tm, W, H);                 // cobblestone plaza
  bounds(tm, W, H);
}

// The A3 carry-off finale floor — the whole street turns out. Flat, festive, clear.
function buildPlazaFinale(tm, W, H) {
  MapKit.groundBand(tm, W, H);
  bounds(tm, W, H);
}
