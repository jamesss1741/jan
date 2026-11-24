import React, { useState, useMemo } from 'react';
import { MEDICINES_DATA, PMBJP_NATIONAL_BENCHMARKS } from '../../data/medicines';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { SalesSimulator } from './SalesSimulator';
import { MedicineDetailModal } from '../finder/MedicineDetailModal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Award,
  ArrowUpDown, Search, Building2, ShieldCheck, IndianRupee, Layers
} from 'lucide-react';

export const SalesAnalyticsTab: React.FC = () => {
  const { setSelectedMedicineModal, t } = useApp();
  const [metricMode, setMetricMode] = useState<'units' | 'revenue' | 'savings'>('units');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardSort, setLeaderboardSort] = useState<'rank' | 'units' | 'turnover'>('rank');
  const [selectedDetailMed, setSelectedDetailMed] = useState<Medicine | null>(null);
  const [displayCount, setDisplayCount] = useState(40);

  // Top 10 Fast-Selling Tablets for Recharts Bar Chart
  const top10Medicines = useMemo(() => {
    return [...MEDICINES_DATA]
      .sort((a, b) => (a.salesMetrics?.nationalRank ?? 9999) - (b.salesMetrics?.nationalRank ?? 9999))
      .slice(0, 10)
      .map(m => {
        const primaryBrand = m.brandedAlternatives?.[0];
        const pack = m.packSize > 0 ? m.packSize : 10;
        const brandPack = primaryBrand && primaryBrand.packSize > 0 ? primaryBrand.packSize : pack;
        const jaUnit = m.janAushadhiMrp / pack;
        const brandUnit = primaryBrand ? primaryBrand.mrp / brandPack : jaUnit * 3;
        const annualStrips = m.salesMetrics?.annualStripsSold || 0;
        
        // Approximate citizen savings in Crores
        const annualCitizenSavingsCrores = ((annualStrips * pack * (brandUnit - jaUnit)) / 10000000);

        return {
          code: `#${m.pmbjpCode}`,
          name: m.genericName.split(' ')[0] + ' ' + (m.genericName.split(' ')[1] || ''),
          fullName: m.genericName,
          unitsSoldLakhs: Number(((m.salesMetrics?.annualStripsSold || 0) / 100000).toFixed(1)),
          annualTurnoverCrores: Number((m.salesMetrics?.annualTurnoverCrores || 0).toFixed(1)),
          savingsCrores: Number(Math.max(0, annualCitizenSavingsCrores).toFixed(1)),
          rawMed: m
        };
      });
  }, []);

  // Category Distribution Data for Donut Chart
  const categoryDonutData = useMemo(() => {
    const map: Record<string, { count: number; turnover: number }> = {};
    for (const m of MEDICINES_DATA) {
      if (!map[m.category]) {
        map[m.category] = { count: 0, turnover: 0 };
      }
      map[m.category].count += 1;
      map[m.category].turnover += (m.salesMetrics?.annualTurnoverCrores || 0);
    }

    const COLORS = [
      '#059669', '#0d9488', '#0284c7', '#6366f1',
      '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'
    ];

    return Object.entries(map).map(([name, data], idx) => ({
      name,
      value: Number(data.turnover.toFixed(1)),
      count: data.count,
      color: COLORS[idx % COLORS.length]
    }));
  }, []);

  // Searchable & Sortable Leaderboard
  const filteredLeaderboard = useMemo(() => {
    let list = [...MEDICINES_DATA];

    if (leaderboardSearch.trim()) {
      const q = leaderboardSearch.toLowerCase().trim();
      list = list.filter(m =>
        m.genericName.toLowerCase().includes(q) ||
        String(m.pmbjpCode).includes(q) ||
        (m.saltComposition || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (leaderboardSort === 'units') {
        return (b.salesMetrics?.annualStripsSold || 0) - (a.salesMetrics?.annualStripsSold || 0);
      }
      if (leaderboardSort === 'turnover') {
        return (b.salesMetrics?.annualTurnoverCrores || 0) - (a.salesMetrics?.annualTurnoverCrores || 0);
      }
      return (a.salesMetrics?.nationalRank ?? 9999) - (b.salesMetrics?.nationalRank ?? 9999);
    });

    return list;
  }, [leaderboardSearch, leaderboardSort]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* National Benchmark KPI Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4" />
              <span>National PMBJP Official Benchmarks ({PMBJP_NATIONAL_BENCHMARKS.fiscalYear})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ₹{PMBJP_NATIONAL_BENCHMARKS.annualSalesCrores.toLocaleString('en-IN')} Crore Annual Sales
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
              Delivering <span className="text-emerald-300 font-bold">+{PMBJP_NATIONAL_BENCHMARKS.salesGrowthYoY}% YoY Growth</span> across {PMBJP_NATIONAL_BENCHMARKS.totalKendrasNationwide.toLocaleString('en-IN')} Pradhan Mantri Bhartiya Janaushadhi Kendras.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-[10px] text-emerald-200 uppercase font-semibold">Active Kendras</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">20,149+</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-[10px] text-emerald-200 uppercase font-semibold">Citizen Savings</div>
              <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">₹37,200+ Cr</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-emerald-200 uppercase font-semibold">WHO-GMP Range</div>
              <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">2,110+ Drugs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top-Selling Tablets Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4" />
                  <span>Top-Selling Formulations</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  National Tablet Sales & Impact Leaders
                </h3>
              </div>

              {/* Metric Toggle Chips */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => setMetricMode('units')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    metricMode === 'units'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Units (Lakhs)
                </button>
                <button
                  onClick={() => setMetricMode('revenue')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    metricMode === 'revenue'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Revenue (₹ Cr)
                </button>
                <button
                  onClick={() => setMetricMode('savings')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    metricMode === 'savings'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Savings (₹ Cr)
                </button>
              </div>
            </div>

            {/* Recharts Bar Component */}
            <div className="w-full h-72 sm:h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <BarChart data={top10Medicines} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <div className="font-bold text-emerald-400">{data.fullName}</div>
                            <div className="text-slate-300">PMBJP Code: {data.code}</div>
                            <div className="font-mono pt-1 text-slate-200">
                              {metricMode === 'units' && `Annual Strips Sold: ${data.unitsSoldLakhs} Lakhs`}
                              {metricMode === 'revenue' && `Annual Turnover: ₹${data.annualTurnoverCrores} Crores`}
                              {metricMode === 'savings' && `Citizen Savings: ₹${data.savingsCrores} Crores`}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={
                      metricMode === 'units'
                        ? 'unitsSoldLakhs'
                        : metricMode === 'revenue'
                        ? 'annualTurnoverCrores'
                        : 'savingsCrores'
                    }
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-400 text-right pt-2 border-t border-slate-100 dark:border-slate-800">
            Source: PMBI Official Central Logistics Monitoring (FY 2025–26)
          </div>
        </div>

        {/* Therapeutic Category Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
              <PieIcon className="w-4 h-4" />
              <span>Therapeutic Market Share</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
              Category Turnover Breakdown (₹ Cr)
            </h3>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <PieChart>
                  <Pie
                    data={categoryDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs border border-slate-700">
                            <div className="font-bold">{d.name}</div>
                            <div className="text-emerald-400 font-mono">Turnover: ₹{d.value} Cr</div>
                            <div className="text-slate-400">{d.count} Formulations</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Category Legend Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              {categoryDonutData.slice(0, 6).map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate">{c.name}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold ml-auto text-[11px]">
                    ₹{c.value}Cr
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100 dark:border-slate-800">
            Cardiovascular & Gastrointestinal formulations account for 44% of total dispensing
          </div>
        </div>

      </div>

      {/* Interactive Kendra Counter Simulator Section */}
      <SalesSimulator />

      {/* Tablet Sales Leaderboard Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>National Leaderboard #1–#65</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              National Tablet Sales & Demand Registry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any medicine row to open its clinical monograph and prescription details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter leaderboard..."
                value={leaderboardSearch}
                onChange={e => setLeaderboardSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={leaderboardSort}
              onChange={e => setLeaderboardSort(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
            >
              <option value="rank">Sort: Rank (#1 to #65)</option>
              <option value="units">Sort: Strips Sold</option>
              <option value="turnover">Sort: Annual Turnover</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4 text-right">Jan-Aushadhi MRP</th>
                <th className="py-3 px-4 text-right">Annual Strips Sold</th>
                <th className="py-3 px-4 text-right">Annual Turnover</th>
                <th className="py-3 px-4 text-center">Demand Velocity</th>
                <th className="py-3 px-4 text-center">12M Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredLeaderboard.slice(0, displayCount).map(med => {
                const trend = med.salesMetrics?.monthlyTrend12M || [1, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2];
                const maxTrend = Math.max(...trend, 1);
                
                return (
                  <tr
                    key={med.id}
                    onClick={() => setSelectedDetailMed(med)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #{med.salesMetrics?.nationalRank ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{med.genericName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{med.saltComposition}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {med.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#000080] dark:text-blue-400 font-bold">
                      #{med.pmbjpCode}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{med.janAushadhiMrp.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {((med.salesMetrics?.annualStripsSold || 0) / 100000).toFixed(1)} Lakhs
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(med.salesMetrics?.annualTurnoverCrores || 0).toFixed(1)} Cr
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        med.salesMetrics?.demandTag === 'Top Fast-Moving'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : med.salesMetrics?.demandTag === 'Chronic Essential'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}>
                        {med.salesMetrics?.demandTag || 'Steady Demand'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* 12-month inline SVG sparkline */}
                      <svg className="w-20 h-6 inline-block" viewBox="0 0 80 24">
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={trend.map((val, idx) => {
                            const x = (idx / 11) * 76 + 2;
                            const y = 22 - (val / maxTrend) * 18;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Button for Leaderboard Table */}
        {filteredLeaderboard.length > displayCount && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setDisplayCount(prev => prev + 50)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
            >
              Load More Medicines ({filteredLeaderboard.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Full Medicine Detail Modal */}
      <MedicineDetailModal
        medicine={selectedDetailMed}
        onClose={() => setSelectedDetailMed(null)}
      />
    </div>
  );
};
