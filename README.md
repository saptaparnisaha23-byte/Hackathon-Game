# 🌴 Tiki Topple — NPC Board2Code Hackathon 2026

> A real-time multiplayer strategy board game with a tropical neon tiki island theme. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase.

![TypeScript](https://img.shields.io/badge/TypeScript-97.1%25-3178C6?style=flat-square&logo=typescript)
![CSS](https://img.shields.io/badge/CSS-2.0%25-1572B6?style=flat-square&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Game Rules](#-game-rules)
- [Scoring Formula](#-scoring-formula)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [DSA & Algorithms](#-dsa--algorithms)
- [AI Opponent](#-ai-opponent)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Supabase Schema](#-supabase-schema)
- [Multiplayer & Realtime](#-multiplayer--realtime)
- [Assumptions](#-assumptions)
- [Deployment](#-deployment)

---

## 🎮 Overview

**Tiki Topple** is a turn-based strategy game for 2–4 players. All 20 tokens begin in a single vertical master stack. On each turn, players can move or reorder only the top 1–3 tokens. The goal: get your tokens as far along a 25-position linear track as possible before 30 turns run out.

### Key Features

- ✅ Real-time multiplayer via Supabase Realtime
- ✅ Hotseat (local) mode for testing
- ✅ Create/Join rooms with shareable codes
- ✅ Smart server-side AI opponent (Minimax + Alpha-Beta pruning)
- ✅ Drag-and-drop reorder using `@dnd-kit/core`
- ✅ Framer Motion animations (arc topple, shuffle, confetti)
- ✅ Tropical Neon Tiki Island UI theme
- ✅ Sound effects (wave crash, tiki drum, victory chant)
- ✅ Mobile-first responsive design
- ✅ Deploy-ready (Vercel + Supabase)

---

## 🃏 Game Rules

| Rule | Value |
|------|-------|
| Players | 2–4 |
| Tokens per player | 5 (total 20, randomly shuffled at start) |
| Starting position | All 20 tokens in ONE vertical master stack |
| Board length | 25 positions (0 → 25) |
| Max turns | 30 |
| Actions per turn | Exactly **1** |

### Valid Actions

1. **Move** — Move the top 1, 2, or 3 tokens **forward by exactly 1 step** onto the linear track. Token order must stay the same.
2. **Reorder** — Rearrange the top 2 or 3 tokens and place them back on top of the master stack (does not advance positions).

### Turn End

A player's turn ends after one valid action. If a player has no tokens left in the master stack, they may still reorder others' tokens or pass.

---

## 🏆 Scoring Formula

Scoring occurs **at the end of the game** (all tokens at position 25, or after turn 30).

```
1. Collect all 20 tokens with their final positions.
2. Sort tokens by final position (descending). Ties are broken stably.
3. Assign points: 1st place = 20 pts, 2nd = 19 pts, ..., 20th = 1 pt.
4. Each player's total score = sum of points of ONLY their own tokens.
```

**Example:** If Player 2's tokens rank 1st, 4th, 8th, 11th, and 15th, their score = 20 + 17 + 13 + 10 + 6 = **66 points**.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 + shadcn/ui |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit/core |
| Sound | use-sound |
| Particles | react-tsparticles |
| Realtime DB | Supabase Realtime |
| Auth | Supabase Auth |
| Deployment | Vercel + Supabase |

### Color Palette (Tropical Neon Tiki Island)

| Name | Hex |
|------|-----|
| Background | `#0A1F2C` |
| Neon Coral | `#FF6B6B` |
| Sunset Orange | `#FF9F1C` |
| Teal | `#06D6A0` |
| Gold | `#FFFD66` |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│               Next.js App Router             │
│  ┌──────────────┐    ┌─────────────────────┐ │
│  │  React Pages │    │  API Routes          │ │
│  │  & Components│    │  /api/game/move      │ │
│  │              │    │  /api/game/ai-turn   │ │
│  └──────┬───────┘    └────────┬────────────┘ │
│         │                     │               │
│  ┌──────▼─────────────────────▼────────────┐ │
│  │           GameLogic.ts (Core Class)      │ │
│  │  Token | Player | GameState | Validator  │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────┘
                        │
             ┌──────────▼──────────┐
             │   Supabase          │
             │  - Realtime Broadcast│
             │  - PostgreSQL DB    │
             │  - Auth             │
             └─────────────────────┘
```

### Core Principle

**The backend is 100% authoritative.** All game logic, validation, and AI decisions run server-side in API routes. The client is a pure view layer — it displays state and sends action intents.

---

## 🧮 DSA & Algorithms

### 1. Master Stack — Custom Stack/Deque

```typescript
// Implemented as a typed array with O(1) top access
class TokenStack {
  private tokens: Token[] = [];
  peek(n: number): Token[]  { return this.tokens.slice(-n); }   // O(n), n ≤ 3
  popTop(n: number): Token[] { return this.tokens.splice(-n); } // O(n), n ≤ 3
  push(...t: Token[]): void  { this.tokens.push(...t); }        // O(1) amortized
}
```

Since n is bounded at 3, all stack operations are effectively **O(1)**.

### 2. Move Validation

Validation checks if a move is legal in **O(1)**:
- Count of tokens is 1, 2, or 3 ✓
- Token order preserved (for MOVE action) ✓
- It is the current player's turn ✓
- Game has not ended ✓

### 3. Scoring — Stable Sort + Ranking

```typescript
// O(n log n) stable sort, then linear scan to assign points
const ranked = allTokens
  .slice()
  .sort((a, b) => b.position - a.position); // descending, stable

ranked.forEach((token, idx) => {
  scores[token.ownerId] += (TOTAL_TOKENS - idx); // 20, 19, ..., 1
});
```

### 4. Reorder with Slicing

```typescript
// O(n) where n ≤ 3
function reorderTop(stack: Token[], newOrder: Token[]): Token[] {
  const base = stack.slice(0, -newOrder.length);
  return [...base, ...newOrder]; // validates newOrder is a permutation of removed tokens
}
```

---

## 🤖 AI Opponent

The AI runs **fully server-side** in `/api/game/ai-turn`. When it is the AI's turn, the server automatically:

1. Generates all legal moves for the current state.
2. Runs **Minimax with Alpha-Beta pruning** at depth 3.
3. Executes the best move and broadcasts the new state via Supabase Realtime.

### Heuristic

```
h(state) = Σ(position of AI's tokens) − Σ(position of leading opponent's tokens)
```

A positive score favors the AI; negative favors opponents.

### Minimax Pseudocode

```
minimax(state, depth, α, β, isMaximizing):
  if depth == 0 or game over: return heuristic(state)
  
  if isMaximizing:
    best = -∞
    for each legal move:
      score = minimax(apply(move, state), depth-1, α, β, false)
      best = max(best, score)
      α = max(α, best)
      if β ≤ α: break  // Alpha-Beta pruning
    return best
  else:
    ...symmetric...
```

Depth is fixed at **3** for a balance of speed and intelligence.

---

## 📁 Project Structure

```
tiki-topple/
├── public/                   # Static assets (sounds, icons)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page (create/join room)
│   │   ├── game/[roomId]/
│   │   │   └── page.tsx      # Main game page
│   │   └── api/
│   │       ├── game/
│   │       │   ├── create/route.ts
│   │       │   ├── join/route.ts
│   │       │   ├── move/route.ts
│   │       │   └── ai-turn/route.ts
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── game/
│   │   │   ├── MasterStack.tsx
│   │   │   ├── LinearTrack.tsx
│   │   │   ├── ActionBar.tsx
│   │   │   ├── ReorderModal.tsx
│   │   │   ├── PlayerAvatar.tsx
│   │   │   ├── TurnTimer.tsx
│   │   │   ├── EndScreen.tsx
│   │   │   └── TokenChip.tsx
│   ├── lib/
│   │   ├── GameLogic.ts      # Core game engine (Token, Player, GameState)
│   │   ├── supabase.ts       # Supabase client setup
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useGameState.ts   # Supabase Realtime subscription
│   │   └── useTimer.ts
│   └── types/
│       └── game.ts           # Shared TypeScript interfaces
├── .env.local.example
├── README.md
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/saptaparnisaha23-byte/Hackathon-Game.git
cd Hackathon-Game

# 2. Install dependencies
npm install
# or
bun install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key (see below)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these in your Supabase project under **Settings → API**.

---

## 🗄 Supabase Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Game rooms table
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  state jsonb not null,
  mode text check (mode in ('online', 'hotseat')) default 'online',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table rooms enable row level security;

-- Allow public read/write for room joining (customize for auth)
create policy "Public access" on rooms for all using (true);
```

Supabase Realtime is used via the **Broadcast** channel — no additional tables needed for real-time events.

---

## 📡 Multiplayer & Realtime

Rooms communicate over a Supabase Realtime Broadcast channel named `room:{roomCode}`.

| Event | Direction | Payload |
|-------|-----------|---------|
| `game:state_update` | Server → All clients | Full `GameState` JSON |
| `game:player_joined` | Server → All clients | `{ playerId, playerName }` |
| `game:turn_timeout` | Server → All clients | `{ playerId }` |

All clients subscribe on mount:

```typescript
supabase
  .channel(`room:${roomCode}`)
  .on('broadcast', { event: 'game:state_update' }, ({ payload }) => {
    setGameState(payload.state);
  })
  .subscribe();
```

---

## 📌 Assumptions

1. **No persistent login required** — players are identified by a session UUID stored in `localStorage`. Supabase Auth is optional and can be added for leaderboards.
2. **AI always plays as Player 4** in online rooms when fewer than 4 humans join.
3. **Turn timer (30 seconds)** is enforced client-side for UX; the server auto-advances the turn on timeout via a Supabase Edge Function (optional).
4. **Hotseat mode** uses the same `GameLogic.ts` but skips Supabase Realtime — all state is local.
5. **Ties** in scoring are broken by the order tokens appear in the initial shuffled stack (stable sort).
6. **Board position 0** is the master stack; positions 1–25 are the linear track. A token "at position 0" is still in the master stack.

---

## 🌐 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set the same environment variables in the Vercel project dashboard under **Settings → Environment Variables**.

### Supabase

No additional setup needed beyond the schema above. Realtime is enabled by default on all Supabase projects.

---

## 👤 Author

**Saptaparni Saha** — [github.com/saptaparnisaha23-byte](https://github.com/saptaparnisaha23-byte)

---

## 📜 License

MIT © 2026 Saptaparni Saha
