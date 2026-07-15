# 🎮 Demos

Playable browser mini-games built by the studio's automated production line — pure
Phaser (vendored, zero install / zero build), fully AI-generated (Retro Diffusion) art.
Each folder is self-contained: open its `index.html` over any static host and it runs.

## ▶ Play

| Game | Link | About |
|------|------|-------|
| ⚔️ **Chronicles of Azurerune** | **https://poggig.github.io/demos/dragon/** | A 5-level / 26-act action platformer. Five heroes with personalized skills + ultimates, live party swap, stealth, an underwater air-gauge, a fishing minigame, a masquerade, and a boss-rush finale against a dragon. |
| 🌸 **Flor de Sal** | **https://poggig.github.io/demos/** | A short, warm personalized gift game (a florist's retirement) — playable in Portuguese + English. |

## 🕹️ Controls (Azurerune)

- **← / →** move · **↑ / W / Space** jump (double-jump!) · **Z / J** attack
- **Q / L** skill · **X** ultimate · **K** dash · **Tab / 1–5** swap hero · **R** revive · **Esc** pause · **M** music

## 🛠️ Tech

No frameworks-of-frameworks, no build step: a vendored `phaser.min.js` `<script>` tag +
plain-JS `src/`. Every game is a single shareable folder. Art is generated with
Retro Diffusion and assembled by the studio's asset pipeline.

_These are demos / dry-runs of an automated game studio — no real user data._
