"use client"

import { use } from "react"
import { ResourceForm } from "@/components/dashboard/resource-form"

export default function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string; resourceId: string }>
}) {
  const { id, resourceId } = use(params)
  
  // Mock finding the resource by id
  // In a real app we'd fetch it or get it from a global store
  const initialData = {
    name: "seat_reservation",
    description: "Reservation system for multiplex cinema seats",
    mode: "multiple" as const,
    ttl: 15,
    saveMetadata: true,
    conflictStrategy: "retry" as const,
    retryInterval: 500,
    maxRetries: 3,
    idempotency: true,
  }

  return (
    <ResourceForm 
      applicationId={id} 
      initialData={initialData} 
      isEditing={true} 
    />
  )
}
