import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { GraduationCap, BookOpen } from 'lucide-react';

interface IdentificationProps {
  onIdentify: (user: User) => void;
  onAdminLogin: () => void;
}

export function Identification({ onIdentify, onAdminLogin }: IdentificationProps) {
  const [role, setRole] = useState<'aluno' | 'professor' | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'aluno' && name.trim().length > 0) {
      onIdentify({
        id: crypto.randomUUID(),
        name: name.trim()
      });
    } else if (role === 'professor') {
      if (password === '1234') { // Simple password
        onAdminLogin();
      } else {
        setError('Senha incorreta. (Dica: 1234)');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full"
    >
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          Treino Amigo
        </h1>
        <p className="text-xl text-slate-600 mb-10">
          Selecione como deseja entrar:
        </p>
        
        {!role ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setRole('aluno')}
              className="flex flex-col items-center gap-4 p-8 border-4 border-blue-500 rounded-2xl hover:bg-blue-50 transition-colors"
            >
              <BookOpen size={64} className="text-blue-600" />
              <span className="text-3xl font-bold text-blue-800">Sou Aluno</span>
            </button>
            <button
              onClick={() => setRole('professor')}
              className="flex flex-col items-center gap-4 p-8 border-4 border-slate-300 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <GraduationCap size={64} className="text-slate-600" />
              <span className="text-3xl font-bold text-slate-700">Sou Professor</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <button 
              type="button"
              onClick={() => { setRole(null); setError(''); setPassword(''); }}
              className="text-slate-500 hover:text-slate-700 underline text-lg self-start"
            >
              Voltar
            </button>

            {role === 'aluno' ? (
              <>
                <p className="text-3xl text-slate-700 font-medium">Qual é o seu nome?</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full text-center text-4xl p-6 rounded-xl border-4 border-slate-300 focus:border-blue-600 focus:ring-0 outline-none transition-colors"
                  autoFocus
                />
              </>
            ) : (
              <>
                <p className="text-3xl text-slate-700 font-medium">Senha do Professor</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Digite a senha"
                  className="w-full text-center text-4xl p-6 rounded-xl border-4 border-slate-300 focus:border-slate-600 focus:ring-0 outline-none transition-colors"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xl font-bold">{error}</p>}
              </>
            )}

            <button
              type="submit"
              disabled={role === 'aluno' ? name.trim().length === 0 : password.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-3xl font-bold py-6 px-8 rounded-xl transition-all active:scale-95 mt-4"
            >
              Entrar
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
