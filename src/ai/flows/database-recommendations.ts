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
  company: z.string().describe('The name of the company.'),
  location: z.string().describe('The location of the database.'),
  operationalStatus: z.string().describe('The operational status of the database.'),
  backedUp: z.string().describe('Whether the database is backed up.'),
  contingency: z.string().describe('The contingency status of the database.'),
  environment: z.string().describe('The environment of the database (e.g., Production, Development).'),
  critical: z.string().describe('Whether the database is critical.'),
  monitored: z.string().describe('Whether the database is monitored.'),
  ipAddress: z.string().describe('The IP address of the database server.'),
  supportGroup: z.string().describe('The support group responsible for the database.'),
  nameInstance: z.string().describe('The name of the database instance.'),
  bdName: z.string().describe('The name of the database.'),
  nameServer: z.string().describe('The name of the database server.'),
  isClustered: z.string().describe('Whether the database is clustered.'),
  class: z.string().describe('The class of the database.'),
  edition: z.string().describe('The edition of the database.'),
  engine: z.string().describe('The engine of the database.'),
  license: z.string().describe('The license of the database.'),
});
export type DatabaseRecommendationsInput = z.infer<typeof DatabaseRecommendationsInputSchema>;

const MaintenanceTaskSchema = z.object({
  task: z.string().describe('Specific maintenance task to be performed.'),
  reason: z.string().describe('Reasoning behind the need of this task.'),
});

const UpgradeTaskSchema = z.object({
  task: z.string().describe('Specific upgrade task to be performed.'),
  reason: z.string().describe('Reasoning behind the need of this task.'),
});

const DatabaseRecommendationsOutputSchema = z.object({
  recommendations: z.object({
    maintenanceTasks: z.array(MaintenanceTaskSchema).describe('Recommendations for database maintenance tasks.'),
    upgradeTasks: z.array(UpgradeTaskSchema).describe('Recommendations for database upgrade tasks.'),
    overallAssessment: z.string().describe('Overall assessment of the database health and recommendations.'),
  }).describe('AI-driven recommendations for database maintenance and upgrades.'),
});
export type DatabaseRecommendationsOutput = z.infer<typeof DatabaseRecommendationsOutputSchema>;

export async function getDatabaseRecommendations(input: DatabaseRecommendationsInput): Promise<DatabaseRecommendationsOutput> {
  return databaseRecommendationsFlow(input);
}

const databaseRecommendationsPrompt = ai.definePrompt({
  name: 'databaseRecommendationsPrompt',
  input: {schema: DatabaseRecommendationsInputSchema},
  output: {schema: DatabaseRecommendationsOutputSchema},
  prompt: `You are an expert database administrator providing recommendations for SQL Server database maintenance and upgrades. 

  Based on the following database information, provide actionable recommendations for maintenance and upgrades. 

  Include specific maintenance tasks, upgrade tasks, and an overall assessment of the database health.

  Consider factors like environment, criticality, backup status, and monitoring.

  Company: {{{company}}}
  Location: {{{location}}}
  Operational Status: {{{operationalStatus}}}
  Backed up: {{{backedUp}}}
  Contingency: {{{contingency}}}
  Environment: {{{environment}}}
  Critical: {{{critical}}}
  Monitored: {{{monitored}}}
  IP Address: {{{ipAddress}}}
  Support Group: {{{supportGroup}}}
  Name Instance: {{{nameInstance}}}
  BD Name: {{{bdName}}}
  Name Server: {{{nameServer}}}
  Is Clustered: {{{isClustered}}}
  Class: {{{class}}}
  Edition: {{{edition}}}
  Engine: {{{engine}}}
  License: {{{license}}}

  Format your response as a JSON object conforming to the DatabaseRecommendationsOutputSchema. Only provide the JSON, nothing else.`, // Ensure valid JSON
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
