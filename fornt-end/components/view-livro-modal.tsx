'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Book,
  User,
  Tag,
  Calendar,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ILivro } from "@/types/interface";


export function ViewLivroModal({ livroId }: { livroId: number }) {
  const [livro, setLivro] = useState<ILivro | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLivroDetalhes = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/livros/${livroId}`)
      setLivro(res.data)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      const mensagem = error.response?.data?.message || "Erro ao carregar detalhes do livro"
      toast.error(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog onOpenChange={(open) => open && fetchLivroDetalhes()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
          <Eye className="h-4 w-4" /> Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Book className="h-5 w-5 text-primary" />
            Detalhes do Livro
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground animate-pulse">
            Carregando informações...
          </div>
        ) : livro ? (
          <div className="space-y-6 pt-4">
            {/* Cabeçalho de Status */}
            <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg border">
              <div className="flex gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Etiqueta</p>
                  <Badge
                    variant={livro.etiqueta === 'BRANCO' ? 'outline' : livro.etiqueta === 'AMARELO' ? 'yellow' : 'destructive'}
                    className="mt-1"
                  >
                    {livro.etiqueta}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ID do Acervo</p>
                <p className="font-mono font-bold text-lg">#{livro.id}</p>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-1 gap-4 py-6">
              <DetailItem
                icon={<Book size={16} />}
                label="Título"
                value={livro.titulo}
              />
              <div className="grid gap-4">
                <div className="flex flex-1 justify-between items-center mb-2">
                  <DetailItem
                    icon={<User size={16} />}
                    label="Autor"
                    value={livro.autor?.nome || "Não informado"}
                  />
                  <DetailItem
                    icon={<Tag size={16} />}
                    label="Categoria"
                    value={livro.categoria?.nome || "Sem categoria"}
                  />
                </div>
                <div className="flex flex-1 justify-between items-center">
                  <DetailItem
                    icon={null}
                    label="Quantidade de exmplares"
                    value={String(livro.exemplares?.length) || '0'}
                  />
                  <DetailItem
                    icon={null}
                    label="Exemplares disponíveis"
                    value={String(livro._count?.exemplares) || '0'}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Metadados Adicionais */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span>Cadastrado em: {new Date(livro.criadoEm).toLocaleDateString()}</span>
              </div>
              {livro.isbn && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash size={14} />
                  <span>ISBN: {livro.isbn}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4"></div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1 w-full">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
        {icon} {label}
      </p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  )
}