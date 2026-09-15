import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Timer, Trophy } from 'lucide-react';

const WORDS = [
  "GATO", "BOLA", "CASA", "PATO", "LIVRO", 
  "ESCOLA", "COMPUTADOR", "PROFESSOR", "ALUNO", 
  "APRENDER", "BRINCAR", "FELIZ", "SORRISO"
];

interface DragGameProps {
  onBack: () => void;
  onSaveScore: (score: number) => void;
}

interface Letter {
  id: string;
  char: string;
  placed: boolean;
}

export function DragGame({ onBack, onSaveScore }: DragGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [currentWord, setCurrentWord] = useState("");
  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<Letter[]>([]);
  const [feedback, setFeedback] = useState<'success' | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setGameOver(false);
    nextWord();
  };

  const nextWord = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setPlacedLetters(Array(randomWord.length).fill(null));
    setFeedback(null);
    
    // Create letter objects
    const letters: Letter[] = randomWord.split('').map((char, index) => ({
      id: `${char}-${index}-${Date.now()}`,
      char,
      placed: false
    }));
    
    // Scramble letters
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    setAvailableLetters(letters);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setGameOver(true);
      onSaveScore(score);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, onSaveScore, score]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('letterId', id);
    // Make dragged element slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
     if (e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '1';
     }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('letterId');
    const letter = availableLetters.find(l => l.id === draggedId);
    
    if (!letter || letter.placed) return;
    
    // Check if slot is empty and letter matches the expected character for this position
    if (currentWord[slotIndex] === letter.char && placedLetters[slotIndex] === null) {
      // Success
      const newPlaced = [...placedLetters];
      newPlaced[slotIndex] = letter.char;
      setPlacedLetters(newPlaced);
      
      setAvailableLetters(prev => prev.map(l => 
        l.id === draggedId ? { ...l, placed: true } : l
      ));
      
      setScore(prev => prev + 10); // Points for correct letter
      
      // Check if word is complete
      if (newPlaced.every(char => char !== null)) {
        setFeedback('success');
        setScore(prev => prev + 50); // Word completion bonus
        setTimeLeft(prev => prev + 5); // Time bonus
        setTimeout(nextWord, 1500); // Wait a moment before next word
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={24} />
            <span className="text-2xl font-bold text-slate-800">{score}</span>
          </div>
          <div className="flex items-center gap-3">
            <Timer className={`${timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}`} size={24} />
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-slate-800'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        // Start Screen
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-3xl shadow-lg border border-slate-200 text-center max-w-2xl w-full"
        >
          <h2 className="text-4xl font-bold text-amber-700 mb-6">Caça Palavras</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Clique, segure e arraste as letras dos blocos coloridos até os quadradinhos vazios para formar a palavra correta. Se a letra estiver errada, ela volta para o lugar.
          </p>
          <button
            onClick={startGame}
            className="flex items-center justify-center gap-3 w-full py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-amber-500/30"
          >
            <Play size={28} />
            Começar Treino
          </button>
        </motion.div>
      ) : gameOver ? (
        // Game Over Screen
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-lg border border-slate-200 text-center w-full max-w-lg"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Fim de Jogo!</h2>
          <p className="text-slate-600 text-lg mb-8">O tempo acabou.</p>
          
          <div className="bg-amber-50 rounded-2xl p-8 mb-8 border border-amber-100">
            <p className="text-amber-800 font-medium mb-2 uppercase tracking-wider text-sm">Pontuação Final</p>
            <p className="text-7xl font-black text-amber-600">{score}</p>
          </div>

          <button
            onClick={startGame}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-lg font-bold transition-all active:scale-95"
          >
            Jogar Novamente
          </button>
        </motion.div>
      ) : (
        // Playing Screen
        <div className="w-full flex flex-col items-center">
          
          {feedback === 'success' && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-32 bg-green-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg z-10"
             >
                Muito bem! +5 Segundos
             </motion.div>
          )}

          {/* Target Slots & Available Letters (Side-by-Side) */}
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mt-4">
            
            {/* Left Side: Available Letters */}
            <div className="flex-1 bg-white/50 p-8 rounded-3xl border-2 border-dashed border-amber-200 min-h-[400px]">
              <h3 className="text-xl font-bold text-amber-700 mb-6 text-center uppercase tracking-wider">Letras Disponíveis</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <AnimatePresence>
                  {availableLetters.map((letter) => (
                    !letter.placed && (
                      <motion.div
                        key={letter.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, y: -50 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, letter.id)}
                        onDragEnd={handleDragEnd}
                        className="w-20 h-24 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing border-b-8 border-amber-600 hover:bg-amber-400 hover:-translate-y-1 transition-transform touch-none"
                      >
                        <span className="text-4xl font-bold text-white select-none">
                          {letter.char}
                        </span>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side: Target Slots */}
            <div className="flex-1 bg-white p-8 rounded-3xl shadow-lg border border-slate-200 min-h-[400px]">
               <h3 className="text-xl font-bold text-slate-400 mb-6 text-center uppercase tracking-wider">Forme a Palavra Aqui</h3>
              <div className="flex justify-center flex-wrap gap-4">
                {placedLetters.map((char, index) => (
                  <div
                    key={`slot-${index}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`w-20 h-24 rounded-2xl border-4 flex items-center justify-center text-4xl font-bold transition-colors ${
                      char 
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-inner' 
                        : 'border-dashed border-slate-300 bg-slate-50'
                    }`}
                  >
                    {char && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        type="spring"
                      >
                        {char}
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
          
        </div>
      )}
    </div>
  );
}
