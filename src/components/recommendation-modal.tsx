'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';

import type { Database } from '@/lib/types';
import {
  getDatabaseRecommendations,
  type DatabaseRecommendationsOutput,
  type DatabaseRecommendationsInput,
} from '@/ai/flows/database-recommendations';
import { useToast } from '@/hooks/use-toast';

interface RecommendationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  database: Database | null;
}

export default function RecommendationModal({
  isOpen,
  onOpenChange,
  database,
}: RecommendationModalProps) {
  const [recommendations, setRecommendations] =
    React.useState<DatabaseRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen && database && !recommendations) {
      fetchRecommendations();
    }
    if (!isOpen) {
      // Reset state when modal is closed
      setRecommendations(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, database]);

  const fetchRecommendations = async () => {
    if (!database) return;
    setIsLoading(true);
    setError(null);
    try {
      const input: DatabaseRecommendationsInput = {
        nombre_bd: database.nombre_bd,
        instancia: database.instancia,
        servidor: database.servidor,
        ip: database.ip,
        motor: database.motor,
        version: database.version,
        edicion: database.edicion,
        licencia: database.licencia,
        ambiente: database.ambiente,
        critico: database.critico,
        monitoreado: database.monitoreado,
        respaldo: database.respaldo,
        contingencia: database.contingencia,
        ubicacion: database.ubicacion,
        grupo_soporte: database.grupo_soporte,
        cluster: database.cluster,
        estado_operativo: database.estado_operativo,
        compañia: database.compañia,
      };

      const result = await getDatabaseRecommendations(input);
      setRecommendations(result);
    } catch (e) {
      console.error(e);
      const errorMessage = 'No se pudieron obtener las recomendaciones de IA. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
       toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="pt-4 space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recomendaciones de IA para {database?.nombre_bd}</DialogTitle>
          <DialogDescription>
            Sugerencias impulsadas por IA para mantenimiento y actualizaciones de la base de datos seleccionada.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && renderLoadingState()}
          {error && !isLoading && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <Button variant="secondary" size="sm" onClick={fetchRecommendations} className="mt-2">
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {recommendations && !isLoading && (
            <div className="space-y-4">
               <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Evaluación General</AlertTitle>
                <AlertDescription>
                  {recommendations.recommendations.overallAssessment}
                </AlertDescription>
              </Alert>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="maintenance">
                  <AccordionTrigger>Tareas de Mantenimiento ({recommendations.recommendations.maintenanceTasks.length})</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pl-5">
                      {recommendations.recommendations.maintenanceTasks.map((item, index) => (
                        <li key={index}>
                          <strong>{item.task}:</strong> {item.reason}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="upgrades">
                  <AccordionTrigger>Tareas de Actualización ({recommendations.recommendations.upgradeTasks.length})</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pl-5">
                      {recommendations.recommendations.upgradeTasks.map((item, index) => (
                         <li key={index}>
                          <strong>{item.task}:</strong> {item.reason}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
