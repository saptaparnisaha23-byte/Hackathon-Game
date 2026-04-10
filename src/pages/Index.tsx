import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Wifi, Gamepad2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>(['Moai', 'Hibiscus', 'Turtle', 'Parrot']);

  const modes = [
    {
      id: 'hotseat',
      title: 'Hotseat',
      subtitle: '2-4 players, 1 device',
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-coral to-primary',
      glow: 'glow-coral',
      path: '/play?mode=hotseat&players=4',
    },
    {
      id: 'ai',
      title: 'vs AI',
      subtitle: 'Challenge the Tiki Spirit',
      icon: <Bot className="w-8 h-8" />,
      gradient: 'from-teal to-accent',
      glow: 'glow-teal',
      path: '/play?mode=ai&players=2&ai=1',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sunset/3 rounded-full blur-3xl" />
      </div>

      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🌴', '🗿', '🌺', '🔥', '🐢', '🦜', '🥥', '🌊'].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-20"
            initial={{ y: '110vh', x: `${10 + i * 12}vw`, rotate: 0 }}
            animate={{ y: '-10vh', rotate: 360 }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear',
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        {/* Title */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mb-2"
        >
          <span className="text-6xl">🗿</span>
        </motion.div>
        
        <h1 className="font-heading text-6xl md:text-8xl text-glow mb-2">
          <span className="text-coral">Tiki</span>{' '}
          <span className="text-neonGold">Topple</span>
        </h1>
        
        <p className="font-body text-muted-foreground text-lg mb-2">
          The Ultimate Stack Strategy Game
        </p>
        <p className="text-xs text-muted-foreground/60 mb-12 font-body">
          NPC Board2Code Hackathon 2026
        </p>

        {/* Game mode buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              onClick={() => {
                if (mode.id === 'hotseat') {
                  setShowSetup(true);
                } else {
                  navigate(mode.path);
                }
              }}
              className={`
                relative px-8 py-6 rounded-2xl font-heading text-xl
                bg-gradient-to-br ${mode.gradient}
                text-primary-foreground
                ${mode.glow}
                transition-all duration-300
                min-w-[200px]
              `}
            >
              <div className="flex flex-col items-center gap-2">
                {mode.icon}
                <span>{mode.title}</span>
                <span className="text-xs font-body opacity-80">{mode.subtitle}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* How to play */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 max-w-lg mx-auto"
        >
          <h3 className="font-heading text-secondary text-xl mb-4">🎯 How to Play</h3>
          <div className="text-sm font-body text-muted-foreground space-y-2 text-left">
            <p>• <span className="text-foreground">20 tokens</span> start in one master stack, randomly shuffled</p>
            <p>• Each turn, <span className="text-coral">move top 1-3 tokens</span> to the track or <span className="text-sunset">reorder top 2-3</span></p>
            <p>• Tokens enter the <span className="text-teal">25-position island track</span></p>
            <p>• After <span className="text-neonGold">30 turns</span>, tokens are ranked by position</p>
            <p>• <span className="text-foreground">Highest total score wins!</span> (20 pts for 1st, 19 for 2nd...)</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Hotseat Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-wood rounded-2xl border border-border p-6 max-w-sm w-full"
            >
              <h2 className="font-heading text-secondary text-2xl text-center mb-6 text-glow">
                Player Setup
              </h2>
              
              <div className="flex flex-col gap-4 mb-6">
                {playerNames.map((name, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <label className="text-sm font-body text-muted-foreground ml-1">
                      Player {idx + 1}
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={name}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[idx] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      className="px-4 py-2 bg-background/50 border border-border rounded-xl font-body text-foreground focus:outline-none focus:border-coral transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSetup(false)}
                  className="flex-1 py-3 rounded-xl font-heading bg-muted text-muted-foreground"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.append('mode', 'hotseat');
                    params.append('players', '4');
                    playerNames.forEach((n, i) => params.append(`p${i}`, n));
                    navigate(`/play?${params.toString()}`);
                  }}
                  className="flex-1 py-3 rounded-xl font-heading bg-gradient-to-r from-coral to-primary text-primary-foreground glow-coral"
                >
                  Start Game
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
