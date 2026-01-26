import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp, Hash, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';

export default function StatsDialog({ isOpen, onClose, items }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen && items) {
      calculateStats();
    }
  }, [isOpen, items]);

  const calculateStats = () => {
    // Category breakdown
    const categoryCount = {};
    items.forEach(item => {
      const cat = item.ai_output?.category || 'other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Top tags
    const tagCount = {};
    items.forEach(item => {
      (item.ai_output?.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Saves over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = items.filter(item => item.created_at?.startsWith(dateStr)).length;
      return {
        date: format(date, 'MMM dd'),
        count
      };
    });

    setStats({
      total: items.length,
      categoryData,
      topTags,
      savesOverTime: last7Days,
      avgPerDay: (items.length / Math.max(1, items.length > 0 ? 
        Math.ceil((new Date() - new Date(items[items.length - 1]?.created_at)) / (1000 * 60 * 60 * 24)) : 1)).toFixed(1)
    });
  };

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#8B5A00'];

  if (!isOpen || !stats) return null;

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
          className="bg-surface border border-white/10 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-primary" />
              <h2 className="text-2xl font-bold">Your Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-gray-400 mt-1">Total Saves</div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.categoryData.length}</div>
              <div className="text-xs text-gray-400 mt-1">Categories</div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{stats.topTags.length}</div>
              <div className="text-xs text-gray-400 mt-1">Unique Tags</div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.avgPerDay}</div>
              <div className="text-xs text-gray-400 mt-1">Avg/Day</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-sm">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.categoryData.slice(0, 6).map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-gray-300">{cat.name}</span>
                    <span className="text-gray-500">({cat.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saves Over Time */}
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-sm">Saves Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.savesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Tags */}
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 md:col-span-2">
              <h3 className="font-semibold mb-4 text-sm">Top Tags</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.topTags}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
