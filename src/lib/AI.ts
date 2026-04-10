/**
 * AI.ts — Minimax with Alpha-Beta Pruning for Tiki Topple
 * 
 * Uses depth-3 search with position-sum heuristic.
 * Alpha-Beta pruning significantly reduces the search space.
 * 
 * Heuristic: Sum of positions of AI's tokens minus opponents' average.
 * Higher position = closer to winning.
 */

import { GameLogic, GameAction } from './GameLogic';

const MAX_DEPTH = 3;

/**
 * Position-sum heuristic evaluation function
 * Evaluates how good the current state is for a given player
 * 
 * Score = (sum of AI player's token positions) - (average of opponents' token positions)
 * Bonus for tokens further along the track
 * Penalty for tokens still in the master stack
 */
function evaluateState(game: GameLogic, aiPlayerId: number): number {
  const state = game.getState();
  let aiScore = 0;
  let opponentScore = 0;
  let opponentCount = 0;

  for (const token of state.tokens) {
    if (token.playerId === aiPlayerId) {
      // AI's tokens: position value + bonus for being on track
      aiScore += token.position * 2;
      if (token.position > 0) aiScore += 5; // Bonus for being on track
      if (token.position >= state.boardSize) aiScore += 10; // Bonus for reaching end
    } else {
      opponentScore += token.position;
      opponentCount++;
    }
  }

  // Also consider stack position — tokens near top of stack can be moved soon
  const masterStack = state.masterStack;
  for (let i = masterStack.length - 1; i >= Math.max(0, masterStack.length - 3); i--) {
    const tokenId = masterStack[i];
    if (state.tokens[tokenId].playerId === aiPlayerId) {
      aiScore += 3; // Bonus for having tokens near top of stack
    }
  }

  const avgOpponent = opponentCount > 0 ? opponentScore / opponentCount : 0;
  return aiScore - avgOpponent;
}

/**
 * Minimax with Alpha-Beta Pruning — O(b^d) worst case, much better with pruning
 * 
 * @param game Current game state (cloned)
 * @param depth Current search depth
 * @param alpha Best score for maximizing player
 * @param beta Best score for minimizing player
 * @param maximizing Whether this is a maximizing node
 * @param aiPlayerId The AI player's ID
 * @returns [score, bestAction]
 */
function minimax(
  game: GameLogic,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayerId: number
): [number, GameAction | null] {
  const state = game.getState();

  // Base case: leaf node or game over
  if (depth === 0 || state.gameOver) {
    return [evaluateState(game, aiPlayerId), null];
  }

  const actions = game.getPossibleActions();
  
  // No actions available
  if (actions.length === 0) {
    return [evaluateState(game, aiPlayerId), null];
  }

  let bestAction: GameAction | null = null;

  if (maximizing) {
    let maxEval = -Infinity;

    for (const action of actions) {
      // Clone game and simulate action
      const clonedGame = game.clone();
      const success = clonedGame.executeAction(action);
      
      if (!success) continue;

      const [evalScore] = minimax(
        clonedGame,
        depth - 1,
        alpha,
        beta,
        false,  // Next level is minimizing
        aiPlayerId
      );

      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestAction = action;
      }

      // Alpha-Beta pruning: prune branches that can't affect the result
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }

    return [maxEval, bestAction];
  } else {
    let minEval = Infinity;

    for (const action of actions) {
      const clonedGame = game.clone();
      const success = clonedGame.executeAction(action);
      
      if (!success) continue;

      const [evalScore] = minimax(
        clonedGame,
        depth - 1,
        alpha,
        beta,
        true,   // Next level is maximizing
        aiPlayerId
      );

      if (evalScore < minEval) {
        minEval = evalScore;
        bestAction = action;
      }

      // Alpha-Beta pruning
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }

    return [minEval, bestAction];
  }
}

/**
 * Get the best move for the AI player using Minimax with depth 3
 * Entry point for AI decision making
 */
export function getAIMove(game: GameLogic, aiPlayerId: number): GameAction | null {
  const [_score, bestAction] = minimax(
    game,
    MAX_DEPTH,     // Exact depth 3 as required
    -Infinity,     // Initial alpha
    Infinity,      // Initial beta
    true,          // AI is the maximizing player
    aiPlayerId
  );

  // Fallback: if minimax returns null, pick first available action
  if (!bestAction) {
    const actions = game.getPossibleActions();
    return actions.length > 0 ? actions[0] : null;
  }

  return bestAction;
}
