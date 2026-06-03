"use client"

import { use } from "react"
import { ResourceForm } from "@/components/dashboard/resource-form"

export default function NewResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <ResourceForm applicationId={id} />
  )
}
