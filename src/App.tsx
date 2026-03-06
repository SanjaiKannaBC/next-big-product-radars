import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Zap, 
  Search, 
  ArrowRight, 
  Activity, 
  AlertCircle, 
  Plus, 
  Loader2, 
  X, 
  Compass, 
  Layers, 
  Settings, 
  Menu, 
  ChevronLeft, 
  Sparkles, 
  RefreshCw,
  Send,
  User,
  Bot
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES & INTERFACES ---
interface Signal {
  source: string;
  context: string;
  change: number;
  date: string;
}

interface Trend {
  id: string;
  name: string;
  category: string;
  description: string;
  opportunityBrief: string;
  status: 'Emerging' | 'Growing' | 'Maturing';
  scores: {
    velocity: number;
    marketPotential: number;
    competition: 'Low' | 'Medium' | 'High';
    timeToMainstream: number;
    overallScore: number;
  };
  market: {
    marketSize: string;
    pricePoint: string;
    competitionLevel: string;
    currentPlayers: string[];
  };
  signals: Signal[];
  historicalInterest: { date: string; value: number }[];
}

// --- MOCK DATA (Fallback) ---
const SAMPLE_TRENDS: Trend[] = [
  {
    id: '1',
    name: 'Mushroom-Based Coffee',
    category: 'Beverage',
    description: 'Alternative coffee blends using functional mushrooms like Lions Mane and Cordyceps.',
    opportunityBrief: 'The Indian urban workforce is shifting toward functional caffeine. Mushroom coffee offers energy without the jitters. Significant gap in premium instant mushroom coffee segment.',
    status: 'Emerging',
    scores: {
      velocity: 82,
      marketPotential: 450,
      competition: 'Low',
      timeToMainstream: 8,
      overallScore: 88
    },
    market: {
      marketSize: '₹450 Cr',
      pricePoint: 'Premium',
      competitionLevel: 'Low',
      currentPlayers: ['Small Boutique Brands']
    },
    signals: [
      { source: 'Reddit', context: '300% increase in r/IndiaWellness discussions regarding adaptogens.', change: 300, date: '2024-03-01' },
      { source: 'Instagram', context: 'Influencer mentions of "Focus Coffee" up 45% in Bangalore.', change: 45, date: '2024-03-05' }
    ],
    historicalInterest: [
      { date: 'Jan', value: 20 },
      { date: 'Feb', value: 35 },
      { date: 'Mar', value: 82 }
    ]
  },
  {
    id: '2',
    name: 'Vegan Silk Skincare',
    category: 'Skincare',
    description: 'Skincare products utilizing bio-engineered vegan silk proteins for hydration.',
    opportunityBrief: 'Tier 1 city consumers are seeking cruelty-free luxury. Vegan silk provides the same "slip" as silk without the ethical concerns. High potential in the anti-pollution sub-segment.',
    status: 'Growing',
    scores: {
      velocity: 65,
      marketPotential: 320,
      competition: 'Medium',
      timeToMainstream: 12,
      overallScore: 74
    },
    market: {
      marketSize: '₹320 Cr',
      pricePoint: 'Mid-to-High',
      competitionLevel: 'Medium',
      currentPlayers: ['Global Direct Importers']
    },
    signals: [
      { source: 'Google Trends', context: 'Searches for "Vegan Silk Protein India" increased by 120%.', change: 120, date: '2024-02-15' }
    ],
    historicalInterest: [
      { date: 'Jan', value: 40 },
      { date: 'Feb', value: 55 },
      { date: 'Mar', value: 65 }
    ]
  }
];

// --- UTILS ---
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// --- GEMINI SERVICE ---
const apiKey = ""; // Provided at runtime

