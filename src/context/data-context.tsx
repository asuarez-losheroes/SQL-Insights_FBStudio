
"use client";

import * as React from "react";
import {
  Servidor, Motor, Edicion, Licencia, Ambiente, Ubicacion, GrupoSoporte,
  EstadoOperativo, Compania, SistemaOperativo, Sistema, Criticidad, TipoSistema, TipoServidor
} from "@/lib/relational-schema";
import { DatabaseFormValues } from "@/lib/schema";
import {
  mockServidores, mockMotores, mockEdiciones, mockLicencias, mockAmbientes,
  mockUbicaciones, mockGruposSoporte, mockEstadosOperativos, mockCompanias,
  mockSistemasOperativos, mockSistemas, mockCriticidades, mockTiposSistema, mockTiposServidor
} from "@/lib/mock-relational-data";
import { mockDatabases } from "@/lib/mock-data";


type RelationalData = Servidor | Motor | Edicion | Licencia | Ambiente | Ubicacion | GrupoSoporte | EstadoOperativo | Compania | SistemaOperativo | Sistema | Criticidad | TipoSistema | DatabaseFormValues | TipoServidor;

type DataContextType = {
  // Nuevas entidades
  sistemas: Sistema[];
  criticidades: Criticidad[];
  tiposSistema: TipoSistema[];
  ambientes: Ambiente[];
  tiposServidor: TipoServidor[];

  // Entidades existentes
  servidores: Servidor[];
  motores: Motor[];
  ediciones: Edicion[];
  licencias: Licencia[];
  ubicaciones: Ubicacion[];
  gruposSoporte: GrupoSoporte[];
  estadosOperativos: EstadoOperativo[];
  companias: Compania[];
  sistemasOperativos: SistemaOperativo[];
  databases: DatabaseFormValues[];
  
  addRelationalData: (type: string, data: Omit<RelationalData, 'id'>) => void;
  updateRelationalData: (type: string, data: RelationalData) => void;
  deleteRelationalData: (type: string, id: string) => void;
};

const DataContext = React.createContext<DataContextType | undefined>(undefined);

// Generic update function to avoid repetition
const updateState = <T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  item: T
) => {
  setter((prevItems) => prevItems.map((prevItem) => (prevItem.id === item.id ? item : prevItem)));
};

// Generic delete function
const deleteState = <T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  id: string
) => {
  setter((prevItems) => prevItems.filter((item) => item.id !== id));
};

// Generic add function
const addState = <T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  item: Omit<T, 'id'>,
  prefix: string
) => {
    const newItem = { ...item, id: `${prefix}-${Date.now()}` } as T;
    setter((prevItems) => [...prevItems, newItem]);
}


export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  // Nuevos estados
  const [sistemas, setSistemas] = React.useState(mockSistemas);
  const [criticidades, setCriticidades] = React.useState(mockCriticidades);
  const [tiposSistema, setTiposSistema] = React.useState(mockTiposSistema);
  const [ambientes, setAmbientes] = React.useState(mockAmbientes);
  const [tiposServidor, setTiposServidor] = React.useState(mockTiposServidor);

  // Estados existentes
  const [servidores, setServidores] = React.useState(mockServidores);
  const [motores, setMotores] = React.useState(mockMotores);
  const [ediciones, setEdiciones] = React.useState(mockEdiciones);
  const [licencias, setLicencias] = React.useState(mockLicencias);
  const [ubicaciones, setUbicaciones] = React.useState(mockUbicaciones);
  const [gruposSoporte, setGruposSoporte] = React.useState(mockGruposSoporte);
  const [estadosOperativos, setEstadosOperativos] = React.useState(mockEstadosOperativos);
  const [companias, setCompanias] = React.useState(mockCompanias);
  const [sistemasOperativos, setSistemasOperativos] = React.useState(mockSistemasOperativos);
  const [databases, setDatabases] = React.useState(mockDatabases);
  
  const setters: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
    sistemas: setSistemas,
    criticidades: setCriticidades,
    tiposSistema: setTiposSistema,
    tiposServidor: setTiposServidor,
    ambientes: setAmbientes,
    servidores: setServidores,
    motores: setMotores,
    ediciones: setEdiciones,
    licencias: setLicencias,
    ubicaciones: setUbicaciones,
    gruposSoporte: setGruposSoporte,
    estadosOperativos: setEstadosOperativos,
    companias: setCompanias,
    sistemasOperativos: setSistemasOperativos,
    databases: setDatabases,
  };

  const prefixes: Record<string, string> = {
    sistemas: 'sis',
    criticidades: 'crit',
    tiposSistema: 'tipo',
    tiposServidor: 'tsrv',
    ambientes: 'amb',
    servidores: 'srv',
    motores: 'mot',
    ediciones: 'edi',
    licencias: 'lic',
    ubicaciones: 'ubi',
    gruposSoporte: 'grp',
    estadosOperativos: 'est',
    companias: 'com',
    sistemasOperativos: 'so',
    databases: 'db',
  }

  const addRelationalData = (type: string, data: Omit<RelationalData, 'id'>) => {
      const setter = setters[type];
      const prefix = prefixes[type];
      if(setter && prefix) {
          addState(setter, data, prefix);
      }
  };
  
  const updateRelationalData = (type: string, data: RelationalData) => {
      const setter = setters[type];
      if (setter) {
          updateState(setter, data);
      }
  };

  const deleteRelationalData = (type: string, id: string) => {
      const setter = setters[type];
      if (setter) {
          deleteState(setter, id);
      }
  };

  const value = {
    sistemas,
    criticidades,
    tiposSistema,
    ambientes,
    tiposServidor,
    servidores,
    motores,
    ediciones,
    licencias,
    ubicaciones,
    gruposSoporte,
    estadosOperativos,
    companias,
    sistemasOperativos,
    databases,
    addRelationalData,
    updateRelationalData,
    deleteRelationalData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};