'use client';

import * as React from 'react';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Download,
  Server,
  HeartPulse,
  ShieldAlert,
  EyeOff,
  Sparkles,
  FileUp,
  X,
  Briefcase,
  HardDrive,
  Users
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { mockDatabases } from '@/lib/mock-data';
import RecommendationModal from './recommendation-modal';
import FileUploadDialog from './file-upload-dialog';
import DatabaseFormDialog from './database-form-dialog';
import { useData } from '@/context/data-context';
import { DatabaseFormValues } from '@/lib/schema';
import { Servidor, Sistema } from '@/lib/relational-schema';
import SystemCard from './system-card';

// Helper function to find relation name
const getRelationName = (id: string, collection: {id: string, nombre: string}[]) => {
  return collection.find(item => item.id === id)?.nombre || 'Desconocido';
};

const getServidorById = (id: string, servidores: Servidor[]) => {
    return servidores.find(s => s.id === id);
}

export default function DashboardClient() {
  const { 
    sistemas, criticidades, tiposSistema, ambientes, servidores,
    motores, ediciones, licencias, ubicaciones, gruposSoporte, companias, estadosOperativos
  } = useData();
  
  const [databases, setDatabases] = React.useState<DatabaseFormValues[]>(mockDatabases);
  
  // Modal states
  const [selectedDb, setSelectedDb] = React.useState<DatabaseFormValues | null>(null);
  const [editingDb, setEditingDb] = React.useState<DatabaseFormValues | null>(null);
  const [isRecommendationModalOpen, setRecommendationModalOpen] = React.useState(false);
  const [isFileUploadDialogOpen, setFileUploadDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setFormDialogOpen] = React.useState(false);

  const handleGetRecommendations = (db: DatabaseFormValues) => {
    setSelectedDb(db);
    setRecommendationModalOpen(true);
  };

  const handleCreate = () => {
    setEditingDb(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (db: DatabaseFormValues) => {
    setEditingDb(db);
    setFormDialogOpen(true);
  };

  const handleSave = (values: DatabaseFormValues) => {
    if (editingDb) {
      setDatabases(databases.map(db => db.id === values.id ? values : db));
    } else {
      const newDb = { ...values, id: `db-${Date.now()}` };
      setDatabases([...databases, newDb]);
    }
  };

  const getAmbienteInfo = (servidorId: string) => {
    const servidor = servidores.find(s => s.id === servidorId);
    if (!servidor) return { ambienteName: 'N/A', sistemaName: 'N/A', sistemaId: null };
    const ambiente = ambientes.find(a => a.id === servidor.ambienteId);
    if (!ambiente) return { ambienteName: 'N/A', sistemaName: 'N/A', sistemaId: null };
    const sistema = sistemas.find(s => s.id === ambiente.sistemaId);
    return {
      ambienteName: ambiente.nombre,
      sistemaName: sistema?.nombre || 'N/A',
      sistemaId: sistema?.id || null
    };
  }

  const exportToCsv = () => {
    const dataToExport = databases.map(db => {
        const servidor = getServidorById(db.servidorId, servidores);
        const { sistemaName, ambienteName } = getAmbienteInfo(db.servidorId);
        return {
            "Sistema": sistemaName,
            "Ambiente": ambienteName,
            "Nombre BD": db.nombre_bd,
            "Servidor": servidor?.nombre || 'Desconocido',
            "IP Servidor": servidor?.ip || 'Desconocida',
            "Motor": getRelationName(db.motorId, motores),
            "Edición": getRelationName(db.edicionId, ediciones),
            "Licencia": getRelationName(db.licenciaId, licencias),
            "Ubicación": getRelationName(db.ubicacionId, ubicaciones),
            "Grupo Soporte": getRelationName(db.grupoSoporteId, gruposSoporte),
            "Estado": getRelationName(db.estadoOperativoId, estadosOperativos),
            "Compañía": getRelationName(db.companiaId, companias),
            "Versión": db.version,
            "Crítico": db.critico ? 'Si' : 'No',
            "Monitoreado": db.monitoreado ? 'Si' : 'No',
            "Respaldo": db.respaldo ? 'Si' : 'No',
            "Contingencia": db.contingencia ? 'Si' : 'No',
            "Clúster": db.cluster ? 'Si' : 'No',
        }
    });

    if (dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]);
    const csvRows = [
      headers.join(','),
      ...dataToExport.map(row =>
        headers.map(fieldName => JSON.stringify((row as any)[fieldName])).join(',')
      ),
    ];
  
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'inventario_sql.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {sistemas.map(sistema => (
          <SystemCard key={sistema.id} sistema={sistema} />
        ))}
      </div>

      <Card className='mt-8'>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <CardTitle>Inventario de Bases de Datos</CardTitle>
                    <CardDescription>Vista detallada de todas las bases de datos registradas.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportToCsv}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Exportar
                    </span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setFileUploadDialogOpen(true)}>
                      <FileUp className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Importar
                      </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={handleCreate}>
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Crear
                      </span>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de BD</TableHead>
                <TableHead className="hidden sm:table-cell">Sistema / Ambiente</TableHead>
                <TableHead className="hidden md:table-cell">Servidor</TableHead>
                <TableHead>Crítica</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {databases.map((db) => {
                const { ambienteName, sistemaName } = getAmbienteInfo(db.servidorId);
                const servidor = getServidorById(db.servidorId, servidores);
                return (
                  <TableRow key={db.id}>
                    <TableCell className="font-medium">
                        <div>{db.nombre_bd}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">{sistemaName} / {ambienteName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div>{sistemaName}</div>
                        <Badge variant={ambienteName === 'Producción' ? 'destructive' : 'secondary'}>{ambienteName}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{servidor?.nombre}</TableCell>
                    <TableCell>{db.critico ? 'Si' : 'No'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleGetRecommendations(db)}>
                            <Sparkles className="mr-2 h-4 w-4" /> Obtener Recomendaciones de IA
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleEdit(db)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedDb && (
        <RecommendationModal
          isOpen={isRecommendationModalOpen}
          onOpenChange={setRecommendationModalOpen}
          database={{
            ...selectedDb,
            servidor: getServidorById(selectedDb.servidorId, servidores)?.nombre || 'N/A',
            ip: getServidorById(selectedDb.servidorId, servidores)?.ip || 'N/A',
            motor: getRelationName(selectedDb.motorId, motores),
            edicion: getRelationName(selectedDb.edicionId, ediciones),
            licencia: getRelationName(selectedDb.licenciaId, licencias),
            ambiente: getAmbienteInfo(selectedDb.servidorId).ambienteName,
            ubicacion: getRelationName(selectedDb.ubicacionId, ubicaciones),
            grupo_soporte: getRelationName(selectedDb.grupoSoporteId, gruposSoporte),
            estado_operativo: getRelationName(selectedDb.estadoOperativoId, estadosOperativos),
            compañia: getRelationName(selectedDb.companiaId, companias),
          }}
        />
      )}

      <FileUploadDialog
        isOpen={isFileUploadDialogOpen}
        onOpenChange={setFileUploadDialogOpen}
      />

      <DatabaseFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSave={handleSave}
        database={editingDb}
      />
    </>
  );
}
