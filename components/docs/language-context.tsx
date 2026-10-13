"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type SupportedLanguage = "typescript" | "java" | "go"

interface DocsLanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

const DocsLanguageContext = createContext<DocsLanguageContextType>({
  language: "typescript",
  setLanguage: () => {},
})

export function DocsLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("typescript")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("caerus_docs_lang") as SupportedLanguage | null
      if (saved === "typescript" || saved === "java" || saved === "go") {
        setLanguageState(saved)
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, [])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    try {
      localStorage.setItem("caerus_docs_lang", lang)
    } catch {
      // Ignore localStorage errors
    }
  }

  return (
    <DocsLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </DocsLanguageContext.Provider>
  )
}

export function useDocsLanguage() {
  return useContext(DocsLanguageContext)
}
