import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Leaf, 
  Network, 
  Beaker, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { DashboardStatsResponse } from '../types';

interface DashboardPageProps {
  stats: DashboardStatsResponse | null;
  isLoading: boolean;
  setActiveTab: (tab: string) => void;
}

const TIER_COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#38bdf8', '#10b981', '#06b6d4'];
const TRAD_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats, isLoading, setActiveTab }) => {
  if (isLoading || !stats) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Aggregating live knowledge base statistics...</p>
      </div>
    );
  }

  // Format chart data
  const evidenceData = Object.entries(stats.evidence_distribution || {}).map(([key, value]) => ({
    name: key.replace(" Experimental", "").replace(" Report", "").replace(" Model", ""),
    fullName: key,
    count: value
  }));

  const confidenceData = Object.entries(stats.confidence_distribution || {}).map(([range, count]) => ({
    range,
    count
  }));

  const traditionData = Object.entries(stats.traditions_distribution || {}).map(([trad, count]) => ({
    name: trad,
    value: count
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono">Research Discovery Dashboard</h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
              Live SQLite Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time quantitative metrics calculated directly from database records and extraction tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('extraction')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Mine Literature</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <span>View Graph</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Plants</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.total_plants}</div>
          <span className="text-[10px] text-slate-500 block">Accepted Taxa</span>
        </div>

        <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Relationships</span>
            <Network className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{stats.total_relationships}</div>
          <span className="text-[10px] text-slate-500 block">S-P-O Triples</span>
        </div>

        <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Compounds</span>
            <Beaker className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{stats.total_compounds}</div>
          <span className="text-[10px] text-slate-500 block">Bioactive Molecules</span>
        </div>

        <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Publications</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{stats.indexed_publications}</div>
          <span className="text-[10px] text-slate-500 block">PMC / BHL Papers</span>
        </div>

        <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.verified_relationships}</div>
          <span className="text-[10px] text-slate-500 block">Curator Approved</span>
        </div>

        <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.pending_verifications}</div>
          <span className="text-[10px] text-slate-500 block">In Curator Queue</span>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Evidence Category Distribution */}
        <div className="bg-[#070c19] border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Evidence Category Stratification</h3>
              <p className="text-[11px] text-slate-400">Claims classified into 6 scientific evidence tiers</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              ConSEFS Aligned
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  angle={-20} 
                  textAnchor="end" 
                  interval={0} 
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b132b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {evidenceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Extraction Confidence & Tradition Breakdown */}
        <div className="bg-[#070c19] border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Confidence Distribution</h3>
              <p className="text-[11px] text-slate-400">Mean Confidence: {(stats.avg_extraction_confidence * 100).toFixed(1)}%</p>
            </div>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              Calibrated NLP
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b132b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recently Processed Documents Table */}
      <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">Indexed Literature Corpus</h3>
            <p className="text-[11px] text-slate-400">Peer-reviewed publications, historical treatises, and ethnobotanical surveys</p>
          </div>
          <button
            onClick={() => setActiveTab('extraction')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Mine Document</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Title & Authors</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Journal / Source</th>
                <th className="py-2.5 px-3">Relations</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.recent_documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-white max-w-md truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-400">{doc.authors || 'Unknown authors'}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{doc.year || 'n.d.'}</td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate italic">{doc.journal || 'Indexed Archive'}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-emerald-400 font-bold">{doc.relationships_count}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Indexed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
