/**
 * GameLogic.ts — Core game engine for Tiki Topple
 * 
 * Implements all game rules with clean OOP design.
 * All validation is O(1), scoring uses O(n log n) stable sort.
 * Stack operations use array-backed custom stack with O(1) top access.
 */

// ==================== TYPES ====================

/** Represents a single token in the game */
export interface Token {
  id: number;        // Unique token ID (0-19)
  playerId: number;  // Owner player (0-3)
  position: number;  // 0 = still in master stack, 1-25 = track position
  color: string;     // Display color
}

/** Player information */
export interface Player {
  id: number;
  name: string;
  isAI: boolean;
  score: number;
  avatar: string;    // Emoji avatar
}

/** Available action types */
export type ActionType = 'MOVE_1' | 'MOVE_2' | 'MOVE_3' | 'REORDER_2' | 'REORDER_3';

/** A game action */
export interface GameAction {
  type: ActionType;
  playerId: number;
  newOrder?: number[];  // Token IDs in new order (for reorder actions)
}

/** Complete game state */
export interface GameState {
  players: Player[];
  tokens: Token[];
  masterStack: number[];    // Token IDs, last element = top of stack
  track: Map<number, number[]>; // position -> token IDs stacked there
  currentPlayerIndex: number;
  currentTurn: number;
  maxTurns: number;
  boardSize: number;
  gameOver: boolean;
  winner: number | null;     // Player ID with highest score
  turnLog: string[];
}

// ==================== CONSTANTS ====================

const PLAYER_COLORS = [
  ['#FF6B6B', '#FF8E8E', '#FF4D4D', '#CC5555', '#FF7777'],  // Coral shades
  ['#06D6A0', '#33E0B5', '#05B888', '#049E75', '#08C495'],  // Teal shades
  ['#FF9F1C', '#FFB347', '#E68A00', '#CC7A00', '#FFAD33'],  // Orange shades
  ['#FFFD66', '#FFFE8A', '#E6E35C', '#CCCA52', '#FFFD7A'],  // Gold shades
];

const PLAYER_AVATARS = ['🗿', '🌺', '🐢', '🦜'];
const PLAYER_NAMES = ['Moai', 'Hibiscus', 'Turtle', 'Parrot'];

// ==================== CUSTOM STACK (Array-backed) ====================

/**
 * Custom Stack/Deque implementation using Array
 * Provides O(1) top access via array indexing
 * Last element = top of stack for efficient push/pop
 */
export class TokenStack {
  private items: number[];

  constructor(initial: number[] = []) {
    this.items = [...initial];
  }

  /** O(1) — Push token ID to top of stack */
  push(tokenId: number): void {
    this.items.push(tokenId);
  }

  /** O(1) amortized — Pop top token ID */
  pop(): number | undefined {
    return this.items.pop();
  }

  /** O(1) — Peek at top N tokens without removing */
  peekTop(n: number): number[] {
    const len = this.items.length;
    if (n > len) return [...this.items].reverse();
    // Return top N in top-to-bottom order
    return this.items.slice(len - n).reverse();
  }

  /** O(1) — Get top token */
  top(): number | undefined {
    return this.items[this.items.length - 1];
  }

  /** O(n) — Remove top N and return them (top-to-bottom order) */
  popTop(n: number): number[] {
    const removed = this.items.splice(this.items.length - Math.min(n, this.items.length));
    return removed.reverse();
  }

  /** O(k) — Push multiple tokens to top (first element goes deepest) */
  pushMultiple(tokenIds: number[]): void {
    for (const id of tokenIds) {
      this.items.push(id);
    }
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Get copy of internal array */
  toArray(): number[] {
    return [...this.items];
  }
}

// ==================== GAME LOGIC CLASS ====================

export class GameLogic {
  private state: GameState;

