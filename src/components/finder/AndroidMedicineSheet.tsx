import React, { useState } from 'react';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, ShoppingBag, Plus, Minus, AlertCircle, Info, TrendingUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  medicine: Medicine | null;
  onClose: () => void;
}

export const AndroidMedicineSheet: React.FC<Props> = ({ medicine, onClose }) => {
  const { addToBasket } = useApp();
  const [qty, setQty] = useState(1);
  const [dosagePattern, setDosagePattern] = useState<'1-0-1' | '1-1-1' | '0-0-1' | '1-0-0' | 'As Needed'>('1-0-1');
  const [addedAnim, setAddedAnim] = useState(false);

  if (!medicine) return null;

  const packSize = medicine.packSize > 0 ? medicine.packSize : 10;
  const jaUnit = medicine.janAushadhiMrp / packSize;
  const primaryBrand = medicine.brandedAlternatives[0];
  const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : packSize;
  const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;
  const unitSavings = Math.max(0, brandUnit - jaUnit);
  const percentOff = brandUnit > 0 ? Math.round((unitSavings / brandUnit) * 100) : 0;

  const handleAdd = () => {
    addToBasket(medicine, qty, dosagePattern);
    setAddedAnim(true);
    setTimeout(() => {
      setAddedAnim(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Native Android Drag Handle with Tricolor micro-bar */}
          <div className="pt-3 pb-2 flex flex-col items-center shrink-0 gap-1.5">
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#FF671F] via-slate-300 to-[#046A38] rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] font-mono font-bold text-[#046A38] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  PMBJP Code #{medicine.pmbjpCode}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  medicine.scheduleType === 'OTC'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}>
                  {medicine.scheduleType}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {medicine.genericName}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Salt: {medicine.saltComposition}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content Scrollable */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            
            {/* Price Highlight Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#046A38] dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official PMBJP Rate</span>
                </span>
                <span className="text-xs font-black bg-[#FF671F] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  {percentOff}% OFF
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Jan Aushadhi MRP</div>
                  <div className="text-2xl font-extrabold font-mono text-[#046A38] dark:text-emerald-400">
                    ₹{medicine.janAushadhiMrp.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ({medicine.packSize} {medicine.dosageForm}s • ₹{jaUnit.toFixed(2)}/tab)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Market Branded MRP</div>
                  <div className="text-base font-bold font-mono text-slate-400 line-through">
                    ₹{primaryBrand?.mrp.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ({primaryBrand?.brandName} • ₹{brandUnit.toFixed(2)}/tab)
                  </div>
                </div>
              </div>
            </div>

            {/* Branded Counterparts List */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Equivalent Indian Market Brands
              </div>
              <div className="space-y-1.5">
                {medicine.brandedAlternatives.map((b, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{b.brandName}</span>
                      <span className="text-slate-400 ml-1.5">({b.manufacturer})</span>
                    </div>
                    <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{b.mrp.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indication */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Clinical Indication & Uses
              </div>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                {medicine.indication}
              </p>
            </div>

            {/* Side Effects & Storage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  Side Effects
                </div>
                <div className="space-y-1">
                  {medicine.commonSideEffects.slice(0, 2).map((s, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-400">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  Storage Instructions
                </div>
                <p className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 leading-normal">
                  {medicine.storageTips}
                </p>
              </div>
            </div>

            {/* Dosage Schedule Selector */}
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Prescription Dosage Pattern
              </label>
              <select
                value={dosagePattern}
                onChange={e => setDosagePattern(e.target.value as any)}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="1-0-1">1-0-1 (Morning & Night)</option>
                <option value="1-1-1">1-1-1 (Thrice daily)</option>
                <option value="1-0-0">1-0-0 (Morning only)</option>
                <option value="0-0-1">0-0-1 (Night only)</option>
                <option value="As Needed">As Needed / SOS</option>
              </select>
            </div>

          </div>

          {/* Sticky Bottom Bar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={addedAnim}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#046A38] to-[#059669] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition"
            >
              {addedAnim ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Prescription!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Prescription (₹{(medicine.janAushadhiMrp * qty).toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
