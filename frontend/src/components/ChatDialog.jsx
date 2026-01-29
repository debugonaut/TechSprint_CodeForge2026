import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.DEV ? 'http://localhost:5001' : '';

export default function ChatDialog({ isOpen, onClose, user }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I remember everything you save. Ask me anything like "Find articles about React" or "What did I save about AI?"'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQueries = [
    'Find articles about technology',
    'What did I save last week?',
    'Show me health-related content',
    'Find videos I saved'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error('Chat failed');

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        items: data.items
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to process query');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const useSuggested = (suggested) => {
    setQuery(suggested);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface/90 backdrop-blur-xl border border-default rounded-3xl max-w-2xl w-full h-[700px] flex flex-col shadow-2xl relative overflow-hidden"
        >
           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-default/50 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
                 <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">Recallr AI</h2>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   <span className="text-xs text-muted font-medium">Online & Ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 hover:text-red-500 transition-colors text-muted"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={16} className="text-primary" />
                    </div>
                )}

                <div className={`max-w-[80%] space-y-2`}>
                    <div
                    className={`rounded-2xl p-4 shadow-sm ${
                        msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-none'
                        : 'bg-elevated border border-default text-secondary rounded-tl-none'
                    }`}
                    >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  
                  {/* Show matched items if any */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="space-y-2 pl-2">
                       <p className="text-xs font-bold text-muted uppercase tracking-wider">References</p>
                      {msg.items.slice(0, 3).map((item, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="bg-surface border border-default rounded-xl p-3 hover:border-primary/50 transition-colors cursor-pointer group"
                        >
                          <div className="text-sm font-semibold text-primary group-hover:underline truncate">{item.ai_output?.title || 'Untitled'}</div>
                          <div className="text-xs text-muted mt-1 line-clamp-2">
                            {item.ai_output?.summary}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center shrink-0 mt-1">
                        <User size={16} className="text-white" />
                    </div>
                )}
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex justify-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-primary" />
                 </div>
                 <div className="bg-elevated border border-default rounded-2xl rounded-tl-none p-4 w-16 flex items-center justify-center">
                   <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                   </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Conversation Starters</div>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => useSuggested(sq)}
                    className="text-xs bg-surface border border-default hover:border-primary text-secondary hover:text-primary rounded-xl px-4 py-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-default/50 bg-surface/50 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="relative flex items-center">
               <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask your second brain..."
                className="w-full bg-elevated border border-default rounded-2xl pl-5 pr-14 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all placeholder:text-muted text-secondary shadow-inner"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:bg-muted shadow-lg shadow-primary/20"
              >
                <div className="relative">
                   <Send size={18} className={loading ? 'opacity-0' : 'opacity-100'} />
                   {loading && <Loader2 size={18} className="absolute inset-0 animate-spin" />}
                </div>
              </button>
            </form>
            <div className="text-center mt-2">
               <p className="text-[10px] text-muted">AI can make mistakes. Check important info.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
