import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PatientDashboard } from "@/components/patient-dashboard"

// Simulación de autenticación - en producción usaría NextAuth o similar
const isAuthenticated = true
const patientData = {
  name: "María García",
  email: "maria.garcia@ejemplo.com",
  appointments: [
    {
      id: "1",
      date: "2025-05-20T10:00:00",
      type: "Revisión general",
      doctor: "Dra. Sánchez",
    },
    {
      id: "2",
      date: "2025-06-15T16:30:00",
      type: "Limpieza dental",
      doctor: "Dr. Martínez",
    },
  ],
  documents: [
    { id: "1", name: "Consentimiento tratamiento", date: "2025-01-15" },
    { id: "2", name: "Radiografía panorámica", date: "2025-02-10" },
  ],
  treatments: [
    {
      id: "1",
      name: "Ortodoncia",
      status: "En progreso",
      progress: 65,
      startDate: "2024-11-10",
    },
    {
      id: "2",
      name: "Blanqueamiento",
      status: "Completado",
      progress: 100,
      startDate: "2024-08-05",
      endDate: "2024-09-15",
    },
  ],
  invoices: [
    { id: "1", name: "Factura Mayo 2025", amount: 120, date: "2025-05-05" },
    { id: "2", name: "Factura Abril 2025", amount: 85, date: "2025-04-05" },
  ],
  reminders: [
    {
      id: "1",
      title: "Revisión semestral",
      description: "Programa tu revisión de rutina",
      date: "2025-11-14",
    },
    {
      id: "2",
      title: "Cambio de cepillo",
      description: "Es momento de cambiar tu cepillo dental",
      date: "2025-05-30",
    },
  ],
}

export default function DashboardPage() {
  if (!isAuthenticated) {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Panel de Paciente" text="Gestiona tus citas, tratamientos y documentos" />
      <PatientDashboard patient={patientData} />
    </DashboardShell>
  )
}
