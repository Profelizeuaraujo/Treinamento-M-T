import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, Keyboard as KeyboardIcon, CheckCircle2, Heart } from 'lucide-react';

interface KeyboardGameProps {
  onBack: () => void;
  onSaveScore: (score: number) => void;
}

export function KeyboardGame({ onBack, onSaveScore }: KeyboardGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetWord, setTargetWord] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState<'success' | 'none'>('none');
  const [wordX, setWordX] = useState(100);
  const [fallingKey, setFallingKey] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const baseRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'];
  
  const generateWord = (currentLevel: number) => {
    let length = 1;
    if (currentLevel > 3 && currentLevel <= 6) length = 2;
    else if (currentLevel > 6) length = 3;

    let word = '';
    for (let i = 0; i < length; i++) {
      let char = baseRow[Math.floor(Math.random() * baseRow.length)];
      if (Math.random() < 0.25) { // 25% chance of being uppercase
        char = char.toUpperCase();
      }
      word += char;
    }
    setTargetWord(word);
    setCurrentInput('');
    setFeedback('none');
    setFallingKey(k => k + 1);

    if (containerRef.current) {
       const width = containerRef.current.clientWidth - (length * 130);
       setWordX(Math.max(40, Math.random() * width));
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setStreak(0);
    setLevel(1);
    generateWord(1);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional keys
      if (e.key.length > 1 || feedback === 'success') return;

      const typedChar = e.key;
      const expectedChar = targetWord[currentInput.length];

      if (typedChar === expectedChar) {
        const nextInput = currentInput + typedChar;
        setCurrentInput(nextInput);

        if (nextInput === targetWord) {
          // Word completed
          setFeedback('success');
          setScore(s => s + 20);
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          
          if (nextStreak % 5 === 0) {
            setLevel(l => l + 1);
          }

          setTimeout(() => {
            generateWord(Math.floor(nextStreak / 5) + 1);
          }, 600);
        }
      } else {
        // Wrong key - reset current input
        if (currentInput.length > 0) {
          setCurrentInput('');
          setStreak(0); // Reset streak
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, currentInput, targetWord, streak, feedback]);

  // Falling timeout
  useEffect(() => {
    if (!isPlaying || gameOver || feedback !== 'none' || !targetWord) return;

    const duration = Math.max(8000 - level * 500, 3000); // Speeds up with level, min 3s

    const timeout = setTimeout(() => {
      // Word hit the bottom
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setGameOver(true);
          setIsPlaying(false);
        }
        return newLives;
      });
      if (lives > 1) {
        setStreak(0);
        generateWord(level);
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [isPlaying, gameOver, feedback, targetWord, level, fallingKey, lives]);

  // Save score when game is over
  useEffect(() => {
    if (gameOver && score > 0) {
      onSaveScore(score);
    }
  }, [gameOver, score]);

  const handleStop = () => {
    setIsPlaying(false);
    if (score > 0 && !gameOver) {
      onSaveScore(score);
    }
    onBack();
  };

  const fallDuration = Math.max(8 - level * 0.5, 3); // in seconds

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
          <div className="flex items-center gap-2 text-indigo-600">
            <span className="text-2xl font-bold">Nível {level}</span>
          </div>
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
        className="relative flex-1 flex flex-col items-center justify-center bg-indigo-50 overflow-hidden"
      >
        {!isPlaying && !gameOver ? (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-50/90 z-10">
            <button
              onClick={startGame}
              className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white text-5xl font-bold py-8 px-16 rounded-full transition-transform active:scale-95 shadow-xl"
            >
              <KeyboardIcon size={64} />
              Iniciar
            </button>
          </div>
        ) : null}

        {gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
            <h2 className="text-7xl font-black text-white mb-4">FIM DE JOGO</h2>
            <p className="text-4xl text-amber-400 font-bold mb-12">Você fez {score} pontos no Nível {level}!</p>
            <button
              onClick={startGame}
              className="flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white text-4xl font-bold py-6 px-12 rounded-full transition-transform active:scale-95 shadow-xl"
            >
              Jogar Novamente
            </button>
          </div>
        ) : null}

        {(isPlaying && !gameOver) && (
          <AnimatePresence mode="popLayout">
            {feedback === 'success' ? (
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                style={{ position: 'absolute', left: wordX, top: '50%' }}
                className="flex items-center justify-center text-emerald-500 z-10"
              >
                <CheckCircle2 size={120} />
              </motion.div>
            ) : (
              <motion.div
                key={`falling-${fallingKey}`}
                initial={{ y: -150 }}
                animate={{ y: (containerRef.current?.clientHeight || 800) + 150 }}
                transition={{ duration: fallDuration, ease: 'linear' }}
                style={{ left: wordX }}
                className="absolute top-0 flex gap-4 z-10"
              >
                {targetWord.split('').map((char, index) => {
                  const isTyped = index < currentInput.length;
                  return (
                    <div
                      key={index}
                      className={`w-32 h-32 flex items-center justify-center rounded-2xl border-4 shadow-sm text-7xl font-bold transition-colors
                        ${isTyped 
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-700' 
                          : index === currentInput.length 
                            ? 'bg-white border-indigo-500 text-indigo-800 shadow-xl' 
                            : 'bg-white/90 border-slate-300 text-slate-400'
                        }`}
                    >
                      {char}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xl text-slate-500 text-center bg-white/80 backdrop-blur-sm py-3 px-6 rounded-full border border-slate-200 shadow-sm pointer-events-none">
          Mantenha os dedos repousados nas teclas centrais e digite antes que caiam!
        </div>
      </div>
    </div>
  );
}
