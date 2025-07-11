import type {Metadata} from 'next';
import './globals.css';
import { DataProvider } from '@/context/data-context';

export const metadata: Metadata = {
  title: 'App de Firebase Studio',
  description: 'Generado por Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
