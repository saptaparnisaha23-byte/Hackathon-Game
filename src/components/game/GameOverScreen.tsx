import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/lib/GameLogic';
import { Trophy, Crown, Medal, Star } from 'lucide-react';

interface GameOverScreenProps {
  isOpen: boolean;
  players: Player[];
  onPlayAgain: () => void;
}

export function GameOverScreen({ isOpen, players, onPlayAgain }: GameOverScreenProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const icons = [
    <Crown className="w-8 h-8 text-neonGold" />,
    <Medal className="w-6 h-6 text-gray-300" />,
    <Medal className="w-5 h-5 text-amber-600" />,
    <Star className="w-5 h-5 text-muted-foreground" />,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-lg p-4"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="max-w-md w-full text-center"
          >
            {/* Trophy animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl mb-4"
            >
              🏆
            </motion.div>
            
            <h1 className="font-heading text-4xl text-neonGold text-glow mb-2">
              Game Over!
            </h1>
            <p className="text-secondary font-heading text-xl mb-8">
              {sorted[0].avatar} {sorted[0].name} Wins!
            </p>

            {/* Podium */}
            <div className="space-y-3 mb-8">
              {sorted.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl
                    ${i === 0 ? 'bg-neonGold/10 border-2 border-neonGold/30 glow-gold' : 'bg-card border border-border'}
                  `}
                >
                  <span className="text-2xl font-heading w-8">#{i + 1}</span>
                  {icons[i]}
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="flex-1 text-left">
                    <p className="font-heading text-foreground">
                      {player.name}
                      {player.isAI && ' 🤖'}
                    </p>
                  </div>
                  <span className={`font-heading text-xl ${i === 0 ? 'text-neonGold' : 'text-foreground'}`}>
                    {player.score} pts
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="px-8 py-4 rounded-xl font-heading text-lg bg-gradient-to-r from-coral to-sunset text-primary-foreground glow-coral"
            >
              🎮 Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
