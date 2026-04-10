import { motion } from 'framer-motion';
import { Token } from '@/lib/GameLogic';
import { TokenChip } from './TokenChip';

interface MasterStackProps {
  tokens: Token[];  // top-to-bottom order
  topGlowCount: number;
  animatingTokens: number[];
}

export function MasterStack({ tokens, topGlowCount, animatingTokens }: MasterStackProps) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="font-heading text-secondary text-lg mb-3 text-glow">
        🌋 Master Stack
      </h3>
      <p className="text-muted-foreground text-xs mb-4 font-body">
        {tokens.length} tokens · Top → Bottom
      </p>
      
      {/* Volcano mouth container */}
      <div className="relative">
        {/* Volcano glow */}
        <div className="absolute -inset-4 bg-volcano rounded-2xl opacity-50 blur-xl" />
        
        {/* Stack container */}
        <div 
          className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-4 min-h-[200px] w-[100px] flex flex-col-reverse items-center gap-1"
          style={{ perspective: '800px' }}
        >
          {tokens.length === 0 && (
            <p className="text-muted-foreground text-xs text-center font-body">
              Empty!
            </p>
          )}
          
          {tokens.map((token, i) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                transform: `perspective(800px) rotateX(${Math.min(i * 2, 15)}deg)`,
                zIndex: tokens.length - i,
                marginTop: i > 0 ? '-4px' : '0',
              }}
            >
              <TokenChip
                token={token}
                size="md"
                glowing={i < topGlowCount}
                isAnimating={animatingTokens.includes(token.id)}
                showLabel={i < 5}
                index={i}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
