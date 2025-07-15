"use client";

import * as React from "react";
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Home } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sistemaOperativoSchema, SistemaOperativo } from "@/lib/relational-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useData } from "@/context/data-context";

type FormData = z.infer<typeof sistemaOperativoSchema>;

export default function SistemasOperativosPage() {
  const { sistemasOperativos, addRelationalData, updateRelationalData, deleteRelationalData } = useData();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSO, setEditingSO] = React.useState<SistemaOperativo | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<FormData, 'id'>>({
    resolver: zodResolver(sistemaOperativoSchema.omit({ id: true })),
  });

  const handleCreate = () => {
    setEditingSO(null);
    reset({ nombre: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (so: SistemaOperativo) => {
    setEditingSO(so);
    reset(so);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteRelationalData('sistemasOperativos', id);
  };

  const onSubmit = (data: Omit<FormData, 'id'>) => {
    if (editingSO) {
      updateRelationalData('sistemasOperativos', { ...editingSO, ...data });
    } else {
      addRelationalData('sistemasOperativos', data);
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Sistemas Operativos</CardTitle>
            <CardDescription>Administra los sistemas operativos de los servidores.</CardDescription>
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
              <span>Añadir S.O.</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sistemasOperativos.map((so) => (
              <TableRow key={so.id}>
                <TableCell className="font-medium">{so.nombre}</TableCell>
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
                      <DropdownMenuItem onSelect={() => handleEdit(so)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDelete(so.id)}>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingSO ? "Editar Sistema Operativo" : "Añadir Sistema Operativo"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <div className="col-span-3">
                  <Input
                    id="nombre"
                    {...register("nombre")}
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                  )}
                </div>
              </div>
            </div>
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