import { useState, useCallback, useEffect, useRef } from 'react';
import { GameLogic, GameState, Token, GameAction } from '@/lib/GameLogic';
import { getAIMove } from '@/lib/AI';

export type GameMode = 'hotseat' | 'ai' | 'online';

interface UseGameOptions {
  mode: GameMode;
  numPlayers: number;
  aiPlayerIds?: number[];
}

export function useGame({ mode, numPlayers, aiPlayerIds = [] }: UseGameOptions) {
  const gameRef = useRef<GameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderCount, setReorderCount] = useState<2 | 3>(2);
  const [animatingTokens, setAnimatingTokens] = useState<number[]>([]);

  const initGame = useCallback(() => {
    const game = new GameLogic(numPlayers, aiPlayerIds);
    gameRef.current = game;
    setGameState(game.getState());
    setSelectedTokens([]);
    setIsReordering(false);
  }, [numPlayers, aiPlayerIds]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Auto-play AI turns
  useEffect(() => {
    if (!gameState || gameState.gameOver) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isAI || !gameRef.current) return;

    const timer = setTimeout(() => {
      const aiMove = getAIMove(gameRef.current!, currentPlayer.id);
      if (aiMove) {
        executeAction(aiMove);
      }
    }, 1500); // Delay for dramatic effect

    return () => clearTimeout(timer);
  }, [gameState?.currentPlayerIndex, gameState?.currentTurn]);

  const executeAction = useCallback((action: GameAction) => {
    if (!gameRef.current) return;

    // Track which tokens are being moved for animation
    if (action.type.startsWith('MOVE_')) {
      const count = parseInt(action.type.split('_')[1]);
      const topTokens = gameRef.current.getTopTokens(count);
      setAnimatingTokens(topTokens.map(t => t.id));
      
      setTimeout(() => setAnimatingTokens([]), 1000);
    }

    const success = gameRef.current.executeAction(action);
    if (success) {
      setGameState(gameRef.current.getState());
      setSelectedTokens([]);
      setIsReordering(false);
    }
  }, []);

  const moveTokens = useCallback((count: 1 | 2 | 3) => {
    if (!gameRef.current) return;
    const playerId = gameRef.current.getCurrentPlayer().id;
    executeAction({ type: `MOVE_${count}` as any, playerId });
  }, [executeAction]);

  const startReorder = useCallback((count: 2 | 3) => {
    if (!gameRef.current) return;
    if (gameRef.current.getState().masterStack.length < count) return;
    setReorderCount(count);
    setIsReordering(true);
    const topTokens = gameRef.current.getTopTokens(count);
    setSelectedTokens(topTokens.map(t => t.id));
  }, []);

  const confirmReorder = useCallback((newOrder: number[]) => {
    if (!gameRef.current) return;
    const playerId = gameRef.current.getCurrentPlayer().id;
    executeAction({
      type: `REORDER_${reorderCount}` as any,
      playerId,
      newOrder,
    });
  }, [reorderCount, executeAction]);

  const cancelReorder = useCallback(() => {
    setIsReordering(false);
    setSelectedTokens([]);
  }, []);

  return {
    gameState,
    selectedTokens,
    isReordering,
    reorderCount,
    animatingTokens,
    moveTokens,
    startReorder,
    confirmReorder,
    cancelReorder,
    resetGame: initGame,
  };
}
