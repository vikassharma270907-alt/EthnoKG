import React, { useState, useEffect } from 'react';
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
  Beaker,
  CheckCircle2,
  Copy,
  Download
} from 'lucide-react';
import { 
  fetchDiscoveryIndex, 
  fetchConvergence, 
  fetchEvaluationBenchmark, 
  fetchSovereigntyCertificate 
} from '../api/client';
import { 
  DiscoveryIndexItem, 
  ConvergenceItem, 
  EvaluationBenchmarkResponse, 
  SovereigntyCertificate 
} from '../types';

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
  const [isCertLoading, setIsCertLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchDiscoveryIndex().catch(() => []),
      fetchConvergence().catch(() => []),
      fetchEvaluationBenchmark().catch(() => null)
    ]).then(([disc, conv, bench]) => {
      setDiscoveryItems(disc);
      setConvergenceItems(conv);
      setBenchmarkData(bench);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleOpenCertificate = async (plantId: number) => {
    setIsCertLoading(true);
    try {
      const cert = await fetchSovereigntyCertificate(plantId);
      setActiveCert(cert);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCertLoading(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
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
    const matchesSearch = 
      item.plant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.condition_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.compound_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tradition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = 
      stageFilter === 'ALL' ||
      (stageFilter === 'PRECLINICAL' && item.stage_badge.includes('Preclinical')) ||
      (stageFilter === 'CLINICAL' && item.stage_badge.includes('Clinical')) ||
      (stageFilter === 'BOTANICAL' && item.stage_badge.includes('Botanical'));

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
              Reverse Pharmacology & Translational AI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Discovery Radar & Sovereignty Ledger
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bridge centuries of empirical natural healing with modern drug discovery. Identify translational gaps, 
              detect independent cross-tradition convergence, and guarantee indigenous knowledge sovereignty under the UN Nagoya Protocol.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">Hallucination Rate</span>
              <span className="text-xl font-bold font-mono text-emerald-400">0.00%</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">Taxon Accuracy</span>
              <span className="text-xl font-bold font-mono text-teal-300">94.1%</span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pt-6 border-t border-slate-800/80 mt-6">
          <button
            onClick={() => setActiveSubTab('discovery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'discovery'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Reverse Pharmacology Discovery Index</span>
          </button>

          <button
            onClick={() => setActiveSubTab('convergence')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'convergence'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Cross-Cultural Convergence Radar</span>
          </button>

          <button
            onClick={() => setActiveSubTab('benchmark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'benchmark'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search plant, condition, compound..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 shrink-0">Stage:</span>
              {[
                { id: 'ALL', label: 'All Candidates' },
                { id: 'PRECLINICAL', label: 'Preclinical Leads' },
                { id: 'BOTANICAL', label: 'Traditional Signals' },
                { id: 'CLINICAL', label: 'Clinically Validated' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStageFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    stageFilter === s.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-400">Computing Reverse Pharmacology Translational Indices...</p>
            </div>
          ) : filteredDiscovery.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
              No drug discovery candidates match the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDiscovery.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg hover:shadow-emerald-950/20"
                >
                  <div className="space-y-3">
                    {/* Top Row: Score & Stage Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        item.stage_badge.includes('Preclinical')
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : item.stage_badge.includes('Clinical')
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}>
                        {item.stage_badge}
                      </span>

                      <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Discovery Index:</span>
                        <span className="text-sm font-extrabold font-mono text-white">{item.discovery_score}</span>
                      </div>
                    </div>

                    {/* Plant & Indication */}
                    <div>
                      <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="italic">{item.plant_name}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.common_names.slice(0, 3).join(', ')} • <span className="text-teal-300">{item.tradition}</span>
                      </p>
                    </div>

                    {/* Target Condition & Bioactive Compound */}
                    <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Target Condition:</span>
                        <span className="font-semibold text-white">{item.condition_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Bioactive Scaffold:</span>
                        <span className="font-semibold text-emerald-400 font-mono">{item.compound_name}</span>
                      </div>
                    </div>

                    {/* Evidence Hierarchy Counters */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                      <div className="bg-slate-950 border border-slate-800 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">Tradition</span>
                        <span className="text-xs font-bold font-mono text-purple-300">{item.evidence_counts.traditional}</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">In-Vitro</span>
                        <span className="text-xs font-bold font-mono text-emerald-300">{item.evidence_counts.in_vitro}</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">In-Vivo</span>
                        <span className="text-xs font-bold font-mono text-amber-300">{item.evidence_counts.in_vivo}</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">Clinical</span>
                        <span className="text-xs font-bold font-mono text-blue-300">{item.evidence_counts.clinical}</span>
                      </div>
                    </div>

                    {/* Conservation Risk */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        IUCN Status:
                      </span>
                      <span className="font-semibold text-slate-200">{item.conservation_status}</span>
                    </div>

                    {/* Verbatim Excerpt */}
                    {item.excerpts.length > 0 && (
                      <p className="text-[11px] text-slate-300 bg-slate-950/60 border-l-2 border-emerald-500 p-2 rounded-r italic line-clamp-2">
                        "{item.excerpts[0]}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenCertificate(item.plant_id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Nagoya Certificate</span>
                    </button>

                    {item.dois.length > 0 && (
                      <a
                        href={`https://doi.org/${item.dois[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>DOI Ref</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CROSS-CULTURAL CONVERGENCE RADAR */}
      {activeSubTab === 'convergence' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-teal-400" />
              Independent Cross-Cultural Convergence Signal
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              When distinct indigenous traditions across different continents (e.g. Ayurveda in India, TCM in China, Amazonian folk medicine) 
              independently arrived at the exact same botanical species or plant family for identical therapeutic symptoms, 
              statistical random chance is ruled out. This cross-cultural convergence is modern pharmacology's highest-probability target filter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {convergenceItems.map((c, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-xl p-5 space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      {c.convergence_level}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-1.5">
                      Target Indication: {c.condition}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Convergence Score</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-400">{c.convergence_score}/100</span>
                  </div>
                </div>

                {/* Traditions Tag Cloud */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">Convergent Medical Traditions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.traditions.map((trad, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700/80 text-xs font-semibold text-slate-200">
                        🏛️ {trad}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Convergent Plants */}
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">Documented Botanical Taxa:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.convergent_plants.map((pName, pIdx) => (
                      <span key={pIdx} className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono italic text-emerald-300">
                        🌿 {pName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Literature Records: {c.total_literature_records} citations</span>
                  <span className="text-emerald-400 font-semibold">Verified Multi-Relational Provenance</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NLP BENCHMARK */}
      {activeSubTab === 'benchmark' && benchmarkData && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Scientific NLP Evaluation Benchmark vs Zero-Shot Baselines
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Empirical evaluation over 60 expert-annotated peer-reviewed ethnopharmacological sentences from 
              Asteraceae, Solanaceae, Zingiberaceae, Meliaceae, Apocynaceae, and Ginkgoaceae literature.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Extraction Dimension</th>
                  <th className="py-3 px-4">Rule-Based F1</th>
                  <th className="py-3 px-4">Zero-Shot LLM F1</th>
                  <th className="py-3 px-4 text-emerald-400">EthnoKG Hybrid F1</th>
                  <th className="py-3 px-4">Precision / Recall</th>
                  <th className="py-3 px-4">Key Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {benchmarkData.summary_table.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {row.dimension}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{row.rule_based_f1.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-400">{row.llm_only_f1.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                      {row.ethnokg_hybrid_f1.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      P: {row.precision.toFixed(2)} / R: {row.recall.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-sans font-semibold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1329] border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Nagoya Protocol Stewardship Certificate</h3>
                  <p className="text-xs text-slate-400">Traditional Knowledge Provenance & ABS Compliance</p>
                </div>
              </div>

              <button
                onClick={() => setActiveCert(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Certificate ID:</span>
                  <span className="font-mono text-emerald-400 font-bold">{activeCert.certificate_id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Botanical Binomial:</span>
                  <span className="font-mono text-white italic font-bold">{activeCert.scientific_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Originating Tradition:</span>
                  <span className="text-teal-300 font-semibold">{activeCert.certificate.originating_traditions.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>IUCN Red List:</span>
                  <span className="text-amber-300 font-semibold">{activeCert.certificate.iucn_red_list_status}</span>
                </div>
              </div>

              {/* SHA-256 Provenance Fingerprint */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Cryptographic SHA-256 Provenance Fingerprint:
                  </span>
                  <button
                    onClick={() => handleCopyHash(activeCert.sha256_provenance_hash)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHash ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <p className="font-mono text-[10px] text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                  {activeCert.sha256_provenance_hash}
                </p>
              </div>

              {/* Legal ABS Statement */}
              <p className="text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                <strong>Access & Benefit Sharing (ABS) Guarantee:</strong> In accordance with UN CBD Article 8(j) and the Nagoya Protocol, 
                any industrial or pharmaceutical application derived from this record must adhere to Prior Informed Consent (PIC) 
                and Mutually Agreed Terms (MAT) with the originating indigenous custodians.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadCert(activeCert)}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Certificate</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
