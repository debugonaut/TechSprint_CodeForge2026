import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, LogOut, Loader2, Link as LinkIcon, ExternalLink, Hash, Info, X, Calendar, TrendingUp, Trash2, FolderOpen, Download, BarChart3, MessageCircle, Folder, Bell, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import CollectionDialog from './CollectionDialog';
import ExportDialog from './ExportDialog';
import StatsDialog from './StatsDialog';
import ChatDialog from './ChatDialog';
import ThemeToggle from './ThemeToggle';

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
    if (!url) return;
    
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
          url,
          title: "Saving...",
          content_text: "", 
          platform: 'web',
          collectionId: selectedCollection !== 'all' ? selectedCollection : null
        })
      });
      
      if (res.status === 409) {
        const errorData = await res.json();
        toast.error('This URL is already saved!');
        return;
      }
      
      if (res.ok) {
        toast.success('Saved successfully!');
        setUrl('');
        fetchItems(query, { category: selectedCategory, collectionId: selectedCollection });
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

  // Apply filters
  useEffect(() => {
    fetchItems(query, { category: selectedCategory, collectionId: selectedCollection });
  }, [selectedCategory, selectedCollection]);

  // Filtered items by category (frontend filter for UX)
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.ai_output?.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Reminder Banner */}
      {showReminderBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mb-4 bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Bell className="text-primary" size={20} />
            <div>
              <div className="font-semibold text-sm">Time to Review!</div>
              <div className="text-xs text-gray-400">You have {reminderCount} items saved a week ago that need your attention.</div>
            </div>
          </div>
          <button
            onClick={() => setShowReminderBanner(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">R</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">RecallBin</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          {/* Quota Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-white/5 text-xs">
            <span className="text-gray-400">Quota:</span>
            <span className={quota.remaining < 5 ? 'text-red-400 font-semibold' : 'text-primary font-semibold'}>
              {quota.remaining}/{quota.limit}
            </span>
          </div>

          <ThemeToggle />
          
          <button 
            onClick={() => setShowStats(true)}
            className="p-2 rounded-lg bg-surface hover:bg-white/10 transition-colors border border-white/5"
            title="View Analytics"
          >
            <BarChart3 size={18} />
          </button>

          <button 
            onClick={() => setShowCollections(true)}
            className="p-2 rounded-lg bg-surface hover:bg-white/10 transition-colors border border-white/5"
            title="Manage Collections"
          >
            <Folder size={18} />
          </button>

          <button 
            onClick={() => setShowExport(true)}
            className="p-2 rounded-lg bg-surface hover:bg-white/10 transition-colors border border-white/5"
            title="Export Data"
          >
            <Download size={18} />
          </button>

          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-white/10 transition-colors border border-white/5 text-sm"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </motion.div>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        {/* Input Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="relative group p-[1px] rounded-2xl bg-gradient-to-r from-primary/50 to-secondary/50">
            <div className="bg-surface rounded-2xl p-4 md:p-6 backdrop-blur-xl">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex gap-4">
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
                    disabled={isSaving || quota.remaining === 0}
                    className="bg-white text-black font-semibold rounded-xl px-6 md:px-8 py-3 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>}
                    <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>

                {/* Collection Selector */}
                {collections.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-gray-400" />
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="bg-black/30 border border-white/5 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    >
                      <option value="all">No Collection</option>
                      {collections.map(col => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                )}
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
            onChange={e => { setQuery(e.target.value); }} 
            onKeyPress={e => e.key === 'Enter' && handleSearch(e)}
            className="w-full bg-surface/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:bg-surface focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all text-sm text-gray-300 placeholder:text-gray-600"
          />
        </section>

        {/* Filter Tabs */}
        <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface/50 text-gray-400 hover:bg-surface hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                {cat === 'all' && <FolderOpen size={14} />}
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                {cat !== 'all' && ` (${items.filter(i => i.ai_output?.category === cat).length})`}
              </span>
            </button>
          ))}
        </section>

        {/* Items Grid */}
        {loading && filteredItems.length === 0 ? (
           <div className="flex justify-center p-12">
             <Loader2 className="animate-spin text-primary" size={32} />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-surface/40 hover:bg-surface/60 border border-white/5 hover:border-primary/20 backdrop-blur-md rounded-xl p-5 transition-all hover:-translate-y-1 flex flex-col h-full relative"
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 gap-2" onClick={() => handleItemView(item)}>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                      {item.ai_output?.title || item.raw_input?.title || "Processing..."}
                    </h3>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-4 flex-1 cursor-pointer" onClick={() => handleItemView(item)}>
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
                      <span>{item.ai_output?.confidence_level?.toUpperCase() || 'UNKNOWN'} CONFIDENCE</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {!loading && filteredItems.length === 0 && items.length > 0 && (
          <div className="text-center py-20 text-gray-600">
            <Info className="mx-auto mb-2 opacity-50" size={32} />
            <p>No items in this category.</p>
          </div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <Info className="mx-auto mb-2 opacity-50" size={32} />
            <p>No memories found. Save something to get started.</p>
          </div>
        )}
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all z-40"
        title="Ask Your Brain"
      >
        <MessageCircle size={24} />
      </button>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h2 className="text-3xl font-bold mb-2 pr-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {selectedItem.ai_output?.title || selectedItem.raw_input?.title || "Saved Content"}
              </h2>

              {/* URL */}
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline text-sm mb-6 inline-flex items-center gap-2"
              >
                <ExternalLink size={14} />
                Visit Source
              </a>

              {/* Meta Info */}
              <div className="flex gap-4 mb-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(selectedItem.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} />
                  {selectedItem.ai_output?.confidence_level?.toUpperCase() || "UNKNOWN"} Confidence
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-gray-300 leading-relaxed">
                  {selectedItem.ai_output?.summary || "No summary available."}
                </p>
              </div>

              {/* Key Ideas */}
              {selectedItem.ai_output?.key_ideas && selectedItem.ai_output.key_ideas.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Key Ideas</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {selectedItem.ai_output.key_ideas.map((idea, i) => (
                      <li key={i}>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {selectedItem.ai_output?.tags && selectedItem.ai_output.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.ai_output.tags.map((tag, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full uppercase tracking-wider font-medium">
                        <Hash size={12} />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {selectedItem.ai_output?.entities && selectedItem.ai_output.entities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Entities</h3>
                  <p className="text-gray-300">{selectedItem.ai_output.entities.join(", ")}</p>
                </div>
              )}

              {/* Delete Button in Modal */}
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="w-full mt-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete This Item
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <CollectionDialog 
        isOpen={showCollections} 
        onClose={() => setShowCollections(false)} 
        user={user}
        onCollectionCreated={fetchCollections}
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
    </div>
  );
}
