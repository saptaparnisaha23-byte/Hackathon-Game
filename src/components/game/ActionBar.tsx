import { motion } from 'framer-motion';

interface ActionBarProps {
  onMove: (count: 1 | 2 | 3) => void;
  onReorder: (count: 2 | 3) => void;
  stackSize: number;
  disabled: boolean;
  currentPlayerName: string;
  isAI: boolean;
}

export function ActionBar({ onMove, onReorder, stackSize, disabled, currentPlayerName, isAI }: ActionBarProps) {
  const canMove = (n: number) => stackSize >= n && !disabled;
  const canReorder = (n: number) => stackSize >= n && !disabled;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-3 z-50">
      <div className="max-w-3xl mx-auto">
        {/* Current player indicator */}
        <div className="text-center mb-2">
          <span className="text-xs font-body text-muted-foreground">
            {isAI ? `${currentPlayerName} 🤖 is thinking...` : `${currentPlayerName}'s Turn`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {/* Move buttons */}
          {[1, 2, 3].map((n) => (
            <motion.button
              key={`move-${n}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canMove(n)}
              onClick={() => onMove(n as 1 | 2 | 3)}
              className={`
                px-5 py-3 rounded-xl font-heading text-sm
                transition-all duration-200
                ${canMove(n) 
                  ? 'bg-gradient-to-r from-coral to-primary text-primary-foreground glow-coral cursor-pointer' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                }
              `}
            >
              Move {n} →
            </motion.button>
          ))}
          
          {/* Separator */}
          <div className="w-px bg-border mx-1" />
          
          {/* Reorder buttons */}
          {[2, 3].map((n) => (
            <motion.button
              key={`reorder-${n}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!canReorder(n)}
              onClick={() => onReorder(n as 2 | 3)}
              className={`
                px-5 py-3 rounded-xl font-heading text-sm
                transition-all duration-200
                ${canReorder(n)
                  ? 'bg-gradient-to-r from-sunset to-secondary text-secondary-foreground glow-orange cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                }
              `}
            >
              Reorder {n} 🔄
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
