import React, { useEffect, useRef } from 'react';
import { Comment } from '../types';
import Avatar from './Avatar';
import { Trash2, ShieldAlert } from 'lucide-react';

interface ChatListProps {
  comments: Comment[];
  isAdminMode: boolean;
  onDelete: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ comments, isAdminMode, onDelete }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-vesanico-black/90 backdrop-blur-sm">
      {comments.length === 0 && (
        <div className="text-center text-vesanico-muted italic mt-10 font-mono text-sm">
          El silencio es ensordecedor...<br/>
          Inicia el caos.
        </div>
      )}
      
      {comments.map((comment) => (
        <div key={comment.id} className="group flex gap-3 animate-fade-in">
          <Avatar seed={comment.avatarSeed} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <span className={`font-bold font-sans text-sm tracking-wider ${comment.isAdmin ? 'text-vesanico-accent' : 'text-vesanico-text'}`}>
                {comment.isAdmin && <ShieldAlert className="w-3 h-3 inline mr-1 mb-0.5" />}
                {comment.author.toUpperCase()}
              </span>
              <span className="text-[10px] text-vesanico-muted font-mono">
                {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-300 break-words leading-relaxed font-mono mt-0.5">
              {comment.content}
            </p>
          </div>
          
          {isAdminMode && (
            <button 
              onClick={() => onDelete(comment.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-vesanico-muted hover:text-red-500 self-start p-1"
              title="Eliminar (Admin)"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatList;