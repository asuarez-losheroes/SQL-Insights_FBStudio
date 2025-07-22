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
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { Servidor } from '@/lib/relational-schema';

// Helper function to find relation name
const getRelationName = (id: string, collection: {id: string, nombre: string}[]) => {
  return collection.find(item => item.id === id)?.nombre || 'Desconocido';
};

const getServidorById = (id: string, servidores: Servidor[]) => {
    return servidores.find(s => s.id === id);
}

export default function DashboardClient() {
  const { 
    servidores, ambientes, estadosOperativos, motores, ediciones, licencias, ubicaciones, gruposSoporte, companias 
  } = useData();
  
  const [databases, setDatabases] = React.useState<DatabaseFormValues[]>(mockDatabases);
  const [filteredDatabases, setFilteredDatabases] = React.useState<DatabaseFormValues[]>(mockDatabases);

  // Filter states
  const [search, setSearch] = React.useState('');
  const [environment, setEnvironment] = React.useState('all');
  const [criticality, setCriticality] = React.useState('all');
  const [monitoring, setMonitoring] = React.useState('all');
  
  // Modal states
  const [selectedDb, setSelectedDb] = React.useState<DatabaseFormValues | null>(null);
  const [editingDb, setEditingDb] = React.useState<DatabaseFormValues | null>(null);
  const [isRecommendationModalOpen, setRecommendationModalOpen] = React.useState(false);
  const [isFileUploadDialogOpen, setFileUploadDialogOpen] = React.useState(false);
  const [isFormDialogOpen, setFormDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let result = databases;
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      result = result.filter(db => {
        const servidor = getServidorById(db.servidorId, servidores);
        const servidorName = servidor?.nombre.toLowerCase() || '';
        const servidorIp = servidor?.ip.toLowerCase() || '';
        return db.nombre_bd.toLowerCase().includes(lowercasedSearch) ||
               servidorName.includes(lowercasedSearch) ||
               servidorIp.includes(lowercasedSearch);
      });
    }
    if (environment !== 'all') {
      result = result.filter(db => db.ambienteId === environment);
    }
    if (criticality !== 'all') {
      result = result.filter(db => db.critico.toString() === criticality);
    }
    if (monitoring !== 'all') {
      result = result.filter(db => db.monitoreado.toString() === monitoring);
    }
    setFilteredDatabases(result);
  }, [search, environment, criticality, monitoring, databases, servidores]);

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

  const handleClearFilters = () => {
    setSearch('');
    setEnvironment('all');
    setCriticality('all');
    setMonitoring('all');
  };

  const exportToCsv = () => {
    const dataToExport = filteredDatabases.map(db => {
        const servidor = getServidorById(db.servidorId, servidores);
        return {
            "Nombre BD": db.nombre_bd,
            "Servidor": servidor?.nombre || 'Desconocido',
            "IP Servidor": servidor?.ip || 'Desconocida',
            "Motor": getRelationName(db.motorId, motores),
            "Edición": getRelationName(db.edicionId, ediciones),
            "Licencia": getRelationName(db.licenciaId, licencias),
            "Ambiente": getRelationName(db.ambienteId, ambientes),
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
  
  const summary = React.useMemo(() => {
    const produccionAmbiente = ambientes.find(a => a.nombre.toLowerCase() === 'producción');
    return {
      total: databases.length,
      production: databases.filter(db => db.ambienteId === produccionAmbiente?.id).length,
      critical: databases.filter(db => db.critico).length,
      unmonitored: databases.filter(db => !db.monitoreado).length,
    }
  }, [databases, ambientes]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bases de Datos Totales</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.production}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Monitoreadas</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.unmonitored}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Inventario de Bases de Datos</h2>
                    <Input placeholder="Buscar bases de datos..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filtrar
                        </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-2 space-y-2">
                            <Select value={environment} onValueChange={setEnvironment}>
                                <SelectTrigger><SelectValue placeholder="Entorno" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Entornos</SelectItem>
                                    {ambientes.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={criticality} onValueChange={setCriticality}>
                                <SelectTrigger><SelectValue placeholder="Criticidad" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toda la Criticidad</SelectItem>
                                    <SelectItem value="true">Crítico</SelectItem>
                                    <SelectItem value="false">No Crítico</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={monitoring} onValueChange={setMonitoring}>
                                <SelectTrigger><SelectValue placeholder="Monitoreo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todo el Monitoreo</SelectItem>
                                    <SelectItem value="true">Monitoreado</SelectItem>
                                    <SelectItem value="false">No Monitoreado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleClearFilters} className="justify-center">
                            <X className="mr-2 h-4 w-4" />
                            Limpiar Filtros
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportToCsv}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Exportar
                    </span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setFileUploadDialogOpen(true)}>
                      <FileUp className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Importar Datos
                      </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={handleCreate}>
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Crear Base de Datos
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
                <TableHead>Servidor</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Crítica</TableHead>
                <TableHead>Monitoreada</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDatabases.map((db) => {
                const ambienteName = getRelationName(db.ambienteId, ambientes);
                const estadoName = getRelationName(db.estadoOperativoId, estadosOperativos);
                return (
                  <TableRow key={db.id}>
                    <TableCell className="font-medium">{db.nombre_bd}</TableCell>
                    <TableCell>{getRelationName(db.servidorId, servidores)}</TableCell>
                    <TableCell>
                      <Badge variant={ambienteName === 'Producción' ? 'destructive' : 'secondary'}>{ambienteName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={estadoName === 'Operacional' || estadoName === 'En Línea' ? 'default' : 'outline' } className={estadoName === 'Operacional' || estadoName === 'En Línea' ? 'bg-green-500 text-white' : ''}>
                        {estadoName}
                      </Badge>
                    </TableCell>
                    <TableCell>{db.critico ? 'Si' : 'No'}</TableCell>
                    <TableCell>{db.monitoreado ? 'Si' : 'No'}</TableCell>
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
            servidor: getRelationName(selectedDb.servidorId, servidores),
            ip: getServidorById(selectedDb.servidorId, servidores)?.ip || 'N/A',
            motor: getRelationName(selectedDb.motorId, motores),
            edicion: getRelationName(selectedDb.edicionId, ediciones),
            licencia: getRelationName(selectedDb.licenciaId, licencias),
            ambiente: getRelationName(selectedDb.ambienteId, ambientes),
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
