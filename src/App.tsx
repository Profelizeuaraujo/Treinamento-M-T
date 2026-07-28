import React, { useState, useEffect } from 'react';
import { Identification } from './components/Identification';
import { Selection } from './components/Selection';
import { MouseGame } from './components/MouseGame';
import { KeyboardGame } from './components/KeyboardGame';
import { AdminDashboard } from './components/AdminDashboard';
import { User, GameMode, ScoreEntry } from './types';
import { Settings, LogOut } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  
  // Heartbeat for active user status
  useEffect(() => {
    if (!currentUser) return;
    
    const ping = async () => {
      try {
        await fetch('/api/active_users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            game: activeMode === 'mouse' ? 'Treino de Mouse' : activeMode === 'keyboard' ? 'Treino de Teclado' : 'Selecionando Jogo'
          })
        });
      } catch (e) {
        console.error("Ping failed", e);
      }
    };
    
    ping();
    const interval = setInterval(ping, 3000);
    return () => clearInterval(interval);
  }, [currentUser, activeMode]);

  // Clean up when leaving
  const handleLogout = async () => {
    if (currentUser) {
      try {
        await fetch('/api/active_users/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentUser.id })
        });
      } catch (e) {}
    }
    setCurrentUser(null);
    setActiveMode(null);
  };

  const handleSaveScore = async (score: number) => {
    if (currentUser && activeMode) {
      const entry: ScoreEntry = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        userName: currentUser.name,
        mode: activeMode,
        score,
        date: new Date().toISOString(),
      };
      
      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } catch (e) {
        console.error("Save score failed", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans selection:bg-blue-200 flex flex-col">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 p-4 md:px-8 flex justify-between items-center shrink-0">
        <div 
          className="flex items-center gap-4 cursor-pointer" 
          onClick={() => {
            if (!isAdminView && currentUser) setActiveMode(null);
          }}
        >
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
            TA
          </div>
          <span className="text-2xl font-bold text-slate-800 hidden md:block">
            Treino Amigo
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {currentUser && !isAdminView && (
            <div className="flex items-center gap-4">
              <span className="text-xl text-slate-600 font-medium hidden md:inline">
                Aluno(a): <strong className="text-slate-800">{currentUser.name}</strong>
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium transition-colors border border-rose-200"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          )}
          
          {isAdminView && (
             <button 
             onClick={() => setIsAdminView(false)}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors border border-slate-300"
           >
             <LogOut size={20} />
             <span>Sair (Professor)</span>
           </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 md:p-8 flex items-center justify-center flex-1">
        {isAdminView ? (
          <AdminDashboard 
            onBack={() => setIsAdminView(false)} 
          />
        ) : !currentUser ? (
          <Identification 
            onIdentify={setCurrentUser} 
            onAdminLogin={() => setIsAdminView(true)}
          />
        ) : !activeMode ? (
          <Selection 
            userName={currentUser.name} 
            onSelect={setActiveMode} 
          />
        ) : activeMode === 'mouse' ? (
          <MouseGame 
            onBack={() => setActiveMode(null)} 
            onSaveScore={handleSaveScore} 
          />
        ) : (
          <KeyboardGame 
            onBack={() => setActiveMode(null)} 
            onSaveScore={handleSaveScore} 
          />
        )}
      </main>
    </div>
  );
}
