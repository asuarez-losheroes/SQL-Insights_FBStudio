'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { databaseSchema, DatabaseFormValues } from '@/lib/schema';
import { useData } from '@/context/data-context';

interface DatabaseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: DatabaseFormValues) => void;
  database: DatabaseFormValues | null;
}

export default function DatabaseFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  database,
}: DatabaseFormDialogProps) {
  const {
    servidores,
    motores,
    ediciones,
    licencias,
    ambientes,
    ubicaciones,
    gruposSoporte,
    estadosOperativos,
    companias,
  } = useData();

  const form = useForm<DatabaseFormValues>({
    resolver: zodResolver(databaseSchema),
    defaultValues: database || {
      nombre_bd: '',
      instancia: '',
      version: '',
      critico: false,
      monitoreado: false,
      respaldo: false,
      contingencia: false,
      cluster: false,
      servidorId: '',
      motorId: '',
      edicionId: '',
      licenciaId: '',
      ambienteId: '',
      ubicacionId: '',
      grupoSoporteId: '',
      estadoOperativoId: '',
      companiaId: '',
    },
  });

  React.useEffect(() => {
    form.reset(database || {
        nombre_bd: '',
        instancia: '',
        version: '',
        critico: false,
        monitoreado: false,
        respaldo: false,
        contingencia: false,
        cluster: false,
        servidorId: '',
        motorId: '',
        edicionId: '',
        licenciaId: '',
        ambienteId: '',
        ubicacionId: '',
        grupoSoporteId: '',
        estadoOperativoId: '',
        companiaId: '',
    });
  }, [database, form, isOpen]);

  const onSubmit = (values: DatabaseFormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {database ? 'Editar Base de Datos' : 'Crear Nueva Base de Datos'}
          </DialogTitle>
          <DialogDescription>
            {database
              ? 'Edita la información de la base de datos existente.'
              : 'Completa los detalles para agregar una nueva base de datos al inventario.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div tabIndex={-1} className="grid grid-cols-2 gap-4 h-[60vh] p-4 overflow-y-auto">
                <FormField control={form.control} name="nombre_bd" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Nombre de BD</FormLabel><FormControl><Input placeholder="Ej. mi_base_de_datos" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="servidorId" render={({ field }) => (<FormItem><FormLabel>Servidor</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un servidor" /></SelectTrigger></FormControl><SelectContent>{servidores.map(s => (<SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="motorId" render={({ field }) => (<FormItem><FormLabel>Motor</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un motor" /></SelectTrigger></FormControl><SelectContent>{motores.map(m => (<SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="edicionId" render={({ field }) => (<FormItem><FormLabel>Edición</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una edición" /></SelectTrigger></FormControl><SelectContent>{ediciones.map(e => (<SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="licenciaId" render={({ field }) => (<FormItem><FormLabel>Licencia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una licencia" /></SelectTrigger></FormControl><SelectContent>{licencias.map(l => (<SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="ambienteId" render={({ field }) => (<FormItem><FormLabel>Ambiente</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un ambiente" /></SelectTrigger></FormControl><SelectContent>{ambientes.map(a => (<SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="ubicacionId" render={({ field }) => (<FormItem><FormLabel>Ubicación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una ubicación" /></SelectTrigger></FormControl><SelectContent>{ubicaciones.map(u => (<SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="grupoSoporteId" render={({ field }) => (<FormItem><FormLabel>Grupo de Soporte</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un grupo" /></SelectTrigger></FormControl><SelectContent>{gruposSoporte.map(g => (<SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="estadoOperativoId" render={({ field }) => (<FormItem><FormLabel>Estado Operativo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl><SelectContent>{estadosOperativos.map(e => (<SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="companiaId" render={({ field }) => (<FormItem><FormLabel>Compañía</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una compañía" /></SelectTrigger></FormControl><SelectContent>{companias.map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="instancia" render={({ field }) => (<FormItem><FormLabel>Instancia</FormLabel><FormControl><Input placeholder="Ej. MSSQLSERVER" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="version" render={({ field }) => (<FormItem><FormLabel>Versión</FormLabel><FormControl><Input placeholder="Ej. 15.0.4312.2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="critico" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Crítico</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="monitoreado" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Monitoreado</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                   <FormField control={form.control} name="respaldo" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Respaldado</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                   <FormField control={form.control} name="contingencia" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Contingencia</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                   <FormField control={form.control} name="cluster" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>En Clúster</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                </div>
              </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
