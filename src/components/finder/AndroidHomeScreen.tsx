import React, { useState, useMemo, useEffect } from 'react';
import { MEDICINES_DATA } from '../../data/medicines';
import { Medicine, Category } from '../../types';
import { useApp } from '../../context/AppContext';
import { AndroidMedicineSheet } from './AndroidMedicineSheet';
import { AshokaChakra } from '../common/AshokaChakra';
import {
  Search, Mic, MicOff, X, Sparkles, TrendingUp,
  ShoppingBag, Plus, Minus, Check, ArrowRight, ShieldCheck, HeartPulse
} from 'lucide-react';

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

export const AndroidHomeScreen: React.FC = () => {
  const { addToBasket, showToast, t } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category | 'All'>('All');
  const [activeSheetMed, setActiveSheetMed] = useState<Medicine | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(30);

  // Reset pagination on search or category filter change
  useEffect(() => {
    setDisplayLimit(30);
  }, [search, selectedCat]);

  // Filter medicines across all 2,453 catalog products safely
  const medicines = useMemo(() => {
    let list = MEDICINES_DATA;
    if (selectedCat !== 'All') {
      list = list.filter(m => m.category === selectedCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(m =>
        m.genericName.toLowerCase().includes(q) ||
        (m.saltComposition || '').toLowerCase().includes(q) ||
        String(m.pmbjpCode).includes(q) ||
        (m.brandedAlternatives || []).some(b => b.brandName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCat, search]);

  const displayedMedicines = useMemo(() => {
    return medicines.slice(0, displayLimit);
  }, [medicines, displayLimit]);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSearch('Dolo 650');
      showToast('Search by voice: "Dolo 650"', 'info');
      return;
    }
    try {
      const r = new SR();
      r.lang = 'en-IN';
      r.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak medicine name', 'info');
      };
      r.onresult = (ev: any) => {
        setSearch(ev.results[0][0].transcript);
        setIsListening(false);
      };
      r.onerror = () => setIsListening(false);
      r.onend = () => setIsListening(false);
      r.start();
    } catch {
      setSearch('Dolo 650');
    }
  };

  return (
    <div className="w-full space-y-4 pb-4">
      
      {/* Search Input with PMBJP Tricolor Border Focus */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder') || 'Search 2,450+ medicines, salts, drug codes...'}
          className="w-full pl-10 pr-20 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-[#000080] dark:focus:border-blue-400 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080]/20 transition shadow-2xs"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleVoice}
            className={`p-1.5 rounded-xl transition ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-[#046A38] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
            }`}
            title="Search by voice"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Category Pills with Tricolor Active Colors */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#000080] to-[#046A38] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? (t('allCategories') || 'All Formulations') : cat}
            </button>
          );
        })}
      </div>

      {/* Official PMBJP Government Savings Banner (https://janaushadhi.gov.in/ colors: Saffron, White, Green, Navy Blue) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF671F] via-[#000080] to-[#046A38] text-white shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-wider text-orange-200 flex items-center gap-1.5">
            <AshokaChakra className="w-3.5 h-3.5 text-white" />
            <span>Govt. of India PMBJP Initiative</span>
          </div>
          <div className="text-sm font-bold mt-0.5 leading-tight text-white">
            50% to 90% Lower Than Market MRP
          </div>
          <div className="text-[10px] text-emerald-100 mt-0.5">
            2,453 WHO-GMP certified formulations in official catalog
          </div>
        </div>
        <div className="text-right shrink-0 bg-black/25 backdrop-blur-xs p-2 rounded-xl border border-white/20 relative z-10">
          <div className="text-lg font-black font-mono">20,149+</div>
          <div className="text-[9px] uppercase tracking-wider text-orange-200">Kendras</div>
        </div>
      </div>

      {/* Medicine Products Feed */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {medicines.length} Available Formulations
            {medicines.length > displayLimit && (
              <span className="text-[10px] font-normal text-slate-500 ml-1">
                (Showing {displayedMedicines.length})
              </span>
            )}
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[11px] font-semibold text-[#000080] dark:text-blue-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        {displayedMedicines.map(med => {
          const pack = med.packSize > 0 ? med.packSize : 10;
          const jaUnit = med.janAushadhiMrp / pack;
          const primaryBrand = med.brandedAlternatives?.[0];
          const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : pack;
          const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;
          const percentOff = brandUnit > 0 ? Math.max(0, Math.round(((brandUnit - jaUnit) / brandUnit) * 100)) : 0;

          return (
            <div
              key={med.id}
              onClick={() => setActiveSheetMed(med)}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#000080]/50 dark:hover:border-blue-500/50 transition cursor-pointer shadow-2xs flex items-center justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#000080] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-200/60 dark:border-blue-800">
                    #{med.pmbjpCode}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {med.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-[#000080] dark:group-hover:text-blue-400 transition">
                  {med.genericName}
                </h3>

                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {med.saltComposition || med.genericName}
                </p>

                {primaryBrand && (
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    Market Brand: <strong className="text-slate-700 dark:text-slate-300">{primaryBrand.brandName}</strong> (MRP ₹{primaryBrand.mrp.toFixed(2)})
                  </div>
                )}
              </div>

              {/* Price & Add Stepper */}
              <div className="text-right shrink-0 space-y-1.5" onClick={e => e.stopPropagation()}>
                <div>
                  <div className="text-sm font-extrabold font-mono text-[#046A38] dark:text-emerald-400">
                    ₹{med.janAushadhiMrp.toFixed(2)}
                  </div>
                  {primaryBrand && (
                    <div className="text-[10px] font-mono text-slate-400 line-through">
                      ₹{primaryBrand.mrp.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {percentOff > 0 && (
                    <span className="text-[9px] font-extrabold text-[#FF671F] bg-orange-50 dark:bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                      {percentOff}% OFF
                    </span>
                  )}
                  <button
                    onClick={() => {
                      addToBasket(med, 1, '1-0-1');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#046A38] hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs active:scale-95 transition"
                  >
                    + ADD
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Load More Button for large catalog pagination */}
        {medicines.length > displayLimit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setDisplayLimit(prev => prev + 40)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Load More Formulations ({medicines.length - displayLimit} remaining)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Native Bottom Sheet */}
      <AndroidMedicineSheet
        medicine={activeSheetMed}
        onClose={() => setActiveSheetMed(null)}
      />
    </div>
  );
};
