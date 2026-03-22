import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ChevronUp, Mic2, Settings } from 'lucide-react';
import { Comment, ViewState } from '../types';
import * as api from '../services/mockApi';
import ChatList from './ChatList';
import ChatInput from './ChatInput';

const FloatingPanel: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.COLLAPSED);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Poll for comments
  useEffect(() => {
    const fetchComments = async () => {
      const data = await api.getComments();
      setComments(data);
    };

    fetchComments();
    const interval = setInterval(fetchComments, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (author: string, content: string) => {
    const newComment = await api.postComment(author, content);
    setComments(prev => [...prev, newComment]);
  };

  const handleDelete = async (id: string) => {
    await api.deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const togglePanel = () => {
    setViewState(prev => prev === ViewState.EXPANDED ? ViewState.COLLAPSED : ViewState.EXPANDED);
  };

  // Render the collapsed "Bar" state
  if (viewState === ViewState.COLLAPSED) {
    return (
      <div 
        onClick={togglePanel}
        className="fixed bottom-24 right-4 md:right-8 z-50 cursor-pointer group animate-fade-in-up"
      >
        <div className="flex items-center gap-3 bg-vesanico-black border border-vesanico-accent/30 hover:border-vesanico-accent px-4 py-2 shadow-2xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,85,0.4)]">
          <div className="relative">
            <div className="w-2 h-2 bg-vesanico-accent rounded-full animate-pulse absolute -top-1 -right-1"></div>
            <MessageSquare className="text-vesanico-text w-5 h-5 group-hover:text-vesanico-accent transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-vesanico-accent font-bold font-sans text-xs tracking-widest uppercase">En Directo</span>
            <span className="text-vesanico-text font-mono text-xs">Voces del Subsuelo</span>
          </div>
          <ChevronUp className="text-vesanico-muted w-4 h-4 group-hover:-translate-y-1 transition-transform" />
        </div>
      </div>
    );
  }

  // Render the expanded "Chat" state
  return (
    <div className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-96 z-50 flex flex-col shadow-2xl border border-vesanico-dark animate-slide-up h-[500px] max-h-[70vh]">
      {/* Header */}
      <div className="bg-vesanico-black p-3 flex items-center justify-between border-b border-vesanico-panel relative overflow-hidden">
        {/* Decorative noise/gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-vesanico-accent/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-2 z-10">
          <Mic2 className="text-vesanico-accent w-4 h-4" />
          <h2 className="text-vesanico-text font-bold font-sans tracking-wider uppercase text-sm">
            Radio Vesánico
          </h2>
        </div>

        <div className="flex items-center gap-2 z-10">
          {/* Admin Toggle (Hidden feature for demo) */}
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${isAdminMode ? 'text-vesanico-accent' : 'text-vesanico-muted'}`}
            title="Modo Admin"
          >
            <Settings size={14} />
          </button>
          
          <button 
            onClick={togglePanel}
            className="text-vesanico-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Admin Notice Bar */}
      {isAdminMode && (
        <div className="bg-red-900/50 text-red-200 text-[10px] uppercase font-mono text-center py-1 tracking-widest border-b border-red-900">
          Modo Administrador Activo
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-vesanico-dark relative overflow-hidden">
         {/* Background pattern (Subtle noise/texture) */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
         </div>

        <ChatList 
          comments={comments} 
          isAdminMode={isAdminMode} 
          onDelete={handleDelete}
        />
        
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default FloatingPanel;