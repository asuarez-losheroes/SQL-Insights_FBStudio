'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-driven recommendations for database maintenance or upgrades.
 *
 * - `getDatabaseRecommendations`: A function that takes database data as input and returns AI-driven recommendations.
 * - `DatabaseRecommendationsInput`: The input type for the `getDatabaseRecommendations` function.
 * - `DatabaseRecommendationsOutput`: The return type for the `getDatabaseRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DatabaseRecommendationsInputSchema = z.object({
  company: z.string().describe('El nombre de la empresa.'),
  location: z.string().describe('La ubicación de la base de datos.'),
  operationalStatus: z.string().describe('El estado operativo de la base de datos.'),
  backedUp: z.string().describe('Si la base de datos está respaldada.'),
  contingency: z.string().describe('El estado de contingencia de la base de datos.'),
  environment: z.string().describe('El entorno de la base de datos (p. ej., Producción, Desarrollo).'),
  critical: z.string().describe('Si la base de datos es crítica.'),
  monitored: z.string().describe('Si la base de datos está monitoreada.'),
  ipAddress: z.string().describe('La dirección IP del servidor de la base de datos.'),
  supportGroup: z.string().describe('El grupo de soporte responsable de la base de datos.'),
  nameInstance: z.string().describe('El nombre de la instancia de la base de datos.'),
  bdName: z.string().describe('El nombre de la base de datos.'),
  nameServer: z.string().describe('El nombre del servidor de la base de datos.'),
  isClustered: z.string().describe('Si la base de datos está en clúster.'),
  class: z.string().describe('La clase de la base de datos.'),
  edition: z.string().describe('La edición de la base de datos.'),
  engine: z.string().describe('El motor de la base de datos.'),
  license: z.string().describe('La licencia de la base de datos.'),
});
export type DatabaseRecommendationsInput = z.infer<typeof DatabaseRecommendationsInputSchema>;

const MaintenanceTaskSchema = z.object({
  task: z.string().describe('Tarea de mantenimiento específica a realizar.'),
  reason: z.string().describe('Justificación de la necesidad de esta tarea.'),
});

const UpgradeTaskSchema = z.object({
  task: z.string().describe('Tarea de actualización específica a realizar.'),
  reason: z.string().describe('Justificación de la necesidad de esta tarea.'),
});

const DatabaseRecommendationsOutputSchema = z.object({
  recommendations: z.object({
    maintenanceTasks: z.array(MaintenanceTaskSchema).describe('Recomendaciones para tareas de mantenimiento de la base de datos.'),
    upgradeTasks: z.array(UpgradeTaskSchema).describe('Recomendaciones para tareas de actualización de la base de datos.'),
    overallAssessment: z.string().describe('Evaluación general de la salud de la base de datos y recomendaciones.'),
  }).describe('Recomendaciones impulsadas por IA para el mantenimiento y actualización de bases de datos.'),
});
export type DatabaseRecommendationsOutput = z.infer<typeof DatabaseRecommendationsOutputSchema>;

export async function getDatabaseRecommendations(input: DatabaseRecommendationsInput): Promise<DatabaseRecommendationsOutput> {
  return databaseRecommendationsFlow(input);
}

const databaseRecommendationsPrompt = ai.definePrompt({
  name: 'databaseRecommendationsPrompt',
  input: {schema: DatabaseRecommendationsInputSchema},
  output: {schema: DatabaseRecommendationsOutputSchema},
  prompt: `Eres un experto administrador de bases de datos que proporciona recomendaciones para el mantenimiento y actualización de bases de datos SQL Server.
  Tus respuestas deben estar en español.

  Basándote en la siguiente información de la base de datos, proporciona recomendaciones accionables para mantenimiento y actualizaciones.

  Incluye tareas específicas de mantenimiento, tareas de actualización y una evaluación general de la salud de la base de datos.

  Considera factores como el entorno, la criticidad, el estado de las copias de seguridad y el monitoreo.

  Compañía: {{{company}}}
  Ubicación: {{{location}}}
  Estado Operativo: {{{operationalStatus}}}
  Respaldada: {{{backedUp}}}
  Contingencia: {{{contingency}}}
  Entorno: {{{environment}}}
  Crítica: {{{critical}}}
  Monitoreada: {{{monitored}}}
  Dirección IP: {{{ipAddress}}}
  Grupo de Soporte: {{{supportGroup}}}
  Nombre de Instancia: {{{nameInstance}}}
  Nombre de BD: {{{bdName}}}
  Nombre del Servidor: {{{nameServer}}}
  Está en Clúster: {{{isClustered}}}
  Clase: {{{class}}}
  Edición: {{{edition}}}
  Motor: {{{engine}}}
  Licencia: {{{license}}}

  Formatea tu respuesta como un objeto JSON que se ajuste al DatabaseRecommendationsOutputSchema. Solo proporciona el JSON, nada más.`,
});

const databaseRecommendationsFlow = ai.defineFlow(
  {
    name: 'databaseRecommendationsFlow',
    inputSchema: DatabaseRecommendationsInputSchema,
    outputSchema: DatabaseRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await databaseRecommendationsPrompt(input);
    return output!;
  }
);
