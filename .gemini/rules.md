# Eating Helper - AI Agent Rules & Workspace Directives

## 1. Domain Context
This repository contains the **Eating Helper** personal nutrition application for Willian Backhaus, designed around the nutrition plan prescribed by Dr. Nélia Filipe (`Plano Alimentar Willian Backhaus 14-01.md`).

### Nutrition Rules:
- **Pequeno Almoço (09:30)**: Skyr/protein yogurt + fruit; or 0% Greek yogurt + oats/corn flakes + cinnamon; or whole-grain rye bread (50g) + light cheese/cottage + skim milk/yogurt.
- **Almoço (13:00)**: 1/2 plate vegetables/salad, 1/4 carbs (rice, pasta, potato, legumes), 1/4 lean protein (140g white meat or 150g lean fish or 2 eggs) + 1 fruit + 1 tbsp olive oil.
- **Lanche (17:00 Pré-treino)**: Greek yogurt + fruit + oats + honey; or 1 egg + 3 crackers/tortilhas + fruit; or bread (50g) + cheese + milk (only if bread wasn't eaten at breakfast). Post-workout: Casein.
- **Jantar (20:30)**: Potato-free vegetable soup + mini-plate (1/4 veggies, 1/2 protein = 120g meat/130g fish/tuna/salmon/2 eggs, 1/2 carbs = 80g legumes) + 1 tbsp olive oil.
- **Ceia SOS (22:30)**: Milk with decaf coffee + 2-3 crackers; or skim yogurt + fruit.
- **Daily Commitments**: 2L water daily, max 1 diet soda (Cola Zero) per day, ordering food max 2x/week (1x h3 without fries, 1x simple fast food), sleep earlier.

---

## 2. Core Architectural Directives

### A. Vertical Slicing
- Group code strictly by feature domain under `src/features/` (`advisor`, `dashboard`, `logger`, `plan`, `metrics`).
- Keep shared utilities and domain schemas under `src/shared/`.
- Never split a feature across horizontal global folders like `/controllers`, `/services`, or `/views`.

### B. Strict File Size Limit (< 300 Lines)
- **Mandatory**: No single source file must exceed 300 lines of code.
- If a file approaches 300 lines, immediately extract sub-components or helpers within the same feature folder.

### C. Colocation & Design System
- Maintain markup, logic, and Tailwind utility classes in the exact same file.
- Strictly adhere to the universal DM Sans + Tailwind CSS v4 design system:
  - Dark-first aesthetic (`bg-neutral-950`, `bg-neutral-900`).
  - High-contrast structural borders (`border-neutral-800`, `border-neutral-700/60`).
  - Containers: `rounded-xl` and `rounded-2xl`.
  - Interactive buttons/chips: `rounded-xl` / `rounded-lg`.
  - Accent colors: `emerald-500` for positive/health states, `amber-500`/`sky-500` for metrics, `rose-500` for warnings.

---

## 3. Storage & AI Integrations

### Database (`db.dunhas.com`)
- Endpoint: `https://db.dunhas.com/api`
- Key header: `x-api-key: 1b4a19fdc1eda3f481543b0f25b01ab428e0f6467ad7c9c1`
- Collections:
  - `eating_logs`: Keyed by date `YYYY-MM-DD`.
  - `food_plan`: Document `active_plan`.
  - `user_settings`: Document `preferences`.
- Always maintain offline-first caching via `localStorage` with background synchronization queue.

### Gemini AI Engine
- Model hierarchy: `gemini-2.5-flash` $\rightarrow$ `gemini-2.0-flash` $\rightarrow$ `gemini-2.0-flash-lite` $\rightarrow$ `gemini-1.5-flash`.
- Always handle HTTP 429 quota exhaustion with automatic graceful failover to the next Flash model in sequence.
- Support `import.meta.env.VITE_GEMINI_API_KEY` with client-side override in `localStorage`.
- Discard images after nutritional analysis to keep database payload small.

---

## 4. Verification & Testing Protocol
Before committing any changes:
1. Run `npm run build` (`tsc && vite build`) to verify strict TypeScript types and asset bundling.
2. Run `npm run test:e2e` (`playwright test`) to verify responsiveness across Mobile Compact (360x640), iPhone 14, iPad, Laptop, and FHD Desktop, asserting zero horizontal overflow (`scrollWidth <= window.innerWidth`).
