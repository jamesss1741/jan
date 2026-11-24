import React, { useState, useMemo } from 'react';
import { MEDICINES_DATA } from '../../data/medicines';
import { Medicine, Category } from '../../types';
import { useApp } from '../../context/AppContext';
import { MedicineCard } from './MedicineCard';
import { MedicineDetailModal } from './MedicineDetailModal';
import { Search, Mic, MicOff, X, ArrowUpDown, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Pain & Fever',
  'Gastro & Acidity',
  'Cardiac & BP',
  'Anti-Diabetic',
  'Antibiotics',
  'Respiratory & Allergy',
  'Vitamins & Minerals',
  'Neuro & CNS'
];

const POPULAR_SUGGESTIONS = [
  'Dolo 650',
  'Pan-D',
  'Augmentin 625 Duo',
  'Telma 40',
  'Glycomet 500 SR',
  'Montair-LC',
  'Shelcal 500',
  'Thyronorm 50mcg'
];

export const MedicineFinderTab: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    selectedMedicineModal,
    setSelectedMedicineModal,
    showToast,
    t
  } = useApp();

  const [isListening, setIsListening] = useState(false);

  // Web Speech API Voice Search with fallback
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser. Using sample search: "Dolo 650"', 'info');
      setSearchQuery('Dolo 650');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak medicine or salt name (e.g. Paracetamol, Pantoprazole)', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        showToast(`Heard: "${transcript}"`, 'success');
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Voice input timed out. You can type in the search bar.', 'info');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSearchQuery('Dolo 650');
      showToast('Simulated voice query: "Dolo 650"', 'info');
    }
  };

  // Filter and Sort Medicines
  const filteredMedicines = useMemo(() => {
    let result = MEDICINES_DATA;

    // 1. Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(m => m.category === selectedCategory);
    }

    // 2. Search query (fuzzy match Brand, Generic Name, Salt, PMBJP Code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(m => {
        const matchesGeneric = m.genericName.toLowerCase().includes(q);
        const matchesSalt = m.saltComposition.toLowerCase().includes(q);
        const matchesCode = m.pmbjpCode.includes(q);
        const matchesCategory = m.category.toLowerCase().includes(q);
        const matchesBrand = m.brandedAlternatives.some(b =>
          b.brandName.toLowerCase().includes(q) || b.manufacturer.toLowerCase().includes(q)
        );
        return matchesGeneric || matchesSalt || matchesCode || matchesCategory || matchesBrand;
      });
    }

    // 3. Sorting
    return [...result].sort((a, b) => {
      const packA = a.packSize > 0 ? a.packSize : 10;
      const packB = b.packSize > 0 ? b.packSize : 10;
      const jaUnitA = a.janAushadhiMrp / packA;
      const jaUnitB = b.janAushadhiMrp / packB;

      const brandA = a.brandedAlternatives[0];
      const brandB = b.brandedAlternatives[0];
      const brandUnitA = brandA ? brandA.mrp / (brandA.packSize || 10) : jaUnitA * 3;
      const brandUnitB = brandB ? brandB.mrp / (brandB.packSize || 10) : jaUnitB * 3;

      const savingsA = brandUnitA > 0 ? (brandUnitA - jaUnitA) / brandUnitA : 0;
      const savingsB = brandUnitB > 0 ? (brandUnitB - jaUnitB) / brandUnitB : 0;

      switch (sortBy) {
        case 'savings_desc':
          return savingsB - savingsA;
        case 'price_asc':
          return a.janAushadhiMrp - b.janAushadhiMrp;
        case 'price_desc':
          return b.janAushadhiMrp - a.janAushadhiMrp;
        case 'sales_rank':
          return a.salesMetrics.nationalRank - b.salesMetrics.nationalRank;
        default:
          return savingsB - savingsA;
      }
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-11 pr-24 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
              title={t('voiceSearchTooltip')}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            Popular:
          </span>
          {POPULAR_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSearchQuery(s)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition shrink-0 text-xs font-medium"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Categories & Sorting Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {CATEGORIES.map(cat => {
              const count = cat === 'All'
                ? MEDICINES_DATA.length
                : MEDICINES_DATA.filter(m => m.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat === 'All' ? t('allCategories') : cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-emerald-700/60 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="savings_desc">{t('sortHighestSavings')}</option>
              <option value="sales_rank">{t('sortTopSelling')}</option>
              <option value="price_asc">{t('sortLowestPrice')}</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Showing <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{filteredMedicines.length}</span> verified PMBJP bioequivalent medicines
          {selectedCategory !== 'All' && <span> in <span className="text-slate-900 dark:text-white font-bold">{selectedCategory}</span></span>}
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Reset search
          </button>
        )}
      </div>

      {/* Medicine Cards Grid */}
      {filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMedicines.map(med => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onOpenDetails={m => setSelectedMedicineModal(m)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No medicines matched "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try searching for the active salt composition (e.g. Paracetamol, Pantoprazole, Metformin) or select "All Categories".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            Show All 65+ Medicines
          </button>
        </div>
      )}

      {/* Medicine Detail Modal / Drawer */}
      <MedicineDetailModal
        medicine={selectedMedicineModal}
        onClose={() => setSelectedMedicineModal(null)}
      />
    </div>
  );
};
