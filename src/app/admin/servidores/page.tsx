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

type FormData = z.infer<typeof servidorSchema>;

export default function ServidoresPage() {
  const { servidores, addRelationalData, updateRelationalData, deleteRelationalData } = useData();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingServidor, setEditingServidor] = React.useState<Servidor | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(servidorSchema.omit({ id: true })),
    defaultValues: {
      nombre: "",
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
    if (editingServidor) {
      form.reset({
        ...editingServidor,
        discos: editingServidor.discos.map(d => ({...d, id: undefined})) // remove id for validation
      });
    } else {
      form.reset({
        nombre: "",
        cpu: 1,
        ramGB: 2,
        discos: [{ nombre: 'C:', totalGB: 100, usadoGB: 50, id: `disk-${Date.now()}` }],
      });
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
      updateRelationalData('servidores', { ...editingServidor, ...finalData });
    } else {
      addRelationalData('servidores', finalData);
    }
    setIsDialogOpen(false);
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-[60vh] p-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Nombre</Label>
                  <div className="col-span-3">
                    <Input id="nombre" {...form.register("nombre")} />
                    {form.formState.errors.nombre && <p className="text-red-500 text-xs mt-1">{form.formState.errors.nombre.message}</p>}
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cpu" className="text-right">CPU (Cores)</Label>
                  <div className="col-span-3">
                    <Input id="cpu" type="number" {...form.register("cpu", { valueAsNumber: true })} />
                    {form.formState.errors.cpu && <p className="text-red-500 text-xs mt-1">{form.formState.errors.cpu.message}</p>}
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ramGB" className="text-right">RAM (GB)</Label>
                  <div className="col-span-3">
                    <Input id="ramGB" type="number" {...form.register("ramGB", { valueAsNumber: true })} />
                    {form.formState.errors.ramGB && <p className="text-red-500 text-xs mt-1">{form.formState.errors.ramGB.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Discos</Label>
                   {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center mt-2 p-2 border rounded-md">
                      <div className="col-span-3">
                        <Label htmlFor={`discos.${index}.nombre`} className="text-xs">Nombre</Label>
                        <Input id={`discos.${index}.nombre`} {...form.register(`discos.${index}.nombre`)} placeholder="Ej: C:" />
                      </div>
                      <div className="col-span-4">
                        <Label htmlFor={`discos.${index}.totalGB`} className="text-xs">Total (GB)</Label>
                        <Input id={`discos.${index}.totalGB`} type="number" {...form.register(`discos.${index}.totalGB`, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-4">
                        <Label htmlFor={`discos.${index}.usadoGB`} className="text-xs">Usado (GB)</Label>
                        <Input id={`discos.${index}.usadoGB`} type="number" {...form.register(`discos.${index}.usadoGB`, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-1 self-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {form.formState.errors.discos?.[index]?.nombre && <p className="text-red-500 text-xs mt-1 col-span-12">{form.formState.errors.discos[index].nombre.message}</p>}
                      {form.formState.errors.discos?.[index]?.totalGB && <p className="text-red-500 text-xs mt-1 col-span-12">{form.formState.errors.discos[index].totalGB.message}</p>}
                      {form.formState.errors.discos?.[index]?.usadoGB && <p className="text-red-500 text-xs mt-1 col-span-12">{form.formState.errors.discos[index].usadoGB.message}</p>}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ id: `new-${Date.now()}`, nombre: '', totalGB: 0, usadoGB: 0 })}>
                    Añadir Disco
                  </Button>
                  {form.formState.errors.discos && <p className="text-red-500 text-xs mt-1">{form.formState.errors.discos.message}</p>}
                </div>
            </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
