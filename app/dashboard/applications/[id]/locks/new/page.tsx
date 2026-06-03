"use client"

import { use } from "react"
import { LockForm } from "@/components/dashboard/lock-form"

export default function NewLockPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <LockForm applicationId={id} />
  )
}
