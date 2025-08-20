import { DatabaseFormValues } from "./schema";

export const mockDatabases: DatabaseFormValues[] = [
  {
    id: "db-1",
    nombre_bd: "BantotalCore",
    instancia: "MSSQLSERVER",
    version: "15.0.2000.5",
    critico: true,
    monitoreado: true,
    respaldo: true,
    contingencia: true,
    cluster: false,
    servidorId: "srv-001", // PROD-BANTOTAL-DB-01
    motorId: "mot-001", // SQL Server
    edicionId: "edi-002", // Enterprise
    licenciaId: "lic-001", // Por Core
    ubicacionId: "ubi-001", // On-Premise
    grupoSoporteId: "grp-001", // DBA Team
    estadoOperativoId: "est-001", // Operacional
    companiaId: "com-001", // Caja Los Héroes
  },
  {
    id: "db-2",
    nombre_bd: "BantotalQA_Clone",
    instancia: "SQLEXPRESS",
    version: "15.0.4000.0",
    critico: false,
    monitoreado: true,
    respaldo: true,
    contingencia: false,
    cluster: false,
    servidorId: "srv-002", // QA-BANTOTAL-DB-01
    motorId: "mot-001", // SQL Server
    edicionId: "edi-003", // Developer
    licenciaId: "lic-003", // Gratuita
    ubicacionId: "ubi-001", // On-Premise
    grupoSoporteId: "grp-001", // DBA Team
    estadoOperativoId: "est-002", // En Línea
    companiaId: "com-001", // Caja Los Héroes
  },
   {
    id: "db-3",
    nombre_bd: "AppClientesDB",
    instancia: "psql-prod",
    version: "13.4",
    critico: true,
    monitoreado: true,
    respaldo: true,
    contingencia: true,
    cluster: true,
    servidorId: "srv-003", // PROD-API-APP-01
    motorId: "mot-002", // PostgreSQL
    edicionId: "edi-002", // Enterprise (simulado para Postgres)
    licenciaId: "lic-003", // Gratuita
    ubicacionId: "ubi-002", // GCP
    grupoSoporteId: "grp-002", // Infraestructura Cloud
    estadoOperativoId: "est-002", // En Línea
    companiaId: "com-001", // Caja Los Héroes
  }
];
