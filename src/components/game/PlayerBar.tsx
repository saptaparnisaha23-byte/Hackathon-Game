import { motion } from 'framer-motion';
import { Player } from '@/lib/GameLogic';

interface PlayerBarProps {
  players: Player[];
  currentPlayerIndex: number;
  currentTurn: number;
  maxTurns: number;
}

const PLAYER_COLORS = ['#FF6B6B', '#06D6A0', '#FF9F1C', '#FFFD66'];

export function PlayerBar({ players, currentPlayerIndex, currentTurn, maxTurns }: PlayerBarProps) {
  return (
    <div className="flex items-center justify-between w-full px-2 py-2 bg-card/80 backdrop-blur-md border-b border-border">
      {/* Turn counter */}
      <div className="flex items-center gap-2">
        <div className="font-heading text-secondary text-lg">
          Turn {currentTurn}/{maxTurns}
        </div>
      </div>
      
      {/* Player avatars */}
      <div className="flex items-center gap-3">
        {players.map((player, i) => {
          const isCurrent = i === currentPlayerIndex;
          return (
            <motion.div
              key={player.id}
              animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={isCurrent ? { repeat: Infinity, duration: 1.5 } : {}}
              className={`
                flex flex-col items-center gap-0.5
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-xl
                  border-2 transition-all duration-300
                  ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-background' : ''}
                `}
                style={{
                  borderColor: PLAYER_COLORS[i],
                  backgroundColor: isCurrent ? `${PLAYER_COLORS[i]}33` : 'transparent',
                  boxShadow: isCurrent ? `0 0 15px ${PLAYER_COLORS[i]}66` : 'none',
                } as React.CSSProperties}
              >
                {player.avatar}
              </div>
              <span className="text-[10px] font-body text-muted-foreground">
                {player.name}
                {player.isAI && ' 🤖'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Timer placeholder */}
      <div className="font-heading text-primary text-sm">
        ⏱️ {30 - (currentTurn % 30)}s
      </div>
    </div>
  );
}
