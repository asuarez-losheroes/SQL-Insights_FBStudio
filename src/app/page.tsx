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
  Building
} from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import DashboardClient from '@/components/dashboard-client';
import { Toaster } from "@/components/ui/toaster"

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
            
              <Collapsible>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                          <Settings className="h-5 w-5" />
                          <span className="sr-only">Administrar Datos</span>
                        </div>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">Administrar Datos</TooltipContent>
                </Tooltip>
                <CollapsibleContent className='flex flex-col items-center gap-4 py-2'>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/servidores" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><Server className="h-5 w-5" /><span className="sr-only">Servidores</span></Link></TooltipTrigger><TooltipContent side="right">Servidores</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/motores" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><Database className="h-5 w-5" /><span className="sr-only">Motores</span></Link></TooltipTrigger><TooltipContent side="right">Motores</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/ediciones" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><BookCopy className="h-5 w-5" /><span className="sr-only">Ediciones</span></Link></TooltipTrigger><TooltipContent side="right">Ediciones</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/licencias" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><KeyRound className="h-5 w-5" /><span className="sr-only">Licencias</span></Link></TooltipTrigger><TooltipContent side="right">Licencias</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/ambientes" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><Network className="h-5 w-5" /><span className="sr-only">Ambientes</span></Link></TooltipTrigger><TooltipContent side="right">Ambientes</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/ubicaciones" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><MapPin className="h-5 w-5" /><span className="sr-only">Ubicaciones</span></Link></TooltipTrigger><TooltipContent side="right">Ubicaciones</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/grupos-soporte" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><Users className="h-5 w-5" /><span className="sr-only">Grupos de Soporte</span></Link></TooltipTrigger><TooltipContent side="right">Grupos de Soporte</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/estados-operativos" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><Activity className="h-5 w-5" /><span className="sr-only">Estados Operativos</span></Link></TooltipTrigger><TooltipContent side="right">Estados Operativos</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Link href="/admin/companias" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"><Building className="h-5 w-5" /><span className="sr-only">Compañías</span></Link></TooltipTrigger><TooltipContent side="right">Compañías</TooltipContent></Tooltip>
                </CollapsibleContent>
              </Collapsible>
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
