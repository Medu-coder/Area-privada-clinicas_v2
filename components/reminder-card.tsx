import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Bell } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface ReminderProps {
  reminder: {
    id: string
    title: string
    description: string
    date: string
  }
}

export function ReminderCard({ reminder }: ReminderProps) {
  const reminderDate = parseISO(reminder.date)
  const formattedDate = format(reminderDate, "d MMM", { locale: es })

  return (
    <Card className="overflow-hidden border border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="rounded-full bg-berdu-base p-1.5 mt-0.5">
            <Bell className="h-4 w-4 text-berdu-text" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{reminder.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{reminder.description}</p>
            <p className="text-xs font-medium text-berdu-text mt-1">{formattedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
