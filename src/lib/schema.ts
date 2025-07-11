import { z } from "zod";

export const databaseSchema = z.object({
  id: z.string().optional(),
  nombre_bd: z.string().min(1, "El nombre de la BD es requerido."),
  instancia: z.string().min(1, "La instancia es requerida."),
  ip: z.string().ip({ message: "Dirección IP inválida." }),
  version: z.string().min(1, "La versión es requerida."),
  critico: z.boolean(),
  monitoreado: z.boolean(),
  respaldo: z.boolean(),
  contingencia: z.boolean(),
  cluster: z.boolean(),

  // Campos que ahora son relacionales (guardamos el ID)
  servidorId: z.string().min(1, "El servidor es requerido."),
  motorId: z.string().min(1, "El motor es requerido."),
  edicionId: z.string().min(1, "La edición es requerida."),
  licenciaId: z.string().min(1, "La licencia es requerida."),
  ambienteId: z.string().min(1, "El ambiente es requerido."),
  ubicacionId: z.string().min(1, "La ubicación es requerida."),
  grupoSoporteId: z.string().min(1, "El grupo de soporte es requerido."),
  estadoOperativoId: z.string().min(1, "El estado operativo es requerido."),
  companiaId: z.string().min(1, "La compañía es requerida."),
});

// Tipo inferido para el formulario principal
export type DatabaseFormValues = z.infer<typeof databaseSchema>;
