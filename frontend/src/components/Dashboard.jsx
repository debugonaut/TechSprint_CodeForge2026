import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, LogOut, Loader2, Link as LinkIcon, ExternalLink, 
  Hash, Info, X, Calendar, TrendingUp, Trash2, FolderOpen, 
  Download, BarChart3, MessageCircle, Folder, Bell, Home, Settings,
  Video, Headphones, Music, Code, Newspaper, Globe, Image as ImageIcon, 
  BookOpen, Github, Twitter, Linkedin, Briefcase, DollarSign, Brain, Command,
  Layout, MessageSquare, FolderPlus, Film, GraduationCap, Trophy, Activity, 
  FlaskConical, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import CollectionDialog from './CollectionDialog';
import ExportDialog from './ExportDialog';
import StatsDialog from './StatsDialog';
import ChatDialog from './ChatDialog';
import ReminderDialog from './ReminderDialog';
import ThemeToggle from './ThemeToggle';
import SpotlightCard from './SpotlightCard';

// API URL: use relative path in production (Vercel), localhost in development
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5001'
  : '';

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Keep all items for stats
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  
  // Form State
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dialog States
  const [showCollections, setShowCollections] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [itemForCollection, setItemForCollection] = useState(null);

  // Collections & Reminders
  const [collections, setCollections] = useState([]);
  const [reminderCount, setReminderCount] = useState(0);
  const [showReminderBanner, setShowReminderBanner] = useState(false);
  const [quota, setQuota] = useState({ used: 0, limit: 20, remaining: 20 });

  // Categories for filtering
  const categories = ['all', 'music', 'tech', 'news', 'entertainment', 'education', 'business', 'sports', 'health', 'science', 'other'];

  useEffect(() => {
    if (user) {
      fetchItems();
      fetchCollections();
      fetchReminderStats();
      fetchQuota();
    }
  }, [user]);

  const fetchItems = async (searchQuery = '', filters = {}) => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      // Build query string
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.collectionId && filters.collectionId !== 'all') params.append('collectionId', filters.collectionId);
      
      const res = await fetch(`${API_URL}/api/search?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Handle new response format with items array
      const itemsArray = data.items || data;
      setItems(itemsArray);
      if (!searchQuery && Object.keys(filters).length === 0) {
        setAllItems(itemsArray); // Keep all items for stats
      }
    } catch (err) {
      console.error("Failed to fetch items", err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/collections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchReminderStats = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/reminders/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReminderCount(data.unreadCount || 0);
      setShowReminderBanner(data.unreadCount > 0);
    } catch (error) {
      console.error('Error fetching reminder stats:', error);
    }
  };

  const fetchQuota = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/quota`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuota(data);
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(query, { category: selectedCategory, collectionId: selectedCollection });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!url && !query) return;
    
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: url || '',
          title: url ? "Saving..." : (query.slice(0, 50) + '...'),
          content_text: query || "", 
          platform: url ? 'web' : 'note',
          collectionId: selectedCollection !== 'all' ? selectedCollection : null
        })
      });
      
      if (res.status === 409) {
        const errorData = await res.json();
        toast.error('This content is already saved!');
        return;
      }
      
      if (res.ok) {
        toast.success('Captured successfully!');
        setUrl('');
        setQuery('');
        fetchItems('', { category: selectedCategory, collectionId: selectedCollection });
        fetchQuota(); // Refresh quota
      } else if (res.status === 429) {
        toast.error(`Daily quota exceeded! You've reached your ${quota.limit} saves/day limit.`);
      } else {
        toast.error('Failed to save');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success('Deleted successfully');
        setSelectedItem(null);
        fetchItems(query, { category: selectedCategory, collectionId: selectedCollection });
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting');
    }
  };

  const handleItemView = async (item) => {
    setSelectedItem(item);
    
    // Mark as read
    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/api/reminders/mark-read/${item.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchReminderStats(); // Refresh reminder count
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    
    // Exact Matches for Filter Tabs
    if (cat === 'entertainment') return <Film size={16} />;
    if (cat === 'education') return <GraduationCap size={16} />;
    if (cat === 'business') return <Briefcase size={16} />;
    if (cat === 'sports') return <Trophy size={16} />;
    if (cat === 'health' || cat === 'fitness') return <Activity size={16} />;
    if (cat === 'science') return <FlaskConical size={16} />;
    if (cat === 'other') return <MoreHorizontal size={16} />;
    if (cat === 'music') return <Music size={16} />;
    if (cat === 'tech') return <Code size={16} />;
    if (cat === 'news') return <Newspaper size={16} />;

    // AI Inferred / Fuzzy Matches
    if (cat.includes('video') || cat.includes('youtube')) return <Video size={16} />;
    if (cat.includes('audio') || cat.includes('spotify')) return <Music size={16} />;
    if (cat.includes('dev')) return <Code size={16} />;
    if (cat.includes('article') || cat.includes('blog')) return <Newspaper size={16} />;
    if (cat.includes('image') || cat.includes('photo') || cat.includes('design')) return <ImageIcon size={16} />;
    if (cat.includes('finance') || cat.includes('money') || cat.includes('crypto')) return <DollarSign size={16} />;
    if (cat.includes('work') || cat.includes('job') || cat.includes('career')) return <Briefcase size={16} />;
    if (cat.includes('social') || cat.includes('twitter') || cat.includes('linkedin')) return <MessageSquare size={16} />;
    if (cat.includes('book') || cat.includes('novel')) return <BookOpen size={16} />;
    
    return <Globe size={16} />;
  };

  // Apply filters
  useEffect(() => {
    fetchItems(query, { category: selectedCategory, collectionId: selectedCollection });
  }, [selectedCategory, selectedCollection]);

  // Filtered items by category (frontend filter for UX)
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.ai_output?.category === selectedCategory);

  return (
    <div className="min-h-screen bg-app text-secondary p-4 md:p-8 relative overflow-hidden pb-32">
       {/* Ambient Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse-slow" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <header className="max-w-[1920px] w-[95%] mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3 select-none">
             <Brain className="text-primary w-8 h-8" />
             <div className="hidden md:block">
              <h1 className="text-2xl font-semibold text-primary tracking-tight">Recallr</h1>
              <p className="text-xs text-muted font-medium tracking-wide">Neural Dashboard</p>
             </div>
        </div>

        <div className="flex items-center gap-4">
             {/* Quota Pulse */}
             <div className="flex items-center gap-3 px-4 py-2 bg-surface/50 border border-default rounded-full backdrop-blur-md">
                <div className="relative w-2 h-2">
                   <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${quota.remaining < 5 ? 'bg-red-400' : 'bg-green-400'}`}></span>
                   <span className={`relative inline-flex rounded-full h-2 w-2 ${quota.remaining < 5 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                </div>
                <span className="text-xs font-medium text-muted">
                    {quota.remaining} saves left
                </span>
             </div>
             
             <ThemeToggle />
             <button onClick={() => auth.signOut()} className="p-2 hover:text-red-400 transition-colors" title="Sign Out">
                 <LogOut size={20} />
             </button>
        </div>
      </header>

      <main className="max-w-[1920px] w-[95%] mx-auto space-y-12 px-6 pb-32 relative z-10 flex-1 flex flex-col">
        {/* SYNAPSE BAR: Combined Search & Save */}
        {/* SYNAPSE BAR: Combined Search & Save */}
        <div className="max-w-7xl mx-auto relative z-20 group">
           {/* Ambient subtle backdrop */}
           <div className={`absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition duration-1000 ${isSaving ? 'animate-pulse opacity-60' : ''}`} />
           
           <div className="relative flex items-center bg-black/5 dark:bg-white/[0.03] backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-full transition-all duration-700 hover:shadow-[0_0_50px_-10px_rgba(167,139,250,0.15)] hover:border-primary/20 focus-within:shadow-[0_0_50px_-10px_rgba(167,139,250,0.25)] focus-within:border-primary/30">
               
               {/* Leading Icon: Large Brain (Neutral, Stable) */}
               <div className="absolute left-6 text-black/20 dark:text-white/10 pointer-events-none transition-colors duration-500">
                  <Brain size={32} strokeWidth={1.5} />
               </div>

               {/* Intake Field */}
               <input 
                 type="text"
                 value={url || query}
                 onChange={(e) => {
                     const val = e.target.value;
                     if (val.startsWith('http')) {
                         setUrl(val);
                         setQuery('');
                     } else {
                         setQuery(val);
                         setUrl('');
                     }
                 }}
                 onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                         if (url) handleSave(e);
                         else handleSearch(e);
                     }
                 }}
                 placeholder="Paste the URL to be saved"
                 className="w-full bg-transparent border-none focus:ring-0 text-2xl font-light tracking-wide py-6 pl-20 pr-32 placeholder:text-black/50 dark:placeholder:text-white/40 text-secondary focus:outline-none transition-all"
               />

               {/* Action Button: Save/Capture */}
               <div className="absolute right-3">
                   <button 
                      onClick={handleSave}
                      disabled={isSaving || (!url && !query) || quota.remaining === 0}
                      className="h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500 bg-primary/20 text-primary hover:bg-primary/30 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                   >
                      {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Plus size={28} strokeWidth={2} />}
                   </button>
               </div>
           </div>
           {/* Context Hints */}
           <div className="absolute top-full mt-2 left-4 text-xs text-muted flex gap-4">
              <span>Press <kbd className="font-sans bg-surface/50 px-1 rounded border border-default">↵</kbd> to action</span>
              {collections.length > 0 && selectedCollection !== 'all' && (
                 <span className="text-primary">• Saving to: {collections.find(c => c.id === selectedCollection)?.name}</span>
              )}
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
            {categories.map(cat => {
                const count = cat === 'all' 
                    ? items.length 
                    : items.filter(i => (i.ai_output?.category || 'other').toLowerCase() === cat).length;
                
                return (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        title={cat.charAt(0).toUpperCase() + cat.slice(1)}
                        className={`relative px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                            selectedCategory === cat
                            ? 'text-white'
                            : 'text-muted hover:text-primary'
                        }`}
                    >
                        {selectedCategory === cat && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {cat === 'all' ? <Layout size={16} /> : getCategoryIcon(cat)}
                            <span className="text-xs font-mono opacity-80">({count})</span>
                        </span>
                    </button>
                );
            })}
        </div>

        {/* GRID: Memories (Switched from Masonry to CSS Grid for better fill) */}
        {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : filteredItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 gap-6">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    <Brain size={64} className="relative text-primary/80" />
                 </div>
                 
                 <div className="text-center space-y-2 max-w-md">
                    <h3 className="text-2xl font-semibold text-secondary">Your brain is quiet... too quiet.</h3>
                    <p className="text-muted">Start by saving a link, or try searching for inspiration:</p>
                 </div>

                 {/* Starter Pack Chips */}
                 <div className="flex flex-wrap justify-center gap-3">
                    {['Future of AI', 'React Design Patterns', 'Space Exploration', 'Healthy Recipes'].map((prompt) => (
                        <button
                           key={prompt}
                           onClick={() => setQuery(prompt)}
                           className="px-4 py-2 bg-surface border border-default rounded-full text-sm text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                           <Search size={14} />
                           {prompt}
                        </button>
                    ))}
                 </div>
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => (
                        <SpotlightCard 
                           key={item.id}
                           className="h-full flex flex-col bg-surface border border-default rounded-2xl hover:border-primary/50 transition-all group cursor-pointer shadow-sm hover:shadow-xl"
                           onClick={() => handleItemView(item)}
                        >
                           <div className="p-6 flex flex-col h-full">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/20">
                                       {getCategoryIcon(item.ai_output?.category)}
                                       <span>{item.ai_output?.category || 'General'}</span>
                                   </div>
                                   <div className="flex gap-2">
                                       <button 
                                          onClick={(e) => { e.stopPropagation(); setItemForCollection(item); }}
                                          className="text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded"
                                          title="Add to Collection"
                                       >
                                           <FolderPlus size={16} />
                                       </button>
                                       <button 
                                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                          className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               </div>

                               <h3 className="text-lg font-bold text-secondary mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                   {item.ai_output?.title || item.raw_input?.title || "Processing..."}
                               </h3>
                               
                               <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-3 flex-1">
                                   {item.ai_output?.summary || "AI is analyzing this content..."}
                               </p>

                               <div className="flex items-center justify-between pt-4 border-t border-default/50 text-xs text-muted font-mono mt-auto">
                                   <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${item.ai_output ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                                      <span>{item.ai_output?.confidence_level?.toUpperCase() || 'UNKNOWN'} SCORE</span>
                                   </div>
                                   <span>{new Date(item.created_at).toLocaleDateString()}</span>
                               </div>
                           </div>
                        </SpotlightCard>
                    ))}
                </AnimatePresence>
             </div>
        )}
      </main>

      {/* FLOATING GLASS DOCK */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-default/50 rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-6 z-40">
           <button 
             onClick={() => {
                setSelectedCategory('all');
                setSelectedCollection('all');
                setQuery('');
             }} 
             className={`p-2 rounded-xl transition-all relative group ${selectedCategory === 'all' && !showStats && !showCollections && !showChat && !showReminders ? 'text-primary' : 'text-muted hover:text-primary hover:bg-primary/5'}`}
           >
              <Home size={24} />
              {selectedCategory === 'all' && !showStats && !showCollections && !showChat && !showReminders && (
                  <motion.div layoutId="dockActive" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.5)]" />
              )}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Home</span>
           </button>
           
           <div className="w-px h-8 bg-default/50"></div>

           <button 
             onClick={() => setShowStats(true)} 
             className={`p-2 rounded-xl transition-all relative group ${showStats ? 'text-primary' : 'text-muted hover:text-primary hover:bg-primary/5'}`}
           >
              <BarChart3 size={24} />
              {showStats && (
                  <motion.div layoutId="dockActive" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.5)]" />
              )}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Analytics</span>
           </button>

           <button 
             onClick={() => setShowReminders(true)} 
             className={`p-2 rounded-xl transition-all relative group ${showReminders ? 'text-primary' : 'text-muted hover:text-primary hover:bg-primary/5'}`}
           >
              <Bell size={24} />
              {showReminders && (
                  <motion.div layoutId="dockActive" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.5)]" />
              )}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Reminders</span>
           </button>

           <button 
             onClick={() => setShowCollections(true)} 
             className={`p-2 rounded-xl transition-all relative group ${showCollections ? 'text-primary' : 'text-muted hover:text-primary hover:bg-primary/5'}`}
           >
              <Folder size={24} />
              {showCollections && (
                  <motion.div layoutId="dockActive" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.5)]" />
              )}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Collections</span>
           </button>

           <button 
             onClick={() => setShowExport(true)} 
             className={`p-2 rounded-xl transition-all relative group ${showExport ? 'text-primary' : 'text-muted hover:text-primary hover:bg-primary/5'}`}
           >
              <Download size={24} />
              {showExport && (
                  <motion.div layoutId="dockActive" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(139,92,246,0.5)]" />
              )}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Export</span>
           </button>
           
           <button 
             onClick={() => setShowChat(true)} 
             className={`p-3 rounded-xl transition-all relative group ${showChat ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary hover:scale-110'}`}
           >
              <MessageCircle size={24} />
              {showChat && (
                  <motion.div layoutId="dockActive" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ask AI</span>
           </button>
      </div>

       {/* Modals & Dialogs (Preserved Logic) */}
       <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-default rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 p-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 rounded-full bg-black/10 hover:bg-black/20 text-muted transition-colors"
                  >
                    <X size={20} />
                  </button>
              </div>

              <div className="mb-6">
                 <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
                       {getCategoryIcon(selectedItem.ai_output?.category)}
                       {selectedItem.ai_output?.category || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-muted font-mono">{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                 </div>
                 <h2 className="text-3xl font-bold text-secondary mt-2 leading-tight">
                    {selectedItem.ai_output?.title || selectedItem.raw_input?.title || "Saved Content"}
                 </h2>
                 <a href={selectedItem.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline mt-4 text-sm font-medium bg-primary/5 px-3 py-2 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                    <ExternalLink size={14} /> Visit Source
                 </a>
              </div>

              <div className="bg-elevated/50 rounded-2xl p-6 border border-default mb-8">
                  <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                     <Brain size={16} className="text-primary" />
                     AI Summary
                  </h3>
                  <p className="text-muted leading-relaxed">
                      {selectedItem.ai_output?.summary || "No summary available."}
                  </p>
              </div>

              {selectedItem.ai_output?.key_ideas && selectedItem.ai_output.key_ideas.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-secondary mb-3">Key Concepts</h3>
                  <ul className="space-y-3">
                    {selectedItem.ai_output.key_ideas.map((idea, i) => (
                      <li key={i} className="flex gap-3 text-muted">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                          {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t border-default">
                  <button onClick={() => handleDelete(selectedItem.id)} className="text-red-400 hover:text-red-500 text-sm font-medium flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} /> Delete Memory
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CollectionDialog 
        isOpen={showCollections} 
        onClose={() => setShowCollections(false)} 
        user={user}
        onCollectionCreated={fetchCollections}
        onSelectCollection={(collectionId) => {
           setSelectedCollection(collectionId);
           setSelectedCategory('all'); // Clear category filter to see everything in collection
           setQuery('');
        }}
      />
      <ExportDialog 
        isOpen={showExport} 
        onClose={() => setShowExport(false)}  
        user={user}
      />
      <StatsDialog 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        items={allItems}
      />
      <ChatDialog 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
        user={user}
      />
      
      <ReminderDialog 
         isOpen={showReminders} 
         onClose={() => setShowReminders(false)} 
      />

       {/* Add To Collection Modal */}
       <AnimatePresence>
        {itemForCollection && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setItemForCollection(null)}
            >
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-surface border border-default rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                        <FolderPlus size={20} className="text-primary" />
                        Add to Collection
                    </h3>
                    
                    {collections.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted text-sm mb-4">No collections found.</p>
                            <button 
                                onClick={() => { setItemForCollection(null); setShowCollections(true); }}
                                className="text-primary text-sm hover:underline"
                            >
                                Create New Collection
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {collections.map(col => (
                                <button
                                    key={col.id}
                                    onClick={async () => {
                                        const toastId = toast.loading('Adding to collection...');
                                        try {
                                            const token = await user.getIdToken();
                                            await fetch(`${API_URL}/api/update/${itemForCollection.id}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ collectionId: col.id })
                                            });
                                            toast.success(`Added to "${col.name}"`, { id: toastId });
                                            setItemForCollection(null);
                                            // Refresh items to update UI if currently viewing a filtered list? 
                                            // For now just close.
                                            fetchItems(query, { category: selectedCategory, collectionId: selectedCollection });
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Failed to add to collection', { id: toastId });
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-default transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Folder size={16} />
                                        </div>
                                        <span className="text-secondary font-medium">{col.name}</span>
                                    </div>
                                    {itemForCollection.collectionId === col.id && (
                                        <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Current</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
       </AnimatePresence>

    </div>
  );
}
