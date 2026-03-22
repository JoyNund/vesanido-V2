import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Radio, Play, Square, Volume2, VolumeX, X, ArrowUpRight, Headphones, Calendar, FileText, Menu, MessageSquare, ChevronRight, Disc, Music, X as XIcon, Heart, User } from 'lucide-react';

// --- Tipos ---
interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

// --- Sticky Mini Player (Mobile & Desktop) ---
interface MiniPlayerProps {
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onTogglePlay: () => void;
  onOpenFullscreen: () => void;
  onOpenComments: () => void;
}

const MiniPlayer = ({ isPlaying, volume, onVolumeChange, onClose, onTogglePlay, onOpenFullscreen, onOpenComments }: MiniPlayerProps) => {
  const [bottomOffset, setBottomOffset] = useState(0);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    const handleViewportChange = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const visualHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const difference = windowHeight - visualHeight;
        
        // Si la barra del navegador está visible, ajustar el bottom
        if (difference > 50) {
          setBottomOffset(difference + 10); // +10px extra de padding
        } else {
          setBottomOffset(0);
        }
      }
    };

    // Escuchar cambios en el viewport visual
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      // Check inicial después de un pequeño delay
      setTimeout(handleViewportChange, 100);
    }

    return () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed left-0 right-0 z-[100] bg-[#0f0f0f] text-white border-t-2 border-[#d90429]"
      style={{
        bottom: bottomOffset,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
        <div className="flex items-center justify-between gap-4">
          {/* Status & Info (Clickable para fullscreen) */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={onOpenFullscreen}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPlaying ? 'bg-[#d90429] animate-pulse' : 'bg-gray-600'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 truncate">
                {isPlaying ? "SONANDO AHORA" : "RADIO VESÁNICO"}
              </p>
              <p className="text-sm font-display tracking-wide truncate">
                {isPlaying ? "IDLES - DANCA" : "104.5 FM"}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-500 flex-shrink-0 hidden sm:block" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Volume Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowVolume(!showVolume)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Volumen"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 size={14} className="text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => onVolumeChange(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#d90429]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Play/Pause */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0f0f0f] transition-colors flex-shrink-0"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Comments */}
            <button
              onClick={onOpenComments}
              className="p-2 text-gray-400 hover:text-[#d90429] transition-colors relative"
              aria-label="Comentarios"
            >
              <MessageSquare size={18} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d90429] rounded-full animate-pulse" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Cerrar reproductor"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Full Screen Player ---
interface FullScreenPlayerProps {
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onTogglePlay: () => void;
  onOpenComments: () => void;
  onOpenLyrics: () => void;
  commentsOpen: boolean;
  children?: React.ReactNode;
}

const FullScreenPlayer = ({ isPlaying, volume, onVolumeChange, onClose, onTogglePlay, onOpenComments, onOpenLyrics, commentsOpen, children }: FullScreenPlayerProps) => {
  const controls = useAnimation();
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    // Only track touch if it starts in the lower 2/3 of the screen
    const touchY = e.targetTouches[0].clientY;
    const screenHeight = window.innerHeight;
    if (touchY > screenHeight / 3) {
      setTouchStart(touchY);
      setTouchStartX(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touchY = e.targetTouches[0].clientY;
    const screenHeight = window.innerHeight;
    if (touchY > screenHeight / 3) {
      setTouchEnd(touchY);
      setTouchEndX(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    const swipeUpDistance = touchStart - touchEnd;
    const swipeLeftDistance = touchStartX - touchEndX;
    
    // Swipe up - open lyrics (vertical swipe > 100px)
    if (swipeUpDistance > 100 && Math.abs(swipeUpDistance) > Math.abs(swipeLeftDistance)) {
      onOpenLyrics();
    }
    // Swipe left - open comments (horizontal swipe > 100px)
    if (swipeLeftDistance > 100 && Math.abs(swipeLeftDistance) > Math.abs(swipeUpDistance)) {
      onOpenComments();
    }
    setTouchStart(0);
    setTouchEnd(0);
    setTouchStartX(0);
    setTouchEndX(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-[#0f0f0f] flex flex-col md:flex-row overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-[#d90429]">
            <Radio size={20} className={isPlaying ? "animate-pulse" : ""} />
            <span className="text-xs font-bold tracking-widest">EN VIVO</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <XIcon size={24} />
          </button>
        </div>

        {/* Player Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 gap-3 sm:gap-4 md:gap-5">
          <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-[280px] sm:max-w-sm aspect-square"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#d90429]/20 to-transparent rounded-full blur-3xl" />
          <div className={`relative w-full h-full rounded-full border-2 border-[#1a1a1a] overflow-hidden shadow-2xl ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '8s' }}>
            <img
              src="https://picsum.photos/seed/album1/600/600?grayscale"
              alt="Portada del álbum"
              className="w-full h-full object-cover"
            />
            {/* Vinyl center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#0f0f0f] rounded-full border-4 border-[#1a1a1a]" />
            </div>
          </div>
        </motion.div>

        {/* Track Info */}
        <div className="text-center space-y-1 sm:space-y-1.5">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display tracking-wide uppercase"
          >
            {isPlaying ? "IDLES - DANCA" : "Radio Vesánico"}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs sm:text-sm md:text-base text-gray-400 tracking-widest"
          >
            {isPlaying ? "104.5 FM // TRANSMISIÓN SUBVERSIVA" : "Presiona play para iniciar"}
          </motion.p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-24 md:w-32 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d90429]"
            />
          </div>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-white border-2 border-white flex items-center justify-center hover:bg-gray-200 transition-colors text-[#0f0f0f]"
          >
            {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
          </button>

          {/* Like Button (Heart) */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border border-[#333] bg-[#1a1a1a] rounded-full hover:border-[#d90429] hover:text-[#d90429] transition-colors group"
          >
            <Heart size={18} className="text-gray-400 group-hover:text-[#d90429]" />
          </button>
        </div>
        </div>

        {/* Bottom Button - Lyrics (Mobile & Desktop) - Inside content div so it moves with comments */}
        <button
          onClick={onOpenLyrics}
          className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 text-gray-500 text-[10px] sm:text-xs tracking-widest hover:text-[#d90429] transition-colors"
        >
          <ChevronRight size={14} className="-rotate-90" />
          <span>ABRIR LYRICS</span>
        </button>
      </div>

      {/* Swipe Indicator - Voces del Subsuelo (Comments) - Mobile Only */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: [-5, 0, -5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 md:hidden z-[70]"
        onClick={onOpenComments}
      >
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white px-2 py-1 rounded bg-gradient-to-l from-black/70 to-transparent">
            VOCES DEL SUBSUELO
          </span>
          <div className="flex items-center gap-1 text-[#d90429]">
            <MessageSquare size={16} />
            <ChevronRight size={20} />
          </div>
        </div>
      </motion.div>

      {/* Comments Panel Desktop - Part of flex layout */}
      {children}
    </motion.div>
  );
};

// --- Comments Panel ---
interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (author: string, content: string) => void;
  isDesktop?: boolean;
}

const CommentsPanel = ({ isOpen, onClose, comments, onAddComment, isDesktop = false }: CommentsPanelProps) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const controls = useAnimation();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swiped right - close panel
      controls.start({ x: '100%' });
      setTimeout(onClose, 300);
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && content.trim()) {
      onAddComment(author.trim(), content.trim());
      setContent('');
    }
  };

  // Desktop: Integrated into layout (not an overlay)
  if (isDesktop) {
    if (!isOpen) return null;

    return (
      <div className="hidden md:flex flex-col w-[400px] border-l border-[#1a1a1a] bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[#d90429]" />
            <h3 className="font-display text-xl tracking-wide">VOCES DEL SUBSUELO</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <XIcon size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Disc size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm tracking-widest">SÉ EL PRIMERO EN COMENTAR</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#d90429] font-bold text-xs tracking-widest">{comment.author}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#1a1a1a] space-y-3">
          <input
            type="text"
            placeholder="ALIAS"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d90429]"
          />
          <textarea
            placeholder="ESCUPE TU VERDAD..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d90429] resize-none"
          />
          <button
            type="submit"
            className="w-full btn-modern primary py-3"
          >
            ENVIAR
          </button>
        </form>

        {/* Swipe hint */}
        <div className="flex items-center justify-center gap-2 py-3 text-gray-500 text-xs tracking-widest border-t border-[#1a1a1a] bg-[#0f0f0f]">
          <ChevronRight size={14} className="rotate-180" />
          <span>DESLIZA DERECHA PARA CERRAR</span>
        </div>
      </div>
    );
  }

  // Mobile: Overlay panel
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[110] md:hidden"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0f0f0f] border-l border-[#1a1a1a] z-[120] md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-[#d90429]" />
                <h3 className="font-display text-xl tracking-wide">VOCES DEL SUBSUELO</h3>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                <XIcon size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Disc size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm tracking-widest">SÉ EL PRIMERO EN COMENTAR</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#d90429] font-bold text-xs tracking-widest">{comment.author}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[#1a1a1a] space-y-3">
              <input
                type="text"
                placeholder="ALIAS"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d90429]"
              />
              <textarea
                placeholder="ESCUPE TU VERDAD..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d90429] resize-none"
              />
              <button
                type="submit"
                className="w-full btn-modern primary py-3"
              >
                ENVIAR
              </button>
            </form>

            {/* Swipe hint */}
            <div className="flex items-center justify-center gap-2 py-3 text-gray-500 text-xs tracking-widest border-t border-[#1a1a1a] bg-[#0f0f0f]">
              <ChevronRight size={14} className="rotate-180" />
              <span>DESLIZA DERECHA PARA CERRAR</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Lyrics Panel (Slide Up from Bottom - Full Screen) ---
interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LyricsPanel = ({ isOpen, onClose }: LyricsPanelProps) => {
  const controls = useAnimation();

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      // Swiped down - close panel
      controls.start({ y: '100%' });
      setTimeout(onClose, 300);
    } else {
      controls.start({ y: 0 });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[70]"
          />

          {/* Panel - Full Screen */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            className="fixed inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-[#1a1a1a] z-[80] flex flex-col overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center py-4 border-b border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center gap-2">
                <Music size={20} className="text-[#d90429]" />
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                <XIcon size={20} />
              </button>
            </div>

            {/* Lyrics Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <p className="text-gray-400 text-xs tracking-widest uppercase text-center mb-8">
                  IDLES - DANCA
                </p>
                <div className="text-center space-y-4">
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    [Verso 1]<br/>
                    Lorem ipsum dolor sit amet,<br/>
                    Consectetur adipiscing elit...
                  </p>
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    [Coro]<br/>
                    Sed do eiusmod tempor,<br/>
                    Incididunt ut labore et dolore...
                  </p>
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    [Verso 2]<br/>
                    Ut enim ad minim veniam,<br/>
                    Quis nostrud exercitation...
                  </p>
                  <p className="text-lg sm:text-xl text-[#d90429] leading-relaxed font-bold">
                    [Outro]<br/>
                    Duis aute irure dolor in reprehenderit,<br/>
                    In voluptate velit esse cillum...
                  </p>
                </div>
                <p className="text-gray-500 text-xs text-center mt-8 tracking-widest">
                  * LETRA DE EJEMPLO *
                </p>
              </div>
            </div>

            {/* Swipe down hint */}
            <div className="flex items-center justify-center gap-2 py-4 text-gray-500 text-xs tracking-widest border-t border-[#1a1a1a] bg-[#0f0f0f]">
              <ChevronRight size={16} className="rotate-90" />
              <span>DESLIZA ABAJO PARA CERRAR</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Modern Live Radio Player Widget (Desktop Only) ---
interface LiveRadioProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const LiveRadio = ({ isPlaying, onTogglePlay }: LiveRadioProps) => {
  return (
    <div className="bg-white border border-[#0f0f0f] flex flex-col relative shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#0f0f0f] flex items-center justify-between bg-[#0f0f0f] text-white">
        <div className="flex items-center gap-3">
          <Radio size={20} className={isPlaying ? "text-[#d90429] animate-pulse" : "text-gray-500"} strokeWidth={1.5} />
          <h3 className="font-display text-2xl tracking-wide m-0 leading-none">TRANSMISIÓN</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#d90429]' : 'bg-gray-600'}`} />
          <span className="text-xs font-bold tracking-widest text-gray-400">EN VIVO</span>
        </div>
      </div>

      {/* Player Body */}
      <div className="p-8 flex flex-col items-center justify-center gap-8">

        {/* Equalizer */}
        <div className="h-16 flex items-end justify-center gap-[2px] w-full">
          {isPlaying ? (
            <>
              <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
              <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
              <div className="eq-bar" />
            </>
          ) : (
            <div className="w-full h-[1px] bg-gray-300" />
          )}
        </div>

        {/* Track Info */}
        <div className="text-center space-y-3 w-full">
          <div className="text-[#d90429] font-bold text-xs tracking-widest uppercase">SONANDO AHORA</div>
          <h4 className="font-display text-4xl md:text-5xl leading-none uppercase truncate w-full">
            {isPlaying ? "IDLES - DANCA" : "ESTACIÓN FUERA DE LÍNEA"}
          </h4>
          <p className="font-medium text-gray-500 text-sm tracking-widest">
            {isPlaying ? "RADIO VESÁNICO // 104.5 FM" : "PRESIONA PLAY PARA INICIAR"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 w-full justify-center pt-6 border-t border-gray-200">
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full border border-[#0f0f0f] flex items-center justify-center hover:bg-[#0f0f0f] hover:text-white transition-colors"
          >
            {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          <div className="flex items-center gap-3 flex-1 max-w-[200px] text-gray-400">
            <Volume2 size={20} strokeWidth={1.5} />
            <div className="h-1 w-full bg-gray-200 relative">
              <div className="absolute top-0 left-0 h-full w-2/3 bg-[#0f0f0f]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [miniPlayerOpen, setMiniPlayerOpen] = useState(false);
  const [fullScreenPlayerOpen, setFullScreenPlayerOpen] = useState(false);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [lyricsPanelOpen, setLyricsPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', author: 'RUIDO_BLANCO', content: 'Excelente selección musical!', timestamp: new Date() },
    { id: '2', author: 'POST_PUNK_FOREVER', content: 'Desde CDMX, saludos!', timestamp: new Date(Date.now() - 300000) },
  ]);
  const [squarePlayerVisible, setSquarePlayerVisible] = useState(false);
  const squarePlayerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar si es desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Intersection Observer para detectar si el reproductor cuadrado está en viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSquarePlayerVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (squarePlayerRef.current) {
      observer.observe(squarePlayerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // El mini player solo se muestra en desktop si el reproductor cuadrado NO está visible
  const showMiniPlayer = miniPlayerOpen && !fullScreenPlayerOpen && (!isDesktop || !squarePlayerVisible);

  const navLinks = [
    { href: '/noticias', label: 'NOTICIAS' },
    { href: '/agenda', label: 'AGENDA' },
    { href: '/podcast', label: 'PODCAST' },
    { href: '/tienda', label: 'TIENDA', badge: 'NUEVO' },
  ];

  const navigate = useNavigate();

  const handleOpenPlayer = () => {
    setMiniPlayerOpen(true);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setMiniPlayerOpen(false);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && !miniPlayerOpen) {
      setMiniPlayerOpen(true);
    }
  };

  const handleOpenFullScreen = () => {
    setFullScreenPlayerOpen(true);
    // On desktop, open comments panel by default
    if (window.innerWidth >= 768) {
      setCommentsPanelOpen(true);
    }
  };

  const handleCloseFullScreen = () => {
    setFullScreenPlayerOpen(false);
    setCommentsPanelOpen(false);
  };

  const handleOpenComments = () => {
    // En desktop, si no está en pantalla completa, abrirla primero
    if (window.innerWidth >= 768 && !fullScreenPlayerOpen) {
      setFullScreenPlayerOpen(true);
      setCommentsPanelOpen(true);
    } else {
      setCommentsPanelOpen(!commentsPanelOpen);
    }
  };

  const handleCloseComments = () => {
    setCommentsPanelOpen(false);
  };

  const handleOpenLyrics = () => {
    setLyricsPanelOpen(true);
  };

  const handleCloseLyrics = () => {
    setLyricsPanelOpen(false);
  };

  const handleAddComment = (author: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      content,
      timestamp: new Date(),
    };
    setComments(prev => [...prev, newComment]);
  };

  return (
    <div className="min-h-screen relative selection:bg-[#d90429] selection:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#f2f2f2]/90 backdrop-blur-md border-b border-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-display text-2xl sm:text-3xl tracking-wide text-[#0f0f0f]">
            RADIO VESÁNICO
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-6 text-sm font-bold tracking-widest">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className="hover:text-[#d90429] transition-colors relative">
                  {link.label}
                  {link.badge && (
                    <span className="absolute -top-3 -right-3 text-[#d90429] text-[8px] font-bold uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <button className="btn-modern px-6 py-2">APOYAR</button>
            <button
              onClick={() => navigate('/login')}
              className="p-2 text-[#0f0f0f] hover:text-[#d90429] transition-colors"
              aria-label="Iniciar sesión"
            >
              <User size={20} />
            </button>
          </div>

          {/* Mobile - APOYAR + Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button className="btn-modern px-4 py-2 text-xs">APOYAR</button>
            <button
              className="p-2 text-[#0f0f0f]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-[#0f0f0f] bg-[#f2f2f2]"
            >
              <div className="px-4 sm:px-6 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg font-bold tracking-widest hover:text-[#d90429] transition-colors py-2 flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[#d90429] text-[8px] font-bold uppercase">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <div className="border-t border-[#0f0f0f] pt-4 mt-2 space-y-3">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="btn-modern primary px-6 py-3 w-full flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    ENTRAR
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mini Player Sticky */}
      <AnimatePresence>
        {showMiniPlayer && (
          <MiniPlayer
            isPlaying={isPlaying}
            volume={volume}
            onVolumeChange={setVolume}
            onClose={handleClosePlayer}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onOpenFullscreen={handleOpenFullScreen}
            onOpenComments={handleOpenComments}
          />
        )}
      </AnimatePresence>

      {/* Full Screen Player */}
      <AnimatePresence>
        {fullScreenPlayerOpen && (
          <FullScreenPlayer
            isPlaying={isPlaying}
            volume={volume}
            onVolumeChange={setVolume}
            onClose={handleCloseFullScreen}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onOpenComments={handleOpenComments}
            onOpenLyrics={handleOpenLyrics}
            commentsOpen={commentsPanelOpen}
          >
            {/* Comments Panel - Desktop (integrated into layout) */}
            <CommentsPanel
              isOpen={commentsPanelOpen}
              onClose={handleCloseComments}
              comments={comments}
              onAddComment={handleAddComment}
              isDesktop={true}
            />
          </FullScreenPlayer>
        )}
      </AnimatePresence>

      {/* Desktop Comments Indicator - Outside player so it does not move */}
      {fullScreenPlayerOpen && (
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [-5, 0, -5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex z-[70] transition-opacity duration-300 ${commentsPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onClick={handleOpenComments}
        >
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold tracking-widest uppercase text-white px-3 py-1.5 rounded bg-gradient-to-l from-black/50 to-transparent">
              VOCES DEL SUBSUELO
            </span>
            <div className="flex items-center gap-1 text-[#d90429]">
              <MessageSquare size={18} />
              <ChevronRight size={24} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Comments Panel - Mobile Overlay (solo en mobile) */}
      <div className="md:hidden">
        <CommentsPanel
          isOpen={commentsPanelOpen}
          onClose={handleCloseComments}
          comments={comments}
          onAddComment={handleAddComment}
          isDesktop={false}
        />
      </div>

      {/* Lyrics Panel */}
      <LyricsPanel
        isOpen={lyricsPanelOpen}
        onClose={handleCloseLyrics}
      />

      <div className={`relative z-10 flex flex-col gap-16 sm:gap-24 pb-24 pt-24 sm:pt-32 ${miniPlayerOpen ? 'sm:pb-24' : ''}`}>

        {/* HERO SECTION */}
        <section className="px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 lg:col-span-7 relative z-10">
            <div className="inline-flex items-center gap-2 text-[#d90429] font-bold text-xs sm:text-sm tracking-widest uppercase">
              <div className="w-2 h-2 bg-[#d90429] rounded-full" />
              Transmisión Subversiva
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-[7rem] font-display leading-[0.9] tracking-tight uppercase">
              SUBVIERTE <br/>
              <span className="text-outline">EL RUIDO.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl font-medium text-gray-600 leading-relaxed max-w-full sm:max-w-md">
              Radio independiente especializada en punk, post-punk y rock alternativo. Sin algoritmos, sin listas corporativas. Pura curaduría humana.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                onClick={handleOpenPlayer}
                className="btn-modern primary px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Headphones size={18} strokeWidth={2} /> {isPlaying ? 'EN VIVO' : 'ESCUCHAR EN VIVO'}
              </button>
              <button className="btn-modern px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 w-full sm:w-auto">
                ENVIAR MÚSICA <ArrowUpRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Desktop: Show full player | Mobile: Hidden */}
          <div ref={squarePlayerRef} className="hidden lg:block lg:col-span-5 relative">
            <LiveRadio isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker-wrap my-8">
          <div className="ticker-content">
            RADIO VESÁNICO // INDEPENDIENTE // POST-PUNK // HARDCORE // NO WAVE // APOYA TU ESCENA LOCAL // RADIO VESÁNICO // INDEPENDIENTE // POST-PUNK // HARDCORE // NO WAVE // APOYA TU ESCENA LOCAL //
          </div>
          <div className="ticker-content" aria-hidden="true">
            RADIO VESÁNICO // INDEPENDIENTE // POST-PUNK // HARDCORE // NO WAVE // APOYA TU ESCENA LOCAL // RADIO VESÁNICO // INDEPENDIENTE // POST-PUNK // HARDCORE // NO WAVE // APOYA TU ESCENA LOCAL //
          </div>
        </div>

        {/* NOTICIAS / PODCAST */}
        <section id="noticias" className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="mb-8 sm:mb-12 border-b border-[#0f0f0f] pb-6 flex items-center justify-between">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight">
              PODCAST
            </h2>
            <FileText size={24} className="text-gray-300 hidden md:block" strokeWidth={1} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { tag: "RESEÑA", title: "EL RESURGIMIENTO DEL POST-PUNK EN LATINOAMÉRICA", img: "https://picsum.photos/seed/band1/600/800?grayscale" },
              { tag: "ENTREVISTA", title: "CONVERSACIÓN EXCLUSIVA CON FONTAINES D.C.", img: "https://picsum.photos/seed/band2/600/800?grayscale" },
              { tag: "OPINIÓN", title: "POR QUÉ LOS ALGORITMOS ESTÁN MATANDO EL DESCUBRIMIENTO", img: "https://picsum.photos/seed/band3/600/800?grayscale" }
            ].map((article, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="card-sharp h-full flex flex-col group cursor-pointer">
                  <div className="relative overflow-hidden h-48 sm:h-64 border-b border-[#0f0f0f]">
                    <img src={article.img} alt={article.title} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <span className="text-[#d90429] font-bold text-[10px] sm:text-xs tracking-widest mb-3">
                      {article.tag}
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-display leading-tight mb-4 sm:mb-6 group-hover:text-[#d90429] transition-colors line-clamp-3">{article.title}</h3>
                    <div className="mt-auto flex items-center justify-between text-xs sm:text-sm font-bold text-gray-500 group-hover:text-[#0f0f0f] transition-colors">
                      <span>LEER ARTÍCULO</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GIGS SECTION */}
        <section id="gigs" className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="border border-[#0f0f0f] bg-white p-4 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight mb-2">
                  AGENDA
                </h2>
                <p className="text-gray-500 font-medium tracking-widest text-xs sm:text-sm">CONCIERTOS Y EVENTOS RECOMENDADOS</p>
              </div>
              <Calendar size={28} className="text-gray-300 hidden md:block" strokeWidth={1} />
            </div>

            <div className="flex flex-col">
              {[
                { date: "12 OCT", band: "PROTOMARTYR + INVITADOS", venue: "FORO INDIE ROCKS", price: "$450" },
                { date: "15 OCT", band: "FESTIVAL RUIDO BLANCO", venue: "PABELLÓN OESTE", price: "$800" },
                { date: "22 OCT", band: "SHOWCASE SELLOS INDEPENDIENTES", venue: "CENTRO CULTURAL", price: "ENTRADA LIBRE" },
                { date: "05 NOV", band: "TURNSTILE", venue: "PALACIO DE LOS DEPORTES", price: "$950" },
              ].map((gig, idx) => (
                <div key={idx} className="flex flex-col py-4 sm:py-6 border-b border-gray-100 hover:bg-[#0f0f0f] hover:text-white hover:px-4 sm:hover:px-6 transition-all duration-300 group cursor-pointer last:border-0">
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="font-display text-xl sm:text-2xl text-[#d90429] w-16 sm:w-24 flex-shrink-0">{gig.date}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base sm:text-lg tracking-wide truncate">{gig.band}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-400 tracking-widest mt-1 truncate">{gig.venue}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-medium text-xs sm:text-sm tracking-widest whitespace-nowrap">{gig.price}</span>
                      <button className="btn-modern px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs group-hover:border-white group-hover:text-white">
                        BOLETOS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIENDA SECTION */}
        <section id="tienda" className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="mb-8 sm:mb-12 border-b border-[#0f0f0f] pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight mb-2">
                TIENDA
              </h2>
              <p className="text-gray-500 font-medium tracking-widest text-xs sm:text-sm">MERCH OFICIAL Y SELLOS INDEPENDIENTES</p>
            </div>
            <span className="text-[#d90429] text-xs font-bold uppercase">NUEVO</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "CAMISETA VESÁNICO", price: "$350", img: "https://picsum.photos/seed/merch1/400/400?grayscale" },
              { name: "VINILO POST-PUNK VOL.1", price: "$350", img: "https://picsum.photos/seed/merch2/400/400?grayscale" },
              { name: "TOTE BAG OFICIAL", price: "$150", img: "https://picsum.photos/seed/merch3/400/400?grayscale" },
              { name: "CASQUETE VESÁNICO", price: "$250", img: "https://picsum.photos/seed/merch4/400/400?grayscale" },
            ].map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="card-sharp group cursor-pointer">
                  <div className="relative overflow-hidden aspect-square border-b border-[#0f0f0f]">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-display tracking-wide uppercase mb-2">{product.name}</h3>
                    <p className="text-[#d90429] font-bold text-lg">{product.price}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-4 sm:px-6 max-w-7xl mx-auto w-full pt-12 border-t border-[#0f0f0f] flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-2 font-display text-xl sm:text-2xl text-[#0f0f0f]">
            RADIO VESÁNICO
          </div>
          <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 text-center md:text-left">
            © 2026 TRANSMISIÓN INDEPENDIENTE
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold tracking-widest">
            <a href="#" className="hover:text-[#d90429] transition-colors">INSTAGRAM</a>
            <a href="#" className="hover:text-[#d90429] transition-colors">MIXCLOUD</a>
            <a href="#" className="hover:text-[#d90429] transition-colors">CONTACTO</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
