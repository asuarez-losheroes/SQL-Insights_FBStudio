import { z } from "zod";

// Esquema base para una entidad relacional simple con ID y nombre.
export const relationalSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido."),
});

// Nuevas entidades para el modelo centrado en Sistemas
export const criticidadSchema = relationalSchema;
export const tipoSistemaSchema = relationalSchema;
export const tipoServidorSchema = relationalSchema; // Nuevo catálogo

export const sistemaSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre del sistema es requerido."),
    descripcion: z.string().min(1, "La descripción es requerida."),
    criticidadId: z.string().min(1, "La criticidad es requerida."),
    tipoSistemaId: z.string().min(1, "El tipo de sistema es requerido."),
    responsableNegocio: z.string().min(1, "El responsable de negocio es requerido."),
    responsableTecnico: z.string().min(1, "El responsable técnico es requerido."),
});

export const ambienteSchema = z.object({
    id: z.string().optional(),
    sistemaId: z.string().min(1, "El sistema es requerido."),
    nombre: z.string().min(1, "El nombre del ambiente es requerido."),
    descripcion: z.string().min(1, "La descripción es requerida."),
    urlAcceso: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});


// Esquema para los discos de un servidor
export const discoSchema = z.object({
  id: z.string().optional(), // Make id optional for new disks
  nombre: z.string().min(1, "El nombre del disco es requerido."),
  totalGB: z.number().positive("El tamaño total debe ser positivo."),
  usadoGB: z.number().min(0, "El espacio usado no puede ser negativo."),
}).refine(data => data.usadoGB <= data.totalGB, {
    message: "El espacio usado no puede ser mayor que el total.",
    path: ["usadoGB"],
});


// Esquema extendido para Servidor (ahora se relaciona con Ambiente de Sistema)
export const servidorSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido."),
  ip: z.string().ip({ message: "Dirección IP inválida." }),
  tipoServidorId: z.string().min(1, "El tipo de servidor es requerido."), // Nuevo campo
  sistemaOperativoId: z.string().min(1, "El sistema operativo es requerido."),
  ambienteId: z.string().min(1, "El ambiente es requerido."), // Se enlaza al nuevo ambiente de sistema
  cpu: z.number().int().positive("La cantidad de CPU es requerida."),
  ramGB: z.number().int().positive("La cantidad de RAM es requerida."),
  discos: z.array(discoSchema).min(1, "Debe haber al menos un disco.").nonempty("Debe haber al menos un disco."),
});

// Esquema extendido para Grupo de Soporte
export const grupoSoporteSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre es requerido."),
    tipo: z.enum(["Interno", "Externo"], { required_error: "El tipo es requerido." }),
    contacto: z.string().optional(),
    email: z.string().email("Email inválido.").optional().or(z.literal('')),
    telefono: z.string().optional(),
});


// Catálogos existentes que se mantienen
export const motorSchema = relationalSchema;
export const edicionSchema = relationalSchema;
export const licenciaSchema = relationalSchema;
export const estadoOperativoSchema = relationalSchema;
export const companiaSchema = relationalSchema;
export const sistemaOperativoSchema = relationalSchema;
export const ubicacionSchema = relationalSchema;

// Tipos inferidos de Zod para usarlos en el frontend.
export type Sistema = z.infer<typeof sistemaSchema>;
export type Criticidad = z.infer<typeof criticidadSchema>;
export type TipoSistema = z.infer<typeof tipoSistemaSchema>;
export type Ambiente = z.infer<typeof ambienteSchema>;
export type TipoServidor = z.infer<typeof tipoServidorSchema>; // Nuevo tipo

export type Disco = z.infer<typeof discoSchema>;
export type Servidor = z.infer<typeof servidorSchema>;
export type Motor = z.infer<typeof motorSchema>;
export type Edicion = z.infer<typeof edicionSchema>;
export type Licencia = z.infer<typeof licenciaSchema>;
export type Ubicacion = z.infer<typeof ubicacionSchema>;
export type GrupoSoporte = z.infer<typeof grupoSoporteSchema>;
export type EstadoOperativo = z.infer<typeof estadoOperativoSchema>;
export type Compania = z.infer<typeof companiaSchema>;
export type SistemaOperativo = z.infer<typeof sistemaOperativoSchema>;