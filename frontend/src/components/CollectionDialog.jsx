import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, FolderPlus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.DEV ? 'http://localhost:5001' : '';

export default function CollectionDialog({ isOpen, onClose, user, onCollectionCreated }) {
  const [collections, setCollections] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6'
  });

  const colors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#8B5A00'  // Orange
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

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
      toast.error('Failed to load collections');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = await user.getIdToken();
      
      if (editingId) {
        // Update existing
        await fetch(`${API_URL}/api/collections/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        toast.success('Collection updated!');
      } else {
        // Create new
        await fetch(`${API_URL}/api/collections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        toast.success('Collection created!');
      }
      
      setFormData({ name: '', description: '', color: '#8B5CF6' });
      setIsCreating(false);
      setEditingId(null);
      fetchCollections();
      
      if (onCollectionCreated) onCollectionCreated();
      
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this collection? Items won\'t be deleted, just removed from this collection.')) return;
    
    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/api/collections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Collection deleted');
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const startEdit = (collection) => {
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color || '#8B5CF6'
    });
    setEditingId(collection.id);
    setIsCreating(true);
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
          className="bg-surface border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Collections</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Create New Button */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 mb-6 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Create New Collection
            </button>
          )}

          {/* Create/Edit Form */}
          {isCreating && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="bg-black/30 border border-white/5 rounded-xl p-4 mb-6 space-y-4"
            >
              <input
                type="text"
                placeholder="Collection Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                required
              />
              
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                rows={2}
              />
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-semibold rounded-lg px-4 py-2 hover:bg-primary/80 transition-colors text-sm"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', color: '#8B5CF6' });
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {/* Collections List */}
          <div className="space-y-2">
            {collections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderPlus className="mx-auto mb-2 opacity-50" size={32} />
                <p>No collections yet. Create one to get organized!</p>
              </div>
            )}
            
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-black/20 border border-white/5 rounded-lg p-4 hover:bg-black/30 hover:border-primary/50 transition-all cursor-pointer group"
                role="button"
                onClick={() => {
                   if (onSelectCollection) {
                       onSelectCollection(collection.id);
                       onClose();
                   }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: collection.color + '20' }}
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: collection.color }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-gray-400 mt-1">{collection.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {collection.item_count || 0} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEdit(collection)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
