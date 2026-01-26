import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.DEV ? 'http://localhost:5001' : '';

export default function ChatDialog({ isOpen, onClose, user }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can help you find content from your saved items. Try asking: "Find articles about React" or "What did I save about AI?"'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQueries = [
    'Find articles about technology',
    'What did I save last week?',
    'Show me health-related content',
    'Find videos I saved'
  ];

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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface border border-white/10 rounded-2xl max-w-2xl w-full h-[600px] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-primary" />
              <h2 className="text-2xl font-bold">Ask Your Brain</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-black/20 border border-white/5'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  
                  {/* Show matched items if any */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <div className="text-xs font-semibold">{item.ai_output?.title || 'Untitled'}</div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {item.ai_output?.summary}
                          </div>
                        </div>
                      ))}
                      {msg.items.length > 3 && (
                        <div className="text-xs text-gray-400">+{msg.items.length - 3} more items</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              </div>
            )}
          </div>

          {/* Suggested Queries */}
          {messages.length === 1 && (
            <div className="px-6 pb-2">
              <div className="text-xs text-gray-400 mb-2">Try asking:</div>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => useSuggested(sq)}
                    className="text-xs bg-black/20 border border-white/5 hover:border-primary/50 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-6 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask something about your saved content..."
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-primary text-white rounded-xl px-6 py-3 hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
