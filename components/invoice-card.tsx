import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Receipt, Download } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface InvoiceProps {
  invoice: {
    id: string
    name: string
    amount: number
    date: string
  }
}

export function InvoiceCard({ invoice }: InvoiceProps) {
  const invoiceDate = parseISO(invoice.date)
  const formattedDate = format(invoiceDate, "d MMM, yyyy", { locale: es })

  return (
    <Card className="overflow-hidden border border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-berdu-base p-1.5">
              <Receipt className="h-4 w-4 text-berdu-text" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{invoice.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
              <p className="text-xs font-medium mt-1">{invoice.amount}€</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
            <span className="sr-only">Descargar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
