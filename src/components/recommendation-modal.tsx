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
        company: database.Company,
        location: database.Location,
        operationalStatus: database['Operational Status'],
        backedUp: database['Backed up'],
        contingency: database.Contingency,
        environment: database.Environment,
        critical: database.Critical,
        monitored: database.Monitored,
        ipAddress: database['IP Address'],
        supportGroup: database['Support Group'],
        nameInstance: database['Name Instance'],
        bdName: database['BD Name'],
        nameServer: database['Name Server'],
        isClustered: database['Is Clustered'],
        class: database.Class,
        edition: database.Edition,
        engine: database.Engine,
        license: database.License,
      };

      const result = await getDatabaseRecommendations(input);
      setRecommendations(result);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch AI recommendations. Please try again.');
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch AI recommendations. Please try again.",
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
          <DialogTitle>AI Recommendations for {database?.['BD Name']}</DialogTitle>
          <DialogDescription>
            AI-powered suggestions for maintenance and upgrades for the selected database.
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
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {recommendations && !isLoading && (
            <div className="space-y-4">
               <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Overall Assessment</AlertTitle>
                <AlertDescription>
                  {recommendations.recommendations.overallAssessment}
                </AlertDescription>
              </Alert>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="maintenance">
                  <AccordionTrigger>Maintenance Tasks ({recommendations.recommendations.maintenanceTasks.length})</AccordionTrigger>
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
                  <AccordionTrigger>Upgrade Tasks ({recommendations.recommendations.upgradeTasks.length})</AccordionTrigger>
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
