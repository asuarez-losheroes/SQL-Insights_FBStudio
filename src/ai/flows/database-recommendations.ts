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
  nombre_bd: z.string().describe('El nombre de la base de datos.'),
  instancia: z.string().describe('El nombre de la instancia de la base de datos.'),
  servidor: z.string().describe('El nombre del servidor de la base de datos.'),
  ip: z.string().describe('La dirección IP del servidor de la base de datos.'),
  motor: z.string().describe('El motor de la base de datos.'),
  version: z.string().describe('La versión de la base de datos.'),
  edicion: z.string().describe('La edición de la base de datos.'),
  licencia: z.string().describe('La licencia de la base de datos.'),
  ambiente: z.string().describe('El entorno de la base de datos (p. ej., Producción, Desarrollo).'),
  critico: z.boolean().describe('Si la base de datos es crítica.'),
  monitoreado: z.boolean().describe('Si la base de datos está monitoreada.'),
  respaldo: z.boolean().describe('Si la base de datos está respaldada.'),
  contingencia: z.boolean().describe('El estado de contingencia de la base de datos.'),
  ubicacion: z.string().describe('La ubicación de la base de datos.'),
  grupo_soporte: z.string().describe('El grupo de soporte responsable de la base de datos.'),
  cluster: z.boolean().describe('Si la base de datos está en clúster.'),
  estado_operativo: z.string().describe('El estado operativo de la base de datos.'),
  compañia: z.string().describe('El nombre de la empresa.'),
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

  Compañía: {{{compañia}}}
  Ubicación: {{{ubicacion}}}
  Estado Operativo: {{{estado_operativo}}}
  Respaldada: {{{respaldo}}}
  Contingencia: {{{contingencia}}}
  Entorno: {{{ambiente}}}
  Crítica: {{{critico}}}
  Monitoreada: {{{monitoreado}}}
  Dirección IP: {{{ip}}}
  Grupo de Soporte: {{{grupo_soporte}}}
  Nombre de Instancia: {{{instancia}}}
  Nombre de BD: {{{nombre_bd}}}
  Nombre del Servidor: {{{servidor}}}
  Está en Clúster: {{{cluster}}}
  Edición: {{{edicion}}}
  Motor: {{{motor}}}
  Licencia: {{{licencia}}}
  Versión: {{{version}}}

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
