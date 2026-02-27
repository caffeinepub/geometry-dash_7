# Specification

## Summary
**Goal:** Build "Pixel Dash," a Geometry Dash-inspired 2D pixel art platformer with a game engine, level editor, community hub, and global leaderboard, backed by a Motoko canister on the Internet Computer with Internet Identity authentication.

**Planned changes:**

**Backend (Motoko):**
- Single actor in `backend/main.mo` storing player profiles (principal → username, unlocked levels, attempts, best scores), community levels (id, creator, title, tile data, play count, ratings), and a global leaderboard (top scores per level)
- Endpoints: create/update player profile, get/update level progress, publish/list/delete/get community levels, submit score, get top-10 leaderboard per level, submit/get ratings
- All state survives canister upgrades via stable storage

**Frontend:**
- Internet Identity login/logout in the navigation; authenticated state via React context
- 2D platformer game engine on HTML canvas: auto-running cube, Space/tap to jump, collision detection with spikes/blocks, death-restart loop, completion percentage HUD, level completion screen with score/attempts
- At least 3 pre-built tile-map levels with unique color themes and increasing difficulty
- Level-select screen showing level name, difficulty, player best score, and attempt count; sequential unlock
- Drag-and-drop pixel art tile-grid level editor with scrollable canvas, sidebar palette (empty, ground, spike, jump pad, decorative), undo/redo, play-test mode, and Publish button (authenticated only)
- Community Levels hub listing published levels with title, creator, play count, and average rating; play and post-completion 1–5 star rating; delete own levels
- Global Leaderboard page showing top 10 scores per level with rank, player name, score, and date; level tabs/dropdown; authenticated player's row highlighted
- Cohesive retro pixel art visual theme: pixel/retro Google Font, dark background with neon accents, pixelated canvas sprites, pixel-bordered UI components across all pages
- Sprite assets served from `frontend/public/assets/generated` and referenced by the game engine and editor

**User-visible outcome:** Players can log in with Internet Identity, play pre-built and community-created pixel art platformer levels, track their best scores and attempts, design and publish their own levels in a full tile editor, rate community levels, and compete on a global leaderboard — all within a cohesive retro arcade visual experience.
