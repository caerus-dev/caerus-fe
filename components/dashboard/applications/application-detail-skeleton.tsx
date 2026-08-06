import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header section */}
      <div className="space-y-4">
        {/* Back link skeleton */}
        <Skeleton className="h-4 w-36 rounded" />

        {/* Title, Badge, Select and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <Skeleton className="h-8 w-full sm:w-[190px] rounded-md" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        </div>

        {/* App description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full max-w-xl rounded" />
          <Skeleton className="h-4 w-2/3 max-w-md rounded" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card/50 border-border p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-12 rounded" />
          </Card>
        ))}
      </div>

      {/* Environment Description Banner Skeleton */}
      <Skeleton className="h-[38px] w-full rounded-lg" />

      {/* Tabs & Content Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Card className="p-6 border-border space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36 rounded" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </Card>
      </div>
    </div>
  )
}
