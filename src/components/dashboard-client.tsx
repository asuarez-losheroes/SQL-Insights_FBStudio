
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Download,
  Sparkles,
  FileUp,
  Search,
  X
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
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

import RecommendationModal from './recommendation-modal';
import FileUploadDialog from './file-upload-dialog';
import DatabaseFormDialog from './database-form-dialog';
import { useData } from '@/context/data-context';
import { DatabaseFormValues } from '@/lib/schema';
import { Servidor } from '@/lib/relational-schema';
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
    sistemas, criticidades, tiposSistema, ambientes, servidores, databases,
    motores, ediciones, licencias, ubicaciones, gruposSoporte, companias, estadosOperativos,
    deleteRelationalData, addRelationalData, updateRelationalData
  } = useData();
  
  // Modal states
  const [selectedDb, setSelectedDb] = React.useState<DatabaseFormValues | null>(null);
  const [editingDb, setEditingDb] = React.useState<DatabaseFormValues | null>(null);
  const [isRecommendationModalOpen, setRecommendationModalOpen] = React.useState(false);
  const [isFileUploadDialogOpen, setFileUploadDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setFormDialogOpen] = React.useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSystem, setSelectedSystem] = React.useState('all');
  const [selectedAmbiente, setSelectedAmbiente] = React.useState('all');

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

  const handleDelete = (id: string) => {
    deleteRelationalData('databases', id);
  }

  const handleSave = (values: DatabaseFormValues) => {
    if (editingDb) {
      updateRelationalData('databases', values);
    } else {
      addRelationalData('databases', values);
    }
  };

  const getAmbienteInfo = (servidorId: string) => {
    const servidor = servidores.find(s => s.id === servidorId);
    if (!servidor) return { ambienteName: 'N/A', ambienteId: null, sistemaName: 'N/A', sistemaId: null };
    const ambiente = ambientes.find(a => a.id === servidor.ambienteId);
    if (!ambiente) return { ambienteName: 'N/A', ambienteId: null, sistemaName: 'N/A', sistemaId: null };
    const sistema = sistemas.find(s => s.id === ambiente.sistemaId);
    return {
      ambienteName: ambiente.nombre,
      ambienteId: ambiente.id,
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
  
  const filteredDatabases = React.useMemo(() => {
    let filtered = [...databases];

    if (searchTerm) {
        filtered = filtered.filter(db => db.nombre_bd.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedSystem !== 'all') {
        filtered = filtered.filter(db => getAmbienteInfo(db.servidorId).sistemaId === selectedSystem);
    }
    
    if (selectedAmbiente !== 'all') {
        filtered = filtered.filter(db => getAmbienteInfo(db.servidorId).ambienteId === selectedAmbiente);
    }

    return filtered;
  }, [databases, searchTerm, selectedSystem, selectedAmbiente]);


  const availableAmbientes = React.useMemo(() => {
      if (selectedSystem === 'all') {
          return ambientes;
      }
      return ambientes.filter(a => a.sistemaId === selectedSystem);
  }, [selectedSystem, ambientes]);


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {sistemas.map(sistema => (
          <SystemCard key={sistema.id} sistema={sistema} />
        ))}
      </div>

      <Card className='mt-8'>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                 <div>
                    <CardTitle>Inventario de Bases de Datos</CardTitle>
                    <CardDescription>Vista detallada de todas las bases de datos registradas.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportToCsv}>
                      <Download className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setFileUploadDialogOpen(true)}>
                      <FileUp className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Importar</span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={handleCreate}>
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Crear</span>
                    </Button>
                </div>
            </div>
             <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative w-full md:w-auto md:flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre de BD..."
                        className="pl-8 sm:w-full md:w-[300px] lg:w-[400px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 md:flex md:items-center gap-4">
                    <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filtrar por Sistema" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Sistemas</SelectItem>
                            {sistemas.map(s => <SelectItem key={s.id} value={s.id!}>{s.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedAmbiente} onValueChange={setSelectedAmbiente}>
                         <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filtrar por Ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todos los Ambientes</SelectItem>
                            {availableAmbientes.map(a => <SelectItem key={a.id} value={a.id!}>{a.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
              {filteredDatabases.map((db) => {
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
                          <DropdownMenuItem onSelect={() => handleDelete(db.id!)}>Eliminar</DropdownMenuItem>
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

