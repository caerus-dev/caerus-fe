"use client"

import { use, useEffect, useState } from "react"
import { LockForm, LockFormValues } from "@/components/dashboard/lock-form"
import { Loader2 } from "lucide-react"

export default function EditLockPage({
  params,
}: {
  params: Promise<{ id: string; lockId: string }>
}) {
  const { id, lockId } = use(params)
  const [initialData, setInitialData] = useState<LockFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLock = async () => {
      try {
        const res = await fetch(`/api/distributed-lock-templates/${lockId}`)
        if (!res.ok) throw new Error("No se pudo cargar el lock")
        const data = await res.json()

        setInitialData({
          namespace: data.namespace,
          description: data.description || "",
          type: data.lockType === "EXCLUSIVE" ? "exclusive" : "read-write",
          deadlockStrategy: data.deadlockResolutionStrategy === "ALERT" ? "alert" : "kill",
          acquisitionStrategy: data.conflictResolution === "FAIL" ? "fail" : data.conflictResolution === "RETRY" ? "retry" : "queue",
          retryInterval: data.retryIntervalMs || 100,
          maxRetries: data.maxRetryCount || 5,
          requireFencingToken: data.fencingTokenRequired || false,
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLock()
  }, [lockId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !initialData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive font-medium mb-4">{error || "Lock no encontrado"}</p>
      </div>
    )
  }

  return (
    <LockForm 
      applicationId={id} 
      lockId={lockId}
      initialData={initialData} 
      isEditing 
    />
  )
}
