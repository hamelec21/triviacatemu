"use client";


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toBlob } from 'html-to-image';


import { 
  Trophy, 
  Zap, 
  HelpCircle, 
  Share2, 
  PlusCircle, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Timer as TimerIcon,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CULTURA_GENERAL, FUTBOL_CATEMU, RODEO_CATEMU, DEFAULT_QUESTIONS } from './questions';

// --- TYPES & CONSTANTS ---
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const SECONDS_PER_QUESTION = 15;

const THEMES: Record<string, { accent: string, glow: string, bg: string, text: string }> = {
  cultura: { accent: 'text-yellow-500', glow: 'rgba(234, 179, 8, 0.4)', bg: 'rgba(234, 179, 8, 0.1)', text: 'text-yellow-200' },
  futbol: { accent: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.1)', text: 'text-blue-100' },
  rodeo: { accent: 'text-orange-500', glow: 'rgba(249, 115, 22, 0.4)', bg: 'rgba(249, 115, 22, 0.1)', text: 'text-orange-100' }
};

const PRIZE_LADDER = [1000, 2000, 3000, 5000, 10000, 15000, 25000, 40000, 60000, 100000, 150000, 250000, 400000, 600000, 1000000];

const audioCtxRef = { current: null as AudioContext | null };

const initAudio = () => {
    if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
        }
    }
    if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
    }
};

const playTone = (freq: number, type: OscillatorType, duration: number, volume = 0.1) => {
  try {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
};

const sounds = {
  correct: () => {
    playTone(523.25, 'sine', 0.5, 0.15); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.5, 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.8, 0.15), 200); // G5
  },
  wrong: () => {
    playTone(220, 'sawtooth', 0.8, 0.1); // A3
    setTimeout(() => playTone(110, 'sawtooth', 1.0, 0.1), 150); // A2
  },
  tick: () => {
    playTone(800, 'square', 0.05, 0.05);
  },
  timeout: () => {
    playTone(150, 'triangle', 1.5, 0.2);
  },
  start: () => {
    playTone(261.63, 'sine', 0.4, 0.1); // C4
    setTimeout(() => playTone(329.63, 'sine', 0.4, 0.1), 100); // E4
    setTimeout(() => playTone(392.00, 'sine', 0.4, 0.1), 200); // G4
    setTimeout(() => playTone(523.25, 'sine', 0.8, 0.15), 300); // C5
  }
};

// --- UTILS ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- SUB-COMPONENTS ---

const Menu = ({ setView, startNewGame, soundEnabled, setSoundEnabled }: any) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#020205] text-white relative overflow-hidden font-sans">
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(20,30,80,0.15),transparent_70%)] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(40,10,60,0.1),transparent_60%)]" />
    </div>

    <button 
      onClick={() => {
        initAudio();
        setSoundEnabled(!soundEnabled);
      }}
      className="absolute top-6 right-6 p-4 bg-white/5 backdrop-blur-md rounded-full hover:bg-white/10 transition-all border border-white/10 z-50 group"
    >
      {soundEnabled ? <Volume2 size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" /> : <VolumeX size={24} className="text-slate-500" />}
    </button>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5 }}
      className="relative z-10 w-full max-w-4xl"
    >
      <div className="mb-8 relative inline-block">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-[-40%] bg-yellow-500/20 blur-[60px] rounded-full"
        />
        <HelpCircle size={100} className="text-yellow-400 relative z-10 mx-auto" />
      </div>

      <h1 className="text-3xl md:text-7xl font-black mb-4 tracking-[-0.05em] uppercase leading-none">
        ¿Quién quiere ser <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 to-yellow-600">
          Catemino?
        </span>
      </h1>
      
      <p className="text-white/40 mb-10 text-xs md:text-xl uppercase tracking-[0.2em] font-light">
        Desafío de conocimiento del Valle del Aconcagua
      </p>

      <div className="space-y-6 w-full max-w-2xl mx-auto">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Selecciona un Desafío</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                initAudio();
                startNewGame(CULTURA_GENERAL, 'cultura');
              }} 
              className="flex items-center sm:flex-col justify-start sm:justify-center gap-4 p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all group active:bg-white/20 relative overflow-hidden"
            >
              <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                <HelpCircle className="text-yellow-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm sm:text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-yellow-200">Cultura General</span>
              <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                initAudio();
                startNewGame(FUTBOL_CATEMU, 'futbol');
              }}
              className="flex items-center sm:flex-col justify-start sm:justify-center gap-4 p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group active:bg-white/20 relative overflow-hidden"
            >
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Zap className="text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm sm:text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-blue-200">Fútbol Catemu</span>
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                initAudio();
                startNewGame(RODEO_CATEMU, 'rodeo');
              }}
              className="flex items-center sm:flex-col justify-start sm:justify-center gap-4 p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-500/10 hover:border-orange-500/30 transition-all group active:bg-white/20 relative overflow-hidden"
            >
              <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                <Star className="text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm sm:text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-orange-200">Tradición Rodeo</span>
              <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 text-center md:text-left">Niveles de Maestría</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Novato', pts: '0+', color: 'text-slate-400', bg: 'bg-slate-500/10' },
              { label: 'Conocedor', pts: '10k+', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
              { label: 'Maestro', pts: '50k+', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Leyenda', pts: '150k+', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            ].map((rank, i) => (
              <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 ${rank.bg} backdrop-blur-sm`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${rank.color}`}>{rank.label}</span>
                <span className="text-xs text-white/40 font-bold">{rank.pts}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('leaderboard')} 
          className="w-full flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 backdrop-blur-sm font-bold rounded-2xl transition-all hover:bg-white/10"
        >
          <Trophy size={20} className="text-yellow-500/80" /> VER RANKING GLOBAL
        </motion.button>
      </div>
    </motion.div>
  </div>
);

