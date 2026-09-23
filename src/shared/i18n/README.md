# Eating Helper - Internationalization (i18n) & Translation Guide

Welcome! This directory contains the complete multi-language system for Eating Helper.
Translations are strictly decoupled into standalone JSON files in `src/shared/i18n/locales/` so that translating or outsourcing to external translators requires no coding or build tools.

---

## 📁 Directory Layout

```
src/shared/i18n/
├── locales/
│   ├── pt.json       # Base Portuguese (PT-PT) translation
│   ├── pt-br.json    # Brazilian Portuguese (PT-BR) translation
│   ├── en.json       # English translation
│   └── es.json       # Spanish translation
├── languages.ts      # Supported language metadata registry (flags, names)
├── index.ts          # Core i18n resolution, typing, and automatic fallback
├── translations.ts   # Backward-compatible facade
└── README.md         # This translation guide
```

---

## 🌍 How to Add or Outsource a New Language

Adding a new language takes just **2 steps**:

### Step 1: Create the Locale JSON File
1. Copy `src/shared/i18n/locales/en.json` (or `pt.json`) and rename it to your target ISO 639-1 language code (e.g. `fr.json`, `de.json`, `it.json`).
2. Translate all the string values into the target language.
   - **Do NOT** modify the JSON keys.
   - Preserve special tags or placeholders (like numbers, units `g`, `kcal`, `ml`).
3. Place the file inside `src/shared/i18n/locales/`.

### Step 2: Register the Language in `languages.ts`
Open `src/shared/i18n/languages.ts` and add an entry to `SUPPORTED_LANGUAGES`:

```ts
import fr from './locales/fr.json'; // optional if registered in index.ts

{
  code: 'fr',
  name: 'Français',
  englishName: 'French',
  flag: '🇫🇷',
  promptInstruction: 'Français',
}
```

And in `src/shared/i18n/index.ts`, add the import to `RAW_TRANSLATIONS`:

```ts
import fr from './locales/fr.json';

const RAW_TRANSLATIONS: Record<string, unknown> = {
  pt,
  en,
  es,
  fr,
};
```

That's it! The app will automatically:
- Show French in the Header language picker and Settings modal dropdown.
- Instruct Gemini to answer in French in the AI prompt system.
- Fall back gracefully to `pt.json` for any keys that haven't been translated yet.

---

## 🛡️ Translation Safety & Fallback

- If an outsourced translation file is missing keys (e.g. during an ongoing update or partial translation), the system **automatically falls back** to the base Portuguese translation (`pt.json`).
- The application will **never crash** or render `undefined` for a missing key.
