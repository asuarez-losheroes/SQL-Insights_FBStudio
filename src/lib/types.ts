import { DatabaseFormValues } from "./schema";

// Extiende los valores del formulario para incluir los nombres de las relaciones.
export type Database = Omit<DatabaseFormValues, 'id' | 'servidorId' | 'motorId' | 'edicionId' | 'licenciaId' | 'ambienteId' | 'ubicacionId' | 'grupoSoporteId' | 'estadoOperativoId' | 'companiaId'> & {
  servidor: string;
  ip: string;
  motor: string;
  edicion: string;
  licencia: string;
  ambiente: string;
  ubicacion: string;
  grupo_soporte: string;
  estado_operativo: string;
  compañia: string;
};
