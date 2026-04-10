import { motion } from 'framer-motion';
import { Token } from '@/lib/GameLogic';
import { TokenChip } from './TokenChip';

interface LinearTrackProps {
  boardSize: number;
  trackTokens: Map<number, Token[]>;
  animatingTokens: number[];
}

export function LinearTrack({ boardSize, trackTokens, animatingTokens }: LinearTrackProps) {
  const positions = Array.from({ length: boardSize }, (_, i) => i + 1);

  return (
    <div className="flex flex-col">
      <h3 className="font-heading text-accent text-lg mb-3 text-glow">
        🏝️ Island Track
      </h3>
      <p className="text-muted-foreground text-xs mb-4 font-body">
        Position 1 → {boardSize}
      </p>
      
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {positions.map(pos => {
            const tokensHere = trackTokens.get(pos) || [];
            const isFinish = pos === boardSize;
            
            return (
              <motion.div
                key={pos}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pos * 0.02 }}
                className={`
                  flex flex-col items-center
                `}
              >
                {/* Tokens stacked at this position */}
                <div className="flex flex-col-reverse items-center gap-0.5 min-h-[60px] mb-1">
                  {tokensHere.map((token, i) => (
                    <div key={token.id} style={{ marginTop: i > 0 ? '-6px' : '0', zIndex: i }}>
                      <TokenChip
                        token={token}
                        size="sm"
                        isAnimating={animatingTokens.includes(token.id)}
                        showLabel={false}
                        index={i}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Platform */}
                <div className={`
                  track-platform rounded-lg w-10 h-10 flex items-center justify-center
                  text-xs font-heading
                  ${isFinish ? 'glow-gold border-neonGold' : ''}
                  ${tokensHere.length > 0 ? 'ring-2 ring-accent/40' : ''}
                `}>
                  <span className={isFinish ? 'text-neonGold' : 'text-muted-foreground'}>
                    {isFinish ? '🏆' : pos}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
