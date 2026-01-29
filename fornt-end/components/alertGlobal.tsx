'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface IAlertGlobalProps {
  isOpen: boolean;
  setIsOpen: () => void;
  message: string;
  titulo?: string;
}

export default function AlertGlobal({ isOpen, setIsOpen, message, titulo }: IAlertGlobalProps) {

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-2">
            <AlertTriangle className="text-yellow-400" /> 
            <span>{titulo || "Erro"}</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {message}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={setIsOpen}>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}