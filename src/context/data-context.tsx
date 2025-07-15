"use client";

import * as React from "react";
import {
  Servidor,
  Motor,
  Edicion,
  Licencia,
  Ambiente,
  Ubicacion,
  GrupoSoporte,
  EstadoOperativo,
  Compania,
  SistemaOperativo,
} from "@/lib/relational-schema";
import {
  mockServidores,
  mockMotores,
  mockEdiciones,
  mockLicencias,
  mockAmbientes,
  mockUbicaciones,
  mockGruposSoporte,
  mockEstadosOperativos,
  mockCompanias,
  mockSistemasOperativos,
} from "@/lib/mock-relational-data";

type RelationalData = Servidor | Motor | Edicion | Licencia | Ambiente | Ubicacion | GrupoSoporte | EstadoOperativo | Compania | SistemaOperativo;

type DataContextType = {
  servidores: Servidor[];
  motores: Motor[];
  ediciones: Edicion[];
  licencias: Licencia[];
  ambientes: Ambiente[];
  ubicaciones: Ubicacion[];
  gruposSoporte: GrupoSoporte[];
  estadosOperativos: EstadoOperativo[];
  companias: Compania[];
  sistemasOperativos: SistemaOperativo[];
  
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
  const [servidores, setServidores] = React.useState(mockServidores);
  const [motores, setMotores] = React.useState(mockMotores);
  const [ediciones, setEdiciones] = React.useState(mockEdiciones);
  const [licencias, setLicencias] = React.useState(mockLicencias);
  const [ambientes, setAmbientes] = React.useState(mockAmbientes);
  const [ubicaciones, setUbicaciones] = React.useState(mockUbicaciones);
  const [gruposSoporte, setGruposSoporte] = React.useState(mockGruposSoporte);
  const [estadosOperativos, setEstadosOperativos] = React.useState(mockEstadosOperativos);
  const [companias, setCompanias] = React.useState(mockCompanias);
  const [sistemasOperativos, setSistemasOperativos] = React.useState(mockSistemasOperativos);
  
  const setters: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
    servidores: setServidores,
    motores: setMotores,
    ediciones: setEdiciones,
    licencias: setLicencias,
    ambientes: setAmbientes,
    ubicaciones: setUbicaciones,
    gruposSoporte: setGruposSoporte,
    estadosOperativos: setEstadosOperativos,
    companias: setCompanias,
    sistemasOperativos: setSistemasOperativos,
  };

  const prefixes: Record<string, string> = {
    servidores: 'srv',
    motores: 'mot',
    ediciones: 'edi',
    licencias: 'lic',
    ambientes: 'amb',
    ubicaciones: 'ubi',
    gruposSoporte: 'grp',
    estadosOperativos: 'est',
    companias: 'com',
    sistemasOperativos: 'so',
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
    servidores,
    motores,
    ediciones,
    licencias,
    ambientes,
    ubicaciones,
    gruposSoporte,
    estadosOperativos,
    companias,
    sistemasOperativos,
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