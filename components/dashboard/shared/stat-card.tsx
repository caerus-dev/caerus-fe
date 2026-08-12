import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  valueColor?: string
}

export function StatCard({ title, value, icon: Icon, valueColor = 'text-primary' }: StatCardProps) {
  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-bold ${valueColor}`}>
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
