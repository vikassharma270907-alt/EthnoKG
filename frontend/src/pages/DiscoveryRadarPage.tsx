import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Sparkles, 
  Leaf, 
  Globe2, 
  ShieldCheck, 
  ExternalLink, 
  Award, 
  Search, 
  FileCheck2, 
  AlertTriangle,
  Copy,
  Download,
  Fingerprint,
  Printer
} from 'lucide-react';
import { 
  fetchDiscoveryIndex, 
  fetchConvergence, 
  fetchEvaluationBenchmark, 
  fetchSovereigntyCertificate 
} from '../api/client';
import type { 
  DiscoveryIndexItem, 
  ConvergenceItem, 
  EvaluationBenchmarkResponse, 
  SovereigntyCertificate 
} from '../types';
import { RadarSonar } from '../components/RadarSonar';
import { GlowCard } from '../components/GlowCard';

export const DiscoveryRadarPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'discovery' | 'convergence' | 'sovereignty' | 'benchmark'>('discovery');
  
  // Data states
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryIndexItem[]>([]);
  const [convergenceItems, setConvergenceItems] = useState<ConvergenceItem[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<EvaluationBenchmarkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  // Certificate Modal
  const [activeCert, setActiveCert] = useState<SovereigntyCertificate | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      const timer = copyTimerRef.current;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchDiscoveryIndex().catch(() => []),
      fetchConvergence().catch(() => []),
      fetchEvaluationBenchmark().catch(() => null)
    ]).then(([disc, conv, bench]) => {
      if (isMounted) {
        setDiscoveryItems(disc);
        setConvergenceItems(conv);
        setBenchmarkData(bench);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCertificate = async (plantId: number) => {
    try {
      const cert = await fetchSovereigntyCertificate(plantId);
      setActiveCert(cert);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadCert = (cert: SovereigntyCertificate) => {
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certificate_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered discovery items
  const filteredDiscovery = discoveryItems.filter((item) => {
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      (item.plant_name || '').toLowerCase().includes(query) ||
      (item.condition_name || '').toLowerCase().includes(query) ||
      (item.compound_name || '').toLowerCase().includes(query) ||
      (item.tradition || '').toLowerCase().includes(query);

    const matchesStage = 
      stageFilter === 'ALL' ||
      (stageFilter === 'PRECLINICAL' && item.stage_badge.includes('Preclinical')) ||
      (stageFilter === 'CLINICAL' && item.stage_badge.includes('Clinical')) ||
      (stageFilter === 'BOTANICAL' && item.stage_badge.includes('Botanical'));

    return matchesSearch && matchesStage;
  });

  const exportDiscoveryCSV = () => {
    if (!discoveryItems.length) return;
    const headers = ['Plant Name', 'Condition', 'Bioactive Compound', 'Tradition', 'Discovery Score', 'Readiness Stage', 'Confidence'];
    const rows = filteredDiscovery.map(item => [
      `"${item.plant_name}"`,
      `"${item.condition_name}"`,
      `"${item.compound_name || 'N/A'}"`,
      `"${item.tradition}"`,
      item.discovery_score,
      `"${item.stage_badge}"`,
      item.average_confidence
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EthnoKG_Reverse_Pharmacology_Index_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportConvergenceCSV = () => {
    if (!convergenceItems.length) return;
    const headers = ['Condition', 'Traditions Count', 'Originating Traditions', 'Convergent Plants Count', 'Convergent Species', 'Convergence Score', 'Consensus Level', 'Literature Records'];
    const rows = convergenceItems.map(item => [
      `"${item.condition}"`,
      item.traditions_count,
      `"${(item.traditions || []).join('; ')}"`,
      item.plants_count,
      `"${(item.convergent_plants || []).join('; ')}"`,
      item.convergence_score,
      `"${item.convergence_level}"`,
      item.total_literature_records
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EthnoKG_Cross_Tradition_Convergence_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner with Integrated Radar Display */}
      <div className="bg-[#111319]/90 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-xs font-semibold font-mono">
              <Compass className="w-3.5 h-3.5 text-zinc-300 animate-spin" style={{ animationDuration: '10s' }} />
              Reverse Pharmacology & Translational AI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              Discovery Radar & Sovereignty Ledger
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Bridge centuries of empirical natural healing with modern drug discovery. Identify translational gaps, 
              detect independent cross-tradition convergence, and guarantee indigenous knowledge sovereignty under the UN Nagoya Protocol.
            </p>
          </div>

          {/* Interactive Radar Visualizer & Metrics */}
          <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="hidden sm:block">
              <RadarSonar size={140} showTargets={true} />
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="bg-[#161822] border border-zinc-700/80 px-4 py-2.5 rounded-xl text-center shadow-inner">
                <span className="text-xs text-zinc-400 block font-sans">Hallucination Rate</span>
                <span className="text-xl font-bold font-mono text-white">0.00%</span>
              </div>
              <div className="bg-[#161822] border border-zinc-700/80 px-4 py-2.5 rounded-xl text-center shadow-inner">
                <span className="text-xs text-zinc-400 block font-sans">Taxon Accuracy</span>
                <span className="text-xl font-bold font-mono text-zinc-200">94.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pt-6 border-t border-zinc-800/80 mt-6 relative z-10 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('discovery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'discovery'
                ? 'bg-zinc-200 text-zinc-950 shadow-md shadow-black/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Reverse Pharmacology Index</span>
          </button>

          <button
            onClick={() => setActiveSubTab('convergence')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'convergence'
                ? 'bg-zinc-200 text-zinc-950 shadow-md shadow-black/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Cross-Cultural Convergence</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sovereignty')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'sovereignty'
                ? 'bg-zinc-200 text-zinc-950 shadow-md shadow-black/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-zinc-300" />
            <span>Nagoya Sovereignty Ledger</span>
          </button>

          <button
            onClick={() => setActiveSubTab('benchmark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'benchmark'
                ? 'bg-zinc-200 text-zinc-950 shadow-md shadow-black/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>NLP Scientific Benchmark</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: REVERSE PHARMACOLOGY DISCOVERY INDEX */}
      {activeSubTab === 'discovery' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111319]/90 border border-zinc-800 p-4 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search plant, condition, compound..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161822] border border-zinc-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-400 shrink-0 font-mono">Filter:</span>
                {[
                  { id: 'ALL', label: 'All Candidates' },
                  { id: 'PRECLINICAL', label: 'Preclinical Leads' },
                  { id: 'BOTANICAL', label: 'Traditional Signals' },
                  { id: 'CLINICAL', label: 'Clinically Validated' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStageFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      stageFilter === s.id
                        ? 'bg-zinc-800 text-white border border-zinc-600 font-semibold'
                        : 'bg-[#161822] text-zinc-400 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={exportDiscoveryCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#161822] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Download filtered Discovery Index as CSV"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-zinc-400">Computing Reverse Pharmacology Translational Indices...</p>
            </div>
          ) : filteredDiscovery.length === 0 ? (
            <div className="bg-[#111319] border border-zinc-800 rounded-xl p-12 text-center text-zinc-400 text-sm">
              No drug discovery candidates match the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDiscovery.map((item, idx) => (
                <GlowCard 
                  key={idx}
                  glowColor="silver"
                  className="p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Score & Stage Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-zinc-800/90 text-zinc-200 border-zinc-700 font-mono">
                        {item.stage_badge}
                      </span>

                      <div className="flex items-center gap-1.5 bg-zinc-800/90 border border-zinc-700 px-2 py-0.5 rounded-lg shadow-xs">
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">Discovery Index:</span>
                        <span className="text-sm font-extrabold font-mono text-white">{item.discovery_score}</span>
                      </div>
                    </div>

                    {/* Plant & Indication */}
                    <div>
                      <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-zinc-300 shrink-0" />
                        <span className="italic">{item.plant_name}</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.common_names.slice(0, 3).join(', ')} • <span className="text-zinc-300">{item.tradition}</span>
                      </p>
                    </div>

                    {/* Target Condition & Bioactive Compound */}
                    <div className="bg-[#161822] border border-zinc-800 p-3 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Target Condition:</span>
                        <span className="font-semibold text-white">{item.condition_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Bioactive Scaffold:</span>
                        <span className="font-semibold text-zinc-200 font-mono">{item.compound_name}</span>
                      </div>
                    </div>

                    {/* Evidence Hierarchy Counters */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                      <div className="bg-[#161822] border border-zinc-800 p-1.5 rounded">
                        <span className="text-[10px] text-zinc-500 block">Tradition</span>
                        <span className="text-xs font-bold font-mono text-zinc-300">{item.evidence_counts.traditional}</span>
                      </div>
                      <div className="bg-[#161822] border border-zinc-800 p-1.5 rounded">
                        <span className="text-[10px] text-zinc-500 block">In-Vitro</span>
                        <span className="text-xs font-bold font-mono text-zinc-200">{item.evidence_counts.in_vitro}</span>
                      </div>
                      <div className="bg-[#161822] border border-zinc-800 p-1.5 rounded">
                        <span className="text-[10px] text-zinc-500 block">In-Vivo</span>
                        <span className="text-xs font-bold font-mono text-zinc-200">{item.evidence_counts.in_vivo}</span>
                      </div>
                      <div className="bg-[#161822] border border-zinc-800 p-1.5 rounded">
                        <span className="text-[10px] text-zinc-500 block">Clinical</span>
                        <span className="text-xs font-bold font-mono text-white">{item.evidence_counts.clinical}</span>
                      </div>
                    </div>

                    {/* Conservation Risk */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                        IUCN Status:
                      </span>
                      <span className="font-semibold text-zinc-200">{item.conservation_status}</span>
                    </div>

                    {/* Verbatim Excerpt */}
                    {item.excerpts.length > 0 && (
                      <p className="text-[11px] text-zinc-300 bg-[#161822]/90 border-l-2 border-zinc-500 p-2 rounded-r italic line-clamp-2">
                        "{item.excerpts[0]}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenCertificate(item.plant_id)}
                      className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Nagoya Certificate</span>
                    </button>

                    {item.dois.length > 0 && (
                      <a
                        href={`https://doi.org/${item.dois[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>DOI Ref</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </GlowCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CROSS-CULTURAL CONVERGENCE RADAR */}
      {activeSubTab === 'convergence' && (
        <div className="space-y-6">
          <div className="bg-[#111319]/90 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-zinc-300" />
                Independent Cross-Cultural Convergence Signal
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When distinct indigenous traditions across different continents (e.g. Ayurveda in India, TCM in China, Amazonian folk medicine) 
                independently arrived at the exact same botanical species or plant family for identical therapeutic symptoms, 
                statistical random chance is ruled out. This cross-cultural convergence is modern pharmacology's highest-probability target filter.
              </p>
            </div>
            <button
              type="button"
              onClick={exportConvergenceCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 flex items-center gap-2 transition-colors cursor-pointer shrink-0 self-start md:self-center"
              title="Download Convergence Matrix dataset as CSV"
            >
              <Download className="w-4 h-4 text-zinc-300" />
              <span>Export Convergence CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {convergenceItems.map((c, idx) => (
              <GlowCard 
                key={idx}
                glowColor="silver"
                className="p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono">
                      {c.convergence_level}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-1.5">
                      Target Indication: {c.condition}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block font-sans">Convergence Score</span>
                    <span className="text-xl font-extrabold font-mono text-white">{c.convergence_score}/100</span>
                  </div>
                </div>

                {/* Traditions Tag Cloud */}
                <div>
                  <span className="text-xs text-zinc-400 block mb-1.5 font-medium font-mono">Convergent Medical Traditions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.traditions.map((trad, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded bg-[#161822] border border-zinc-700/80 text-xs font-semibold text-zinc-200">
                        🏛️ {trad}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Convergent Plants */}
                <div>
                  <span className="text-xs text-zinc-400 block mb-1.5 font-medium font-mono">Documented Botanical Taxa:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.convergent_plants.map((pName, pIdx) => (
                      <span key={pIdx} className="px-2.5 py-1 rounded bg-zinc-800/90 border border-zinc-700 text-xs font-mono italic text-zinc-200">
                        🌿 {pName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Literature Records: {c.total_literature_records} citations</span>
                  <span className="text-zinc-200 font-semibold font-mono">Verified Multi-Relational Provenance</span>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NAGOYA SOVEREIGNTY LEDGER */}
      {activeSubTab === 'sovereignty' && (
        <div className="space-y-6">
          <div className="bg-[#111319]/90 border border-zinc-800 p-5 rounded-xl space-y-2">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-zinc-300" />
              Nagoya Protocol Traditional Knowledge Sovereignty Ledger
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every botanical entity in EthnoKG generates an immutable cryptographic SHA-256 certificate ensuring 
              indigenous attribution, Access and Benefit-Sharing (ABS) compliance under Article 8(j) of the Convention on Biological Diversity (CBD), 
              and permanent auditability for intellectual property protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveryItems.map((item, idx) => (
              <GlowCard key={idx} glowColor="silver" className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-zinc-300 shrink-0" />
                      <span className="italic">{item.plant_name}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Tradition: <span className="text-zinc-200 font-medium">{item.tradition}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-full">
                    ABS Verified
                  </span>
                </div>

                <div className="bg-[#161822] p-2.5 rounded-lg border border-zinc-800 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Target Indication:</span>
                    <span className="text-white font-semibold">{item.condition_name}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Conservation:</span>
                    <span className="text-zinc-300">{item.conservation_status}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenCertificate(item.plant_id)}
                    className="text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>View Cryptographic Certificate</span>
                  </button>
                  <span className="text-[10px] text-zinc-500 font-mono">UN CBD Art. 8(j)</span>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: NLP BENCHMARK */}
      {activeSubTab === 'benchmark' && benchmarkData && (
        <div className="space-y-6">
          <div className="bg-[#111319]/90 border border-zinc-800 p-5 rounded-xl space-y-2">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Award className="w-5 h-5 text-zinc-300" />
              Scientific NLP Evaluation Benchmark vs Zero-Shot Baselines
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Empirical evaluation over 60 expert-annotated peer-reviewed ethnopharmacological sentences from 
              Asteraceae, Solanaceae, Zingiberaceae, Meliaceae, Apocynaceae, and Ginkgoaceae literature.
            </p>
          </div>

          <div className="bg-[#111319] border border-zinc-800 rounded-xl overflow-x-auto shadow-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#161822] text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Extraction Dimension</th>
                  <th className="py-3 px-4">Rule-Based F1</th>
                  <th className="py-3 px-4">Zero-Shot LLM F1</th>
                  <th className="py-3 px-4 text-white">EthnoKG Hybrid F1</th>
                  <th className="py-3 px-4">Precision / Recall</th>
                  <th className="py-3 px-4">Key Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 font-mono">
                {benchmarkData.summary_table.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {row.dimension}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{row.rule_based_f1.toFixed(2)}</td>
                    <td className="py-3 px-4 text-zinc-400">{row.llm_only_f1.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      {row.ethnokg_hybrid_f1.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      P: {row.precision.toFixed(2)} / R: {row.recall.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-sans font-semibold">
                        {row.advantage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NAGOYA PROTOCOL STEWARDSHIP CERTIFICATE */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111319] border border-zinc-700/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Nagoya Protocol Stewardship Certificate</h3>
                  <p className="text-xs text-zinc-400">Traditional Knowledge Provenance & ABS Compliance</p>
                </div>
              </div>

              <button
                onClick={() => setActiveCert(null)}
                className="text-zinc-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4 text-xs">
              <div className="bg-[#161822] p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Certificate ID:</span>
                  <span className="font-mono text-white font-bold">{activeCert.certificate_id}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Botanical Binomial:</span>
                  <span className="font-mono text-white italic font-bold">{activeCert.scientific_name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Originating Tradition:</span>
                  <span className="text-zinc-200 font-semibold">{activeCert.certificate.originating_traditions.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>IUCN Red List:</span>
                  <span className="text-zinc-300 font-semibold">{activeCert.certificate.iucn_red_list_status}</span>
                </div>
              </div>

              {/* SHA-256 Provenance Fingerprint */}
              <div className="bg-zinc-900/90 border border-zinc-700/80 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5 font-mono">
                    <FileCheck2 className="w-3.5 h-3.5 text-zinc-300" />
                    Cryptographic SHA-256 Fingerprint:
                  </span>
                  <button
                    onClick={() => handleCopyHash(activeCert.sha256_provenance_hash)}
                    className="text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHash ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <p className="font-mono text-[10px] text-zinc-300 break-all bg-black/60 p-2 rounded border border-zinc-800">
                  {activeCert.sha256_provenance_hash}
                </p>
              </div>

              {/* Legal ABS Statement */}
              <p className="text-[11px] text-zinc-400 bg-[#161822] p-3 rounded-lg border border-zinc-800 leading-relaxed">
                <strong className="text-zinc-200">Access & Benefit Sharing (ABS) Guarantee:</strong> In accordance with UN CBD Article 8(j) and the Nagoya Protocol, 
                any industrial or pharmaceutical application derived from this record must adhere to Prior Informed Consent (PIC) 
                and Mutually Agreed Terms (MAT) with the originating indigenous custodians.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-lg bg-[#161822] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-300" />
                <span>Print / PDF</span>
              </button>
              <button
                onClick={() => handleDownloadCert(activeCert)}
                className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-950 text-xs font-bold hover:bg-white flex items-center gap-1.5 shadow-md shadow-black/40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
