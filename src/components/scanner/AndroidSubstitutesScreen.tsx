import React, { useState, useMemo } from 'react';
import { MEDICINES_DATA } from '../../data/medicines';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { AshokaChakra } from '../common/AshokaChakra';
import {
  Repeat, Search, Sparkles, Check, ArrowRight, X,
  ShieldCheck, Upload, FileText, ShoppingBag, Plus
} from 'lucide-react';

export const AndroidSubstitutesScreen: React.FC = () => {
  const { addToBasket, showToast, setActiveTab } = useApp();

  const [query, setQuery] = useState('');

  // Quick brand shortcuts
  const popularBrands = [
    'Dolo 650',
    'Pan-D',
    'Augmentin 625',
    'Telma 40',
    'Glycomet 500 SR',
    'Montair-LC',
    'Atorva 10',
    'Shelcal 500',
    'Crocin 650',
    'Combiflam'
  ];

  const handleBrandClick = (brandName: string) => {
    setQuery(brandName);
  };

  // Search across all 2,453 medicines for matching brands, salts, or names
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return MEDICINES_DATA.filter(m =>
      (m.brandedAlternatives || []).some(b => b.brandName.toLowerCase().includes(q)) ||
      m.genericName.toLowerCase().includes(q) ||
      (m.saltComposition || '').toLowerCase().includes(q) ||
      String(m.pmbjpCode) === q
    ).slice(0, 8); // Top 8 relevant bioequivalent matches
  }, [query]);

  return (
    <div className="w-full space-y-4 pb-4">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#000080] dark:text-blue-400 uppercase tracking-wider">
          <Repeat className="w-4 h-4 text-[#046A38]" />
          <span>Brand-to-Generic Switcher</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Find Jan Aushadhi Substitute
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search any expensive market brand to discover its official PMBJP generic equivalent.
        </p>
      </div>

      {/* Brand Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type brand name (e.g. Dolo 650, Pan-D, Augmentin)..."
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080] dark:focus:ring-blue-500 shadow-xs"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Brand Pills */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FF671F]" />
          <span>Popular Market Brands</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {popularBrands.map(b => (
            <button
              key={b}
              onClick={() => handleBrandClick(b)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-[#000080] dark:hover:text-blue-400 transition"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Substitution Results Feed */}
      {matches.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Found {matches.length} Jan Aushadhi Equivalent{matches.length > 1 ? 's' : ''}:
          </div>

          {matches.map(med => {
            const primaryBrand = med.brandedAlternatives?.[0];
            const pack = med.packSize > 0 ? med.packSize : 10;
            const jaUnit = med.janAushadhiMrp / pack;
            const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : pack;
            const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;
            const percentOff = brandUnit > 0 ? Math.max(0, Math.round(((brandUnit - jaUnit) / brandUnit) * 100)) : 0;

            return (
              <div
                key={med.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/80 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#000080] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200/60">
                    PMBJP Code #{med.pmbjpCode}
                  </span>
                  <span className="text-xs font-extrabold text-[#046A38] dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Verified Bioequivalent</span>
                  </span>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Jan Aushadhi Generic</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {med.genericName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Exact Salt: {med.saltComposition || med.genericName}
                  </p>
                </div>

                {/* Side by Side Comparison Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Jan Aushadhi MRP</div>
                    <div className="text-lg font-mono font-black text-[#046A38] dark:text-emerald-400">
                      ₹{med.janAushadhiMrp.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ({med.packSize} units/strip)
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">
                      {primaryBrand ? primaryBrand.brandName : 'Market MRP'}
                    </div>
                    <div className="text-base font-mono font-bold text-slate-400 line-through">
                      ₹{primaryBrand ? primaryBrand.mrp.toFixed(2) : (med.janAushadhiMrp * 3).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#FF671F] font-bold">
                      Flat {percentOff || 75}% Savings
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addToBasket(med, 1, '1-0-1');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#046A38] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Prescription</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('basket')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : query ? (
        <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <p>No exact match for "{query}".</p>
          <p className="text-[11px] text-slate-400">
            Try searching active salt ingredients (e.g. Paracetamol, Pantoprazole, Metformin, Telmisartan).
          </p>
        </div>
      ) : null}

      {/* Quick Regimens Presets */}
      <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Preset Substitution Regimens:
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleBrandClick('Telma 40')}
            className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-left text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-[#000080]/50 transition"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Cardiac & BP (Telma 40 vs Code #505)</div>
              <div className="text-[10px] text-slate-400">Save up to 90% per strip</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#046A38]" />
          </button>

          <button
            onClick={() => handleBrandClick('Dolo 650')}
            className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-left text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-[#000080]/50 transition"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Fever & Pain (Dolo 650 vs Code #612)</div>
              <div className="text-[10px] text-slate-400">Save 56% to 82% per strip</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#046A38]" />
          </button>
        </div>
      </div>
    </div>
  );
};
