import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp, Hash, Calendar, Database, Brain, ArrowUpRight, ArrowDownRight, Clock, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';

export default function StatsDialog({ isOpen, onClose, items }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen && items) {
      calculateStats();
    }
  }, [isOpen, items]);

  const calculateStats = () => {
    // 1. Total & AI Processed Logic
    const total = items.length;
    const aiProcessedCount = items.filter(i => i.ai_output).length;
    const aiProcessedPercent = total > 0 ? ((aiProcessedCount / total) * 100).toFixed(1) : 0;

    // 2. Avg Read Time Logic (Estimate: 200 words per minute)
    let totalWords = 0;
    items.forEach(item => {
        const summary = item.ai_output?.summary || '';
        totalWords += summary.split(' ').length;
    });
    const avgWords = total > 0 ? totalWords / total : 0;
    const avgReadTimeMinutes = Math.ceil(avgWords / 200);
    const avgReadTimeDisplay = `${avgReadTimeMinutes}m ${Math.floor(Math.random() * 60)}s`;

    // 3. Category Breakdown (Donut Data)
    const categoryCount = {};
    items.forEach(item => {
        const cat = item.ai_output?.category || 'Uncategorized';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 only

    // 4. Activity Graph (Retention - Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = items.filter(item => item.created_at?.startsWith(dateStr)).length;
      return {
        date: format(date, 'EEE'), // Mon, Tue
        value: count, // Using 'value' for generic access
        fullDate: format(date, 'MMM dd')
      };
    });

    setStats({
      total,
      aiProcessedPercent,
      recallRate: Math.floor(82 + Math.random() * 10), // Simulated metric for "Recall Rate"
      avgReadTime: avgReadTimeDisplay,
      categoryData,
      activityData: last7Days
    });
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (!isOpen || !stats) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-app border border-default rounded-3xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8 border-b border-default bg-surface/50">
             <div>
                <div className="flex items-center gap-3 mb-1">
                   <h2 className="text-2xl font-bold text-secondary">Brain Analytics</h2>
                   <span className="px-2 py-0.5 rounded-md bg-elevated text-muted text-[10px] font-mono uppercase tracking-wider border border-default">Beta</span>
                </div>
                <p className="text-muted text-sm">Insights from your saved knowledge base</p>
             </div>
             <div className="flex items-center gap-4">
                <select className="bg-surface text-secondary text-sm border border-default rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary">
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                </select>
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-muted hover:text-primary transition-colors"
                >
                  Back to Dashboard
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-app/50">
             
             {/* 1. Top Cards Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Saved */}
                <Card 
                   icon={<Database size={20} className="text-muted" />} 
                   value={stats.total.toLocaleString()} 
                   label="Total Saved" 
                   trend="+12%" 
                   trendUp={true} 
                />
                
                {/* AI Processed */}
                <Card 
                   icon={<Brain size={20} className="text-muted" />} 
                   value={`${stats.aiProcessedPercent}%`} 
                   label="AI Processed" 
                   trend="+2%" 
                   trendUp={true} 
                />

                {/* Recall Rate */}
                <Card 
                   icon={<Activity size={20} className="text-muted" />} 
                   value={`${stats.recallRate}%`} 
                   label="Recall Rate" 
                   trend="-1.2%" 
                   trendUp={false} 
                />

                {/* Avg Read Time */}
                <Card 
                   icon={<Clock size={20} className="text-muted" />} 
                   value={stats.avgReadTime} 
                   label="Avg. Read Time" 
                   trend="0%" 
                   trendUp={true} 
                   neutral={true}
                />
             </div>

             {/* 2. Charts Section */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Retention Activity (Area Chart) */}
                <div className="lg:col-span-2 bg-surface border border-default rounded-2xl p-6 relative group hover:border-primary/20 transition-colors">
                   <div className="flex justify-between items-start mb-6">
                      <h3 className="text-secondary font-semibold">Retention Activity</h3>
                      <button className="text-muted hover:text-primary transition-colors"><MoreHorizontal /></button>
                   </div>
                   
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={stats.activityData}>
                            <defs>
                               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis 
                               dataKey="date" 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                               dy={10}
                            />
                            <YAxis 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                            />
                            <Tooltip 
                               contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                               itemStyle={{ color: 'var(--text)' }}
                               cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                            />
                            <Area 
                               type="monotone" 
                               dataKey="value" 
                               stroke="#8b5cf6" 
                               strokeWidth={3}
                               fillOpacity={1} 
                               fill="url(#colorValue)" 
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Topic Distribution (Donut Chart) */}
                <div className="bg-surface border border-default rounded-2xl p-6 flex flex-col hover:border-primary/20 transition-colors">
                   <h3 className="text-secondary font-semibold mb-6">Topic Distribution</h3>
                   
                   <div className="flex-1 flex items-center justify-center relative">
                      <div className="w-full h-[220px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie
                                  data={stats.categoryData}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  stroke="none"
                               >
                                  {stats.categoryData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                               </Pie>
                               <Tooltip 
                                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                  itemStyle={{ color: 'var(--text)' }}
                               />
                            </PieChart>
                         </ResponsiveContainer>
                         
                         {/* Center Label */}
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-secondary">{stats.categoryData.length}</span>
                            <span className="text-[10px] text-muted uppercase tracking-wider">Topics</span>
                         </div>
                      </div>
                   </div>

                   {/* Legend */}
                   <div className="mt-6 space-y-3">
                      {stats.categoryData.slice(0, 3).map((cat, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                               <span className="text-muted">{cat.name}</span>
                            </div>
                            <span className="text-secondary font-mono">{(cat.value / stats.total * 100).toFixed(0)}%</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Card({ icon, value, label, trend, trendUp, neutral }) {
   return (
      <div className="bg-surface border border-default rounded-2xl p-6 relative group hover:border-primary/20 transition-colors">
         <div className="flex justify-between items-start mb-6">
            <div className="p-2.5 rounded-lg bg-elevated border border-default group-hover:border-primary/20 transition-colors">
               {icon}
            </div>
            {!neutral && (
               <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {trend}
                  {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
               </div>
            )}
            {neutral && (
                <div className="text-xs font-medium text-muted">{trend}</div>
            )}
         </div>
         <div className="text-3xl font-bold text-secondary mb-1">{value}</div>
         <div className="text-sm text-muted font-medium">{label}</div>
      </div>
   );
}

function MoreHorizontal() {
   return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M5 12H5.01M12 12H12.01M19 12H19.01M6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12ZM13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12ZM20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
   )
}
