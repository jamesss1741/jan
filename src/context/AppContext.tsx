import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medicine, BasketItem, Reminder, UserSession, Language, Category } from '../types';
import { MEDICINES_DATA } from '../data/medicines';
import { TRANSLATIONS } from '../utils/translations';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  userSession: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
  replayLoginDemo: () => void;
  isReplayingDemo: boolean;
  completeDemoLoading: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  seniorMode: boolean;
  setSeniorMode: (enabled: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeTab: 'finder' | 'analytics' | 'basket' | 'scanner' | 'reminders';
  setActiveTab: (tab: 'finder' | 'analytics' | 'basket' | 'scanner' | 'reminders') => void;
  basket: BasketItem[];
  addToBasket: (medicine: Medicine, quantity?: number, dosage?: BasketItem['dosagePattern']) => void;
  removeFromBasket: (medicineId: string) => void;
  updateBasketItem: (medicineId: string, updates: Partial<BasketItem>) => void;
  clearBasket: () => void;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  selectedMedicineModal: Medicine | null;
  setSelectedMedicineModal: (med: Medicine | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (cat: Category | 'All') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'janaushadhi_user_v2',
  BASKET: 'janaushadhi_basket_v2',
  REMINDERS: 'janaushadhi_reminders_v2',
  LANG: 'janaushadhi_lang_v2',
  SENIOR: 'janaushadhi_senior_v2',
  THEME: 'janaushadhi_theme_v2',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Session state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isReplayingDemo, setIsReplayingDemo] = useState(false);

  // 2. Language & UI Preferences
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG) as Language;
      return saved && ['EN', 'HI', 'KN'].includes(saved) ? saved : 'EN';
    } catch {
      return 'EN';
    }
  });

  const [seniorMode, setSeniorModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SENIOR) === 'true';
    } catch {
      return false;
    }
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light'; // Default strictly light mode
    } catch {
      return 'light';
    }
  });

  // Apply theme class to document
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Storage quota or preference write error', e);
    }
  }, [theme]);

  // Apply senior mode class to document body
  useEffect(() => {
    try {
      if (seniorMode) {
        document.body.classList.add('senior-mode');
      } else {
        document.body.classList.remove('senior-mode');
      }
      localStorage.setItem(STORAGE_KEYS.SENIOR, String(seniorMode));
    } catch (e) {
      console.warn('Storage quota write error', e);
    }
  }, [seniorMode]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {}
  };

  const setSeniorMode = (enabled: boolean) => {
    setSeniorModeState(enabled);
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  // 3. Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'finder' | 'analytics' | 'basket' | 'scanner' | 'reminders'>('finder');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState('savings_desc');
  const [selectedMedicineModal, setSelectedMedicineModal] = useState<Medicine | null>(null);

  // 4. Basket State
  const [basket, setBasket] = useState<BasketItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BASKET);
      if (saved) {
        const parsed: { medId: string; qty: number; dosage: BasketItem['dosagePattern'] }[] = JSON.parse(saved);
        const restored: BasketItem[] = [];
        for (const item of parsed) {
          const med = MEDICINES_DATA.find(m => m.id === item.medId);
          if (med) {
            restored.push({
              medicine: med,
              quantityStrips: item.qty || 1,
              dosagePattern: item.dosage || '1-0-1',
              selectedBrandAlternative: med.brandedAlternatives[0]
            });
          }
        }
        return restored;
      }
      // Pre-seed sample basket for immediate delight
      const dolo = MEDICINES_DATA.find(m => m.id === 'pmbjp-612');
      const telma = MEDICINES_DATA.find(m => m.id === 'pmbjp-505');
      const glyco = MEDICINES_DATA.find(m => m.id === 'pmbjp-145');
      const pan = MEDICINES_DATA.find(m => m.id === 'pmbjp-133');
      
      const seed: BasketItem[] = [];
      if (telma) seed.push({ medicine: telma, quantityStrips: 1, dosagePattern: '1-0-0' });
      if (glyco) seed.push({ medicine: glyco, quantityStrips: 1, dosagePattern: '1-0-1' });
      if (pan) seed.push({ medicine: pan, quantityStrips: 1, dosagePattern: '1-0-0' });
      if (dolo) seed.push({ medicine: dolo, quantityStrips: 1, dosagePattern: 'As Needed' });
      return seed;
    } catch {
      return [];
    }
  });

  // Persist basket
  useEffect(() => {
    try {
      const compact = basket.map(b => ({
        medId: b.medicine.id,
        qty: b.quantityStrips,
        dosage: b.dosagePattern
      }));
      localStorage.setItem(STORAGE_KEYS.BASKET, JSON.stringify(compact));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [basket]);

  // 5. Reminders State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'rem-1',
          medicineName: 'Telmisartan 40mg (Code: 505)',
          pmbjpCode: '505',
          timeSlots: ['Morning'],
          specificTime: '08:00',
          dosage: '1 tablet with water',
          isActive: true,
          notes: 'Blood pressure control'
        },
        {
          id: 'rem-2',
          medicineName: 'Metformin 500mg SR (Code: 145)',
          pmbjpCode: '145',
          timeSlots: ['Morning', 'Night'],
          specificTime: '20:30',
          dosage: '1 tablet after dinner',
          isActive: true,
          notes: 'Take with food to minimize GI discomfort'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  // 6. Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth actions
  const login = (session: UserSession) => {
    setUserSession(session);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
    } catch {}
    showToast(`Welcome back, ${session.name}! Session initialized.`, 'success');
  };

  const logout = () => {
    setUserSession(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
    showToast('Signed out of Google session.', 'info');
  };

  const replayLoginDemo = () => {
    setIsReplayingDemo(true);
  };

  const completeDemoLoading = () => {
    setIsReplayingDemo(false);
  };

  // Basket actions
  const addToBasket = (medicine: Medicine, quantity: number = 1, dosage: BasketItem['dosagePattern'] = '1-0-1') => {
    setBasket(prev => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.medicine.id === medicine.id
            ? { ...item, quantityStrips: item.quantityStrips + quantity }
            : item
        );
      }
      return [...prev, {
        medicine,
        quantityStrips: quantity,
        dosagePattern: dosage,
        selectedBrandAlternative: medicine.brandedAlternatives[0]
      }];
    });
    showToast(`Added ${medicine.genericName.split(' ')[0]} to prescription basket!`, 'success');
  };

  const removeFromBasket = (medicineId: string) => {
    setBasket(prev => prev.filter(item => item.medicine.id !== medicineId));
    showToast('Item removed from basket', 'info');
  };

  const updateBasketItem = (medicineId: string, updates: Partial<BasketItem>) => {
    setBasket(prev => prev.map(item =>
      item.medicine.id === medicineId ? { ...item, ...updates } : item
    ));
  };

  const clearBasket = () => {
    setBasket([]);
    showToast('Prescription basket cleared', 'info');
  };

  // Reminder actions
  const addReminder = (remData: Omit<Reminder, 'id'>) => {
    const newRem: Reminder = {
      ...remData,
      id: 'rem-' + Date.now()
    };
    setReminders(prev => [newRem, ...prev]);
    showToast('New pill reminder scheduled!', 'success');
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast('Reminder deleted', 'info');
  };

  // Translation helper
  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return langDict[key] || TRANSLATIONS.EN[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        userSession,
        login,
        logout,
        replayLoginDemo,
        isReplayingDemo,
        completeDemoLoading,
        language,
        setLanguage,
        seniorMode,
        setSeniorMode,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        basket,
        addToBasket,
        removeFromBasket,
        updateBasketItem,
        clearBasket,
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        selectedMedicineModal,
        setSelectedMedicineModal,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        toasts,
        showToast,
        removeToast,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
