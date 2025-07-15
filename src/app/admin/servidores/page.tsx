
"use client";

import * as React from "react";
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Home, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { servidorSchema, Servidor } from "@/lib/relational-schema";
import { useData } from "@/context/data-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";


type FormData = z.infer<typeof servidorSchema>;

export default function ServidoresPage() {
  const { servidores, sistemasOperativos, addRelationalData, updateRelationalData, deleteRelationalData } = useData();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingServidor, setEditingServidor] = React.useState<Servidor | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(servidorSchema.omit({ id: true })),
    defaultValues: {
      nombre: "",
      ip: "",
      sistemaOperativoId: "",
      cpu: 1,
      ramGB: 2,
      discos: [{ nombre: 'C:', totalGB: 100, usadoGB: 50 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "discos",
  });

  React.useEffect(() => {
    if (isDialogOpen) {
      if (editingServidor) {
        form.reset({
          ...editingServidor,
          discos: editingServidor.discos.map(d => ({...d, id: undefined})) // remove id for validation
        });
      } else {
        form.reset({
          nombre: "",
          ip: "",
          sistemaOperativoId: "",
          cpu: 1,
          ramGB: 2,
          discos: [{ id: `new-disk-${Date.now()}`, nombre: 'C:', totalGB: 100, usadoGB: 50 }],
        });
      }
    }
  }, [editingServidor, isDialogOpen, form]);


  const handleCreate = () => {
    setEditingServidor(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (servidor: Servidor) => {
    setEditingServidor(servidor);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteRelationalData('servidores', id);
  };

  const onSubmit = (data: Omit<FormData, 'id'>) => {
    const finalData = {
      ...data,
      discos: data.discos.map((d, i) => ({ ...d, id: editingServidor?.discos[i]?.id || `disk-${Date.now()}-${i}` }))
    };

    if (editingServidor) {
      updateRelationalData('servidores', { id: editingServidor.id, ...finalData });
    } else {
      addRelationalData('servidores', finalData);
    }
    setIsDialogOpen(false);
    toast({
        title: "Éxito",
        description: "Servidor guardado correctamente.",
    })
  };

  const getSOName = (id: string) => {
    return sistemasOperativos.find(so => so.id === id)?.nombre || "Desconocido";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Servidores</CardTitle>
            <CardDescription>Administra los servidores de bases de datos.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/" passHref>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Volver al Inicio
                </span>
              </Button>
            </Link>
            <Button size="sm" className="h-8 gap-1" onClick={handleCreate}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Añadir Servidor</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección IP</TableHead>
              <TableHead>Sistema Operativo</TableHead>
              <TableHead className="text-center">CPU</TableHead>
              <TableHead className="text-center">RAM (GB)</TableHead>
              <TableHead>Almacenamiento</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servidores.map((servidor) => (
              <TableRow key={servidor.id}>
                <TableCell className="font-medium">{servidor.nombre}</TableCell>
                <TableCell>{servidor.ip}</TableCell>
                <TableCell>{getSOName(servidor.sistemaOperativoId)}</TableCell>
                <TableCell className="text-center">{servidor.cpu}</TableCell>
                <TableCell className="text-center">{servidor.ramGB}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    {servidor.discos.map(disco => (
                       <div key={disco.id}>
                        <div className="flex justify-between text-xs">
                           <span>{disco.nombre}</span>
                           <span>{disco.usadoGB} GB / {disco.totalGB} GB</span>
                        </div>
                         <Progress value={(disco.usadoGB / disco.totalGB) * 100} className="h-2" />
                       </div>
                    ))}
                  </div>
                </TableCell>
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
                      <DropdownMenuItem onSelect={() => handleEdit(servidor)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDelete(servidor.id)}>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
           <DialogHeader>
            <DialogTitle>{editingServidor ? "Editar Servidor" : "Añadir Servidor"}</DialogTitle>
            <DialogDescription>
              {editingServidor ? "Edita la información del servidor." : "Añade un nuevo servidor al inventario."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sistemaOperativoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sistema Operativo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un S.O." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sistemasOperativos.map(so => (
                              <SelectItem key={so.id} value={so.id}>{so.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU (Cores)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="ramGB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RAM (GB)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                    <Label className="mb-2 block">Discos</Label>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md relative">
                          <div className="col-span-3">
                             <FormField
                              control={form.control}
                              name={`discos.${index}.nombre`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ej: C:" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-4">
                             <FormField
                              control={form.control}
                              name={`discos.${index}.totalGB`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total (GB)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-4">
                            <FormField
                              control={form.control}
                              name={`discos.${index}.usadoGB`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Usado (GB)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-1 self-center pt-8">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ id: `new-disk-${Date.now()}`, nombre: '', totalGB: 0, usadoGB: 0 })}>
                      Añadir Disco
                    </Button>
                    {form.formState.errors.discos && typeof form.formState.errors.discos === 'object' && 'message' in form.formState.errors.discos && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.discos.message}</p>
                    )}
                </div>

              </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
