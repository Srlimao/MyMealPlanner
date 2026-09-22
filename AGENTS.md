# AGENTS.md

Welcome to the **Eating Helper** repository. This document defines the engineering standards, architecture, and behavioral guidelines for all AI agents working on this codebase.

## 🎯 Project Overview
Eating Helper is a mobile-optimized personal nutrition assistant built with **React 18, Vite 6, TypeScript, and Tailwind CSS v4**. It assists Willian in following his nutritionist plan by:
1. Suggesting the next meal based on time of day and what has already been eaten.
2. Logging meals via multimodal photo analysis (Gemini) or natural text with an editable review modal.
3. Tracking daily macronutrients, water (2L target), soda limit (max 1/day), and plate balance adherence.
4. Persisting data to `https://db.dunhas.com/api` (SQLite document store) with offline-first synchronization.

---

## 📐 Architecture & Standards

### 1. Vertical Slicing
Group code strictly by feature domain inside `src/features/`:
- `src/features/advisor/`: AI next meal recommendation and chat drawer.
- `src/features/dashboard/`: Daily timeline, macro meters, habit counters, and meal cards.
- `src/features/logger/`: Multimodal camera/photo and text meal logging with review modal.
- `src/features/plan/`: Plan accordion viewer, fruit equivalencies table, and markdown editor.
- `src/features/metrics/`: 7-day trend bar charts and historical log list.
- `src/shared/`: Shared services (`geminiService.ts`, `jsonDbService.ts`), types, i18n dictionaries, and layout components.

### 2. Strict File Size Limit (< 300 Lines)
- **Hard Rule**: No single source file may exceed 300 lines of code.
- If a file approaches 300 lines, extract focused sub-components or helpers within that feature folder.

### 3. Design System & Styling
- Follow the **DM Sans + Tailwind CSS v4** design system:
  - Font: Google Font `DM Sans`. Use `tabular-nums` or `font-mono` for metrics/macros.
  - Background: Dark-first `bg-neutral-950` with card backgrounds `bg-neutral-900/70`.
  - Borders: `border-neutral-800` or `border-neutral-800/80`.
  - Containers: `rounded-2xl` or `rounded-xl`.
  - Colors: Emerald (`emerald-500`) for primary positive status; Sky/Amber for metrics; Rose for warnings.
- Colocate markup, logic, and Tailwind classes in component files. Avoid separate CSS files.

### 4. Resilient Gemini & Gemma API Integration
- Supported models: `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemma-4-26b-a4b-it`, `gemini-1.5-flash`.
- Always handle HTTP 429 quota exhaustion with automatic failover to the next Flash model in sequence.
- Support `import.meta.env.VITE_GEMINI_API_KEY` with client-side override in `localStorage`.
- Discard images after nutritional analysis to keep database payload small.

---

## 🧪 Verification Commands

When making modifications, agents MUST run these verification steps:

```bash
# 1. Typecheck and build
npm run build

# 2. Run Playwright multi-viewport responsiveness tests
npm run test:e2e
```

All 25 Playwright tests must pass, verifying that:
- `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow or clipping).
- Modals, drawers, and cards fit cleanly across Mobile Compact (360x640), iPhone 14, iPad, Laptop, and Desktop.
