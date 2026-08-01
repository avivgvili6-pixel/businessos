import React, { createContext, useContext, useEffect, useState } from 'react'
import { storage } from '../utils/storage'
import { TRANSLATIONS } from './translations'

// Simple i18n with fallback to Hebrew for untranslated keys.
// Language + direction is persisted in localStorage and applied to document root.

const LANG_KEY = 'hfos:lang'
const I18nCtx = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => storage.get(LANG_KEY) || 'he')

  useEffect(() => {
    // Update document direction + lang attribute so CSS + assistive tech
    // switch correctly. Persist choice.
    const dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', dir)
    // body dir helps in cases where CSS uses body dir
    if (document.body) document.body.setAttribute('dir', dir)
    storage.set(LANG_KEY, lang)
  }, [lang])

  const setLang = (l) => setLangState(l === 'en' ? 'en' : 'he')

  const t = (key, fallback) => {
    const table = TRANSLATIONS[lang] || TRANSLATIONS.he
    if (table[key] != null) return table[key]
    // Fallback ladder: try Hebrew table, then explicit fallback, then key itself
    if (lang !== 'he' && TRANSLATIONS.he[key] != null) return TRANSLATIONS.he[key]
    if (fallback != null) return fallback
    return key
  }

  return (
    <I18nCtx.Provider value={{ lang, setLang, t, isRTL: lang === 'he' }}>
      {children}
    </I18nCtx.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

// Convenience: also exposed as `useT` for pure translation-function consumers.
export function useT() {
  return useI18n().t
}
