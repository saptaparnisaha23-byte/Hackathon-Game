import { useMemo } from 'react';
import { useGame, GameMode } from '@/hooks/useGame';
import { PlayerBar } from '@/components/game/PlayerBar';
import { MasterStack } from '@/components/game/MasterStack';
import { LinearTrack } from '@/components/game/LinearTrack';
import { ActionBar } from '@/components/game/ActionBar';
import { ReorderModal } from '@/components/game/ReorderModal';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Token } from '@/lib/GameLogic';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface GamePageProps {
  mode: GameMode;
  numPlayers: number;
  aiPlayerIds: number[];
}

export default function GamePage({ mode, numPlayers, aiPlayerIds }: GamePageProps) {
  const navigate = useNavigate();
  const {
    gameState,
    isReordering,
    reorderCount,
    animatingTokens,
    moveTokens,
    startReorder,
    confirmReorder,
    cancelReorder,
    resetGame,
  } = useGame({ mode, numPlayers, aiPlayerIds });

  const trackTokens = useMemo(() => {
    if (!gameState) return new Map<number, Token[]>();
    const result = new Map<number, Token[]>();
    for (const [pos, ids] of gameState.track) {
      result.set(pos, ids.map(id => gameState.tokens[id]));
    }
    return result;
  }, [gameState]);

  const masterStackTokens = useMemo(() => {
    if (!gameState) return [];
    return [...gameState.masterStack].reverse().map(id => gameState.tokens[id]);
  }, [gameState]);

  const reorderTokens = useMemo(() => {
    if (!gameState || !isReordering) return [];
    const count = reorderCount;
    const stack = gameState.masterStack;
    return stack.slice(stack.length - count).reverse().map(id => gameState.tokens[id]);
  }, [gameState, isReordering, reorderCount]);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-2 bg-card/90 backdrop-blur-md border-b border-border">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <h1 className="font-heading text-2xl text-secondary text-glow">
            🌴 Tiki Topple 🌴
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
        </div>
        
        <PlayerBar
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          currentTurn={gameState.currentTurn}
          maxTurns={gameState.maxTurns}
        />
      </div>

      {/* Main game area */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          {/* Linear Track - 60% on desktop */}
          <div className="order-2 lg:order-1">
            <LinearTrack
              boardSize={gameState.boardSize}
              trackTokens={trackTokens}
              animatingTokens={animatingTokens}
            />
            
            {/* Turn log */}
            <div className="mt-4 bg-card/50 rounded-xl border border-border p-3 max-h-32 overflow-y-auto">
              <h4 className="font-heading text-sm text-muted-foreground mb-2">📜 Game Log</h4>
              {gameState.turnLog.slice(-5).reverse().map((log, i) => (
                <p key={i} className={`text-xs font-body ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {log}
                </p>
              ))}
              {gameState.turnLog.length === 0 && (
                <p className="text-xs text-muted-foreground font-body">No moves yet. Make your first move!</p>
              )}
            </div>
          </div>
          
          {/* Master Stack - 40% on desktop */}
          <div className="order-1 lg:order-2 flex justify-center">
            <MasterStack
              tokens={masterStackTokens}
              topGlowCount={3}
              animatingTokens={animatingTokens}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        onMove={moveTokens}
        onReorder={startReorder}
        stackSize={gameState.masterStack.length}
        disabled={gameState.gameOver || currentPlayer.isAI}
        currentPlayerName={currentPlayer.name}
        isAI={currentPlayer.isAI}
      />

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isReordering}
        tokens={reorderTokens}
        onConfirm={confirmReorder}
        onCancel={cancelReorder}
      />

      {/* Game Over Screen */}
      <GameOverScreen
        isOpen={gameState.gameOver}
        players={gameState.players}
        onPlayAgain={resetGame}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {['🔥', '✨', '🌺', '🍃'][i % 4]}
          </div>
        ))}
      </div>
    </div>
  );
}
