import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface TreatmentProps {
  treatment: {
    id: string
    name: string
    status: string
    progress: number
    startDate: string
    endDate?: string
  }
}

export function TreatmentCard({ treatment }: TreatmentProps) {
  const startDate = parseISO(treatment.startDate)
  const formattedStartDate = format(startDate, "d MMM, yyyy", { locale: es })

  const formattedEndDate = treatment.endDate ? format(parseISO(treatment.endDate), "d MMM, yyyy", { locale: es }) : null

  return (
    <Card className="overflow-hidden border border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{treatment.name}</h3>
              <Badge
                variant={treatment.status === "Completado" ? "default" : "outline"}
                className={treatment.status === "Completado" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              >
                {treatment.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Inicio: {formattedStartDate}
              {formattedEndDate && ` • Fin: ${formattedEndDate}`}
            </p>
          </div>
          {treatment.status === "Completado" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progreso</span>
            <span>{treatment.progress}%</span>
          </div>
          <Progress value={treatment.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
