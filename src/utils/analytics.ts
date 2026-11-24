import { BasketItem, InteractionAlert } from '../types';

export function detectDrugInteractions(basket: BasketItem[]): InteractionAlert[] {
  const alerts: InteractionAlert[] = [];
  if (basket.length < 2) return alerts;

  // 1. Detect duplicate active salts
  const saltOccurrences: Record<string, string[]> = {};
  
  const knownSalts = [
    'Paracetamol',
    'Ibuprofen',
    'Aceclofenac',
    'Diclofenac',
    'Etoricoxib',
    'Pantoprazole',
    'Rabeprazole',
    'Omeprazole',
    'Esomeprazole',
    'Metformin',
    'Glimepiride',
    'Vildagliptin',
    'Dapagliflozin',
    'Telmisartan',
    'Amlodipine',
    'Atorvastatin',
    'Rosuvastatin',
    'Aspirin',
    'Montelukast',
    'Levocetirizine',
    'Cetirizine',
    'Fexofenadine',
    'Clopidogrel',
    'Pregabalin',
    'Thyroxine'
  ];

  for (const item of basket) {
    const medName = item.medicine.genericName || 'Medicine';
    const saltComp = (item.medicine.saltComposition || '').toLowerCase();

    for (const salt of knownSalts) {
      if (saltComp.includes(salt.toLowerCase())) {
        if (!saltOccurrences[salt]) {
          saltOccurrences[salt] = [];
        }
        saltOccurrences[salt].push(medName);
      }
    }
  }

  // Add duplicate salt alerts
  for (const [salt, meds] of Object.entries(saltOccurrences)) {
    const uniqueMeds = Array.from(new Set(meds));
    if (uniqueMeds.length > 1) {
      const isHighRisk = ['Paracetamol', 'Ibuprofen', 'Aceclofenac', 'Diclofenac', 'Metformin'].includes(salt);
      alerts.push({
        type: 'duplicate_salt',
        severity: isHighRisk ? 'high' : 'moderate',
        title: `Duplicate Salt: ${salt} detected across ${uniqueMeds.length} medicines`,
        description: `Taking multiple medications containing ${salt} simultaneously may inadvertently exceed the maximum daily therapeutic ceiling (e.g. max 4,000mg/day for Paracetamol can cause acute hepatotoxicity).`,
        medicinesInvolved: uniqueMeds
      });
    }
  }

  // 2. Clinical drug interactions
  const allSaltsCombined = basket.map(b => (b.medicine.saltComposition || '').toLowerCase()).join(' ');

  // Aspirin + NSAID interaction
  const hasAspirin = allSaltsCombined.includes('aspirin') || allSaltsCombined.includes('acetylsalicylic');
  const hasNsaid = allSaltsCombined.includes('ibuprofen') || allSaltsCombined.includes('aceclofenac') || allSaltsCombined.includes('diclofenac') || allSaltsCombined.includes('etoricoxib');

  if (hasAspirin && hasNsaid) {
    const involved = basket
      .filter(b => {
        const s = (b.medicine.saltComposition || '').toLowerCase();
        return s.includes('aspirin') || s.includes('ibuprofen') || s.includes('aceclofenac') || s.includes('diclofenac');
      })
      .map(b => b.medicine.genericName);

    alerts.push({
      type: 'clinical_interaction',
      severity: 'high',
      title: 'High Risk: Aspirin + NSAID Concurrent Co-Administration',
      description: 'Concomitant use of systemic NSAIDs with low-dose cardioprotective Aspirin significantly elevates upper gastrointestinal mucosal ulceration and bleeding risk while competitively blocking Aspirin’s antiplatelet action.',
      medicinesInvolved: Array.from(new Set(involved))
    });
  }

  // Quinolone antibiotic + Calcium / Iron chelation
  const hasQuinolone = allSaltsCombined.includes('ciprofloxacin') || allSaltsCombined.includes('levofloxacin');
  const hasMineral = allSaltsCombined.includes('calcium') || allSaltsCombined.includes('iron') || allSaltsCombined.includes('ferrous') || allSaltsCombined.includes('zinc');

  if (hasQuinolone && hasMineral) {
    const involved = basket
      .filter(b => {
        const s = (b.medicine.saltComposition || '').toLowerCase();
        return s.includes('ciprofloxacin') || s.includes('levofloxacin') || s.includes('calcium') || s.includes('iron') || s.includes('ferrous') || s.includes('zinc');
      })
      .map(b => b.medicine.genericName);

    alerts.push({
      type: 'clinical_interaction',
      severity: 'moderate',
      title: 'Absorption Chelation: Quinolone Antibiotic + Polyvalent Cation Mineral',
      description: 'Calcium, Iron, or Zinc supplements bind irreversibly with Fluoroquinolones (Ciprofloxacin/Levofloxacin) in the digestive tract, plummeting antibiotic absorption by up to 85%. Space doses by at least 2 to 4 hours.',
      medicinesInvolved: Array.from(new Set(involved))
    });
  }

  // Dual Antiplatelet / Anticoagulant bleeding caution
  const hasClopidogrel = allSaltsCombined.includes('clopidogrel');
  if (hasClopidogrel && hasNsaid) {
    const involved = basket
      .filter(b => {
        const s = (b.medicine.saltComposition || '').toLowerCase();
        return s.includes('clopidogrel') || s.includes('ibuprofen') || s.includes('aceclofenac');
      })
      .map(b => b.medicine.genericName);

    alerts.push({
      type: 'clinical_interaction',
      severity: 'high',
      title: 'High Hemorrhagic Risk: Clopidogrel + NSAID Anti-inflammatory',
      description: 'Combining Clopidogrel with non-steroidal anti-inflammatory drugs dramatically magnifies systemic bleeding risk. Requires clinical evaluation and physician monitoring.',
      medicinesInvolved: Array.from(new Set(involved))
    });
  }

  return alerts;
}

