import { 
    Servidor, Motor, Edicion, Licencia, Ambiente, Ubicacion, GrupoSoporte, 
    EstadoOperativo, Compania, SistemaOperativo, Sistema, Criticidad, TipoSistema, TipoServidor
} from "@/lib/relational-schema";

export const mockCriticidades: Criticidad[] = [
  { id: "crit-001", nombre: "Alta" },
  { id: "crit-002", nombre: "Media" },
  { id: "crit-003", nombre: "Baja" },
];

export const mockTiposSistema: TipoSistema[] = [
    { id: "tipo-001", nombre: "Core Bancario" },
    { id: "tipo-002", nombre: "Canales Digitales" },
    { id: "tipo-003", nombre: "Gestión Interna" },
];

export const mockSistemas: Sistema[] = [
    {
        id: "sis-001",
        nombre: "Bantotal",
        descripcion: "Sistema central para operaciones bancarias y financieras.",
        criticidadId: "crit-001", // Alta
        tipoSistemaId: "tipo-001", // Core Bancario
        responsableNegocio: "Gerencia de Operaciones",
        responsableTecnico: "Equipo Core",
    },
    {
        id: "sis-002",
        nombre: "App Móvil Clientes",
        descripcion: "Aplicación móvil para clientes finales.",
        criticidadId: "crit-001", // Alta
        tipoSistemaId: "tipo-002", // Canales Digitales
        responsableNegocio: "Gerencia de Canales",
        responsableTecnico: "Equipo de Desarrollo Móvil",
    },
    {
        id: "sis-003",
        nombre: "CRM Interno",
        descripcion: "Plataforma de gestión de relación con clientes para ejecutivos.",
        criticidadId: "crit-002", // Media
        tipoSistemaId: "tipo-003", // Gestión Interna
        responsableNegocio: "Gerencia Comercial",
        responsableTecnico: "Equipo de TI Interno",
    },
];

export const mockAmbientes: Ambiente[] = [
  // Ambientes para Bantotal
  { id: "amb-bt-prod", sistemaId: "sis-001", nombre: "Producción", descripcion: "Ambiente productivo de Bantotal.", urlAcceso: "https://bantotal.example.com" },
  { id: "amb-bt-qa", sistemaId: "sis-001", nombre: "QA", descripcion: "Ambiente de pruebas de calidad para Bantotal.", urlAcceso: "https://qa-bantotal.example.com" },
  { id: "amb-bt-dev", sistemaId: "sis-001", nombre: "Desarrollo", descripcion: "Ambiente de desarrollo para Bantotal.", urlAcceso: "https://dev-bantotal.example.com" },
  // Ambientes para App Móvil
  { id: "amb-app-prod", sistemaId: "sis-002", nombre: "Producción", descripcion: "API y servicios productivos para la app móvil.", urlAcceso: "https://api.example.com" },
  { id: "amb-app-staging", sistemaId: "sis-002", nombre: "Staging", descripcion: "Ambiente pre-productivo para la app móvil.", urlAcceso: "https://staging-api.example.com" },
];

export const mockTiposServidor: TipoServidor[] = [
    { id: "ts-db", nombre: "Base de Datos" },
    { id: "ts-app", nombre: "Aplicaciones" },
    { id: "ts-file", nombre: "Archivos" },
    { id: "ts-proc", nombre: "Procesos" },
];

export const mockSistemasOperativos: SistemaOperativo[] = [
  { id: "so-001", nombre: "Windows Server 2016" },
  { id: "so-002", nombre: "Windows Server 2019" },
  { id: "so-003", nombre: "Windows Server 2022" },
  { id: "so-004", nombre: "Linux" },
  { id: "so-005", nombre: "Otro" },
];

export const mockServidores: Servidor[] = [
  { 
    id: "srv-001", 
    nombre: "PROD-BANTOTAL-DB-01",
    ip: "10.10.1.10",
    tipoServidorId: "ts-db", // Base de Datos
    sistemaOperativoId: "so-002",
    ambienteId: "amb-bt-prod", // Producción de Bantotal
    cpu: 16,
    ramGB: 128,
    discos: [
      { id: "disk-001", nombre: "C:", totalGB: 200, usadoGB: 150 },
      { id: "disk-002", nombre: "D:", totalGB: 2048, usadoGB: 1800 },
    ]
  },
  { 
    id: "srv-002", 
    nombre: "QA-BANTOTAL-DB-01",
    ip: "10.20.1.10",
    tipoServidorId: "ts-db", // Base de Datos
    sistemaOperativoId: "so-003",
    ambienteId: "amb-bt-qa", // QA de Bantotal
    cpu: 8,
    ramGB: 64,
    discos: [
      { id: "disk-003", nombre: "C:", totalGB: 200, usadoGB: 100 },
    ]
  },
  { 
    id: "srv-003", 
    nombre: "PROD-API-APP-01",
    ip: "10.10.2.20",
    tipoServidorId: "ts-app", // Aplicaciones
    sistemaOperativoId: "so-004", // Linux
    ambienteId: "amb-app-prod", // Producción de App Móvil
    cpu: 8,
    ramGB: 64,
    discos: [
      { id: "disk-004", nombre: "/", totalGB: 500, usadoGB: 250 },
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

export const mockUbicaciones: Ubicacion[] = [
  { id: "ubi-001", nombre: "On-Premise" },
  { id: "ubi-002", nombre: "GCP" },
  { id: "ubi-003", nombre: "Azure" },
  { id: "ubi-004", nombre: "AWS" },
];

export const mockGruposSoporte: GrupoSoporte[] = [
  { id: "grp-001", nombre: "DBA Team", tipo: "Interno", contacto: "Ana Fuentes", email: "ana.fuentes@example.com", telefono: "123456789" },
  { id: "grp-002", nombre: "Infraestructura Cloud", tipo: "Interno", contacto: "Carlos Díaz", email: "carlos.diaz@example.com", telefono: "987654321" },
  { id: "grp-003", nombre: "Soporte Externo SQL", tipo: "Externo", contacto: "Pedro Marín", email: "pedro.marin@externo.com", telefono: "555123456" },
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