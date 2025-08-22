import type {Metadata} from 'next';
import './globals.css';
import { DataProvider } from '@/context/data-context';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SQL Insights',
  description: 'Generado por Firebase Studio',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-body antialiased">
        <DataProvider>
          {children}
          <Toaster />
        </DataProvider>
      </body>
    </html>
  );
}
