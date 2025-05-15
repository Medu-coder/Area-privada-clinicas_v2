import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { FileText, Download } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DocumentProps {
  document: {
    id: string
    name: string
    date: string
  }
}

export function DocumentCard({ document }: DocumentProps) {
  const documentDate = parseISO(document.date)
  const formattedDate = format(documentDate, "d MMM, yyyy", { locale: es })

  return (
    <Card className="overflow-hidden border border-gray-100">
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-berdu-base p-2">
                <FileText className="h-4 w-4 text-berdu-text" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{document.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-4 flex justify-end">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Download className="h-4 w-4 mr-1" />
              <span className="text-xs">Descargar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
