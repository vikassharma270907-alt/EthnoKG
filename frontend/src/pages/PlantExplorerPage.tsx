import React, { useState, useEffect } from 'react';
import { Leaf, Search, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { fetchPlants, fetchPlantDetail } from '../api/client';
import type { PlantBrief, PlantDetail } from '../types';
import { PlantModal } from '../components/PlantModal';
import { GlowCard } from '../components/GlowCard';

export const PlantExplorerPage: React.FC = () => {
  const [plants, setPlants] = useState<PlantBrief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('');

  // Modal state
  const [activePlantDetail, setActivePlantDetail] = useState<PlantDetail | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    fetchPlants({
      query: searchQuery || undefined,
      family: selectedFamily || undefined,
      tradition: selectedTradition || undefined,
      limit: 100
    }).then(data => {
      if (isSubscribed) {
        setPlants(data);
        setIsLoading(false);
      }
    }).catch(err => {
      if (isSubscribed) {
        console.error(err);
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, selectedFamily, selectedTradition]);

  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await fetchPlantDetail(id);
      setActivePlantDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-400" />
              <span>Plant Intelligence Explorer</span>
            </h1>
            <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
              Kew MPNS / WFO
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Standardized botanical catalog cross-referenced against Kew MPNS and World Flora Online. Reconciles historical synonyms without false species merging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Total Taxa:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#161822] border border-zinc-800 text-xs font-mono text-emerald-400 font-bold">
            {plants.length} Species
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111319]/90 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search binomial, common name (e.g. Ashwagandha, Neem, Qinghao)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#161822] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Family Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-[#161822] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
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
            className="bg-[#161822] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
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
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-zinc-400 text-xs">Querying botanical database...</p>
        </div>
      ) : plants.length === 0 ? (
        <div className="bg-[#111319] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
          <Leaf className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm">No plant species matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {plants.map((plant) => (
              <GlowCard
                key={plant.id}
                interactive
                glowColor="mint"
                onClick={() => handleOpenDetail(plant.id)}
                className="p-5 flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono group-hover:text-emerald-300 transition-colors">
                        {plant.scientific_name}
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium">Family: {plant.family || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-zinc-800 text-emerald-300 border border-zinc-700 px-2 py-0.5 rounded-full shrink-0 font-mono">
                      {plant.taxonomic_status}
                    </span>
                  </div>

                  {/* Common names */}
                  <div className="flex flex-wrap gap-1">
                    {plant.common_names.slice(0, 3).map((cn, i) => (
                      <span key={i} className="text-[11px] bg-[#161822] border border-zinc-700/80 px-2 py-0.5 rounded-md text-zinc-300">
                        {cn}
                      </span>
                    ))}
                    {plant.common_names.length > 3 && (
                      <span className="text-[11px] text-zinc-500 self-center">
                        +{plant.common_names.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom stats row */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-emerald-400 font-semibold">
                    {plant.relationships_count} documented relations
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-white transition-colors">
                    <span>Open Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </GlowCard>
            ))}
          </AnimatePresence>
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
