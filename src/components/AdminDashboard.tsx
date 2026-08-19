import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, History, Activity } from 'lucide-react';
import { ScoreEntry, ActiveUser } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    // Listen to active users
    const qUsers = collection(db, 'activeUsers');
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const users: ActiveUser[] = [];
      const now = Date.now();
      snapshot.forEach(doc => {
        const data = doc.data() as ActiveUser;
        // Only show users active within the last 15 seconds
        if (now - (data.timestamp || 0) < 15000) {
          users.push(data);
        }
      });
      setActiveUsers(users);
    });

    // Listen to scores
    const qScores = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(100));
    const unsubscribeScores = onSnapshot(qScores, (snapshot) => {
      const newScores: ScoreEntry[] = [];
      snapshot.forEach(doc => {
        newScores.push(doc.data() as ScoreEntry);
      });
      setScores(newScores);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeScores();
    };
  }, []);

  const getDuration = (startTime: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 60000);
    return diff < 1 ? '< 1 min' : `${diff} min`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full min-h-[80vh] w-full max-w-7xl mx-auto bg-slate-50 rounded-3xl overflow-hidden shadow-xl border border-slate-200"
    >
      <div className="flex justify-between items-center p-6 bg-slate-800 text-white">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xl font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={28} />
            Voltar
          </button>
          <h2 className="text-3xl font-bold border-l-2 border-slate-600 pl-6">
            Painel do Professor
          </h2>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Users Panel */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Alunos Ativos Agora</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {activeUsers.length === 0 ? (
                 <p className="text-xl text-slate-500 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                 Nenhum aluno conectado no momento.
               </p>
              ) : (
                activeUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800">{user.name}</p>
                        <p className="text-lg text-slate-500">{user.game}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold uppercase tracking-wider mb-1">
                        Ativo
                      </span>
                      <p className="text-slate-500 font-medium">{getDuration(user.startTime)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Score History Panel */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <History size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Ranking / Histórico</h3>
            </div>
            
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {scores.length === 0 ? (
                <p className="text-xl text-slate-500 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Nenhum registro encontrado.
                </p>
              ) : (
                [...scores]
                  .sort((a, b) => b.score - a.score) // Sort by highest score for a ranking
                  .map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                        {index + 1}º
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800">{entry.userName}</p>
                        <p className="text-lg text-slate-500">
                          {entry.mode === 'mouse' ? 'Treino de Mouse' : 'Treino de Teclado'} • {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-amber-500">
                      {entry.score} <span className="text-lg text-amber-600/70">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
