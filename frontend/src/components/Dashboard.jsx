import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, LogOut, Loader2, Link as LinkIcon, ExternalLink, Hash, Info } from 'lucide-react';

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = async (searchQuery = '') => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      // Use 5001 as previously configured
      const res = await fetch(`http://localhost:5001/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(query);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('http://localhost:5001/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          title: "Saving...", // Temporary, backend will scrape title if capable or use this
          content_text: "", 
          platform: 'web'
        })
      });
      
      if (res.ok) {
        setUrl('');
        fetchItems(query);
      } else {
        alert('Failed to save');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">R</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Recallr</h1>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => auth.signOut()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-white/10 transition-colors border border-white/5 text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </motion.button>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        {/* Input Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="relative group p-[1px] rounded-2xl bg-gradient-to-r from-primary/50 to-secondary/50">
            <div className="bg-surface rounded-2xl p-4 md:p-6 backdrop-blur-xl">
              <form onSubmit={handleSave} className="flex gap-4">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="url" 
                    placeholder="Paste a URL to recall later..." 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-white text-black font-semibold rounded-xl px-6 md:px-8 py-3 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>}
                  <span className="hidden md:inline">{isSaving ? 'Thinking...' : 'Save Memory'}</span>
                </button>
              </form>
            </div>
          </div>
        </motion.section>

        {/* Search Section */}
        <section className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by topic, summary, or tag..." 
            value={query} 
            onChange={e => { setQuery(e.target.value); handleSearch(e); }} 
            className="w-full bg-surface/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:bg-surface focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all text-sm text-gray-300 placeholder:text-gray-600"
          />
        </section>

        {/* Masonry Grid (Simulated with Flex for now) */}
        {loading && items.length === 0 ? (
           <div className="flex justify-center p-12">
             <Loader2 className="animate-spin text-primary" size={32} />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-surface/40 hover:bg-surface/60 border border-white/5 hover:border-primary/20 backdrop-blur-md rounded-xl p-5 transition-all hover:-translate-y-1 flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                        {item.ai_output?.summary ? (item.raw_input?.title || "Web Resource") : "Processing..."}
                      </a>
                    </h3>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-4 flex-1">
                    {item.ai_output?.summary || "AI is analyzing this content..."}
                  </p>

                  {/* Footer Stats */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.ai_output?.tags?.slice(0, 3).map((tag, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wider font-medium">
                          <Hash size={10} />
                          {tag}
                        </div>
                      ))}
                    </div>
                    
                    {/* Meta */}
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                      <span>{item.ai_output?.confidence_level?.toUpperCase()} CONFIDENCE</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <Info className="mx-auto mb-2 opacity-50" size={32} />
            <p>No memories found. Save something to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
