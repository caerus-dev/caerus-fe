"use client"

import { use } from "react"
import { LockForm, LockFormValues } from "@/components/dashboard/lock-form"

export default function EditLockPage({
  params,
}: {
  params: Promise<{ id: string; lockId: string }>
}) {
  const { id, lockId } = use(params)
  
  // Mock finding the lock by id
  // In a real app we'd fetch it or get it from a global store
  const initialData: LockFormValues = {
    namespace: "payment_processor",
    description: "Exclusive lock for processing Stripe payments to prevent double charging",
    type: "exclusive",
    ttl: 30,
    deadlockStrategy: "alert",
    webhookUrl: "https://api.acme.com/webhooks/deadlocks",
    acquisitionStrategy: "retry",
    retryInterval: 200,
    maxRetries: 5,
    requireFencingToken: true,
  }

  return (
    <LockForm 
      applicationId={id} 
      initialData={initialData} 
      isEditing={true} 
    />
  )
}
