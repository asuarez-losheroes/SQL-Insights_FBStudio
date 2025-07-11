'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UploadCloud } from 'lucide-react';

interface FileUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function FileUploadDialog({ isOpen, onOpenChange }: FileUploadDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Inventario de Base de Datos</DialogTitle>
          <DialogDescription>
            Sube un archivo .csv o .xlsx exportado desde MAP Toolkit.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-gray-100/25">
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-300">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white dark:bg-gray-900 font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
              >
                <span>Sube un archivo</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">CSV, XLSX hasta 10MB</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
