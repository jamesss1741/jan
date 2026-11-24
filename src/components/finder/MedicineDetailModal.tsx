import React, { useState } from 'react';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, ShoppingBag, Plus, Minus, Tag, AlertCircle, Info, TrendingUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  medicine: Medicine | null;
  onClose: () => void;
}

export const MedicineDetailModal: React.FC<Props> = ({ medicine, onClose }) => {
  const { addToBasket, t } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [dosagePattern, setDosagePattern] = useState<'1-0-1' | '1-1-1' | '0-0-1' | '1-0-0' | 'As Needed'>('1-0-1');

  if (!medicine) return null;

  const packSize = medicine.packSize > 0 ? medicine.packSize : 10;
  const jaUnit = medicine.janAushadhiMrp / packSize;
  const primaryBrand = medicine.brandedAlternatives[0];
  const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : packSize;
  const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;
  const unitSavings = Math.max(0, brandUnit - jaUnit);
  const percentOff = brandUnit > 0 ? Math.round((unitSavings / brandUnit) * 100) : 0;

  const handleAdd = () => {
    addToBasket(medicine, quantity, dosagePattern);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/60">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  PMBJP Code #{medicine.pmbjpCode}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {medicine.category}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  medicine.scheduleType === 'OTC'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}>
                  {medicine.scheduleType}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {medicine.genericName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Salt: {medicine.saltComposition}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body Scrollable */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            
            {/* Price Comparison Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center justify-between">
                <span>Unit Price & Financial Savings</span>
                <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full text-[11px]">
                  {percentOff}% LOWER MRP
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500">Jan-Aushadhi MRP</div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{medicine.janAushadhiMrp.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ({medicine.packSize} {medicine.dosageForm}s • ₹{jaUnit.toFixed(2)}/unit)
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500">Branded MRP ({primaryBrand?.brandName})</div>
                  <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 line-through">
                    ₹{primaryBrand?.mrp.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ({primaryBrand?.packSize} {medicine.dosageForm}s • ₹{brandUnit.toFixed(2)}/unit)
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-emerald-300 dark:border-emerald-700/50 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Net Savings</div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{unitSavings.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Saved on every single tablet
                  </div>
                </div>
              </div>
            </div>

            {/* Branded Market Equivalents Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Real Indian Branded Market Equivalents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {medicine.brandedAlternatives.map((brand, idx) => {
                  const bPack = brand.packSize > 0 ? brand.packSize : 10;
                  const bUnit = brand.mrp / bPack;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {brand.brandName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {brand.manufacturer} ({brand.packSize} tabs)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          ₹{brand.mrp.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ₹{bUnit.toFixed(2)}/tab
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinical Indications & Plain Language Explanation */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Clinical Indication & Uses
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {medicine.indication}
              </p>
            </div>

            {/* Common Side Effects & Storage Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Common Side Effects
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {medicine.commonSideEffects.map((sideEffect, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                    >
                      {sideEffect}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  Storage Instructions
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {medicine.storageTips}
                </p>
              </div>
            </div>

            {/* National PMBJP Demand Metrics */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  National PMBJP Sales Benchmarks
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Rank #{medicine.salesMetrics.nationalRank} Nationwide
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400">Monthly Sold</div>
                  <div className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {(medicine.salesMetrics.monthlyStripsSold / 100000).toFixed(1)} Lakh Strips
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400">Annual Turnover</div>
                  <div className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    ₹{medicine.salesMetrics.annualTurnoverCrores.toFixed(1)} Cr
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400">Velocity</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {medicine.salesMetrics.demandTag}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer / Add to Basket */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                  {quantity} strip{quantity > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <select
                value={dosagePattern}
                onChange={e => setDosagePattern(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1-0-1">1-0-1 (Morning & Night)</option>
                <option value="1-1-1">1-1-1 (Thrice daily)</option>
                <option value="1-0-0">1-0-0 (Morning only)</option>
                <option value="0-0-1">0-0-1 (Night only)</option>
                <option value="As Needed">As Needed / SOS</option>
              </select>
            </div>

            <button
              onClick={handleAdd}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Basket (₹{(medicine.janAushadhiMrp * quantity).toFixed(2)})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
