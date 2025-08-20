import { DatabaseFormValues } from "./schema";
import { Ambiente, Sistema } from "./relational-schema";

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

// Tipos para la visualización de grafos
export type GraphNode = {
  id: string;
  label: string;
  type: 'compania' | 'sistema' | 'ambiente' | 'servidor' | 'database';
  data: any;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
