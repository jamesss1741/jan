import React, { useState } from 'react';
import { MEDICINES_DATA } from '../../data/medicines';
import { Medicine } from '../../types';
import { Calculator, TrendingUp, IndianRupee, Percent, Sparkles, Plus } from 'lucide-react';

export const SalesSimulator: React.FC = () => {
  const [selectedMedId, setSelectedMedId] = useState<string>('pmbjp-612'); // Dolo 650 equivalent default
  const [monthlyStrips, setMonthlyStrips] = useState<number>(800); // 800 strips/month
  const [secondMedId, setSecondMedId] = useState<string>('pmbjp-133'); // Pan 40 default
  const [secondMonthlyStrips, setSecondMonthlyStrips] = useState<number>(500);

  const med1 = MEDICINES_DATA.find(m => m.id === selectedMedId) || MEDICINES_DATA[0];
  const med2 = MEDICINES_DATA.find(m => m.id === secondMedId) || MEDICINES_DATA[1];

  // Calculations for Med 1
  const revenue1 = monthlyStrips * med1.janAushadhiMrp;
  const brand1 = med1.brandedAlternatives[0];
  const brandPack1 = brand1 && brand1.packSize > 0 ? brand1.packSize : med1.packSize;
  const brandCost1 = monthlyStrips * (brand1 ? (brand1.mrp / brandPack1) * med1.packSize : med1.janAushadhiMrp * 3);
  const savings1 = Math.max(0, brandCost1 - revenue1);

  // Calculations for Med 2
  const revenue2 = secondMonthlyStrips * med2.janAushadhiMrp;
  const brand2 = med2.brandedAlternatives[0];
  const brandPack2 = brand2 && brand2.packSize > 0 ? brand2.packSize : med2.packSize;
  const brandCost2 = secondMonthlyStrips * (brand2 ? (brand2.mrp / brandPack2) * med2.packSize : med2.janAushadhiMrp * 3);
  const savings2 = Math.max(0, brandCost2 - revenue2);

  // Combined Counter Totals
  const totalGrossRevenue = revenue1 + revenue2;
  const totalCitizenSavings = savings1 + savings2;
  const retailerMargin20Pct = totalGrossRevenue * 0.20; // Official 20% Kendra Retailer Margin
  // PMBJP Monthly Incentive Scheme: Additional 15% of monthly purchase, up to ₹15,000/month
  const pmbjpIncentiveEstimate = Math.min(15000, totalGrossRevenue * 0.15);
  const totalKendraMonthlyEarnings = retailerMargin20Pct + pmbjpIncentiveEstimate;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Interactive Kendra Counter Simulator</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Kendra Counter Revenue & Retailer Margin Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Slide monthly tablet dispense volume to forecast gross revenue, citizen savings delivered, and your 20% Kendra trade margin.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          20% Official Trade Margin
        </span>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tablet 1 Controls */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Fast-Moving Tablet #1
            </label>
            <select
              value={selectedMedId}
              onChange={e => setSelectedMedId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MEDICINES_DATA.map(m => (
                <option key={m.id} value={m.id}>
                  #{m.pmbjpCode} - {m.genericName.slice(0, 38)} (₹{m.janAushadhiMrp.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Monthly Strips Sold</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {monthlyStrips} strips/mo
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={monthlyStrips}
              onChange={e => setMonthlyStrips(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>100 strips</span>
              <span>2,500</span>
              <span>5,000 strips</span>
            </div>
          </div>
        </div>

        {/* Tablet 2 Controls */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Chronic Tablet #2
            </label>
            <select
              value={secondMedId}
              onChange={e => setSecondMedId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MEDICINES_DATA.map(m => (
                <option key={m.id} value={m.id}>
                  #{m.pmbjpCode} - {m.genericName.slice(0, 38)} (₹{m.janAushadhiMrp.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Monthly Strips Sold</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {secondMonthlyStrips} strips/mo
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={secondMonthlyStrips}
              onChange={e => setSecondMonthlyStrips(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>100 strips</span>
              <span>2,500</span>
              <span>5,000 strips</span>
            </div>
          </div>
        </div>

      </div>

      {/* Real-Time Projected Outputs Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="text-[11px] text-slate-500 font-medium">Gross Counter Revenue</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            ₹{totalGrossRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">per month</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Citizen Savings Delivered</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalCitizenSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">household money saved</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="text-[11px] text-slate-500 font-medium">Retailer Margin (20%)</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            ₹{retailerMargin20Pct.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">guaranteed trade margin</div>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
          <div className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">Total Monthly Kendra Earnings</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-1">
            ₹{totalKendraMonthlyEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">includes PMBJP incentive</div>
        </div>
      </div>
    </div>
  );
};
