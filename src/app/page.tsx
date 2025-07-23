import {
  DatabaseZap,
  Home as HomeIcon,
  Settings,
  Server,
  Database,
  BookCopy,
  KeyRound,
  Network,
  MapPin,
  Users,
  Activity,
  Building,
  Monitor,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import DashboardClient from '@/components/dashboard-client';
import { Toaster } from "@/components/ui/toaster"

const navItems = [
    { href: "/admin/servidores", icon: Server, label: "Servidores" },
    { href: "/admin/sistemas-operativos", icon: Monitor, label: "Sistemas Operativos" },
    { href: "/admin/motores", icon: Database, label: "Motores" },
    { href: "/admin/ediciones", icon: BookCopy, label: "Ediciones" },
    { href: "/admin/licencias", icon: KeyRound, label: "Licencias" },
    { href: "/admin/ambientes", icon: Network, label: "Ambientes" },
    { href: "/admin/ubicaciones", icon: MapPin, label: "Ubicaciones" },
    { href: "/admin/grupos-soporte", icon: Users, label: "Grupos de Soporte" },
    { href: "/admin/estados-operativos", icon: Activity, label: "Estados Operativos" },
    { href: "/admin/companias", icon: Building, label: "Compañías" },
]

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <DatabaseZap className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Perspectivas SQL</span>
            </Link>
            
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    <HomeIcon className="h-5 w-5" />
                    <span className="sr-only">Panel</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Panel</TooltipContent>
              </Tooltip>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href="/admin/servidores"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Administrar Datos</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Administrar Datos</TooltipContent>
            </Tooltip>
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Configuración</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Configuración</TooltipContent>
              </Tooltip>
          </nav>
        </TooltipProvider>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="/"
                            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                        >
                            <DatabaseZap className="h-5 w-5 transition-all group-hover:scale-110" />
                            <span className="sr-only">SQL Insights</span>
                        </Link>
                         <Link
                            href="/"
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <HomeIcon className="h-5 w-5" />
                            Panel
                        </Link>
                        <p className="px-2.5 text-muted-foreground">Administración</p>
                        {navItems.map((item) => (
                             <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
          <h1 className="text-xl font-semibold">Panel de Perspectivas SQL</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <DashboardClient />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