  constructor(numPlayers: number = 4, aiPlayers: number[] = [], playerNames?: string[]) {
    this.state = this.initializeGame(numPlayers, aiPlayers, playerNames);
  }

  /** Initialize a new game with shuffled tokens */
  private initializeGame(numPlayers: number, aiPlayers: number[], customNames?: string[]): GameState {
    // Create players
    const players: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: customNames && customNames[i] ? customNames[i] : PLAYER_NAMES[i],
      isAI: aiPlayers.includes(i),
      score: 0,
      avatar: PLAYER_AVATARS[i],
    }));

    // Create 20 tokens (5 per player), assign colors
    const tokens: Token[] = [];
    for (let p = 0; p < numPlayers; p++) {
      for (let t = 0; t < 5; t++) {
        tokens.push({
          id: p * 5 + t,
          playerId: p,
          position: 0,  // All start in master stack
          color: PLAYER_COLORS[p][t],
        });
      }
    }

    // Fisher-Yates shuffle for random stack order — O(n)
    const tokenIds = tokens.map(t => t.id);
    for (let i = tokenIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tokenIds[i], tokenIds[j]] = [tokenIds[j], tokenIds[i]];
    }

    return {
      players,
      tokens,
      masterStack: tokenIds,  // Last element = top
      track: new Map(),
      currentPlayerIndex: 0,
      currentTurn: 1,
      maxTurns: 30,
      boardSize: 25,
      gameOver: false,
      winner: null,
      turnLog: [],
    };
  }

  // ==================== VALIDATION (O(1)) ====================

  /** O(1) — Validate if a move action is legal */
  validateMove(count: number): boolean {
    if (this.state.gameOver) return false;
    if (count < 1 || count > 3) return false;
    // Must have enough tokens in stack
    return this.state.masterStack.length >= count;
  }

  /** O(1) — Validate if a reorder action is legal */
  validateReorder(count: number): boolean {
    if (this.state.gameOver) return false;
    if (count !== 2 && count !== 3) return false;
    return this.state.masterStack.length >= count;
  }

  // ==================== ACTIONS ====================

  /** Execute a MOVE action: move top 1/2/3 tokens forward by 1 step */
  executeMove(count: number): boolean {
    if (!this.validateMove(count)) return false;

    const stack = new TokenStack(this.state.masterStack);
    // Pop top N tokens (returned in top-to-bottom order)
    const movedIds = stack.popTop(count);
    this.state.masterStack = stack.toArray();

    // Move each token to position 1 on the track (they start their journey)
    // Tokens maintain their relative order on the track position
    for (const tokenId of movedIds) {
      const token = this.state.tokens[tokenId];
      token.position = 1; // Enter track at position 1

      // Add to track
      if (!this.state.track.has(1)) {
        this.state.track.set(1, []);
      }
      this.state.track.get(1)!.push(tokenId);
    }

    // Now advance ALL tokens already on the track by 1 position
    // Process from highest position to lowest to avoid conflicts
    const newTrack = new Map<number, number[]>();
    const positions = Array.from(this.state.track.keys()).sort((a, b) => b - a);
    
    for (const pos of positions) {
      const tokensAtPos = this.state.track.get(pos)!;
      for (const tid of tokensAtPos) {
        const newPos = Math.min(pos + 1, this.state.boardSize);
        this.state.tokens[tid].position = newPos;
        if (!newTrack.has(newPos)) newTrack.set(newPos, []);
        newTrack.get(newPos)!.push(tid);
      }
    }
    this.state.track = newTrack;

    // Wait — re-read the rules. "Move top 1/2/3 tokens forward by exactly 1 step"
    // This means: take top tokens from stack, place them on track, each advances 1 step
    // Actually the tokens go from stack to position 1. Let me re-interpret:
    // Tokens in the stack are at position 0. Moving forward by 1 = position 1.
    // But tokens already on track don't move. Only the moved tokens advance.
    
    // Let me simplify: moved tokens go to position 1, that's "1 step forward from 0"
    // Actually re-reading: "Move top 1/2/3 tokens forward by exactly 1 step (order must stay the same)"
    // This applies to tokens already on track too? No — "Players can only interact with the top 1, 2, or 3 tokens"
    // meaning tokens in the master stack. So we move them from stack to track position 1.

    // Revert the "advance all" logic — only newly moved tokens go to pos 1
    this.state.track = new Map();
    for (const token of this.state.tokens) {
      if (token.position > 0) {
        if (!this.state.track.has(token.position)) {
          this.state.track.set(token.position, []);
        }
        this.state.track.get(token.position)!.push(token.id);
      }
    }

    const playerName = this.state.players[this.state.currentPlayerIndex].name;
    this.state.turnLog.push(`${playerName} moved ${count} token(s) to track`);

    this.endTurn();
    return true;
  }

  /** Execute a REORDER action: reorder top 2 or 3 tokens in the stack */
  executeReorder(count: number, newOrder: number[]): boolean {
    if (!this.validateReorder(count)) return false;

    // Validate newOrder contains exactly the right token IDs
    const stack = new TokenStack(this.state.masterStack);
    const topTokens = stack.peekTop(count);
    
    if (newOrder.length !== count) return false;
    const sortedNew = [...newOrder].sort();
    const sortedOld = [...topTokens].sort();
    if (JSON.stringify(sortedNew) !== JSON.stringify(sortedOld)) return false;

    // Check that the order actually changed
    // (Optional: allow same order as a "pass"-like move)

    // Remove top N and push new order
    // Array slicing for efficient reorder — O(k) where k = count
    const baseStack = this.state.masterStack.slice(0, this.state.masterStack.length - count);
    // newOrder is top-to-bottom, but stack stores bottom-to-top
    // So reverse newOrder to get stack order
    const reordered = [...newOrder].reverse();
    this.state.masterStack = [...baseStack, ...reordered];

    const playerName = this.state.players[this.state.currentPlayerIndex].name;
    this.state.turnLog.push(`${playerName} reordered top ${count} tokens`);

    this.endTurn();
    return true;
  }

  /** End the current turn and advance to next player */
  private endTurn(): void {
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    
    // Check if we've gone through all players = 1 full round
    if (this.state.currentPlayerIndex === 0) {
      this.state.currentTurn++;
    }

    // Check game end conditions
    if (this.checkGameEnd()) {
      this.state.gameOver = true;
      this.calculateScores();
    }
  }

  /** Check if game should end */
  private checkGameEnd(): boolean {
    // Condition 1: All tokens on track (master stack empty) and all at position 25
    const allAtEnd = this.state.tokens.every(t => t.position >= this.state.boardSize);
    if (allAtEnd) return true;

    // Condition 2: Max turns exceeded
    if (this.state.currentTurn > this.state.maxTurns) return true;

    // Condition 3: No moves possible (stack empty and no reorder possible)
    if (this.state.masterStack.length === 0) return true;

    return false;
  }

  /**
   * Calculate final scores using stable sort + ranking — O(n log n)
   * Sort ALL tokens by position (descending).
   * Assign 20 points for 1st, 19 for 2nd, ..., 1 for 20th.
   * Player score = sum of points for their tokens.
   */
  calculateScores(): void {
    // Stable sort: tokens sorted by position descending, ties broken by token ID ascending
    const sorted = [...this.state.tokens].sort((a, b) => {
      if (b.position !== a.position) return b.position - a.position;
      return a.id - b.id;  // Stable: lower ID ranks higher on tie
    });

    // Assign ranking points: 20 for rank 1, 19 for rank 2, etc.
    const totalTokens = sorted.length; // 20
    const playerScores = new Map<number, number>();
    
    for (let i = 0; i < sorted.length; i++) {
      const points = totalTokens - i;  // 20, 19, 18, ..., 1
      const playerId = sorted[i].playerId;
      playerScores.set(playerId, (playerScores.get(playerId) || 0) + points);
    }

    // Update player scores
    for (const player of this.state.players) {
      player.score = playerScores.get(player.id) || 0;
    }

    // Determine winner
    const sortedPlayers = [...this.state.players].sort((a, b) => b.score - a.score);
    this.state.winner = sortedPlayers[0].id;
  }

  // ==================== GETTERS ====================

  getState(): GameState {
    return { ...this.state, track: new Map(this.state.track) };
  }

  /** Get serializable state (for broadcast) */
  getSerializableState() {
    return {
      ...this.state,
      track: Object.fromEntries(this.state.track),
    };
  }

  /** Load from serialized state */
  static fromSerializable(data: any): GameLogic {
    const game = new GameLogic();
    game.state = {
      ...data,
      track: new Map(Object.entries(data.track).map(([k, v]) => [Number(k), v as number[]])),
    };
    return game;
  }

  getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  getTopTokens(n: number): Token[] {
    const stack = new TokenStack(this.state.masterStack);
    const ids = stack.peekTop(Math.min(n, stack.size));
    return ids.map(id => this.state.tokens[id]);
  }

  getMasterStackTokens(): Token[] {
    // Return top-to-bottom order
    return [...this.state.masterStack].reverse().map(id => this.state.tokens[id]);
  }

  getTrackTokens(): Map<number, Token[]> {
    const result = new Map<number, Token[]>();
    for (const [pos, ids] of this.state.track) {
      result.set(pos, ids.map(id => this.state.tokens[id]));
    }
    return result;
  }

  /** Get all possible actions for current state */
  getPossibleActions(): GameAction[] {
    const actions: GameAction[] = [];
    const playerId = this.state.players[this.state.currentPlayerIndex].id;
    const stackSize = this.state.masterStack.length;

    // Move actions
    for (let n = 1; n <= Math.min(3, stackSize); n++) {
      actions.push({ type: `MOVE_${n}` as ActionType, playerId });
    }

    // Reorder actions — generate all permutations
    if (stackSize >= 2) {
      const top2 = new TokenStack(this.state.masterStack).peekTop(2);
      // 2 permutations for reorder 2
      actions.push({ type: 'REORDER_2', playerId, newOrder: [top2[1], top2[0]] });
    }

    if (stackSize >= 3) {
      const top3 = new TokenStack(this.state.masterStack).peekTop(3);
      // All 6 permutations minus identity = 5 for reorder 3
      const perms = this.getPermutations(top3);
      for (const perm of perms) {
        if (JSON.stringify(perm) !== JSON.stringify(top3)) {
          actions.push({ type: 'REORDER_3', playerId, newOrder: perm });
        }
      }
    }

    return actions;
  }

  /** Generate all permutations of an array */
  private getPermutations(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr];
    const result: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of this.getPermutations(rest)) {
        result.push([arr[i], ...perm]);
      }
    }
    return result;
  }

  /** Execute an action (dispatcher) */
  executeAction(action: GameAction): boolean {
    switch (action.type) {
      case 'MOVE_1': return this.executeMove(1);
      case 'MOVE_2': return this.executeMove(2);
      case 'MOVE_3': return this.executeMove(3);
      case 'REORDER_2': return this.executeReorder(2, action.newOrder || []);
      case 'REORDER_3': return this.executeReorder(3, action.newOrder || []);
      default: return false;
    }
  }

  /** Deep clone the game for AI simulation */
  clone(): GameLogic {
    const cloned = new GameLogic();
    cloned.state = JSON.parse(JSON.stringify({
      ...this.state,
      track: Object.fromEntries(this.state.track),
    }));
    cloned.state.track = new Map(
      Object.entries(cloned.state.track as any).map(([k, v]) => [Number(k), v as number[]])
    );
    return cloned;
  }
}
