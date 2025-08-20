"use client";

import * as React from "react";
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Home } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { ambienteSchema, Ambiente } from "@/lib/relational-schema";
import { useData } from "@/context/data-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type FormData = z.infer<typeof ambienteSchema>;

export default function AmbientesPage() {
  const { ambientes, sistemas, addRelationalData, updateRelationalData, deleteRelationalData } = useData();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAmbiente, setEditingAmbiente] = React.useState<Ambiente | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(ambienteSchema.omit({ id: true })),
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (isDialogOpen) {
      if (editingAmbiente) {
        form.reset(editingAmbiente);
      } else {
        form.reset({
          nombre: "",
          descripcion: "",
          sistemaId: "",
          urlAcceso: "",
        });
      }
    }
  }, [editingAmbiente, isDialogOpen, form]);


  const handleCreate = () => {
    setEditingAmbiente(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (ambiente: Ambiente) => {
    setEditingAmbiente(ambiente);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteRelationalData('ambientes', id);
  };

  const onSubmit = (data: Omit<FormData, 'id'>) => {
    if (editingAmbiente) {
      updateRelationalData('ambientes', { id: editingAmbiente.id, ...data });
    } else {
      addRelationalData('ambientes', data);
    }
    setIsDialogOpen(false);
    toast({
        title: "Éxito",
        description: "Ambiente guardado correctamente.",
    })
  };

  const getSystemName = (systemId: string) => {
    return sistemas.find(s => s.id === systemId)?.nombre || "Desconocido";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ambientes de Sistema</CardTitle>
            <CardDescription>Administra los ambientes (Producción, QA, etc.) para cada sistema.</CardDescription>
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
              <span>Añadir Ambiente</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Sistema</TableHead>
              <TableHead>URL de Acceso</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ambientes.map((ambiente) => (
              <TableRow key={ambiente.id}>
                <TableCell className="font-medium">{ambiente.nombre}</TableCell>
                <TableCell>{getSystemName(ambiente.sistemaId)}</TableCell>
                <TableCell>
                    {ambiente.urlAcceso ? <a href={ambiente.urlAcceso} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{ambiente.urlAcceso}</a> : 'N/A'}
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
                      <DropdownMenuItem onSelect={() => handleEdit(ambiente)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDelete(ambiente.id)}>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingAmbiente ? "Editar Ambiente" : "Añadir Ambiente"}</DialogTitle>
            <DialogDescription>
                {editingAmbiente ? "Edita la información del ambiente." : "Añade un nuevo ambiente a un sistema."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 p-4">
                <FormField
                  control={form.control}
                  name="sistemaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sistema</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un sistema" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sistemas.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Ambiente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Producción, QA, Desarrollo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe el propósito de este ambiente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="urlAcceso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Acceso (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
