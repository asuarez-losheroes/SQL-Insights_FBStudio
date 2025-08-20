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
import { sistemaSchema, Sistema } from "@/lib/relational-schema";
import { useData } from "@/context/data-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type FormData = z.infer<typeof sistemaSchema>;

export default function SistemasPage() {
  const { sistemas, criticidades, tiposSistema, addRelationalData, updateRelationalData, deleteRelationalData } = useData();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSistema, setEditingSistema] = React.useState<Sistema | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(sistemaSchema.omit({ id: true })),
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (isDialogOpen) {
      if (editingSistema) {
        form.reset(editingSistema);
      } else {
        form.reset({
          nombre: "",
          descripcion: "",
          criticidadId: "",
          tipoSistemaId: "",
          responsableNegocio: "",
          responsableTecnico: ""
        });
      }
    }
  }, [editingSistema, isDialogOpen, form]);


  const handleCreate = () => {
    setEditingSistema(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (sistema: Sistema) => {
    setEditingSistema(sistema);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteRelationalData('sistemas', id);
  };

  const onSubmit = (data: Omit<FormData, 'id'>) => {
    if (editingSistema) {
      updateRelationalData('sistemas', { id: editingSistema.id, ...data });
    } else {
      addRelationalData('sistemas', data);
    }
    setIsDialogOpen(false);
    toast({
        title: "Éxito",
        description: "Sistema guardado correctamente.",
    })
  };
  
  const getRelationName = (id: string, collection: {id: string, nombre: string}[]) => {
    return collection.find(item => item.id === id)?.nombre || "Desconocido";
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Sistemas de Negocio</CardTitle>
            <CardDescription>Administra los sistemas y aplicaciones principales del negocio.</CardDescription>
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
              <span>Añadir Sistema</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Criticidad</TableHead>
              <TableHead>Responsable Técnico</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sistemas.map((sistema) => (
              <TableRow key={sistema.id}>
                <TableCell className="font-medium">{sistema.nombre}</TableCell>
                <TableCell>{getRelationName(sistema.tipoSistemaId, tiposSistema)}</TableCell>
                <TableCell>{getRelationName(sistema.criticidadId, criticidades)}</TableCell>
                <TableCell>{sistema.responsableTecnico}</TableCell>
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
                      <DropdownMenuItem onSelect={() => handleEdit(sistema)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDelete(sistema.id)}>Eliminar</DropdownMenuItem>
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
            <DialogTitle>{editingSistema ? "Editar Sistema" : "Añadir Sistema"}</DialogTitle>
             <DialogDescription>
                {editingSistema ? "Edita la información del sistema." : "Añade un nuevo sistema al inventario."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 p-4 max-h-[70vh] overflow-y-auto">
                <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Sistema</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="descripcion" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="tipoSistemaId" render={({ field }) => (<FormItem><FormLabel>Tipo de Sistema</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger></FormControl><SelectContent>{tiposSistema.map(t => (<SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="criticidadId" render={({ field }) => (<FormItem><FormLabel>Criticidad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una criticidad" /></SelectTrigger></FormControl><SelectContent>{criticidades.map(c => (<SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="responsableTecnico" render={({ field }) => (<FormItem><FormLabel>Responsable Técnico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="responsableNegocio" render={({ field }) => (<FormItem><FormLabel>Responsable de Negocio</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
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
