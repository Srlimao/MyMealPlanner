# 🥗 Eating Helper

> **Personal Nutrition Advisor & Daily Meal Tracker**  
> Tailored for Willian Backhaus's nutrition plan prescribed by Dr. Nélia Filipe, powered by Google Gemini AI and synced with `db.dunhas.com`.

---

## 📱 Overview

**Eating Helper** is a modern, responsive single-page web application (PWA/mobile-optimized) designed to run seamlessly on both phones and desktops. It is deployed to **GitHub Pages** with zero backend infrastructure, persisting data to a lightweight cloud JSON document store with offline-first synchronization.

---

## ✨ Key Features

### 1. 🤖 "What to Eat Next" AI Advisor
- **Time & History Aware**: Identifies the upcoming meal based on the current hour (*Pequeno Almoço* 09:30, *Almoço* 13:00, *Lanche* 17:00, *Jantar* 20:30, *Ceia SOS* 22:30) and cross-references today's logged meals to recommend the best balanced option from the nutritionist plan.
- **Rule Enforcement**: Prevents repeating restricted items (e.g., skips bread at snack if already eaten at breakfast).
- **1-Tap Log Shortcut**: Direct button to immediately log the recommended meal without retyping.
- **Conversational Assistant Drawer**: Side drawer to ask custom questions, handle fruit portion swaps, or get advice when dining out.

### 2. 📸 Multimodal Meal Logger & Review Flow
- **Photo Recognition**: Take a picture or upload an image of your plate. Gemini Multimodal decomposes the meal into individual food items, portions, calories, and macros.
- **Text Description**: Log meals in natural Portuguese or English (*"Comi 140g peito de frango grelhado com 4 colheres de arroz e salada de tomate"*).
- **Interactive Review Modal**: Review and tweak portions, calories, protein, carbs, and fat, plus confirm the balanced plate proportion before committing to your daily log.
- **Lean Storage**: Images are discarded after extraction to preserve the 5MB document payload limit.

### 3. 📊 Daily Dashboard & Habit Trackers
- **Live Macronutrient Bars**: Progress meters for daily Calories, Protein, Carbs, and Fats against personal targets.
- **2L Water Tracker**: 1-tap quick buttons (+250ml, +500ml, -250ml) towards the 2000ml goal.
- **Cola Zero Counter**: Tracks daily soda intake and displays warning alerts if exceeding the nutritionist's max 1/day commitment.
- **Balanced Plate Adherence**: Tracks meals adhering to the 1/2 vegetables + 1/4 carbs + 1/4 protein rule.
- **Date Navigation**: Browse past days or log meals retroactively.

### 4. 📋 Nutritionist Plan Viewer & Editor
- **Structured Accordions**: Clean presentation of meals, options, and rules from `Plano Alimentar Willian Backhaus 14-01.md`.
- **Fruit Equivalencies Table**: Searchable guide for fruit portion substitutions (banana, apple, strawberry, etc.).
- **In-App Markdown Editor**: Edit and update the plan anytime with local and cloud persistence.

### 5. 📈 7-Day Metrics & History
- 7-day calorie trend bar chart.
- Average daily calories, protein, and water consumption.
- Chronological daily history list with 1-click drill-down to any past date.

### 6. ⚡ Resilient Gemini Model Failover
- Supports `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, and `gemini-1.5-flash`.
- **Automatic Fallback on HTTP 429**: Gracefully switches to another Flash model if rate limits or quota exhaustion occurs.
- Dynamic model switcher in the header.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite 6, TypeScript
- **Styling**: Tailwind CSS v4, DM Sans typography (dark-first, high-density wireframe aesthetic)
- **Icons**: Lucide React
- **Testing**: Playwright multi-viewport testing (Mobile, Tablet, Desktop)
- **Database**: `https://db.dunhas.com/api` (SQLite document store with CORS and offline-first queue)
- **Hosting**: GitHub Pages via GitHub Actions

### Architecture Principles
- **Strict Vertical Slices**: Features isolated under `src/features/` (`advisor`, `dashboard`, `logger`, `plan`, `metrics`).
- **Strict File Size Limits**: Every source file is kept strictly under 300 lines of code.
- **Colocation**: Logic, markup, and Tailwind styling colocated within component files.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (recommended v22.x)
- npm 10+

### Installation & Local Development
```bash
# Clone the repository
git clone https://github.com/<your-username>/EatingHelper.git
cd EatingHelper

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```
Build output is saved to the `dist/` directory.

### Running Automated Playwright Tests
```bash
npm run test:e2e
```
Executes 25 responsiveness and overflow tests across 5 device viewports (Mobile Compact 360x640, iPhone 14 390x844, iPad 810x1080, Laptop 1280x800, and FHD 1920x1080).

---

## 🌐 GitHub Pages Deployment

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/EatingHelper.git
   git push -u origin main
   ```

2. **Configure Gemini API Key**:
   - Go to your GitHub repository: **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
   - Click **New repository secret**.
   - Name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API Key.

3. **Enable GitHub Pages**:
   - Go to **Settings** $\rightarrow$ **Pages**.
   - Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions**.
   - On every push to `main`, `.github/workflows/deploy.yml` builds and deploys your site automatically!

---

## 📄 License

Personal project for Willian Backhaus.
