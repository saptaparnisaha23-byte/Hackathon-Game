import { motion } from 'framer-motion';
import { Token } from '@/lib/GameLogic';

interface TokenChipProps {
  token: Token;
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
  draggable?: boolean;
  isAnimating?: boolean;
  showLabel?: boolean;
  index?: number;
}

const PLAYER_EMOJIS = ['🗿', '🌺', '🐢', '🦜'];

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
};

export function TokenChip({ 
  token, 
  size = 'md', 
  glowing = false, 
  isAnimating = false,
  showLabel = true,
  index = 0,
}: TokenChipProps) {
  return (
    <motion.div
      layout
      initial={isAnimating ? { scale: 0, y: -50, rotate: -180 } : false}
      animate={isAnimating ? {
        scale: 1,
        y: 0,
        rotate: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 15,
          delay: index * 0.1 
        }
      } : { scale: 1 }}
      whileHover={{ scale: 1.1, y: -4 }}
      className={`
        ${sizeClasses[size]} 
        rounded-xl flex items-center justify-center font-heading
        border-2 border-opacity-30 cursor-pointer select-none
        transition-shadow duration-300
        ${glowing ? 'animate-neon-pulse ring-2 ring-offset-2 ring-offset-background' : ''}
      `}
      style={{
        backgroundColor: token.color,
        borderColor: `${token.color}66`,
        boxShadow: glowing 
          ? `0 0 15px ${token.color}88, 0 4px 12px ${token.color}44, inset 0 1px 2px rgba(255,255,255,0.3)` 
          : `0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)`,
        color: isLightColor(token.color) ? '#0A1F2C' : '#FFFFFF',
      }}
    >
      <span className="text-lg">{PLAYER_EMOJIS[token.playerId]}</span>
      {showLabel && (
        <span className="absolute -bottom-5 text-[10px] text-muted-foreground font-body whitespace-nowrap">
          P{token.playerId + 1}
        </span>
      )}
    </motion.div>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