async function analyzeTrendWithGemini(topic: string): Promise<Trend> {
  const systemPrompt = `You are a world-class market research analyst specializing in the Indian D2C and wellness market.
  Your task is to analyze the given trend and return a structured JSON response.
  Provide detailed market intelligence, including scores, opportunity briefs, and signals.
  The response must be a single JSON object matching the Trend interface.
  Use real-world search grounding to find actual trends if possible.`;

  const userQuery = `Analyze the trend: "${topic}". Focus on the Indian market for 2026. Provide a detailed opportunity brief (approx 100 words), scores for velocity (0-100), market potential (in Cr), competition level, and historical interest data points.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ "google_search": {} }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              category: { type: "string" },
              description: { type: "string" },
              opportunityBrief: { type: "string" },
              status: { type: "string", enum: ["Emerging", "Growing", "Maturing"] },
              scores: {
                type: "OBJECT",
                properties: {
                  velocity: { type: "number" },
                  marketPotential: { type: "number" },
                  competition: { type: "string", enum: ["Low", "Medium", "High"] },
                  timeToMainstream: { type: "number" },
                  overallScore: { type: "number" }
                }
              },
              market: {
                type: "OBJECT",
                properties: {
                  marketSize: { type: "string" },
                  pricePoint: { type: "string" },
                  competitionLevel: { type: "string" },
                  currentPlayers: { type: "ARRAY", items: { type: "string" } }
                }
              },
              signals: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    source: { type: "string" },
                    context: { type: "string" },
                    change: { type: "number" },
                    date: { type: "string" }
                  }
                }
              },
              historicalInterest: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    date: { type: "string" },
                    value: { type: "number" }
                  }
                }
              }
            }
          }
        }
      })
    });

    if (!response.ok) throw new Error('API request failed');
    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Gemini error:', error);
    // Fallback to a modified mock object if API fails
    return {
      ...SAMPLE_TRENDS[0],
      id: Math.random().toString(36).substr(2, 9),
      name: topic,
      description: `Analysis for ${topic} could not be completed via AI. Using local templates.`
    };
  }
}

// --- COMPONENTS ---

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

function MetricCard({ label, value, sub, invert = false }: { label: string, value: string | number, sub: string, invert?: boolean }) {
  let colorClass = "text-slate-900 dark:text-white";
  if (typeof value === 'number' || (typeof value === 'string' && value.includes('%'))) {
    const numValue = typeof value === 'number' ? value : parseInt(value);
    if (numValue > 80) colorClass = "text-emerald-600 dark:text-emerald-400";
    else if (numValue > 50) colorClass = "text-amber-600 dark:text-amber-400";
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg group relative overflow-hidden">
      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-3">{label}</div>
      <div className={cn("text-3xl font-bold mb-1 tracking-tight", colorClass)}>{value}</div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold opacity-60">{sub}</div>
    </div>
  );
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userMsg }] }] })
      });
      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";
      setMessages(prev => [...prev, { role: 'bot', content: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span className="font-bold text-sm uppercase tracking-widest">Market AI</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  <p className="text-sm">Ask me about any product trend in India.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn("p-2 rounded-lg", m.role === 'user' ? "bg-blue-600" : "bg-slate-800")}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn("p-3 rounded-2xl max-w-[80%] text-sm", m.role === 'user' ? "bg-blue-600/20 text-blue-100" : "bg-slate-800 text-slate-300")}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 size={20} className="animate-spin text-blue-500 mx-auto" />}
            </div>

            <div className="p-4 border-t border-slate-800 flex gap-2">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask intelligence..."
                className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white"
              />
              <button onClick={handleSend} className="p-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                <Send size={18} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
      >
        <Sparkles size={24} />
      </button>
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeView, setActiveView] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisTopic, setAnalysisTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initial Discovery Scan with Caching
  const performInitialDiscovery = useCallback(async (isRefresh = false) => {
    setIsInitialLoading(true);
    try {
      // Check if trends were discovered in the last 24 hours to save API quota
      if (!isRefresh) {
        const cached = localStorage.getItem('radar_discovery_cache');
        const expiry = localStorage.getItem('radar_discovery_expiry');
        
        if (cached && expiry && Date.now() < parseInt(expiry)) {
          const cachedTrends = JSON.parse(cached);
          setTrends(cachedTrends);
          setSelectedTrend(cachedTrends[0]);
          setIsInitialLoading(false);
          return;
        }
      }

      // Call Gemini for real-time discovery
      const discoveryPrompt = "Scan the Indian D2C and wellness market for 2026. Identify 4 emerging trends with high growth potential.";
      const result = await analyzeTrendWithGemini(discoveryPrompt);
      
      // Merge AI result with existing sample data to fill the UI
      const combinedTrends = [result, ...SAMPLE_TRENDS];
      setTrends(combinedTrends);
      setSelectedTrend(combinedTrends[0]);
      
      // Save to cache (24-hour expiry)
      localStorage.setItem('radar_discovery_cache', JSON.stringify(combinedTrends));
      localStorage.setItem('radar_discovery_expiry', (Date.now() + 86400000).toString());
    } catch (err) {
      console.error("Discovery failed:", err);
      setTrends(SAMPLE_TRENDS); 
      setSelectedTrend(SAMPLE_TRENDS[0]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    performInitialDiscovery();
  }, [performInitialDiscovery]);

  const handleManualAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisTopic.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeTrendWithGemini(analysisTopic);
      setTrends(prev => [result, ...prev]);
      setSelectedTrend(result);
      setIsModalOpen(false);
      setAnalysisTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTrends = trends.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="shrink-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-lg">Radar<span className="text-blue-600">.ai</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => performInitialDiscovery(true)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
          >
            <RefreshCw size={14} className={isInitialLoading ? "animate-spin" : ""} />
            Scan Market
          </button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search trends..."
              className="bg-slate-800 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-64 outline-none"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} /> New Analysis
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={cn("bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col p-4", isSidebarOpen ? "w-64" : "w-20")}>
          <div className="space-y-1 flex-1">
            <SidebarItem icon={LayoutDashboard} label="Overview" active={activeView === 'Overview'} onClick={() => setActiveView('Overview')} collapsed={!isSidebarOpen} />
            <SidebarItem icon={Compass} label="Discovery" active={activeView === 'Discovery'} onClick={() => setActiveView('Discovery')} collapsed={!isSidebarOpen} />
            <SidebarItem icon={Activity} label="Live Signals" active={activeView === 'Live Signals'} onClick={() => setActiveView('Live Signals')} collapsed={!isSidebarOpen} />
          </div>
          <SidebarItem icon={Settings} label="Settings" collapsed={!isSidebarOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          <AnimatePresence mode="wait">
            {isInitialLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[70vh] flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <Loader2 size={64} className="text-blue-600 animate-spin" />
                  <Sparkles className="absolute -top-4 -right-4 text-blue-400 animate-pulse" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Scanning Market Data</h2>
                  <p className="text-slate-500">Extracting 2026 insights from social signals & market shifts...</p>
                </div>
              </motion.div>
            ) : activeView === 'Overview' ? (
              <div key="overview" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto">
                {/* List Column */}
                <div className="lg:col-span-5 space-y-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Market Signals</h2>
                  {filteredTrends.map(t => (
                    <motion.div 
                      key={t.id}
                      onClick={() => setSelectedTrend(t)}
                      layoutId={`trend-${t.id}`}
                      className={cn(
                        "p-4 rounded-2xl border cursor-pointer transition-all",
                        selectedTrend?.id === t.id ? "bg-blue-600/10 border-blue-500 shadow-xl" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{t.name}</h3>
                        <span className="text-emerald-400 text-xs font-bold">+{t.scores.velocity}%</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Detail Column */}
                <div className="lg:col-span-7">
                  {selectedTrend ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                      <div className="p-8 bg-gradient-to-br from-blue-600/20 to-transparent border-b border-slate-800">
                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                          {selectedTrend.category}
                        </span>
                        <h2 className="text-4xl font-bold mb-4">{selectedTrend.name}</h2>
                        <div className="bg-blue-600/5 p-6 rounded-2xl border border-blue-500/10">
                          <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-3 uppercase tracking-widest text-[10px]">
                            <Sparkles size={14} /> Opportunity Brief
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{selectedTrend.opportunityBrief}</p>
                        </div>
                      </div>

                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MetricCard label="Potential" value={`₹${selectedTrend.scores.marketPotential}Cr`} sub="Market Cap" />
                          <MetricCard label="Velocity" value={`${selectedTrend.scores.velocity}%`} sub="Growth" />
                          <MetricCard label="Time" value={`${selectedTrend.scores.timeToMainstream}mo`} sub="Peak Target" />
                          <MetricCard label="Score" value={selectedTrend.scores.overallScore} sub="Rating" />
                        </div>

                        <div className="h-64 bg-slate-950 rounded-2xl p-4 border border-slate-800">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedTrend.historicalInterest}>
                              <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                              <XAxis dataKey="date" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#chartGrad)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Signals</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedTrend.signals.map((s, i) => (
                              <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-blue-400">{s.source}</span>
                                  <span className="text-[10px] text-emerald-400">+{s.change}%</span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2">{s.context}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800">
                      <Compass size={48} className="mb-4 opacity-20" />
                      <p>Select a signal to begin analysis.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">New Intelligence Scan</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleManualAnalyze} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Trend Topic</label>
                  <input 
                    value={analysisTopic}
                    onChange={e => setAnalysisTopic(e.target.value)}
                    placeholder="e.g. Sea Moss Gummies"
                    className="w-full bg-slate-800 border-none rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  disabled={isAnalyzing}
                  className="w-full bg-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Execute Analysis
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
}
