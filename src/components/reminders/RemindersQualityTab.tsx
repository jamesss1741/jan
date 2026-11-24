import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MEDICINES_DATA } from '../../data/medicines';
import { Reminder } from '../../types';
import {
  BellRing, BellOff, Volume2, Plus, Trash2, Check,
  ShieldCheck, Award, FlaskConical, CheckCircle2, ChevronDown, ChevronUp, PhoneCall, HeartPulse
} from 'lucide-react';

const FAQS = [
  {
    q: 'Are Jan-Aushadhi (PMBJP) generic medicines really as effective as branded medicines?',
    a: 'Yes, 100%. PMBJP generic medicines contain the exact same active pharmaceutical ingredients (API) in identical dosage strength and formulation standards as innovator brands. They are tested for in-vivo bioequivalence in NABL-accredited laboratories to ensure equal therapeutic efficacy.'
  },
  {
    q: 'Why are Jan-Aushadhi medicines 50% to 90% cheaper than branded drugs?',
    a: 'Branded pharmaceutical firms spend astronomical budgets on marketing, medical representative incentives, physician promotion, and patent monopolies. PMBI procures generic medicines via transparent central bulk tenders directly from WHO-GMP manufacturers, eliminating marketing overhead and passing direct savings to Indian citizens.'
  },
  {
    q: 'Can a private chemist or hospital refuse to honor generic prescriptions?',
    a: 'Under National Medical Commission (NMC) guidelines, registered medical practitioners are encouraged to prescribe generic names in clear legible handwriting. Citizens have the legal right to purchase equivalent generic formulations by salt composition at any PMBJP Kendra.'
  },
  {
    q: 'How does PMBJP verify quality before medicines reach pharmacy counters?',
    a: 'Every production batch undergoes a mandatory 2-tier quality protocol: First, internal quality testing by the WHO-GMP manufacturer; Second, independent blind sample verification by government-empanelled NABL accredited laboratories before batch release.'
  }
];

export const RemindersQualityTab: React.FC = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder, showToast, t } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(MEDICINES_DATA[0].id);
  const [customMedName, setCustomMedName] = useState('');
  const [timeSlots, setTimeSlots] = useState<('Morning' | 'Afternoon' | 'Night')[]>(['Morning']);
  const [specificTime, setSpecificTime] = useState('08:00');
  const [dosage, setDosage] = useState('1 tablet after meals');
  const [notes, setNotes] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Synthesized Web Audio API Gentle Chime Test
  const handleTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.85);

      showToast('Pill reminder chime tested successfully!', 'success');
    } catch {
      showToast('Audio chime played (simulated browser audio)', 'info');
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const med = MEDICINES_DATA.find(m => m.id === selectedMedId);
    const medName = customMedName.trim() || (med ? `${med.genericName} (Code: ${med.pmbjpCode})` : 'Daily Prescription');

    addReminder({
      medicineName: medName,
      pmbjpCode: med?.pmbjpCode,
      timeSlots,
      specificTime,
      dosage,
      isActive: true,
      notes: notes.trim()
    });

    setShowAddForm(false);
    setCustomMedName('');
    setNotes('');
  };

  const toggleSlot = (slot: 'Morning' | 'Afternoon' | 'Night') => {
    if (timeSlots.includes(slot)) {
      if (timeSlots.length > 1) {
        setTimeSlots(timeSlots.filter(s => s !== slot));
      }
    } else {
      setTimeSlots([...timeSlots, slot]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Pill Reminder Manager Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <BellRing className="w-4 h-4" />
              <span>Adherence & Dosage Schedules</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t('pillRemindersTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('pillRemindersSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTestChime}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('testNotification')}</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewReminder')}</span>
            </button>
          </div>
        </div>

        {/* Add Reminder Inline Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleCreateReminder} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule New Pill Reminder</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select PMBJP Generic Medicine
                </label>
                <select
                  value={selectedMedId}
                  onChange={e => setSelectedMedId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  {MEDICINES_DATA.map(m => (
                    <option key={m.id} value={m.id}>
                      #{m.pmbjpCode} - {m.genericName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Custom Medicine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vitamin D3 Sachet"
                  value={customMedName}
                  onChange={e => setCustomMedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Time Slot Frequency
                </label>
                <div className="flex gap-2">
                  {(['Morning', 'Afternoon', 'Night'] as const).map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                        timeSlots.includes(slot)
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Alarm Time & Dosage Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={specificTime}
                    onChange={e => setSpecificTime(e.target.value)}
                    className="w-28 px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 1 tablet with water"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
              >
                Save Reminder
              </button>
            </div>
          </form>
        )}

        {/* Reminders List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {reminders.map(rem => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                rem.isActive
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {rem.specificTime}
                  </span>
                  <div className="flex gap-1">
                    {rem.timeSlots.map(s => (
                      <span key={s} className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {rem.medicineName}
                </h4>
                <div className="text-xs text-slate-500">
                  {rem.dosage} {rem.notes ? `• ${rem.notes}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleReminder(rem.id)}
                  className={`p-2 rounded-xl transition ${
                    rem.isActive
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                  title={rem.isActive ? 'Disable reminder' : 'Enable reminder'}
                >
                  {rem.isActive ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHO-GMP & NABL 4-Step Quality Assurance Explorer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Government Quality Guarantee</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {t('qualityHubTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('qualityHubSubtitle')}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              WHO-GMP Plants
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manufactured exclusively in World Health Organization Good Manufacturing Practices approved facilities.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              NABL Lab Testing
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every production batch is independently evaluated at National Accreditation Board for Testing Laboratories.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              In-Vivo Equivalence
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Strict dissolution profile match ensuring bioequivalent absorption and therapeutic clinical response.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Barcoded Blisters
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Centralized IT tracking across 20,149+ Kendras with tamper-evident moisture-sealed packaging.
            </p>
          </div>
        </div>

        {/* PMBJP Official Toll-Free Helpline Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">National PMBJP Toll-Free Helpline</div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 tracking-wider">
                1800-180-8080
              </div>
            </div>
          </div>

          <a
            href="tel:18001808080"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition text-center"
          >
            Call National Helpline
          </a>
        </div>
      </div>

      {/* Citizen FAQ Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {t('faqTitle')}
        </h3>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {faq.q}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 text-[11px] leading-relaxed text-center border border-slate-200 dark:border-slate-800">
        {t('disclaimer')}
      </div>
    </div>
  );
};
