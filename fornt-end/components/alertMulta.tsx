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
import React, { useState } from "react";
import AlertGlobal from "./alertGlobal";

interface IAlertMultaProps {
  children: React.ReactNode;
  multa: number;
  isOpen: boolean;
  setIsOpen: () => void;
  emprestimoId: number;
}

export default function AlertMulta({ children, multa, isOpen, setIsOpen, emprestimoId }: IAlertMultaProps) {
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const pagarMulta = async () => {
    try {
      const res = await api.put(`/emprestimos/multa/pagar/${emprestimoId}`);
      const data = res.data;
      toast.success(data.message)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      setMessage(error.response?.data?.message)
      setError(true);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {error && <AlertGlobal isOpen={error} setIsOpen={() => setError(false)} message={message} titulo="Erro Multa" />}
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Multas</AlertDialogTitle>
          <AlertDialogDescription>
            Multa no valor de {new Intl.NumberFormat('pt-AO', {
              style: 'currency',
              currency: 'AOA'
            }).format(multa)}kz.
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