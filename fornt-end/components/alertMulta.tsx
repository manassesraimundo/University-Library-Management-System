'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import React from "react";

interface IAlertMultaProps {
  children: React.ReactNode;
  multa: number;
  emprestimoId: number;
}

export default function AlertMulta({ children, multa, emprestimoId }: IAlertMultaProps) {
  const pagarMulta = async () => {
    try {
      const res = await api.put(`/emprestimos/multa/pagar/${emprestimoId}`);
      const data = res.data;
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error.response?.data?.message)
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o livro {multa}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {multa > 0 && (
            <AlertDialogAction
              onClick={pagarMulta}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Pagamento
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}