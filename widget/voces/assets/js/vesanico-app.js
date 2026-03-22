const { useState, useEffect, useRef } = React;

// --- ICONS ---
const IconMessage = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevronUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconSave = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconShield = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconMic = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IconVideo = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;

// --- API SERVICE ---
const api = {
    getComments: () => {
        return new Promise((resolve) => {
            jQuery.ajax({
                url: vesanicoVars.ajaxUrl,
                type: 'GET',
                data: { action: 'vesanico_get_comments' },
                success: (response) => {
                    if(response.success) {
                        const mapped = response.data.map(c => ({
                            id: c.id,
                            author: c.author,
                            avatarSeed: c.avatar_seed,
                            content: c.content,
                            timestamp: new Date(c.time).getTime(),
                            isAdmin: c.is_admin == "1"
                        }));
                        resolve(mapped);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    },
    postComment: (author, content) => {
        return new Promise((resolve) => {
            jQuery.ajax({
                url: vesanicoVars.ajaxUrl,
                type: 'POST',
                data: { action: 'vesanico_post_comment', nonce: vesanicoVars.nonce, author, content },
                success: (response) => { if(response.success) resolve(response.data); }
            });
        });
    },
    deleteComment: (id, secretKey = '') => {
        return new Promise((resolve) => {
            jQuery.ajax({
                url: vesanicoVars.ajaxUrl,
                type: 'POST',
                data: { action: 'vesanico_delete_comment', nonce: vesanicoVars.nonce, id, secret_key: secretKey },
                success: () => resolve(true)
            });
        });
    },
    updateComment: (id, content, secretKey = '') => {
        return new Promise((resolve) => {
            jQuery.ajax({
                url: vesanicoVars.ajaxUrl,
                type: 'POST',
                data: { action: 'vesanico_update_comment', nonce: vesanicoVars.nonce, id, content, secret_key: secretKey },
                success: () => resolve(true)
            });
        });
    }
};

// --- HELPER: PAUSE PRO.RADIO (QTMPLAYER) ---
const pauseRadioPlayer = () => {
    // Attempt standard HTML5 Audio tags
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => a.pause());

    // Attempt Pro.Radio / QTM Player specific buttons/selectors
    const pauseBtn = document.querySelector('.qtm-player-pause');
    if (pauseBtn && getComputedStyle(pauseBtn).display !== 'none') {
        pauseBtn.click();
    }
    
    // Attempt Global Object if exposed
    if (window.qtmPlayer && typeof window.qtmPlayer.pause === 'function') {
        window.qtmPlayer.pause();
    }
    
    console.log("Radio Vesánico: Attempting to pause radio for video stream.");
};

// --- SUB-COMPONENTS ---

const Avatar = ({ seed, size = 'md' }) => {
    const src = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=262626&rowColor=ff0055`;
    const sizeClasses = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-12 h-12' };
    return (
        <div className={`rounded-sm overflow-hidden bg-[#262626] border border-gray-700 ${sizeClasses[size]}`}>
            <img src={src} alt="avatar" className="w-full h-full object-cover opacity-80" />
        </div>
    );
};

const ChatList = ({ comments, isAdminMode, onDelete, onUpdate }) => {
    const bottomRef = useRef(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        if (!editingId && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [comments, editingId]);

    const startEditing = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const saveEdit = (id) => {
        if (editContent.trim()) onUpdate(id, editContent);
        setEditingId(null);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/90 backdrop-blur-sm vesanico-scroll w-full">
            {comments.length === 0 && <div className="text-center text-gray-500 italic mt-10 font-mono text-sm">El silencio es ensordecedor...<br/>Inicia el caos.</div>}
            {comments.map((comment) => (
                <div key={comment.id} className="group flex gap-3 animate-fade-in text-left">
                    <Avatar seed={comment.avatarSeed} size="md" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                            <span className={`font-bold font-sans text-sm tracking-wider ${comment.isAdmin ? 'text-[#ff0055]' : 'text-gray-200'}`}>
                                {comment.isAdmin && <span className="inline-block mr-1"><IconShield /></span>}
                                {comment.author.toUpperCase()}
                            </span>
                        </div>
                        {editingId === comment.id ? (
                            <div className="mt-1 flex gap-2">
                                <input type="text" className="flex-1 bg-[#111] border border-[#ff0055] text-white text-sm p-1 font-mono focus:outline-none" value={editContent} onChange={(e) => setEditContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(comment.id)} autoFocus />
                                <button onClick={() => saveEdit(comment.id)} className="text-[#ff0055] hover:text-white"><IconSave /></button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 break-words leading-relaxed font-mono mt-0.5">{comment.content}</p>
                        )}
                    </div>
                    {isAdminMode && editingId !== comment.id && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(comment)} className="text-gray-600 hover:text-white"><IconEdit /></button>
                            <button onClick={() => onDelete(comment.id)} className="text-gray-600 hover:text-red-500"><IconTrash /></button>
                        </div>
                    )}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

const ChatInput = ({ onSend, onAuthorChange }) => {
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [isNameSet, setIsNameSet] = useState(false);

    const handleAuthorChange = (val) => { setAuthor(val); onAuthorChange(val); };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSend(author.trim() || 'Anónimo', content);
        setContent('');
        setIsNameSet(true);
    };

    return (
        <div className="p-3 bg-[#262626] border-t border-[#1a1a1a] w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {!isNameSet && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-[#1a1a1a] rounded border border-gray-700/50">
                         <span className="text-[#ff0055] font-bold text-xs">&gt;</span>
                        <input type="text" placeholder="Tu Alias..." className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-mono uppercase" value={author} onChange={(e) => handleAuthorChange(e.target.value)} maxLength={15} />
                    </div>
                )}
                <div className="flex gap-2">
                    <input type="text" placeholder={isNameSet ? `Habla, ${author}...` : "Escupe tu verdad..."} className="flex-1 bg-[#1a1a1a] text-sm text-white px-3 py-2 rounded border border-gray-700/50 focus:border-[#ff0055] focus:outline-none transition-colors font-mono" value={content} onChange={(e) => setContent(e.target.value)} />
                    <button type="submit" disabled={!content.trim()} className="bg-[#ff0055] hover:bg-red-600 disabled:opacity-50 text-white p-2 rounded transition-colors shadow-[0_0_10px_rgba(255,0,85,0.3)]"><IconSend /></button>
                </div>
            </form>
        </div>
    );
};

// --- VIDEO MODAL COMPONENT ---
const VideoModal = ({ streamUrl, onClose, chatProps }) => {
    
    // Pause Radio on Mount
    useEffect(() => {
        pauseRadioPlayer();
    }, []);

    return (
        <div className="vesanico-backdrop animate-fade-in">
            <div className="vesanico-modal-container animate-slide-up">
                
                {/* VIDEO SECTION */}
                <div className="vesanico-video-section">
                    <div className="vesanico-iframe-wrapper">
                         {streamUrl ? (
                             <iframe src={streamUrl} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                         ) : (
                             <div className="text-gray-500 font-mono">No Stream URL Configured</div>
                         )}
                    </div>
                </div>

                {/* CHAT SECTION */}
                <div className="vesanico-chat-section bg-[#1a1a1a]">
                    <div className="bg-[#0a0a0a] p-3 flex items-center justify-between border-b border-[#333]">
                        <h2 className="text-white font-bold font-sans tracking-wider uppercase text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#ff0055] rounded-full animate-pulse"></span>
                            Stream En Vivo
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white"><IconX /></button>
                    </div>
                    
                    <ChatList {...chatProps} />
                    <ChatInput 
                        onSend={chatProps.handleSend} 
                        onAuthorChange={chatProps.setCurrentAuthor} 
                    />
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const VesanicoChat = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [comments, setComments] = useState([]);
    
    // Config from WP Settings
    const pluginMode = vesanicoVars.pluginMode || 'chat_only'; // 'chat_only' | 'video_stream'
    const streamUrl = vesanicoVars.streamUrl || '';

    const [currentAuthor, setCurrentAuthor] = useState('');
    const [isWPAdmin] = useState(vesanicoVars.isAdmin);
    const isAdminMode = isWPAdmin || currentAuthor === 'Jazz0207';

    useEffect(() => {
        const fetchComments = async () => {
            const data = await api.getComments();
            setComments(data);
        };
        fetchComments();
        const interval = setInterval(fetchComments, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (author, content) => {
        const tempId = Date.now();
        setComments(prev => [...prev, { id: tempId, author, content, avatarSeed: author+tempId, timestamp: Date.now(), isAdmin: isAdminMode }]);
        await api.postComment(author, content);
        const realData = await api.getComments();
        setComments(realData);
    };

    const handleDelete = async (id) => {
        setComments(prev => prev.filter(c => c.id !== id));
        await api.deleteComment(id, currentAuthor);
    };

    const handleUpdate = async (id, newContent) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, content: newContent } : c));
        await api.updateComment(id, newContent, currentAuthor);
    };

    // Shared Props
    const chatProps = {
        comments,
        isAdminMode,
        onDelete: handleDelete,
        onUpdate: handleUpdate,
        handleSend, // Passing separately to Input
        setCurrentAuthor
    };

    // --- RENDER LOGIC ---

    if (isExpanded) {
        // If mode is VIDEO STREAM, show the Modal
        if (pluginMode === 'video_stream') {
            return (
                <VideoModal 
                    streamUrl={streamUrl} 
                    onClose={() => setIsExpanded(false)} 
                    chatProps={chatProps} 
                />
            );
        }

        // If mode is CHAT ONLY, show the existing Side Panel
        return (
            <div className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-96 z-50 flex flex-col shadow-2xl border border-[#1a1a1a] animate-slide-up h-[500px] max-h-[70vh]">
                <div className="bg-[#0a0a0a] p-3 flex items-center justify-between border-b border-[#262626] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff0055]/10 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2 z-10">
                        <span className="text-[#ff0055]"><IconMic /></span>
                        <h2 className="text-white font-bold font-sans tracking-wider uppercase text-sm">Radio Vesánico</h2>
                    </div>
                    <div className="flex items-center gap-2 z-10">
                        <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white transition-colors"><IconX /></button>
                    </div>
                </div>

                {isAdminMode && <div className="bg-red-900/50 text-red-200 text-[10px] uppercase font-mono text-center py-1 tracking-widest border-b border-red-900">Modo Admin</div>}

                <div className="flex-1 flex flex-col bg-[#1a1a1a] relative">
                    <ChatList {...chatProps} />
                    <ChatInput onSend={handleSend} onAuthorChange={setCurrentAuthor} />
                </div>
            </div>
        );
    }

    // COLLAPSED BUTTON (Trigger)
    return (
        <div onClick={() => setIsExpanded(true)} className="fixed bottom-24 right-4 md:right-8 z-50 cursor-pointer group animate-fade-in">
            <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#ff0055]/30 hover:border-[#ff0055] px-4 py-2 shadow-2xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                <div className="relative">
                    <div className="w-2 h-2 bg-[#ff0055] rounded-full animate-pulse absolute -top-1 -right-1"></div>
                    <span className="text-white">
                        {pluginMode === 'video_stream' ? <IconVideo /> : <IconMessage />}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#ff0055] font-bold font-sans text-xs tracking-widest uppercase">
                        {pluginMode === 'video_stream' ? 'Stream En Vivo' : 'En Directo'}
                    </span>
                    <span className="text-white font-mono text-xs">Voces del Subsuelo</span>
                </div>
                <span className="text-gray-500 group-hover:-translate-y-1 transition-transform"><IconChevronUp /></span>
            </div>
        </div>
    );
};

// Mount
const rootElement = document.getElementById('vesanico-chat-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<VesanicoChat />);
}
