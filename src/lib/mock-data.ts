import { DatabaseFormValues } from "./schema";

export const mockDatabases: DatabaseFormValues[] = [
  {
    id: "db-1",
    nombre_bd: "ContabilidadDB",
    instancia: "MSSQLSERVER",
    ip: "192.168.1.10",
    version: "15.0.2000.5",
    critico: true,
    monitoreado: true,
    respaldo: true,
    contingencia: true,
    cluster: false,
    servidorId: "srv-001", // PROD-SQL-01
    motorId: "mot-001", // SQL Server
    edicionId: "edi-002", // Enterprise
    licenciaId: "lic-001", // Por Core
    ambienteId: "amb-001", // Producción
    ubicacionId: "ubi-001", // On-Premise
    grupoSoporteId: "grp-001", // DBA Team
    estadoOperativoId: "est-001", // Operacional
    companiaId: "com-001", // Caja Los Héroes
  },
  {
    id: "db-2",
    nombre_bd: "DesarrolloWeb",
    instancia: "SQLEXPRESS",
    ip: "192.168.1.20",
    version: "14.0.1000.169",
    critico: false,
    monitoreado: true,
    respaldo: true,
    contingencia: false,
    cluster: false,
    servidorId: "srv-002", // DEV-SQL-01
    motorId: "mot-001", // SQL Server
    edicionId: "edi-003", // Developer
    licenciaId: "lic-003", // Gratuita
    ambienteId: "amb-002", // Desarrollo
    ubicacionId: "ubi-001", // On-Premise
    grupoSoporteId: "grp-001", // DBA Team
    estadoOperativoId: "est-002", // En Línea
    companiaId: "com-001", // Caja Los Héroes
  },
   {
    id: "db-3",
    nombre_bd: "PostgresQA",
    instancia: "psql",
    ip: "10.0.5.30",
    version: "13.4",
    critico: false,
    monitoreado: false,
    respaldo: true,
    contingencia: true,
    cluster: true,
    servidorId: "srv-003", // QA-SQL-01
    motorId: "mot-002", // PostgreSQL
    edicionId: "edi-003", // Developer
    licenciaId: "lic-003", // Gratuita
    ambienteId: "amb-004", // QA
    ubicacionId: "ubi-002", // GCP
    grupoSoporteId: "grp-002", // Infraestructura
    estadoOperativoId: "est-002", // En Línea
    companiaId: "com-001", // Caja Los Héroes
  }
];