export function calculateBasketMetrics(basket: BasketItem[]) {
  let totalJanAushadhiMonthlyCost = 0;
  let totalBrandedMonthlyCost = 0;

  for (const item of basket) {
    const packSize = item.medicine.packSize > 0 ? item.medicine.packSize : 10;
    const jaUnitCost = item.medicine.janAushadhiMrp / packSize;
    
    // Primary or chosen branded alternative
    const brand = item.selectedBrandAlternative || (item.medicine.brandedAlternatives && item.medicine.brandedAlternatives[0]);
    const brandPack = brand && brand.packSize > 0 ? brand.packSize : packSize;
    const brandUnitCost = brand ? brand.mrp / brandPack : jaUnitCost * 3.5;

    // Monthly tabs requirement based on dosage pattern
    let monthlyTabs = 30; // default 1 tab/day
    switch (item.dosagePattern) {
      case '1-0-1':
        monthlyTabs = 60;
        break;
      case '1-1-1':
        monthlyTabs = 90;
        break;
      case '0-0-1':
      case '1-0-0':
        monthlyTabs = 30;
        break;
      case 'As Needed':
        monthlyTabs = 15;
        break;
    }

    // Multiply by number of strips or quantity multiplier
    const effectiveTabs = monthlyTabs * (item.quantityStrips > 0 ? item.quantityStrips : 1);
    
    totalJanAushadhiMonthlyCost += effectiveTabs * jaUnitCost;
    totalBrandedMonthlyCost += effectiveTabs * brandUnitCost;
  }

  const monthlySavings = Math.max(0, totalBrandedMonthlyCost - totalJanAushadhiMonthlyCost);
  const annualSavings = monthlySavings * 12;
  const savingsPercentage = totalBrandedMonthlyCost > 0 
    ? Math.round((monthlySavings / totalBrandedMonthlyCost) * 100) 
    : 0;

  return {
    totalJanAushadhiMonthlyCost: Math.round(totalJanAushadhiMonthlyCost * 100) / 100,
    totalBrandedMonthlyCost: Math.round(totalBrandedMonthlyCost * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
    savingsPercentage
  };
}
