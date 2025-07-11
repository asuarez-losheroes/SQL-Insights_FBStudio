'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  FormDescription,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Database } from '@/lib/types';
import { databaseSchema } from '@/lib/schema';

interface DatabaseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Database) => void;
  database: Database | null;
}

export default function DatabaseFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  database,
}: DatabaseFormDialogProps) {
  const form = useForm<Database>({
    resolver: zodResolver(databaseSchema),
    defaultValues: database || {
      nombre_bd: '',
      instancia: '',
      servidor: '',
      ip: '',
      motor: '',
      version: '',
      edicion: '',
      licencia: '',
      ambiente: 'Development',
      critico: false,
      monitoreado: false,
      respaldo: false,
      contingencia: false,
      ubicacion: '',
      grupo_soporte: '',
      cluster: false,
      estado_operativo: 'Unknown',
      compañia: '',
    },
  });

  React.useEffect(() => {
    if (database) {
      form.reset(database);
    } else {
      form.reset({
        nombre_bd: '',
        instancia: '',
        servidor: '',
        ip: '',
        motor: '',
        version: '',
        edicion: '',
        licencia: '',
        ambiente: 'Development',
        critico: false,
        monitoreado: false,
        respaldo: false,
        contingencia: false,
        ubicacion: '',
        grupo_soporte: '',
        cluster: false,
        estado_operativo: 'Unknown',
        compañia: '',
      });
    }
  }, [database, form, isOpen]);

  const onSubmit = (values: Database) => {
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
            <ScrollArea className="h-[60vh] p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre_bd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de BD</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. mi_base_de_datos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="servidor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servidor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. servidor_produccion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="instancia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instancia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. MSSQLSERVER" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección IP</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 192.168.1.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Microsoft SQL Server 2019" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versión</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 15.0.4312.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="edicion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edición</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Standard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Licencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Standard Edition (64-bit)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ambiente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ambiente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un ambiente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Production">Producción</SelectItem>
                          <SelectItem value="Development">Desarrollo</SelectItem>
                          <SelectItem value="Staging">Pruebas</SelectItem>
                          <SelectItem value="Contingency">Contingencia</SelectItem>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="TEST">TEST</SelectItem>
                          <SelectItem value="Produccion">Produccion</SelectItem>
                          <SelectItem value="Noprod">Noprod</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado_operativo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Operativo</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Operational">Operacional</SelectItem>
                          <SelectItem value="Online">En Línea</SelectItem>
                          <SelectItem value="Offline">Fuera de Línea</SelectItem>
                          <SelectItem value="Unknown">Desconocido</SelectItem>
                           <SelectItem value="Operacional">Operacional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="ubicacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. GCP, Azure" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="grupo_soporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo de Soporte</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. TIVIT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="compañia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compañía</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Caja Los Heroes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="critico"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Crítico</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monitoreado"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Monitoreado</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="respaldo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Respaldado</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="contingencia"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Contingencia</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="cluster"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>En Clúster</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>
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
