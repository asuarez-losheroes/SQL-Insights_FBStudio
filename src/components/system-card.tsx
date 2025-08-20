
'use client';

import * as React from 'react';
import { useData } from '@/context/data-context';
import type { Sistema } from '@/lib/relational-schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Server, Database, Layers, ShieldCheck, Tag } from 'lucide-react';

interface SystemCardProps {
  sistema: Sistema;
}

export default function SystemCard({ sistema }: SystemCardProps) {
  const { ambientes, servidores, databases, criticidades, tiposSistema } = useData();

  const systemData = React.useMemo(() => {
    const systemAmbientes = ambientes.filter(a => a.sistemaId === sistema.id);
    const systemAmbienteIds = systemAmbientes.map(a => a.id!);
    const systemServidores = servidores.filter(s => systemAmbienteIds.includes(s.ambienteId));
    const systemServerIds = systemServidores.map(s => s.id!);
    const systemDatabases = databases.filter(db => systemServerIds.includes(db.servidorId));
    
    const criticidad = criticidades.find(c => c.id === sistema.criticidadId);
    const tipo = tiposSistema.find(t => t.id === sistema.tipoSistemaId);

    return {
      ambienteCount: systemAmbientes.length,
      serverCount: systemServidores.length,
      databaseCount: systemDatabases.length,
      criticidadName: criticidad?.nombre || 'N/A',
      criticidadColor: criticidad?.nombre === 'Alta' ? 'destructive' : (criticidad?.nombre === 'Media' ? 'secondary' : 'outline'),
      tipoName: tipo?.nombre || 'N/A',
    }
  }, [sistema, ambientes, servidores, databases, criticidades, tiposSistema]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{sistema.nombre}</span>
          <div className='flex gap-2'>
            <Badge variant={systemData.criticidadColor as any}>{systemData.criticidadName}</Badge>
          </div>
        </CardTitle>
        <CardDescription className='flex items-center gap-2'>
            <Tag className="h-3.5 w-3.5" /> {systemData.tipoName}
        </CardDescription>
        <CardDescription className="pt-2">{sistema.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
            <Layers className="h-5 w-5 text-muted-foreground mb-1" />
            <span className='font-bold'>{systemData.ambienteCount}</span>
            <span className='text-xs'>Ambientes</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
            <Server className="h-5 w-5 text-muted-foreground mb-1" />
            <span className='font-bold'>{systemData.serverCount}</span>
            <span className='text-xs'>Servidores</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
            <Database className="h-5 w-5 text-muted-foreground mb-1" />
            <span className='font-bold'>{systemData.databaseCount}</span>
            <span className='text-xs'>Bases de Datos</span>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Responsable Técnico: {sistema.responsableTecnico}</p>
      </CardFooter>
    </Card>
  );
}
