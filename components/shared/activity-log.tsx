"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface ActivityLogEntry {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

interface ActivityLogProps {
  activities: ActivityLogEntry[]
  title?: string
}

export default function ActivityLog({ activities, title = "Activity Log" }: ActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={20} />
          {title}
        </CardTitle>
        <CardDescription>Aktivitas sistem terbaru</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada aktivitas</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                  {activity.details && <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
