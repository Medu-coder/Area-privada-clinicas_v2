import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarClock, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

interface AppointmentProps {
  appointment: {
    id: string
    date: string
    type: string
    doctor: string
  }
}

export function AppointmentCard({ appointment }: AppointmentProps) {
  const appointmentDate = parseISO(appointment.date)
  const formattedDate = format(appointmentDate, "d 'de' MMMM, yyyy", { locale: es })
  const formattedTime = format(appointmentDate, "HH:mm")

  return (
    <Card className="overflow-hidden border border-gray-100">
      <CardContent className="p-0">
        <div className="flex items-start justify-between p-4">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-berdu-base p-2">
              <CalendarClock className="h-5 w-5 text-berdu-text" />
            </div>
            <div>
              <h3 className="font-medium">{appointment.type}</h3>
              <p className="text-sm text-gray-500">{appointment.doctor}</p>
              <div className="mt-1 flex items-center">
                <p className="text-sm font-medium text-berdu-text">
                  {formattedDate} - {formattedTime}
                </p>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Modificar cita</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancelar cita</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