const Game = ({ 
  activeQuestions, 
  gameState, 
  timeLeft, 
  soundEnabled, 
  setSoundEnabled, 
  setView, 
  handleOptionClick, 
  useFiftyFifty, 
  isAnswering, 
  selectedOption, 
  hiddenOptions,
  activeTheme 
}: any) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleImageShare = async () => {
    if (!resultRef.current || isSharing) return;
    setIsSharing(true);
    
    try {
      const blob = await toBlob(resultRef.current, {
        cacheBust: true,
        backgroundColor: '#020205',
        style: {
           transform: 'scale(1)', 
        }
      });

      if (!blob) {
        alert("No se pudo generar la imagen.");
        setIsSharing(false);
        return;
      }
      
      const file = new File([blob], 'logro-catemu.png', { type: 'image/png' });
      const text = gameState.win 
        ? `¡Soy una leyenda de Catemu! ${gameState.score.toLocaleString()} PTS. 🏆`
        : `Mi puntaje en Trivia Catemina: ${gameState.score.toLocaleString()} PTS. 🧠`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: 'Trivia Catemina', text, files: [file] });
        } catch (e) { console.warn('Share dismissed', e); }
      } else {
        try {
            const link = document.createElement('a');
            link.download = 'trivia-catemu-resultado.png';
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) { alert("Tu navegador no soporta la descarga."); }
      }
      setIsSharing(false);
    } catch (err: any) {
      console.error(err);
      alert(`Error al generar imagen: ${err.message}`);
      setIsSharing(false);
    }
  };

  const currentQuestion = activeQuestions[gameState.currentQuestionIndex];
  const theme = THEMES[activeTheme] || THEMES.cultura;
  const currentPrize = PRIZE_LADDER[gameState.currentQuestionIndex] || 1000;

  if (gameState.gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020205] text-white overflow-hidden relative">
         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(20,30,80,0.15),transparent_70%)]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          className="bg-white/5 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-white/10 text-center max-w-lg w-full shadow-2xl relative z-10"
        >
          <div ref={resultRef} className="flex flex-col items-center bg-[#020205] p-8 rounded-[2rem] border border-white/5 shadow-inner mb-8 w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
              {gameState.win ? (
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <CheckCircle2 size={80} className={`${theme.accent} mx-auto mb-6 drop-shadow-[0_0_20px_${theme.glow}]`} />
                </motion.div>
              ) : (
                <XCircle size={80} className="text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
              )}
              <h2 className="text-2xl sm:text-3xl font-black mb-2 uppercase tracking-tight relative z-10">
                {gameState.win ? '¡Leyenda de Catemu!' : 'Fin del Camino'}
              </h2>
              <p className="text-white/40 mb-8 text-sm sm:text-base font-light italic relative z-10">
                {gameState.win ? 'Has demostrado ser un conocedor absoluto.' : 
                gameState.reason === 'timeout' ? 'El tiempo fue más rápido que tú.' : 'Una decisión equivocada ha terminado el juego.'}
              </p>
              
              <div className="flex flex-col items-center justify-center bg-white/5 p-6 rounded-2xl border border-white/5 w-full relative overflow-hidden group">
                  <motion.div 
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ background: theme.glow }}
                    className="absolute inset-0"
                  />
                  <span className="text-white/30 uppercase text-[9px] font-black tracking-[0.4em] mb-2 relative z-10">Rango Alcanzado</span>
                  <div className={`text-3xl sm:text-4xl font-black ${theme.accent} tracking-tighter mb-4 relative z-10 uppercase italic drop-shadow-[0_0_15px_${theme.glow}]`}>
                    {gameState.score >= 150000 ? 'Leyenda Catemina' : 
                    gameState.score >= 50000 ? 'Maestro del Valle' : 
                    gameState.score >= 10000 ? 'Conocedor Local' : 'Visitante Novato'}
                  </div>
                  <span className="text-white/30 uppercase text-[9px] font-black tracking-[0.3em] mb-2 relative z-10">Puntuación Final</span>
                  <div className="text-3xl sm:text-4xl font-black text-white/80 tracking-tighter relative z-10">
                    {gameState.score.toLocaleString()} <span className="text-xs text-white/20 ml-1">PTS</span>
                  </div>
              </div>
              <div className="mt-6 text-white/10 text-[8px] uppercase tracking-[0.5em] font-bold">
                 Trivia Catemina
              </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('menu')} 
              className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-white/5"
            >
              VOLVER AL VALLE
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImageShare} 
              disabled={isSharing}
              className="w-full py-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm rounded-2xl hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {isSharing ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Share2 size={18} />}
              {isSharing ? 'Generando...' : 'Compartir Logro'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#020205] text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at 50% 50%, ${theme.glow}, transparent 70%)` }}
          className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%]" 
        />
      </div>

      <header className="flex justify-between items-center p-4 max-w-6xl mx-auto w-full z-20">
        <motion.button 
           whileHover={{ scale: 1.1 }}
           onClick={() => setView('menu')} 
           className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        
        <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-10 py-2 sm:p-3 rounded-full border border-white/10 backdrop-blur-md transition-all min-w-[100px] sm:min-w-[160px] justify-center ${timeLeft <= 5 ? 'bg-red-500/20 border-red-500/40 text-red-200' : 'bg-white/5 text-yellow-500'}`}>
          <TimerIcon size={18} className={`${timeLeft <= 5 ? 'animate-bounce' : ''} sm:w-5 sm:h-5`} />
          <span className="text-xl sm:text-3xl font-black font-mono tracking-tighter tabular-nums w-10 sm:w-16 text-center">
            {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
          >
              {soundEnabled ? <Volume2 size={20} className="text-yellow-500" /> : <VolumeX size={20} className="text-white/20" />}
          </button>
          <button 
              onClick={useFiftyFifty}
              disabled={!gameState.lifelines.fiftyFifty || isAnswering}
              className={`px-4 sm:px-6 py-3 rounded-xl border font-black text-sm transition-all ${!gameState.lifelines.fiftyFifty ? 'opacity-20 border-white/5 text-white/20' : 'border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-500/10'}`}
          >
              50:50
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full pb-12 z-10 px-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={gameState.currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="mb-10 text-center relative">
               <div className="flex flex-col items-center gap-1 mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={gameState.currentQuestionIndex}
                      initial={{ scale: 1.5, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      className={`flex items-center gap-2 ${theme.accent} font-black text-4xl sm:text-6xl tracking-tighter drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]`}
                    >
                       <Star size={32} fill="currentColor" className="opacity-80 hidden sm:block" /> {currentPrize.toLocaleString()}
                    </motion.div>
                  </AnimatePresence>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] flex flex-col items-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                       <span>Puntaje Total:</span>
                       <span className="text-white font-bold">{gameState.score.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span>Próximo Rango:</span>
                       <span className={`${theme.accent} opacity-60 italic`}>
                          {gameState.score < 10000 ? 'Conocedor' : gameState.score < 50000 ? 'Maestro' : gameState.score < 150000 ? 'Leyenda' : '¡Máximo Rango!'}
                       </span>
                    </div>
                  </motion.div>
               </div>
               
               <div className="flex flex-col items-center justify-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="h-[1px] w-8 sm:w-16 bg-white/10"></span>
                    <span className="text-white/40 px-4 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest border border-white/5 rounded-full bg-white/5">
                      Pregunta {gameState.currentQuestionIndex + 1} / {activeQuestions.length}
                    </span>
                    <span className="h-[1px] w-8 sm:w-16 bg-white/10"></span>
                  </div>
                  
                  {/* Progress Bar (Psychological Milestone) */}
                  <div className="w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((gameState.currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
                      style={{ background: `linear-gradient(to right, ${theme.glow}, ${theme.accent.split('-')[1]})` }}
                      className="h-full rounded-full"
                    />
                  </div>
               </div>
               
               <h2 className="text-xl sm:text-4xl md:text-5xl font-black leading-snug sm:leading-tight tracking-tight px-2 sm:px-4 max-w-3xl mx-auto drop-shadow-xl">
                 {currentQuestion.question}
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt: string, idx: number) => {
                const isHidden = hiddenOptions.includes(idx);
                const isSelected = selectedOption === idx;
                const isCorrect = isAnswering && idx === currentQuestion.answer;

                return (
                  <motion.button
                    key={idx}
                    whileHover={!isAnswering && !isHidden ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" } : {}}
                    whileTap={!isAnswering && !isHidden ? { scale: 0.98 } : {}}
                    disabled={isAnswering || isHidden}
                    onClick={() => handleOptionClick(idx)}
                    className={`
                      p-5 sm:p-6 text-left rounded-2xl border transition-all relative overflow-hidden group min-h-[80px] sm:min-h-[100px] flex items-center
                      ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                      ${isSelected && !isCorrect && isAnswering ? 'bg-red-600 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)]' : isSelected && !isAnswering ? `bg-white/10 border-white/40 ${theme.text}` : ''}
                      ${isAnswering && idx === currentQuestion.answer ? 'bg-green-600 border-green-400 text-white shadow-[0_0_30px_rgba(34,197,94,0.2)]' : ''}
                      ${!isAnswering && !isHidden && !isSelected ? 'bg-white/5 border-white/10 hover:border-white/30' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4 sm:gap-6 w-full">
                      <span className={`font-black text-xl sm:text-2xl w-8 transition-colors ${isAnswering && (idx === currentQuestion.answer || isSelected) ? 'text-white' : theme.accent + ' opacity-60'}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-lg sm:text-xl font-medium tracking-tight pr-4">{opt}</span>
                      {isAnswering && idx === currentQuestion.answer && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-white">
                          <CheckCircle2 size={24} />
                        </motion.div>
                      )}
                      {isAnswering && isSelected && !isCorrect && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-white">
                          <XCircle size={24} />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const Leaderboard = ({ highScores, setView }: any) => (
  <div className="min-h-screen bg-[#020205] text-white p-6 flex flex-col items-center relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.05),transparent_70%)]" />
    </div>

    <div className="w-full max-w-2xl z-10">
      <motion.button 
        whileHover={{ x: -10 }}
        onClick={() => setView('menu')} 
        className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest"
      >
        <ArrowLeft size={18} /> VOLVER AL MENÚ
      </motion.button>
      
      <h2 className="text-4xl sm:text-6xl font-black mb-12 text-center text-yellow-500 uppercase italic tracking-tighter">
        Ranking de <br /> <span className="text-white">Expertos</span>
      </h2>

      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        {highScores.length === 0 ? (
          <div className="p-20 text-center text-white/20 italic text-lg font-light tracking-widest">Nadie ha reclamado la gloria aún.</div>
        ) : (
          highScores.map((s: any, i: number) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex justify-between items-center p-6 border-b border-white/5 last:border-0 transition-colors ${i === 0 ? 'bg-yellow-500/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-6">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-white/80 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/5 text-white/40'}`}>
                  {i + 1}
                </span>
                <div>
                  <div className="font-black text-lg tracking-tight uppercase">{s.userName}</div>
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-yellow-500 tracking-tighter">
                {s.score.toLocaleString()} <span className="text-[10px] text-white/30 tracking-normal ml-1">PTS</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('menu');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState({
    currentQuestionIndex: 0,
    score: 0,
    lifelines: { fiftyFifty: true },
    gameOver: false,
    win: false,
    reason: ''
  });
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [highScores, setHighScores] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState(DEFAULT_QUESTIONS);
  const [activeTheme, setActiveTheme] = useState('cultura');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  // Load High Scores from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('catemu_leaderboard');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'game' && !gameState.gameOver && !isAnswering) {
      if (timeLeft > 0) {
        if (soundEnabled && timeLeft <= 5) sounds.tick();
        timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        if (soundEnabled) sounds.timeout();
        handleGameOver('timeout');
      }
    }
    return () => clearInterval(timer);
  }, [view, gameState.gameOver, isAnswering, timeLeft, soundEnabled]);

  const saveScoreLocal = (finalScore: number) => {
    if (finalScore === 0) return;
    const newScore = {
      userName: `Viajero_${Math.floor(Math.random() * 1000)}`,
      score: finalScore,
      date: new Date().toISOString()
    };
    const updated = [...highScores, newScore]
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);
    setHighScores(updated as any);
    localStorage.setItem('catemu_leaderboard', JSON.stringify(updated));
  };

  const handleGameOver = useCallback((reason: string) => {
    setGameState(prev => {
        const newState = { ...prev, gameOver: true, reason };
        saveScoreLocal(prev.score);
        return newState;
    });
  }, [highScores]);

  const startNewGame = (questions = DEFAULT_QUESTIONS, theme = 'cultura') => {
    const shuffledQuestions = shuffleArray(questions).map(q => {
      const optionsWithIndex = q.options.map((opt, idx) => ({ opt, originalIndex: idx }));
      const shuffledOptions = shuffleArray(optionsWithIndex);
      const newAnswerIndex = shuffledOptions.findIndex(o => o.originalIndex === q.answer);
      return {
        ...q,
        options: shuffledOptions.map(o => o.opt),
        answer: newAnswerIndex
      };
    });

    if (soundEnabled) sounds.start();

    setActiveQuestions(shuffledQuestions);
    setActiveTheme(theme);
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lifelines: { fiftyFifty: true },
      gameOver: false,
      win: false,
      reason: ''
    });
    setTimeLeft(SECONDS_PER_QUESTION);
    setSelectedOption(null);
    setIsAnswering(false);
    setHiddenOptions([]);
    setView('game');
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswering || hiddenOptions.includes(idx)) return;
    setSelectedOption(idx);
    setIsAnswering(true);

    const question = activeQuestions[gameState.currentQuestionIndex];
    const currentPrize = PRIZE_LADDER[gameState.currentQuestionIndex] || 1000;
    
    setTimeout(() => {
      if (idx === question.answer) {
        if (soundEnabled) sounds.correct();
        const nextIndex = gameState.currentQuestionIndex + 1;
        const newScore = gameState.score + currentPrize;
        
        if (nextIndex >= activeQuestions.length) {
          setGameState(prev => ({ ...prev, score: newScore, win: true, gameOver: true }));
          saveScoreLocal(newScore);
        } else {
          setGameState(prev => ({ 
            ...prev, 
            currentQuestionIndex: nextIndex,
            score: newScore 
          }));
          setSelectedOption(null);
          setIsAnswering(false);
          setHiddenOptions([]);
          setTimeLeft(SECONDS_PER_QUESTION);
        }
      } else {
        if (soundEnabled) sounds.wrong();
        handleGameOver('wrong');
      }
    }, 1200);
  };

  const useFiftyFifty = () => {
    if (!gameState.lifelines.fiftyFifty || isAnswering) return;
    const question = activeQuestions[gameState.currentQuestionIndex];
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== question.answer);
    const toHide = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(toHide);
    setGameState(prev => ({ ...prev, lifelines: { ...prev.lifelines, fiftyFifty: false } }));
  };

  const handleShare = async (score: number, isWin: boolean) => {
    const text = isWin 
      ? `¡Soy una leyenda de Catemu! Logré el máximo puntaje: ${score.toLocaleString()} PTS. ¿Puedes superarme?`
      : `¡Acabo de obtener ${score.toLocaleString()} PTS en la Trivia Catemina!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Trivia Catemina', text, url: window.location.href });
      } catch (e) { console.warn(e); }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`);
        alert("¡Resultado copiado!");
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="font-sans antialiased select-none bg-[#020205] min-h-screen text-white">
      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Menu 
              setView={setView} 
              startNewGame={startNewGame} 
              soundEnabled={soundEnabled} 
              setSoundEnabled={setSoundEnabled} 
            />
          </motion.div>
        )}
        {view === 'game' && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Game 
              activeQuestions={activeQuestions}
              gameState={gameState}
              timeLeft={timeLeft}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              setView={setView}
              handleOptionClick={handleOptionClick}
              useFiftyFifty={useFiftyFifty}
              isAnswering={isAnswering}
              selectedOption={selectedOption}
              hiddenOptions={hiddenOptions}
              handleShare={handleShare}
              activeTheme={activeTheme}
            />
          </motion.div>
        )}
        {view === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Leaderboard highScores={highScores} setView={setView} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
