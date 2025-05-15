import type React from "react"
import { UserNav } from "@/components/user-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-berdu-base">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 bg-berdu-base">
        <div className="container grid gap-12 py-8">{children}</div>
      </main>
      <footer className="border-t bg-white py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-berdu-text">&copy; 2025 Berdú. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
