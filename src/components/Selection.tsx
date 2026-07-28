import React from 'react';
import { motion } from 'motion/react';
import { MousePointer2, Keyboard } from 'lucide-react';
import { GameMode } from '../types';

interface SelectionProps {
  userName: string;
  onSelect: (mode: GameMode) => void;
}

export function Selection({ userName, onSelect }: SelectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-5xl mx-auto"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 text-center tracking-tight">
        Olá, {userName}!
      </h2>
      <p className="text-2xl text-slate-600 mb-12 text-center">
        O que você gostaria de treinar hoje?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <button
          onClick={() => onSelect('mouse')}
          className="group flex flex-col items-center justify-center p-12 bg-white border-4 border-emerald-500 rounded-3xl hover:bg-emerald-50 transition-all active:scale-95 shadow-lg hover:shadow-xl"
        >
          <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-8 group-hover:bg-emerald-200 transition-colors">
            <MousePointer2 size={64} className="text-emerald-700" />
          </div>
          <span className="text-4xl font-bold text-emerald-800">
            Treinar o Mouse
          </span>
          <span className="text-xl text-emerald-600 mt-4 font-medium">
            Jogo das Bolinhas
          </span>
        </button>

        <button
          onClick={() => onSelect('keyboard')}
          className="group flex flex-col items-center justify-center p-12 bg-white border-4 border-indigo-500 rounded-3xl hover:bg-indigo-50 transition-all active:scale-95 shadow-lg hover:shadow-xl"
        >
          <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-8 group-hover:bg-indigo-200 transition-colors">
            <Keyboard size={64} className="text-indigo-700" />
          </div>
          <span className="text-4xl font-bold text-indigo-800">
            Treinar o Teclado
          </span>
          <span className="text-xl text-indigo-600 mt-4 font-medium">
            Jogo de Digitação
          </span>
        </button>
      </div>
    </motion.div>
  );
}
