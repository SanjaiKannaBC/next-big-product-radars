/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SAMPLE_TRENDS } from './data/mockData';
import { Trend } from './types';
import { LayoutDashboard, TrendingUp, Zap, Search, ArrowRight, BarChart3, Activity, AlertCircle, Plus, Loader2, X, Compass, Layers, Settings, Menu, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { analyzeTrendWithGemini } from './services/gemini';
import { Chatbot } from './components/Chatbot';

function SidebarItem({ icon: Icon, label, active = false, onClick, collapsed = false }: { icon: any, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <Icon size={20} className={cn("shrink-0 transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white")} />
      {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap uppercase tracking-widest">
          {label}
        </div>
      )}
    </div>
  );
}

function DiscoveryView() {
  const categories = [
    { name: 'Biohacking', count: 12, growth: '+24%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Mental Wellness', count: 8, growth: '+18%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { name: 'Sustainable Nutrition', count: 15, growth: '+32%', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { name: 'Longevity', count: 6, growth: '+45%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2 dark:text-white tracking-tight">Trend Discovery</h2>
          <p className="text-slate-500 dark:text-slate-400">Explore emerging categories and untapped market shifts.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer group hover:shadow-xl hover:shadow-blue-500/5">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-all group-hover:scale-110", cat.bg, cat.color)}>
                <cat.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{cat.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{cat.count} Trends</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">{cat.growth}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-bold text-xl mb-8 dark:text-white tracking-tight">Broad Market Shifts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  0{i}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Shift in Consumer Behavior {i}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Increased interest in personalized wellness solutions across Tier 1 cities.</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveSignalsView({ trends }: { trends: Trend[] }) {
  const allSignals = trends.flatMap(t => t.signals.map(s => ({ ...s, trendName: t.name, trendId: t.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold dark:text-white tracking-tight">Live Signal Feed</h2>
            <p className="text-slate-500 dark:text-slate-400">Real-time aggregation of market movements.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30 tracking-widest uppercase">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            LIVE UPDATING
          </div>
        </div>

        <div className="space-y-4">
          {allSignals.map((signal, i) => (
            <div key={i} className="flex items-start gap-5 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group cursor-pointer">
              <div className="mt-1 shrink-0 transition-all group-hover:scale-110">
                {signal.source === 'Reddit' && <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm shadow-sm">R</div>}
                {signal.source === 'Google Trends' && <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">G</div>}
                {signal.source === 'YouTube' && <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-sm shadow-sm">Y</div>}
                {signal.source === 'Instagram' && <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold text-sm shadow-sm">I</div>}
                {signal.source === 'Research' && <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-sm shadow-sm">S</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{signal.trendName}</h4>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{signal.date}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed font-medium">{signal.context}</p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest">{signal.source}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg">+{signal.change}% Momentum</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <h2 className="text-3xl font-bold mb-10 dark:text-white tracking-tight">Platform Settings</h2>
        
        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Intelligence Configuration</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="flex-1 mr-6">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">Signal Sensitivity</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Detect shifts {'>'} 15% momentum</div>
                </div>
                <input type="range" className="w-32 accent-blue-600" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Notifications</h3>
            <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">Critical Alerts</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Notify on signals with {'>'} 50% velocity</div>
              </div>
              <button className="w-14 h-7 rounded-full bg-blue-600 relative">
                <div className="absolute top-1 left-8 w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ trends, onSelectTrend }: { trends: Trend[], onSelectTrend: (t: Trend) => void }) {
  const avgVelocity = Math.round(trends.reduce((acc, t) => acc + t.scores.velocity, 0) / trends.length);
  const highPotentialCount = trends.filter(t => t.scores.overallScore >= 80).length;
  // Sort by Overall Score to match the card badges
  const topTrends = [...trends].sort((a, b) => b.scores.overallScore - a.scores.overallScore).slice(0, 5);
  
  const allSignals = trends.flatMap(t => t.signals.map(s => ({ ...s, trendName: t.name, trendId: t.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px] opacity-[0.07] -mr-64 -mt-64 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="bg-blue-600 text-white p-4 rounded-[1.5rem] shadow-2xl shadow-blue-500/30">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Market Pulse</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time health and wellness intelligence aggregation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">Live Intelligence</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <MetricCard label="Active Trends" value={trends.length} sub="Monitoring" />
           <MetricCard label="Avg. Velocity" value={`${avgVelocity}%`} sub="Market Heat" />
           <MetricCard label="High Potential" value={highPotentialCount} sub="Opportunities > 80 Score" />
        </div>
      </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Top Movers Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <h3 className="font-bold text-xl mb-10 flex items-center gap-4 dark:text-white tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <TrendingUp size={20} />
              </div>
              Top Rated Trends
            </h3>
            <div className="h-96">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={topTrends} layout="vertical" margin={{ left: 0, right: 30 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" opacity={0.05} />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fontWeight: 600, fill: '#94A3B8'}} interval={0} axisLine={false} tickLine={false} />
                   <Tooltip 
                      cursor={{fill: 'rgba(59, 130, 246, 0.03)', radius: 8}}
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backgroundColor: '#0F172A', color: '#FFF', padding: '12px 16px'}}
                      itemStyle={{color: '#FFF', fontWeight: 700, fontSize: '12px'}}
                      labelStyle={{color: '#94A3B8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px'}}
                      formatter={(value: number) => [value, 'Overall Score']}
                   />
                   <Bar dataKey="scores.overallScore" fill="#3B82F6" radius={[0, 12, 12, 0]} barSize={48} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
    </div>
  );
}

function App() {
  const [trends, setTrends] = useState<Trend[]>(SAMPLE_TRENDS);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeView, setActiveView] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Analysis Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisTopic, setAnalysisTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const filteredTrends = trends.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.scores.overallScore - a.scores.overallScore);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisTopic.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const newTrend = await analyzeTrendWithGemini(analysisTopic);
      setTrends([newTrend, ...trends]);
      setSelectedTrend(newTrend);
      setIsModalOpen(false);
      setAnalysisTopic('');
    } catch (err) {
      setAnalysisError("Failed to analyze trend. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-300 dark bg-slate-950 text-slate-100">
      <div className="flex-1 flex flex-col overflow-hidden font-sans selection:bg-blue-500/20">
        {/* Navigation */}
        <nav className="shrink-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hidden lg:block"
                >
                  <Menu size={20} />
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 lg:hidden"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                    <Zap size={18} fill="currentColor" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">Radar<span className="text-blue-600">.</span></span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search market signals..." 
                    className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all border border-transparent focus:border-blue-500/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-blue-500/20"
                >
                  <Plus size={16} />
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Analysis Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => !isAnalyzing && setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Market Analysis</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-powered signal extraction and brief generation</p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)} 
                      disabled={isAnalyzing}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAnalyze} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trend Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Ashwagandha Gummies"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                        value={analysisTopic}
                        onChange={(e) => setAnalysisTopic(e.target.value)}
                        disabled={isAnalyzing}
                        autoFocus
                      />
                    </div>

                    {analysisError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
                        <AlertCircle size={16} className="shrink-0" />
                        {analysisError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAnalyzing || !analysisTopic.trim()}
                      className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Analyzing Market Data...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate Opportunity Brief
                        </>
                      )}
                    </button>
                  </form>
                </div>
                {isAnalyzing && (
                  <div className="h-1 w-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden">
                    <div className="h-full bg-blue-600 animate-progress origin-left"></div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex overflow-hidden">
          {/* Mobile Menu Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
                />
                <motion.aside 
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[70] p-6 border-r border-slate-200 dark:border-slate-800 lg:hidden flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <Zap size={18} fill="currentColor" />
                      </div>
                      <span className="font-bold text-lg tracking-tight">Radar<span className="text-blue-600">.</span></span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Overview" active={activeView === 'Overview'} onClick={() => { setActiveView('Overview'); setSelectedTrend(null); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Compass} label="Discovery" active={activeView === 'Discovery'} onClick={() => { setActiveView('Discovery'); setIsMobileMenuOpen(false); }} />
                    <SidebarItem icon={Activity} label="Live Signals" active={activeView === 'Live Signals'} onClick={() => { setActiveView('Live Signals'); setIsMobileMenuOpen(false); }} />
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <SidebarItem icon={Settings} label="Settings" active={activeView === 'Settings'} onClick={() => { setActiveView('Settings'); setIsMobileMenuOpen(false); }} />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <aside 
            className={cn(
              "hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 h-full z-40 shrink-0",
              isSidebarOpen ? "w-64 p-6" : "w-20 p-4"
            )}
          >
            <div className="space-y-1 flex-1">
              {!isSidebarOpen && (
                <div className="flex justify-center mb-6">
                  <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
              )}
              {isSidebarOpen && (
                <div className="px-3 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform</span>
                </div>
              )}
              <SidebarItem collapsed={!isSidebarOpen} icon={LayoutDashboard} label="Overview" active={activeView === 'Overview'} onClick={() => { setActiveView('Overview'); setSelectedTrend(null); }} />
              <SidebarItem collapsed={!isSidebarOpen} icon={Compass} label="Discovery" active={activeView === 'Discovery'} onClick={() => setActiveView('Discovery')} />
              <SidebarItem collapsed={!isSidebarOpen} icon={Activity} label="Live Signals" active={activeView === 'Live Signals'} onClick={() => setActiveView('Live Signals')} />
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <SidebarItem collapsed={!isSidebarOpen} icon={Settings} label="Settings" active={activeView === 'Settings'} onClick={() => setActiveView('Settings')} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AnimatePresence mode="wait">
              {activeView === 'Overview' ? (
                <div key="overview" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Trend List */}
                  <div className={cn(
                    "lg:col-span-5 space-y-6 transition-all duration-500 order-2 lg:order-1",
                    selectedTrend ? "hidden lg:block" : "block"
                  )}>
                    <div className="flex flex-col gap-4 mb-2">
                      <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Emerging Signals</h1>
                        <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800 uppercase tracking-widest">
                          {filteredTrends.length} Active
                        </span>
                      </div>

                      {/* Category Filters */}
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Supplement', 'Skincare', 'Beverage', 'Device'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                              selectedCategory === cat
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-900"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredTrends.map((trend) => (
                        <motion.div
                          layoutId={`card-${trend.id}`}
                          key={trend.id}
                          onClick={() => setSelectedTrend(trend)}
                          className={cn(
                            "group relative rounded-xl p-4 cursor-pointer border transition-all duration-200",
                            selectedTrend?.id === trend.id 
                              ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 text-white" 
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-blue-500/5"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800",
                                  selectedTrend?.id === trend.id ? "bg-white/20 text-white" : "text-slate-500 dark:text-slate-400"
                                )}>
                                  {trend.category}
                                </span>
                                {trend.scores.overallScore >= 85 && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                    <TrendingUp size={10} />
                                    High Growth
                                  </span>
                                )}
                              </div>
                              <h3 className={cn(
                                "font-bold text-base transition-colors",
                                selectedTrend?.id === trend.id ? "text-white" : "text-slate-900 dark:text-white group-hover:text-blue-600"
                              )}>
                                {trend.name}
                              </h3>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                              selectedTrend?.id === trend.id 
                                ? "bg-white/20 text-white" 
                                : (trend.scores.overallScore >= 80 ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                                   trend.scores.overallScore >= 60 ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                                   "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400")
                            )}>
                              {trend.scores.overallScore}
                            </div>
                          </div>
                          
                          <p className={cn(
                            "text-xs line-clamp-2 mb-3 leading-relaxed",
                            selectedTrend?.id === trend.id ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                          )}>
                            {trend.description}
                          </p>

                          <div className={cn(
                            "flex items-center justify-between text-[10px] border-t pt-3",
                            selectedTrend?.id === trend.id ? "border-white/10 text-blue-100" : "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                          )}>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 font-bold">
                                <TrendingUp size={12} />
                                {trend.scores.velocity}% VELOCITY
                              </span>
                              <span className="flex items-center gap-1 font-bold">
                                <Activity size={12} />
                                {trend.signals.length} SIGNALS
                              </span>
                            </div>
                            <span className="font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Details →</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Detail View */}
                  <div className={cn(
                    "lg:col-span-7 transition-all duration-500 order-1 lg:order-2",
                    "block"
                  )}>
                    <AnimatePresence mode="wait">
                      {selectedTrend ? (
                        <motion.div
                          key={selectedTrend.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden sticky top-24"
                        >
                          {/* Header */}
                          <div className="bg-slate-900 dark:bg-black text-white p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
                            
                            <button 
                              onClick={() => setSelectedTrend(null)}
                              className="lg:hidden absolute top-6 left-6 text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <ChevronLeft size={20} />
                            </button>

                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-lg bg-white/10 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                                  {selectedTrend.category}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-blue-500/20">
                                  {selectedTrend.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <h2 className="text-5xl font-bold mb-4 tracking-tight leading-none">{selectedTrend.name}</h2>
                                  <p className="text-slate-400 text-lg max-w-xl leading-relaxed">{selectedTrend.description}</p>
                                </div>
                                <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                                  <ArrowRight className="rotate-90" size={18} />
                                  Export Brief
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-10 space-y-10">
                            
                            {/* Opportunity Brief - The "Killer Feature" */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={120} className="text-blue-600" />
                              </div>
                              <div className="flex items-center gap-3 mb-6 text-blue-800 dark:text-blue-400 relative z-10">
                                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">
                                  <Zap size={20} fill="currentColor" />
                                </div>
                                <h3 className="font-bold text-xl tracking-tight">Opportunity Brief</h3>
                              </div>
                              <div className="prose prose-blue dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line relative z-10 font-medium">
                                {selectedTrend.opportunityBrief}
                              </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <MetricCard label="Velocity" value={selectedTrend.scores.velocity} sub="Growth Speed" />
                              <MetricCard label="Market Size" value={selectedTrend.scores.marketPotential} sub="Potential" />
                              <MetricCard label="Competition" value={selectedTrend.scores.competition} sub="Intensity" invert />
                              <MetricCard label="Time to Peak" value={`${selectedTrend.scores.timeToMainstream}mo`} sub="Forecast" />
                            </div>

                            {/* Chart */}
                            <div className="h-64 w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Interest Over Time</h4>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedTrend.historicalInterest}>
                                  <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.1} />
                                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                                  <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: '#111827', color: '#FFF'}}
                                    itemStyle={{color: '#FFF'}}
                                  />
                                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>                            {/* Signals List */}
                            <div className="space-y-6">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity size={14} className="text-blue-500" />
                                Detected Signal Extraction
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedTrend.signals.map((signal, idx) => (
                                  <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group">
                                    <div className="mt-1 shrink-0">
                                      {signal.source === 'Reddit' && <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs shadow-sm">R</div>}
                                      {signal.source === 'Google Trends' && <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">G</div>}
                                      {signal.source === 'YouTube' && <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-xs shadow-sm">Y</div>}
                                      {signal.source === 'Instagram' && <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold text-xs shadow-sm">I</div>}
                                      {signal.source === 'Research' && <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs shadow-sm">S</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{signal.source}</span>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">+{signal.change}%</span>
                                      </div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">{signal.context}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Market Data */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-slate-100 dark:border-slate-800">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Market Size</h4>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedTrend.market.marketSize}</p>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Price Point</h4>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedTrend.market.pricePoint}</p>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Competition</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        selectedTrend.market.competitionLevel === 'High' ? 'w-full bg-red-500' :
                                        selectedTrend.market.competitionLevel === 'Medium' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-emerald-500'
                                      )}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedTrend.market.competitionLevel}</span>
                                </div>
                              </div>
                              <div className="sm:col-span-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dominant Players</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTrend.market.currentPlayers.map((player, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200/50 dark:border-slate-700/50">
                                      {player}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      ) : (
                        <DashboardOverview trends={trends} onSelectTrend={setSelectedTrend} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : activeView === 'Discovery' ? (
                <DiscoveryView key="discovery" />
              ) : activeView === 'Live Signals' ? (
                <LiveSignalsView trends={trends} />
              ) : activeView === 'Settings' ? (
                <SettingsView />
              ) : (
                <div key="placeholder" className="bg-white dark:bg-gray-900 rounded-3xl p-12 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-gray-500">
                    <Zap size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeView} Module</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    This intelligence module is currently being calibrated with live market data. 
                    Check back soon for deep-dive insights.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
    </div>
  );
}

function MetricCard({ label, value, sub, invert = false }: { label: string, value: string | number, sub: string, invert?: boolean }) {
  // Simple color logic for demo
  let colorClass = "text-slate-900 dark:text-white";
  if (typeof value === 'number' || (typeof value === 'string' && value.includes('%'))) {
    const numValue = typeof value === 'number' ? value : parseInt(value);
    if (invert) {
      colorClass = numValue > 60 ? "text-red-600 dark:text-red-400" : numValue > 30 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
    } else {
      colorClass = numValue > 80 ? "text-emerald-600 dark:text-emerald-400" : numValue > 50 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white";
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/5 dark:hover:shadow-blue-500/5 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <TrendingUp size={64} className="text-slate-400" />
      </div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mb-4 group-hover:text-blue-500 transition-colors">{label}</div>
      <div className={cn("text-4xl font-bold mb-2 tracking-tight leading-none", colorClass)}>{value}</div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold opacity-60">{sub}</div>
    </div>
  );
}

export default App;
