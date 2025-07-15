import { Servidor, Motor, Edicion, Licencia, Ambiente, Ubicacion, GrupoSoporte, EstadoOperativo, Compania } from "@/lib/relational-schema";

export const mockServidores: Servidor[] = [
  { 
    id: "srv-001", 
    nombre: "PROD-SQL-01",
    cpu: 8,
    ramGB: 64,
    discos: [
      { id: "disk-001", nombre: "C:", totalGB: 200, usadoGB: 150 },
      { id: "disk-002", nombre: "D:", totalGB: 1024, usadoGB: 800 },
    ]
  },
  { 
    id: "srv-002", 
    nombre: "DEV-SQL-01",
    cpu: 4,
    ramGB: 32,
    discos: [
      { id: "disk-003", nombre: "C:", totalGB: 100, usadoGB: 50 },
    ]
  },
  { 
    id: "srv-003", 
    nombre: "QA-SQL-01",
    cpu: 4,
    ramGB: 32,
    discos: [
      { id: "disk-004", nombre: "C:", totalGB: 150, usadoGB: 75 },
      { id: "disk-005", nombre: "E:", totalGB: 500, usadoGB: 250 },
    ]
  },
];

export const mockMotores: Motor[] = [
  { id: "mot-001", nombre: "SQL Server" },
  { id: "mot-002", nombre: "PostgreSQL" },
  { id: "mot-003", nombre: "MySQL" },
  { id: "mot-004", nombre: "Oracle" },
];

export const mockEdiciones: Edicion[] = [
  { id: "edi-001", nombre: "Standard" },
  { id: "edi-002", nombre: "Enterprise" },
  { id: "edi-003", nombre: "Developer" },
];

export const mockLicencias: Licencia[] = [
  { id: "lic-001", nombre: "Por Core" },
  { id: "lic-002", nombre: "Server + CAL" },
  { id: "lic-003", nombre: "Gratuita" },
];

export const mockAmbientes: Ambiente[] = [
  { id: "amb-001", nombre: "Producción" },
  { id: "amb-002", nombre: "Desarrollo" },
  { id: "amb-003", nombre: "Staging" },
  { id: "amb-004", nombre: "QA" },
];

export const mockUbicaciones: Ubicacion[] = [
  { id: "ubi-001", nombre: "On-Premise" },
  { id: "ubi-002", nombre: "GCP" },
  { id: "ubi-003", nombre: "Azure" },
  { id: "ubi-004", nombre: "AWS" },
];

export const mockGruposSoporte: GrupoSoporte[] = [
  { id: "grp-001", nombre: "DBA Team" },
  { id: "grp-002", nombre: "Infraestructura" },
  { id: "grp-003", nombre: "Soporte Nivel 2" },
];

export const mockEstadosOperativos: EstadoOperativo[] = [
  { id: "est-001", nombre: "Operacional" },
  { id: "est-002", nombre: "En Línea" },
  { id: "est-003", nombre: "Fuera de Línea" },
  { id: "est-004", nombre: "Desconocido" },
];

export const mockCompanias: Compania[] = [
  { id: "com-001", nombre: "Caja Los Héroes" },
  { id: "com-002", nombre: "Empresa Ejemplo S.A." },
];
