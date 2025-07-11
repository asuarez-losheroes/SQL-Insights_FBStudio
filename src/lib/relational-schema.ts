import { z } from "zod";

// Esquema base para una entidad relacional simple con ID y nombre.
export const relationalSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido."),
});

// Exportamos tipos específicos para mayor claridad en el código.
export const servidorSchema = relationalSchema;
export const motorSchema = relationalSchema;
export const edicionSchema = relationalSchema;
export const licenciaSchema = relationalSchema;
export const ambienteSchema = relationalSchema;
export const ubicacionSchema = relationalSchema;
export const grupoSoporteSchema = relationalSchema;
export const estadoOperativoSchema = relationalSchema;
export const companiaSchema = relationalSchema;

// Tipos inferidos de Zod para usarlos en el frontend.
export type Servidor = z.infer<typeof servidorSchema>;
export type Motor = z.infer<typeof motorSchema>;
export type Edicion = z.infer<typeof edicionSchema>;
export type Licencia = z.infer<typeof licenciaSchema>;
export type Ambiente = z.infer<typeof ambienteSchema>;
export type Ubicacion = z.infer<typeof ubicacionSchema>;
export type GrupoSoporte = z.infer<typeof grupoSoporteSchema>;
export type EstadoOperativo = z.infer<typeof estadoOperativoSchema>;
export type Compania = z.infer<typeof companiaSchema>;
