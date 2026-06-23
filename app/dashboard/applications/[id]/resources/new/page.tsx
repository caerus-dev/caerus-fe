"use client"

import { use, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ResourceForm } from "@/components/dashboard/resource-form"
import { Loader2 } from "lucide-react"

function NewResourceFormContainer({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const envId = searchParams.get("envId") || ""
  return <ResourceForm applicationId={id} environmentId={envId} />
}

export default function NewResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <NewResourceFormContainer id={id} />
    </Suspense>
  )
}
