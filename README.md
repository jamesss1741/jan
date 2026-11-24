# Jan Aushadhi (PMBJP) • Official Generic Bioequivalence & Savings Portal

An official, responsive Progressive Web Application (PWA) and Android hybrid app built for **Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)**, Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers, Government of India.

---

## 🚀 Key Features

1. **Complete 2,453 Formulations Catalog:**
   - Ingests the full official PMBJP drug master dataset with authentic Drug Codes, Pack Sizes, MRPs, and active therapeutic salts.
   - Smooth 30-item slice pagination for 60fps scrolling performance on mobile devices.
2. **Brand-to-Generic Bioequivalence Switcher:**
   - Search by expensive market brand name (e.g., Dolo 650, Augmentin, Pan-D, Telma 40) to instantly find verified PMBJP generic alternatives saving 50% to 90%.
3. **Prescription Basket & Financial Savings Calculator:**
   - Calculates monthly and 12-month chronic medicine savings.
   - Generates official PMBJP printable PDF shopping slips and text summaries for Kendra pharmacists.
4. **Clinical Drug-Drug & Duplicate Salt Interaction Guard:**
   - Detects concurrent NSAID toxicity, duplicate active salts, and chelation absorption warnings.
5. **National Tablet Sales & Demand Benchmarks:**
   - Recharts-powered analytics reflecting official benchmarks across 20,149+ active PMBJP Kendras nationwide.
6. **Triple-Dial Health Emergency Hub:**
   - One-tap access to 108 (Ambulance), 1075 (Health Desk), 1800-180-8080 (PMBJP Toll-Free), and 14567 (Elderline).
7. **Multi-Language & Accessibility Support:**
   - Full translation support for English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ).
   - Senior Citizen Mode (A+ Large Text scale) and Light/Dark OLED theme toggle.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS + CSS `clamp()` fluid typography
- **Animations:** Framer Motion
- **Icons & Charts:** Lucide-React & Recharts
- **PDF Generation:** jsPDF
- **Audio Synthesis:** Web Audio API (offline reminder tones)

---

## 📦 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 📱 How to Generate Android APK (Capacitor)

```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor configuration
npx cap init "Jan Aushadhi PMBJP" "gov.in.pmbjp.janaushadhi" --web-dir dist

# 3. Build web bundle & sync to Android
npm run build
npx cap add android
npx cap sync

# 4. Open in Android Studio or compile APK via Gradle
cd android
./gradlew assembleDebug
# Generated APK will be in: android/app/build/outputs/apk/debug/app-debug.apk
```
