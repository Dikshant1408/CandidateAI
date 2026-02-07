
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  BarChart3, 
  Search, 
  Share2, 
  Zap, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings as SettingsIcon,
  Target,
  ShieldAlert,
  Leaf,
  Users2,
  Award,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  LayoutDashboard,
  Moon,
  Sun,
  Database,
  Globe,
  Plus,
  X,
  Scale,
  Save,
  Trash2,
  Maximize2,
  Minimize2,
  Grid
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  AreaChart,
  Area
} from 'recharts';
import { generateCandidates, generateMockEvaluations } from './mockData';
import { Candidate, Evaluation } from './types';
import { evaluateCandidateWithAI } from './services/geminiService';

type Page = 'dashboard' | 'candidates' | 'rankings' | 'settings' | 'comparison';

const ROLES = [
  'All Roles',
  'Senior Software Engineer', 'Product Manager', 'UX Designer', 
  'Operations Director', 'Sustainability Lead', 'HR Business Partner',
  'Marketing Strategy Head', 'Data Scientist', 'CTO', 'Project Manager'
];

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [candidates] = useState<Candidate[]>(generateCandidates());
  const [evaluations, setEvaluations] = useState<Evaluation[]>(generateMockEvaluations(candidates));
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(candidates[0].id);
  const [isEvaluating, setIsEvaluating] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompact, setIsCompact] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    darkMode: false,
    autoEval: false,
    model: 'gemini-3-flash-preview',
    notifications: true
  });

  const rankings = useMemo(() => {
    return evaluations
      .map(e => ({
        candidateId: e.candidateId,
        totalScore: (e.crisisManagementScore + e.sustainabilityScore + e.teamMotivationScore) / 3,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [evaluations]);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
  const selectedEvaluation = evaluations.find(e => e.candidateId === selectedCandidateId);
  const selectedRanking = rankings.find(r => r.candidateId === selectedCandidateId);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || c.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [candidates, searchQuery, roleFilter]);

  // Auto-Evaluation Logic
  useEffect(() => {
    if (settings.autoEval && selectedCandidateId && !evaluations.some(e => e.candidateId === selectedCandidateId)) {
      runAIEvaluation(selectedCandidateId);
    }
  }, [selectedCandidateId, settings.autoEval]);

  const runAIEvaluation = async (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || isEvaluating === candidateId) return;

    setIsEvaluating(candidateId);
    const newEval = await evaluateCandidateWithAI(candidate);
    
    setEvaluations(prev => {
      const index = prev.findIndex(e => e.candidateId === candidateId);
      if (index > -1) {
        const next = [...prev];
        next[index] = newEval;
        return next;
      }
      return [...prev, newEval];
    });
    setIsEvaluating(null);
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const shareCandidate = (candidate: Candidate) => {
    alert(`Share Link Generated for ${candidate.name}.\nTracking ID: AI-${Math.floor(Math.random() * 100000)}`);
  };

  const ScoreBar = ({ label, score, icon: Icon, color }: { label: string, score: number, icon: any, color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          {label}
        </div>
        <span className="text-slate-700 dark:text-slate-300">{Math.round(score)}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out rounded-full ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  const radarData = selectedEvaluation ? [
    { subject: 'Crisis', A: selectedEvaluation.crisisManagementScore, fullMark: 100 },
    { subject: 'Sustainability', A: selectedEvaluation.sustainabilityScore, fullMark: 100 },
    { subject: 'Team', A: selectedEvaluation.teamMotivationScore, fullMark: 100 },
    { subject: 'Exp', A: Math.min(100, (selectedCandidate?.experienceYears || 0) * 7), fullMark: 100 },
    { subject: 'Skills', A: Math.min(100, (selectedCandidate?.skills.length || 0) * 18), fullMark: 100 },
  ] : [];

  // --- Views ---

  const DashboardView = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Candidates" value={candidates.length} icon={Users} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
          <StatCard 
            title="Avg. Talent Score" 
            value={(rankings.reduce((acc, curr) => acc + curr.totalScore, 0) / (rankings.length || 1)).toFixed(1)} 
            icon={TrendingUp} 
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
          />
          <StatCard title="AI Evaluations" value={evaluations.length} icon={BrainCircuit} color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Trophy className="w-4 h-4 text-amber-500" /> Top Performers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[9px] font-bold tracking-widest">
                  <tr>
                    <th className="px-5 py-2.5">Rank</th>
                    <th className="px-5 py-2.5">Candidate</th>
                    <th className="px-5 py-2.5 text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {rankings.slice(0, 5).map((r) => {
                    const c = candidates.find(cand => cand.id === r.candidateId)!;
                    return (
                      <tr 
                        key={r.candidateId} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${selectedCandidateId === c.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                        onClick={() => setSelectedCandidateId(c.id)}
                      >
                        <td className="px-5 py-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-lg font-bold text-[10px] ${
                            r.rank === 1 ? 'bg-amber-100 text-amber-600' : 
                            r.rank === 2 ? 'bg-slate-100 text-slate-600' : 
                            r.rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                          }`}>
                            {r.rank}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full shadow-sm" />
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate max-w-[120px]">{c.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{r.totalScore.toFixed(0)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-4">
              <Grid className="w-4 h-4 text-indigo-500" /> Skill Intensity Heatmap
            </h3>
            <div className="space-y-3">
              {rankings.slice(0, 4).map((r) => {
                const c = candidates.find(cand => cand.id === r.candidateId)!;
                const e = evaluations.find(ev => ev.candidateId === r.candidateId);
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-20 text-[9px] font-bold text-slate-400 truncate uppercase tracking-tighter">{c.name.split(' ')[0]}</div>
                    <div className="flex-1 grid grid-cols-3 gap-1">
                      <HeatmapCell value={e?.crisisManagementScore || 0} />
                      <HeatmapCell value={e?.sustainabilityScore || 0} />
                      <HeatmapCell value={e?.teamMotivationScore || 0} />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-20"></div>
                <div className="flex-1 grid grid-cols-3 gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  <span>CRS</span>
                  <span>SUS</span>
                  <span>MOT</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Market Yield Index</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Neural Projection</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', value: 12 }, { month: 'Feb', value: 18 }, { month: 'Mar', value: 34 }, 
                { month: 'Apr', value: 28 }, { month: 'May', value: 45 }, { month: 'Jun', value: 60 }
              ]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="xl:col-span-4">
        <ProfilePanel />
      </div>
    </div>
  );

  const CandidatesView = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            {compareIds.length > 0 && (
              <button 
                onClick={() => setActivePage('comparison')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <Scale className="w-3.5 h-3.5" /> Compare ({compareIds.length})
              </button>
            )}
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{filteredCandidates.length} Candidates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredCandidates.map(candidate => {
            const isComparing = compareIds.includes(candidate.id);
            return (
              <div 
                key={candidate.id} 
                onClick={() => setSelectedCandidateId(candidate.id)}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 transition-all cursor-pointer hover:shadow-xl ${
                  selectedCandidateId === candidate.id ? 'border-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleCompare(candidate.id); }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isComparing 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 hover:border-indigo-600 hover:text-indigo-600'
                    }`}
                  >
                    {isComparing ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <img src={candidate.avatar} className="w-12 h-12 rounded-xl shadow-inner object-cover" alt={candidate.name} />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight text-sm">{candidate.name}</h4>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-tighter">{candidate.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4 h-10 overflow-hidden content-start">
                  {candidate.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{candidate.experienceYears}Y Experience</span>
                  <div className="flex gap-2">
                    {evaluations.some(e => e.candidateId === candidate.id) && (
                      <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="xl:col-span-4">
        <ProfilePanel />
      </div>
    </div>
  );

  const RankingsView = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Talent Analytics Index</h3>
            <p className="text-sm text-slate-500 font-medium">Global cross-metric rankings powered by Gemini AI</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-4">Rank</th>
                  <th className="px-8 py-4">Candidate</th>
                  <th className="px-8 py-4">Crisis</th>
                  <th className="px-8 py-4">Green</th>
                  <th className="px-8 py-4">Motivation</th>
                  <th className="px-8 py-4 text-center">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {rankings.map((r) => {
                  const c = candidates.find(cand => cand.id === r.candidateId)!;
                  const e = evaluations.find(ev => ev.candidateId === r.candidateId);
                  return (
                    <tr 
                      key={r.candidateId} 
                      onClick={() => setSelectedCandidateId(c.id)}
                      className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer ${selectedCandidateId === c.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-400">#{r.rank}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img src={c.avatar} className="w-9 h-9 rounded-lg shadow-sm" alt={c.name} />
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5"><ScoreBadge score={e?.crisisManagementScore || 0} /></td>
                      <td className="px-8 py-5"><ScoreBadge score={e?.sustainabilityScore || 0} /></td>
                      <td className="px-8 py-5"><ScoreBadge score={e?.teamMotivationScore || 0} /></td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{r.totalScore.toFixed(0)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div className="xl:col-span-4 space-y-6">
        <AnalyticsMetric label="Pool Quality" value="High" change="+2.4% MoM" icon={TrendingUp} color="text-emerald-500" />
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" /> Retention Risk
          </h4>
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-rose-500 w-[15%]"></div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">Only 15% of high-scoring candidates are flagged as high retention risks. Competitive offers recommended for top 5%.</p>
        </section>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl">
              {settings.darkMode ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-slate-600" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Visual Theme</h3>
              <p className="text-sm text-slate-400 font-medium">Interface personalization</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Dark Mode Interface</span>
              <button 
                onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Desktop Notifications</span>
              <button 
                onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl"><Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Gemini AI Model</h3>
              <p className="text-sm text-slate-400 font-medium">Evaluation engine configuration</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Inference Model</label>
              <select 
                value={settings.model}
                onChange={(e) => setSettings(s => ({ ...s, model: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Real-time)</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro (Deep Analysis)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Legacy)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Auto-Evaluate Selection</span>
                <span className="text-[10px] text-slate-400 font-medium italic">Triggers AI when profile is viewed</span>
              </div>
              <button 
                onClick={() => setSettings(s => ({ ...s, autoEval: !s.autoEval }))}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.autoEval ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${settings.autoEval ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden md:col-span-2">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-xl"><Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">System Management</h3>
                <p className="text-sm text-slate-400 font-medium">Compliance and data purging</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Domains</h4>
              <div className="space-y-2">
                {['internal.hr-portal.com', 'secure.talentai.io'].map(domain => (
                  <div key={domain} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{domain}</span>
                    <button className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Domain</button>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Retention Protocol</h4>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl">
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                  Current policy: <strong>GDPR-24</strong>. Records of inactive candidates will be automatically purged after 24 months of zero interaction. Audit log maintained for 5 years.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const ComparisonView = () => {
    const selectedCandidates = candidates.filter(c => compareIds.includes(c.id));
    
    if (selectedCandidates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
          <Scale className="w-12 h-12" />
          <p className="text-sm font-medium">No candidates selected for comparison.</p>
          <button onClick={() => setActivePage('candidates')} className="text-indigo-600 text-xs font-bold underline">Navigate to Talent Pool</button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-6">
            <button onClick={() => setActivePage('candidates')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">
              <X className="w-4 h-4" /> Exit Comparison
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Comparison Matrix</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsCompact(!isCompact)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isCompact 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              {isCompact ? 'Show Details' : 'Compact View'}
            </button>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800 hidden sm:block">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Comparing: {selectedCandidates.length}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Container with improved UI */}
        <div className="relative group">
          <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar md:scrollbar">
            <div className="flex gap-6 min-w-max pb-4">
              {selectedCandidates.map(candidate => {
                const evalData = evaluations.find(e => e.candidateId === candidate.id);
                const rank = rankings.find(r => r.candidateId === candidate.id);
                
                return (
                  <div key={candidate.id} className={`flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all duration-300 ${isCompact ? 'w-64' : 'w-80 md:w-96'}`}>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col items-center text-center bg-slate-50/30 dark:bg-slate-900/10">
                      <div className="relative mb-4">
                        <img src={candidate.avatar} className={`rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-700 transition-all ${isCompact ? 'w-16 h-16' : 'w-24 h-24'}`} alt={candidate.name} />
                        <div className="absolute -top-1 -right-1 bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold shadow-xl">
                          #{rank?.rank}
                        </div>
                      </div>
                      <h3 className={`font-bold text-slate-800 dark:text-slate-100 mb-0.5 leading-tight ${isCompact ? 'text-base' : 'text-xl'}`}>{candidate.name}</h3>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">{candidate.role}</p>
                    </div>

                    <div className={`p-6 space-y-6 flex-1 transition-all ${isCompact ? 'space-y-4' : 'space-y-8'}`}>
                      <div>
                        <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-50 dark:border-slate-700 pb-1">Performance Index</h4>
                        {evalData ? (
                          <div className="space-y-4">
                            <ScoreBar label="Crisis" score={evalData.crisisManagementScore} icon={ShieldAlert} color="text-rose-500" />
                            <ScoreBar label="Green" score={evalData.sustainabilityScore} icon={Leaf} color="text-emerald-500" />
                            <ScoreBar label="Motivation" score={evalData.teamMotivationScore} icon={Users2} color="text-indigo-500" />
                            <div className="pt-3 flex items-center justify-between border-t border-slate-50 dark:border-slate-700">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Neural Average</span>
                              <span className={`font-black text-indigo-600 dark:text-indigo-400 tracking-tighter ${isCompact ? 'text-lg' : 'text-2xl'}`}>{rank?.totalScore.toFixed(0)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 bg-slate-50 dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
                            <Zap className="w-5 h-5 text-slate-300 animate-pulse mb-2" />
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Awaiting Neural Evaluation</p>
                          </div>
                        )}
                      </div>

                      {!isCompact && (
                        <>
                          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-50 dark:border-slate-700 pb-1">Primary Skillsets</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.slice(0, 6).map(s => (
                                <span key={s} className="px-2 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                            <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-50 dark:border-slate-700 pb-1">Signature Impact</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                              "{candidate.achievements[0]}"
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={() => toggleCompare(candidate.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Subtle scroll indicator for mobile */}
          <div className="md:hidden flex justify-center mt-2">
            <div className="flex gap-1.5">
              {selectedCandidates.map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfilePanel = () => {
    if (!selectedCandidate) return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 h-full flex flex-col justify-center items-center">
        <Users className="w-12 h-12 mb-4 opacity-10" />
        <p className="text-sm font-bold uppercase tracking-widest">Select a candidate profile</p>
      </div>
    );
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden transition-all sticky top-8">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="relative group">
              <img src={selectedCandidate.avatar} className="w-16 h-16 rounded-xl object-cover shadow-lg ring-4 ring-white dark:ring-slate-700 group-hover:scale-105 transition-transform" alt={selectedCandidate.name} />
              <div className="absolute -top-1.5 -left-1.5 bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold shadow-lg">
                {selectedRanking?.rank || '-'}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleCompare(selectedCandidate.id)}
                className={`p-2 rounded-lg transition-all ${
                  compareIds.includes(selectedCandidate.id) 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-300'
                }`}
                title="Add to Comparison"
              >
                <Scale className="w-4 h-4" />
              </button>
              <button onClick={() => shareCandidate(selectedCandidate)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{selectedCandidate.name}</h3>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3">{selectedCandidate.role}</p>
          <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {selectedCandidate.experienceYears}Y Exp</span>
            <span className="flex items-center gap-1"><Users2 className="w-3 h-3" /> High Yield</span>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px]">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vector Benchmarks</h4>
            {selectedEvaluation ? (
              <div className="space-y-4">
                <ScoreBar label="Crisis Mitigation" score={selectedEvaluation.crisisManagementScore} icon={ShieldAlert} color="text-rose-500" />
                <ScoreBar label="Sustainability" score={selectedEvaluation.sustainabilityScore} icon={Leaf} color="text-emerald-500" />
                <ScoreBar label="Motivation" score={selectedEvaluation.teamMotivationScore} icon={Users2} color="text-indigo-500" />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic font-medium">Neural evaluation vectors pending...</p>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Talent DNA Mapping</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="4 4" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 700}} />
                  <Radar name={selectedCandidate.name} dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-amber-300" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider">Neural Insights</h4>
            </div>
            <p className="text-xs text-indigo-50 italic leading-relaxed font-medium">
              "{selectedEvaluation?.summary || 'Processing profile through Gemini 3 Neural Suite...'}"
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50/80 dark:bg-slate-900/40">
          <button 
            onClick={() => runAIEvaluation(selectedCandidate.id)}
            disabled={isEvaluating === selectedCandidate.id}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
              isEvaluating === selectedCandidate.id 
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none'
            }`}
          >
            {isEvaluating === selectedCandidate.id ? <><BrainCircuit className="w-4 h-4 animate-pulse" /> Evaluating...</> : <><BrainCircuit className="w-4 h-4" /> Trigger Neural Evaluation</>}
          </button>
        </div>
      </div>
    );
  };

  // --- Helpers ---

  const NavItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: Page }) => (
    <button 
      onClick={() => setActivePage(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm w-full ${
        activePage === id 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: any, icon: any, color: string }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <div className={`${color} p-2.5 rounded-xl`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  const ScoreBadge = ({ score }: { score: number }) => (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-tighter ${
      score >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
      score >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    }`}>
      {Math.round(score)}%
    </span>
  );

  const AnalyticsMetric = ({ label, value, change, icon: Icon, color }: { label: string, value: string, change: string, icon: any, color: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <span className={`text-[10px] font-black ${color}`}>{change}</span>
      </div>
      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  const HeatmapCell = ({ value }: { value: number }) => {
    const opacity = (value - 50) / 50; // Map 50-100 to 0-1
    return (
      <div 
        className="h-4 rounded shadow-inner transition-colors duration-500" 
        style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
        title={`${value.toFixed(0)}%`}
      />
    );
  };

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen ${settings.darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-hidden h-screen transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">CandidateAI</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem id="candidates" icon={Users} label="Talent Pool" />
          <NavItem id="rankings" icon={Trophy} label="Rankings" />
          <NavItem id="comparison" icon={Scale} label="Comparison" />
          <NavItem id="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="mt-auto bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-widest">Global Neural Feed</p>
          <p className="text-xs font-bold text-slate-200">Active Q4 Campaign</p>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full w-3/4 transition-all duration-1000"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden dark:bg-slate-900">
        <header className="flex flex-col md:flex-row md:items-center justify-between p-6 lg:p-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize tracking-tight">{activePage.replace('-', ' ')}</h2>
            <p className="text-xs text-slate-500 font-medium">Augmented Intelligence Suite</p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
              <input 
                type="text" 
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all w-full md:w-64 text-sm dark:text-slate-200"
              />
            </div>
            {compareIds.length > 0 && activePage !== 'comparison' && (
              <button 
                onClick={() => setActivePage('comparison')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <Scale className="w-4 h-4" /> Compare
              </button>
            )}
            <button 
              onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-500 transition-all"
            >
              {settings.darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {activePage === 'dashboard' && <DashboardView />}
            {activePage === 'candidates' && <CandidatesView />}
            {activePage === 'rankings' && <RankingsView />}
            {activePage === 'settings' && <SettingsView />}
            {activePage === 'comparison' && <ComparisonView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
