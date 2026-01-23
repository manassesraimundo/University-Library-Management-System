'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateLivroForm } from "./create-livro-form";

export function CreateLivroModal({ onLivroCriado, }: { onLivroCriado: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Livro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Livro</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar um novo item ao acervo.
          </DialogDescription>
        </DialogHeader>
 
        <CreateLivroForm closeModal={setOpen} onLivroCriado={onLivroCriado} />

      </DialogContent>
    </Dialog>
  )
}

