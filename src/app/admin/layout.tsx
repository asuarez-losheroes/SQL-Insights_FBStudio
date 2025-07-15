
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cog,
  Server,
  Laptop,
  BookCopy,
  KeyRound,
  Layers,
  MapPin,
  Users,
  Activity,
  Building2,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const navItems = [
  { href: "/admin/sistemas-operativos", icon: Laptop, label: "Sistemas Operativos" },
  { href: "/admin/servidores", icon: Server, label: "Servidores" },
  { href: "/admin/motores", icon: Cog, label: "Motores de BD" },
  { href: "/admin/ediciones", icon: BookCopy, label: "Ediciones" },
  { href: "/admin/licencias", icon: KeyRound, label: "Licencias" },
  { href: "/admin/ambientes", icon: Layers, label: "Ambientes" },
  { href: "/admin/ubicaciones", icon: MapPin, label: "Ubicaciones" },
  { href: "/admin/grupos-soporte", icon: Users, label: "Grupos de Soporte" },
  { href: "/admin/estados-operativos", icon: Activity, label: "Estados Operativos" },
  { href: "/admin/companias", icon: Building2, label: "Compañías" },
];

const CustomResizeHandle = React.forwardRef<HTMLSpanElement>((props, ref) => {
    return (
      <span
        ref={ref}
        {...props}
        className="absolute top-0 right-[-5px] z-10 h-full w-[10px] cursor-col-resize group"
      >
        <span className="absolute top-0 right-1/2 h-full w-0.5 bg-transparent transition-colors group-hover:bg-border" />
      </span>
    );
});
CustomResizeHandle.displayName = 'CustomResizeHandle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [width, setWidth] = React.useState(280);

  return (
    <div className="flex min-h-screen w-full">
      <ResizableBox 
        width={width}
        height={Infinity}
        axis="x"
        minConstraints={[220, Infinity]}
        maxConstraints={[500, Infinity]}
        onResizeStop={(e, data) => {
          setWidth(data.size.width);
        }}
        className="hidden md:flex relative flex-col border-r bg-muted/40"
        handle={<CustomResizeHandle />}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Home className="h-6 w-6" />
              <span className="">Inicio</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </ResizableBox>
       <main className="flex flex-1 flex-col p-4 sm:gap-4 sm:py-4">
            {children}
        </main>
    </div>
  );
}
