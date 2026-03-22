import React, { useState } from 'react';
import { Send, User } from 'lucide-react';

interface ChatInputProps {
  onSend: (author: string, content: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  // In a real WP plugin, we might store the name in a cookie
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Validate author name if not set yet
    const finalAuthor = author.trim() || 'Anónimo';
    
    onSend(finalAuthor, content);
    setContent('');
    setIsNameSet(true); // Once they send a message, we assume they keep the name
  };

  return (
    <div className="p-3 bg-vesanico-panel border-t border-vesanico-dark">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {!isNameSet && (
          <div className="flex items-center gap-2 px-2 py-1 bg-vesanico-dark rounded border border-vesanico-muted/20">
            <User size={14} className="text-vesanico-accent" />
            <input
              type="text"
              placeholder="Tu Alias..."
              className="bg-transparent border-none text-xs text-vesanico-text focus:outline-none w-full font-mono uppercase placeholder-vesanico-muted"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={15}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={isNameSet ? `Habla, ${author}...` : "Escupe tu verdad..."}
            className="flex-1 bg-vesanico-dark text-sm text-vesanico-text px-3 py-2 rounded border border-vesanico-muted/20 focus:border-vesanico-accent/50 focus:outline-none transition-colors font-mono placeholder-vesanico-muted/50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-vesanico-accent hover:bg-red-600 disabled:opacity-50 text-white p-2 rounded transition-colors flex items-center justify-center shadow-[0_0_10px_rgba(255,0,85,0.3)]"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;