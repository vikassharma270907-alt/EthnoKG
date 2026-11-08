import React, { useState, useEffect } from 'react';
import { Leaf, Search, Filter, BookOpen, ChevronRight, Layers, ExternalLink } from 'lucide-react';
import { fetchPlants, fetchPlantDetail } from '../api/client';
import { PlantBrief, PlantDetail } from '../types';
import { PlantModal } from '../components/PlantModal';

export const PlantExplorerPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('');

  // Modal state
  const [activePlantDetail, setActivePlantDetail] = useState<PlantDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadPlants = () => {
    setIsLoading(true);
    fetchPlants({
      query: searchQuery || undefined,
      family: selectedFamily || undefined,
      tradition: selectedTradition || undefined,
      limit: 100
    }).then(setPlants).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPlants();
  }, [searchQuery, selectedFamily, selectedTradition]);

  const handleOpenDetail = async (id: number) => {
    setIsLoadingDetail(true);
    try {
      const detail = await fetchPlantDetail(id);
      setActivePlantDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white font-mono">Plant Intelligence Explorer</h1>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
            Taxonomic Authority
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Standardized botanical catalog cross-referenced against Kew MPNS and World Flora Online. Reconciles historical synonyms without false species merging.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#070c19] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search binomial, common name (e.g. Ashwagandha, Neem, Qinghao)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Family Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Families</option>
            <option value="Asteraceae">Asteraceae (Daisy/Wormwood)</option>
            <option value="Solanaceae">Solanaceae (Nightshade)</option>
            <option value="Zingiberaceae">Zingiberaceae (Ginger/Turmeric)</option>
            <option value="Apocynaceae">Apocynaceae (Dogbane)</option>
            <option value="Meliaceae">Meliaceae (Mahogany/Neem)</option>
            <option value="Ginkgoaceae">Ginkgoaceae</option>
            <option value="Araliaceae">Araliaceae (Ginseng)</option>
            <option value="Rubiaceae">Rubiaceae (Coffee/Cinchona)</option>
            <option value="Plantaginaceae">Plantaginaceae (Plantain/Foxglove)</option>
            <option value="Salicaceae">Salicaceae (Willow)</option>
            <option value="Papaveraceae">Papaveraceae (Poppy)</option>
          </select>

          {/* Tradition Filter */}
          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Traditions</option>
            <option value="Ayurveda">Ayurveda</option>
            <option value="Traditional Chinese Medicine">Traditional Chinese Medicine</option>
            <option value="African Traditional Medicine">African Traditional Medicine</option>
            <option value="Amazonian Ethnobotany">Amazonian Ethnobotany</option>
            <option value="European Folk Medicine">European Folk Medicine</option>
            <option value="Greco-Roman & Unani">Greco-Roman & Unani</option>
          </select>
        </div>

      </div>

      {/* Species Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs">Querying botanical database...</p>
        </div>
      ) : plants.length === 0 ? (
        <div className="bg-[#070c19] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Leaf className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <p className="text-sm">No plant species matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => handleOpenDetail(plant.id)}
              className="bg-[#070c19] border border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 cursor-pointer group transition-all shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono group-hover:text-emerald-300 transition-colors">
                      {plant.scientific_name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-medium">Family: {plant.family || 'Unknown'}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                    {plant.taxonomic_status}
                  </span>
                </div>

                {/* Common names */}
                <div className="flex flex-wrap gap-1">
                  {plant.common_names.slice(0, 3).map((cn, i) => (
                    <span key={i} className="text-[11px] bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded text-slate-300">
                      {cn}
                    </span>
                  ))}
                  {plant.common_names.length > 3 && (
                    <span className="text-[11px] text-slate-500 self-center">
                      +{plant.common_names.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom stats row */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-emerald-400 font-semibold">
                  {plant.relationships_count} documented relations
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-emerald-300 transition-colors">
                  <span>Open Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PlantModal
        plant={activePlantDetail}
        onClose={() => setActivePlantDetail(null)}
      />

    </div>
  );
};
