"use client"

import { use, useEffect, useState } from "react"
import { ResourceForm } from "@/components/dashboard/resource-form"
import { Loader2 } from "lucide-react"

export default function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string; resourceId: string }>
}) {
  const { id, resourceId } = use(params)
  const [initialData, setInitialData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/shared-resource-templates/${resourceId}`)
        if (res.ok) {
          const data = await res.json()
          const mappedData = {
            name: data.name,
            description: data.description || "",
            mode: data.type === "UNITARY" ? ("unit" as const) : ("multiple" as const),
            ttl: data.defaultTtlMs !== undefined && data.defaultTtlMs !== null ? data.defaultTtlMs : 900000,
            saveMetadata: !!data.saveMetadata,
            conflictStrategy: data.conflictResolution ? (data.conflictResolution.toLowerCase() as any) : "fail",
            retryInterval: data.retryIntervalMs || 500,
            maxRetries: data.maxRetryCount || 3,
            idempotency: !!data.useIdempotency,
            notificationWebhookUrl: data.notificationWebhookUrl || "",
          }
          setInitialData(mappedData)
        } else {
          console.error("Failed to load resource template")
        }
      } catch (error) {
        console.error("Error loading resource template:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTemplate()
  }, [resourceId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró la plantilla de recurso o no tienes acceso.</p>
      </div>
    )
  }

  return (
    <ResourceForm 
      applicationId={id} 
      templateId={resourceId}
      initialData={initialData} 
      isEditing={true} 
    />
  )
}
