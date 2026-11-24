import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateBasketMetrics, detectDrugInteractions } from '../../utils/analytics';
import { generateShoppingSlipPdf, formatShoppingSlipText } from '../../utils/pdfGenerator';
import { InteractionAlerts } from './InteractionAlerts';
import {
  ShoppingBag, Trash2, Plus, Minus, Download, Share2, Copy,
  CheckCircle2, AlertCircle, IndianRupee, Calendar, Sparkles, ArrowRight
} from 'lucide-react';
import { MEDICINES_DATA } from '../../data/medicines';

export const PrescriptionBasketTab: React.FC = () => {
  const {
    basket,
    addToBasket,
    removeFromBasket,
    updateBasketItem,
    clearBasket,
    setActiveTab,
    showToast,
    userSession,
    t
  } = useApp();

  const metrics = useMemo(() => calculateBasketMetrics(basket), [basket]);
  const interactionAlerts = useMemo(() => detectDrugInteractions(basket), [basket]);

  const handleCopySlip = () => {
    const text = formatShoppingSlipText(basket, metrics);
    navigator.clipboard.writeText(text);
    showToast(t('slipCopiedToast'), 'success');
  };

  const handleShareWhatsApp = () => {
    const text = formatShoppingSlipText(basket, metrics);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = () => {
    generateShoppingSlipPdf(basket, userSession?.name || 'Citizen');
    showToast('PDF prescription shopping slip generated!', 'success');
  };

  if (basket.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('basketEmpty')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('basketEmptyDesc')}
          </p>
        </div>

        {/* Quick Add Starters */}
        <div className="pt-4 max-w-lg mx-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Add Chronic Starters:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {MEDICINES_DATA.slice(0, 4).map(m => (
              <button
                key={m.id}
                onClick={() => {
                  addToBasket(m, 1, '1-0-1');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{m.genericName.split(' ')[0]} (Code: {m.pmbjpCode})</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('finder')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/25"
        >
          <span>Browse Medicine Finder</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Financial Savings Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Chronic Prescription Savings Projection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
              You Save ₹{metrics.monthlySavings.toFixed(2)} / Month
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs bg-white/20 text-white font-bold px-3 py-1 rounded-full">
              {metrics.savingsPercentage}% OFF Branded MRP
            </span>
            <div className="text-xs text-emerald-100 mt-1">
              Annual Citizen Savings: <strong className="text-white font-mono text-sm">₹{metrics.annualSavings.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <div className="text-emerald-100 text-[11px]">Jan-Aushadhi Monthly Cost</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              ₹{metrics.totalJanAushadhiMonthlyCost.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <div className="text-emerald-100 text-[11px]">Equivalent Branded Cost</div>
            <div className="text-lg font-bold font-mono text-slate-200 line-through mt-0.5">
              ₹{metrics.totalBrandedMonthlyCost.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <div className="text-emerald-100 text-[11px]">Monthly Savings</div>
            <div className="text-lg font-bold font-mono text-emerald-200 mt-0.5">
              ₹{metrics.monthlySavings.toFixed(2)}
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <div className="text-emerald-100 text-[11px]">12-Month Annual Total</div>
            <div className="text-lg font-bold font-mono text-cyan-200 mt-0.5">
              ₹{metrics.annualSavings.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Drug Interaction Alerts */}
      <InteractionAlerts alerts={interactionAlerts} />

      {/* Basket Action Bar (Export, Print, WhatsApp, Clear) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{basket.length}</span> Medicines in Regimen
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySlip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{t('copyShoppingSlip')}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('shareWhatsApp')}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('downloadPdf')}</span>
          </button>

          <button
            onClick={clearBasket}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Clear entire basket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prescription Basket Item Cards */}
      <div className="space-y-3.5">
        {basket.map(item => {
          const pack = item.medicine.packSize > 0 ? item.medicine.packSize : 10;
          const jaUnit = item.medicine.janAushadhiMrp / pack;
          const primaryBrand = item.selectedBrandAlternative || item.medicine.brandedAlternatives[0];
          const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : pack;
          const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;

          let monthlyTabs = 30;
          if (item.dosagePattern === '1-0-1') monthlyTabs = 60;
          if (item.dosagePattern === '1-1-1') monthlyTabs = 90;
          if (item.dosagePattern === 'As Needed') monthlyTabs = 15;

          const totalTabs = monthlyTabs * item.quantityStrips;
          const monthlyItemCost = totalTabs * jaUnit;
          const monthlyBrandCost = totalTabs * brandUnit;
          const itemSavings = Math.max(0, monthlyBrandCost - monthlyItemCost);

          return (
            <div
              key={item.medicine.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Medicine Overview */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    PMBJP #{item.medicine.pmbjpCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {item.medicine.category}
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {item.medicine.genericName}
                </h4>
                <div className="text-xs text-slate-500 font-mono">
                  Salt: {item.medicine.saltComposition}
                </div>
                {primaryBrand && (
                  <div className="text-xs text-slate-500 pt-0.5">
                    Brand counterpart: <strong className="text-slate-700 dark:text-slate-300">{primaryBrand.brandName}</strong> ({primaryBrand.manufacturer})
                  </div>
                )}
              </div>

              {/* Controls: Dosage Pattern + Strips Stepper */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Dosage Pattern
                  </label>
                  <select
                    value={item.dosagePattern}
                    onChange={e => updateBasketItem(item.medicine.id, { dosagePattern: e.target.value as any })}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                    <option value="1-1-1">1-1-1 (Thrice daily)</option>
                    <option value="1-0-0">1-0-0 (Morning only)</option>
                    <option value="0-0-1">0-0-1 (Night only)</option>
                    <option value="As Needed">As Needed / SOS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Multiplier
                  </label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden">
                    <button
                      onClick={() => updateBasketItem(item.medicine.id, { quantityStrips: Math.max(1, item.quantityStrips - 1) })}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {item.quantityStrips}x
                    </span>
                    <button
                      onClick={() => updateBasketItem(item.medicine.id, { quantityStrips: item.quantityStrips + 1 })}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price & Savings info */}
                <div className="text-right min-w-[110px] pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{monthlyItemCost.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono line-through">
                    ₹{monthlyBrandCost.toFixed(2)} branded
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    Saves ₹{itemSavings.toFixed(2)}/mo
                  </div>
                </div>

                {/* Delete Item */}
                <button
                  onClick={() => removeFromBasket(item.medicine.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
