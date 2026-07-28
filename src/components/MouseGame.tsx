import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ArrowLeft, Trophy, Heart } from 'lucide-react';

interface MouseGameProps {
  onBack: () => void;
  onSaveScore: (score: number) => void;
}

interface Ball {
  id: string;
  x: number;
  clicksRequired: number;
  clicksCurrent: number;
  color: string;
  isPopping: boolean;
}

interface FloatingPoint {
  id: string;
  x: number;
  y: number;
  amount: number;
}

export function MouseGame({ onBack, onSaveScore }: MouseGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const ballsRef = useRef<Ball[]>([]);

  useEffect(() => {
    ballsRef.current = balls;
  }, [balls]);

  const colors = [
    { bg: 'bg-blue-500', border: 'border-blue-700' },
    { bg: 'bg-rose-500', border: 'border-rose-700' },
    { bg: 'bg-amber-500', border: 'border-amber-700' },
    { bg: 'bg-emerald-500', border: 'border-emerald-700' },
  ];

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setBalls([]);
    setFloatingPoints([]);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const spawnBall = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth - 120;
      const id = Math.random().toString(36).substr(2, 9);
      
      const newBall: Ball = {
        id,
        x: Math.max(0, Math.random() * width),
        clicksRequired: Math.random() > 0.5 ? 1 : 2,
        clicksCurrent: 0,
        color: colors[Math.floor(Math.random() * colors.length)].bg,
        isPopping: false
      };
      
      setBalls(prev => [...prev, newBall]);

      // Remove the ball after it falls off the screen (approx 8.5 seconds)
      setTimeout(() => {
        const ballExists = ballsRef.current.find(b => b.id === id);
        if (ballExists && !ballExists.isPopping) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setIsPlaying(false);
            }
            return newLives;
          });
        }
        setBalls(prev => prev.filter(b => b.id !== id));
      }, 8500);
    };

    spawnBall(); // Initial spawn
    const interval = setInterval(spawnBall, 2500); // Spawn every 2.5s

    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  // Save score when game is over
  useEffect(() => {
    if (gameOver && score > 0) {
      onSaveScore(score);
    }
  }, [gameOver, score]);

  const handleBallClick = (id: string, e: React.MouseEvent) => {
    if (gameOver) return;
    e.stopPropagation(); // prevent clicking behind
    
    setBalls(prev => prev.map(ball => {
      if (ball.id === id && !ball.isPopping) {
        const newClicks = ball.clicksCurrent + 1;
        if (newClicks >= ball.clicksRequired) {
          const points = ball.clicksRequired === 2 ? 20 : 10;
          setScore(s => s + points);
          
          const containerRect = containerRef.current?.getBoundingClientRect();
          const relativeX = e.clientX - (containerRect?.left || 0);
          const relativeY = e.clientY - (containerRect?.top || 0);
          
          setFloatingPoints(fp => [...fp, { 
            id: Math.random().toString(36), 
            x: relativeX, 
            y: relativeY, 
            amount: points 
          }]);
          
          // Mark ball for delayed removal to show pop animation
          setTimeout(() => {
            setBalls(currentBalls => currentBalls.filter(b => b.id !== id));
          }, 300);
          
          return { ...ball, clicksCurrent: newClicks, isPopping: true };
        }
        return { ...ball, clicksCurrent: newClicks };
      }
      return ball;
    }));
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (score > 0 && !gameOver) {
      onSaveScore(score);
    }
    onBack();
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-6xl mx-auto bg-slate-50 rounded-3xl overflow-hidden shadow-inner border-4 border-slate-200">
      <div className="flex justify-between items-center p-6 bg-white border-b-4 border-slate-200">
        <button 
          onClick={handleStop}
          className="flex items-center gap-2 text-2xl font-bold text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={32} />
          Voltar
        </button>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                size={36} 
                className={`${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300 fill-slate-300'} transition-colors`} 
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Trophy size={40} className="text-amber-500" />
            <span className="text-4xl font-bold text-slate-800">
              Pontos: {score}
            </span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative flex-1 bg-sky-50 overflow-hidden cursor-crosshair"
      >
        {!isPlaying && !gameOver ? (
          <div className="absolute inset-0 flex items-center justify-center bg-sky-50/90 z-10">
            <button
              onClick={startGame}
              className="flex items-center gap-4 bg-emerald-600 hover:bg-emerald-700 text-white text-5xl font-bold py-8 px-16 rounded-full transition-transform active:scale-95 shadow-xl"
            >
              <Play size={64} fill="currentColor" />
              Iniciar
            </button>
          </div>
        ) : null}

        {gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
            <h2 className="text-7xl font-black text-white mb-4">FIM DE JOGO</h2>
            <p className="text-4xl text-amber-400 font-bold mb-12">Você fez {score} pontos!</p>
            <button
              onClick={startGame}
              className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white text-4xl font-bold py-6 px-12 rounded-full transition-transform active:scale-95 shadow-xl"
            >
              Jogar Novamente
            </button>
          </div>
        ) : null}

        <AnimatePresence>
          {balls.map(ball => (
            <motion.button
              key={ball.id}
              initial={{ y: -50, scale: 0, opacity: 0 }}
              animate={{ 
                y: (containerRef.current?.clientHeight || 800) + 150,
                scale: ball.isPopping ? 1.5 : (ball.clicksCurrent > 0 ? 0.9 : 1), 
                opacity: ball.isPopping ? 0 : 1 
              }}
              transition={{ 
                y: { duration: 8, ease: "linear" },
                scale: { duration: ball.isPopping ? 0.2 : 0.1 },
                opacity: { duration: ball.isPopping ? 0.2 : 0.1 }
              }}
              onMouseDown={(e) => handleBallClick(ball.id, e)}
              style={{
                position: 'absolute',
                left: ball.x,
                top: 0,
                width: 120,
                height: 120,
              }}
              className={`${ball.color} rounded-full flex items-center justify-center text-white font-bold text-6xl shadow-lg border-8 border-white/30 select-none active:brightness-90 transition-colors`}
            >
              {ball.clicksRequired - ball.clicksCurrent > 0 ? ball.clicksRequired - ball.clicksCurrent : ''}
            </motion.button>
          ))}
          
          {floatingPoints.map(fp => (
            <motion.div
              key={fp.id}
              initial={{ opacity: 1, y: fp.y, x: fp.x, scale: 0.5 }}
              animate={{ opacity: 0, y: fp.y - 100, scale: 1.5 }}
              transition={{ duration: 1, ease: "easeOut" }}
              onAnimationComplete={() => {
                setFloatingPoints(current => current.filter(p => p.id !== fp.id));
              }}
              className="absolute text-5xl font-black text-amber-500 drop-shadow-lg pointer-events-none z-20"
            >
              +{fp.amount}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
