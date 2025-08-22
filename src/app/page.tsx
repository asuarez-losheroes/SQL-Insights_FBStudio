import {
  Settings,
  PanelLeft,
  Briefcase,
  GitGraph,
  List,
  Home
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import DashboardClient from '@/components/dashboard-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GraphView from '@/components/graph-view';


const navItems = [
    { href: "/admin/sistemas", icon: Briefcase, label: "Sistemas" },
    { href: "/admin/ambientes", icon: List, label: "Ambientes" },
    { href: "/admin/servidores", icon: Settings, label: "Infraestructura" },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="flex items-center justify-center"
            >
              <Image src="/logo.svg" width={32} height={32} alt="Logo" />
              <span className="sr-only">SQL Insights</span>
            </Link>
            
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Panel</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Panel</TooltipContent>
              </Tooltip>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href="/admin/sistemas"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Administración</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Administración</TooltipContent>
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
                  <SheetHeader>
                    <SheetTitle>Navegación</SheetTitle>
                  </SheetHeader>
                  <nav className="grid gap-6 text-lg font-medium mt-4">
                      <Link
                          href="/"
                          className="flex items-center justify-center"
                      >
                          <Image src="/logo.svg" width={40} height={40} alt="Logo" />
                          <span className="sr-only">SQL Insights</span>
                      </Link>
                       <Link
                          href="/"
                          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                      >
                          <Home className="h-5 w-5" />
                          Panel Principal
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
          <h1 className="text-xl font-semibold">Panel de Sistemas</h1>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
            <Tabs defaultValue="list-view">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Sistemas de Negocio</h2>
                    <TabsList>
                        <TabsTrigger value="list-view"><List className="mr-2 h-4 w-4"/>Vista de Lista</TabsTrigger>
                        <TabsTrigger value="graph-view"><GitGraph className="mr-2 h-4 w-4"/>Vista de Grafo</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="list-view">
                    <DashboardClient />
                </TabsContent>
                <TabsContent value="graph-view" className="h-[75vh]">
                    <GraphView />
                </TabsContent>
            </Tabs>
        </main>
      </div>
    </div>
  );
}
