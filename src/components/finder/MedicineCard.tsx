import React, { useState } from 'react';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, ArrowRight, TrendingUp, Plus, Minus, Check, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  medicine: Medicine;
  onOpenDetails: (med: Medicine) => void;
}

export const MedicineCard: React.FC<Props> = ({ medicine, onOpenDetails }) => {
  const { addToBasket, t } = useApp();
  const [stripQty, setStripQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const packSize = medicine.packSize > 0 ? medicine.packSize : 10;
  const jaUnit = medicine.janAushadhiMrp / packSize;
  const primaryBrand = medicine.brandedAlternatives[0];
  const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : packSize;
  const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;
  const unitSavings = Math.max(0, brandUnit - jaUnit);
  const percentOff = brandUnit > 0 ? Math.round((unitSavings / brandUnit) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToBasket(medicine, stripQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpenDetails(medicine)}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top badges & rank */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              Code #{medicine.pmbjpCode}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              medicine.scheduleType === 'OTC'
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}>
              {medicine.scheduleType}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>#{medicine.salesMetrics.nationalRank}</span>
          </div>
        </div>

        {/* Medicine Name & Category */}
        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-snug">
          {medicine.genericName}
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 line-clamp-1">
          {medicine.saltComposition}
        </p>

        {/* Popular Branded Alternative Pill */}
        {primaryBrand && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 text-[11px]">Brand:</span>
            <strong className="font-semibold text-slate-900 dark:text-slate-100">{primaryBrand.brandName}</strong>
            <span className="text-slate-400 text-[10px]">({primaryBrand.manufacturer})</span>
          </div>
        )}

        {/* Side-by-Side Normalized Math Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Pack-Normalized Unit Math</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full text-[11px]">
              {percentOff}% OFF
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                Jan-Aushadhi
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                ₹{medicine.janAushadhiMrp.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                ₹{jaUnit.toFixed(2)}/tab ({medicine.packSize} {medicine.dosageForm}s)
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                Branded MRP
              </div>
              <div className="text-sm font-semibold font-mono text-slate-500 dark:text-slate-400 line-through">
                ₹{primaryBrand?.mrp.toFixed(2) || '0.00'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ₹{brandUnit.toFixed(2)}/tab
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onOpenDetails(medicine)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 py-1.5 transition"
        >
          <span>{t('viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStripQty(Math.max(1, stripQty - 1))}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
              {stripQty}
            </span>
            <button
              onClick={() => setStripQty(stripQty + 1)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-sm ${
              justAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
