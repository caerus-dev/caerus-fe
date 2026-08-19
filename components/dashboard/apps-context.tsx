"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Box } from "lucide-react"

interface AppContextData {
  name: string
  href: string
  environments: string[]
  icon: any
}

interface AppsContextType {
  applications: AppContextData[]
  isAppsLoading: boolean
  refreshApps: () => Promise<void>
}

const AppsContext = createContext<AppsContextType | undefined>(undefined)

export function AppsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<AppContextData[]>([])
  const [isAppsLoading, setIsAppsLoading] = useState(true)

  const refreshApps = async () => {
    setIsAppsLoading(true)
    try {
      const res = await fetch("/api/applications")
      if (res.ok) {
        const data = await res.json()
        if (data && data.content) {
          const mapped = data.content.map((app: any) => ({
            name: app.name,
            href: `/dashboard/applications/${app.id}`, 
            environments: (app.environments || []).map((env: any) => env.name),
            icon: Box,
          }))
          setApplications(mapped)
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsAppsLoading(false)
    }
  }

  useEffect(() => {
    refreshApps()
  }, [])

  return (
    <AppsContext.Provider value={{ applications, isAppsLoading, refreshApps }}>
      {children}
    </AppsContext.Provider>
  )
}

export function useApps() {
  const context = useContext(AppsContext)
  if (context === undefined) {
    throw new Error("useApps must be used within an AppsProvider")
  }
  return context
}
