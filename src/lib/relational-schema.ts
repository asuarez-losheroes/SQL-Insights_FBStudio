import { z } from "zod";

// Esquema base para una entidad relacional simple con ID y nombre.
export const relationalSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido."),
});

// Esquema para los discos de un servidor
export const discoSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre del disco es requerido."),
  totalGB: z.number().positive("El tamaño total debe ser positivo."),
  usadoGB: z.number().min(0, "El espacio usado no puede ser negativo."),
});

// Esquema extendido para Servidor
export const servidorSchema = relationalSchema.extend({
  ip: z.string().ip({ message: "Dirección IP inválida." }),
  sistemaOperativoId: z.string().min(1, "El sistema operativo es requerido."),
  cpu: z.number().int().positive("La cantidad de CPU es requerida."),
  ramGB: z.number().int().positive("La cantidad de RAM es requerida."),
  discos: z.array(discoSchema).min(1, "Debe haber al menos un disco."),
});

// Exportamos tipos específicos para mayor claridad en el código.
export const motorSchema = relationalSchema;
export const edicionSchema = relationalSchema;
export const licenciaSchema = relationalSchema;
export const ambienteSchema = relationalSchema;
export const ubicacionSchema = relationalSchema;
export const grupoSoporteSchema = relationalSchema;
export const estadoOperativoSchema = relationalSchema;
export const companiaSchema = relationalSchema;
export const sistemaOperativoSchema = relationalSchema;

// Tipos inferidos de Zod para usarlos en el frontend.
export type Disco = z.infer<typeof discoSchema>;
export type Servidor = z.infer<typeof servidorSchema>;
export type Motor = z.infer<typeof motorSchema>;
export type Edicion = z.infer<typeof edicionSchema>;
export type Licencia = z.infer<typeof licenciaSchema>;
export type Ambiente = z.infer<typeof ambienteSchema>;
export type Ubicacion = z.infer<typeof ubicacionSchema>;
export type GrupoSoporte = z.infer<typeof grupoSoporteSchema>;
export type EstadoOperativo = z.infer<typeof estadoOperativoSchema>;
export type Compania = z.infer<typeof companiaSchema>;
export type SistemaOperativo = z.infer<typeof sistemaOperativoSchema>;
