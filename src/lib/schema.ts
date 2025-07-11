import { z } from "zod";

export const databaseSchema = z.object({
  id: z.string().optional(),
  nombre_bd: z.string().min(1, "El nombre de la BD es requerido."),
  instancia: z.string().min(1, "La instancia es requerida."),
  servidor: z.string().min(1, "El servidor es requerido."),
  ip: z.string().ip({ message: "Dirección IP inválida." }),
  motor: z.string().min(1, "El motor es requerido."),
  version: z.string().min(1, "La versión es requerida."),
  edicion: z.string().min(1, "La edición es requerida."),
  licencia: z.string().min(1, "La licencia es requerida."),
  ambiente: z.enum(['Production', 'Development', 'Staging', 'Contingency', 'QA', 'TEST', 'Produccion', 'Noprod']),
  critico: z.boolean(),
  monitoreado: z.boolean(),
  respaldo: z.boolean(),
  contingencia: z.boolean(),
  ubicacion: z.string().min(1, "La ubicación es requerida."),
  grupo_soporte: z.string().min(1, "El grupo de soporte es requerido."),
  cluster: z.boolean(),
  estado_operativo: z.enum(['Operational', 'Online', 'Offline', 'Unknown', 'Operacional']),
  compañia: z.string().min(1, "La compañía es requerida."),
});
