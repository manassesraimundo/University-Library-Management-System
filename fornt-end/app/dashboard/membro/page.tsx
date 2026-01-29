'use client'

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateMembroModal } from "@/components/create-membro-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { MembroDetalhesModal } from "@/components/membro-detalhes-modal";
import { api } from "@/lib/api";
import { IMembro } from "@/types/interface";

export default function MembrosPage() {
  const router = useRouter();

  const [membros, setMembros] = useState<IMembro[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("true");
  const [busca, setBusca] = useState<string>("");

  const [membroSelecionado, setMembroSelecionado] = useState<string | null>(null)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState<boolean>(false)
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const carregarMembros = async () => {
    try {
      const response = await api.get('/membros', {
        params: {
          status: filtroStatus
        }
      })
      setMembros(response.data)
    } catch (error: any) {
      toast.error("Erro ao carregar lista de membros")
      if (error.response?.status === 401) router.replace('/login')
    }
  }

  const buscarMembroPelaMatricula = async () => {
    try {
      const response = await api.get(`/membros/${busca}`)

      setMembros(response.data)

    } catch (error: any) {
      if (error.response?.status === 401) router.replace('/login')
    }
  }

  useEffect(() => {
    carregarMembros()
  }, [filtroStatus, busca])

  useEffect(() => {
    if (busca && busca.length === 8)
      buscarMembroPelaMatricula()
  }, [busca])

  // Alternar status (Ativo/Inativo)
  const handleToggleStatus = async (matricula: string, statusAtual: boolean) => {
    try {
      // Ajustando para PUT usando a instância API
      await api.put(`/membros/${matricula}/status/${!statusAtual}`)
      toast.success(`Membro ${statusAtual ? 'desativado' : 'ativado'} com sucesso`)
      carregarMembros()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar status")
    }
  }

  // Deletar membro
  // const handleDelete = async (matricula: string) => {

  //     try {
  //         const s = await api.delete(`/membros/${matricula}`)

  //         console.log(s.data)

  //         toast.success("Membro removido com sucesso")

  //         setIsAlertOpen(false)
  //         carregarMembros()
  //     } catch (error: any) {
  //         alert(error.message)
  //         toast.error("Erro ao deletar membro")
  //     }
  // }

  const abrirDetalhes = (matricula: string) => {
    setMembroSelecionado(matricula)
    setModalDetalhesAberto(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* ... Cabeçalho permanece igual ... */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Gestão de Membros</h1>
            <p className="text-muted-foreground text-sm">Administre os leitores cadastrados no sistema.</p>
          </div>
        </div>
        <CreateMembroModal onMembroCriado={carregarMembros} />
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por matrícula..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ver Inativos</span>
          <Switch
            checked={filtroStatus === "false"}
            onCheckedChange={(checked) => setFiltroStatus(checked ? "false" : "true")}
          />
        </div>
      </div>

      {/* TABELA DE DADOS */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membros.length > 0 ? membros.map((membro: IMembro) => (
              <TableRow key={membro.matricula}>
                <TableCell className="font-mono font-bold text-primary">{membro.matricula}</TableCell>
                <TableCell>{membro.usuario?.nome}</TableCell>
                <TableCell>{membro.usuario?.email}</TableCell>
                <TableCell>
                  <Badge variant={membro.ativo ? "success" : "destructive"}>
                    {membro.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Opções</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => abrirDetalhes(membro.matricula)}>
                        Ver detalhes do membro
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`
                                                    ${membro.ativo ? 'text-red-600 focus:text-red-600'
                            : 'text-green-600 focus:text-green-600'}`
                        }
                        onClick={() => handleToggleStatus(membro.matricula, membro.ativo)}
                      >
                        {membro.ativo ? "Desativar" : "Ativar"} Membro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum membro encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MembroDetalhesModal
        matricula={membroSelecionado}
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
      />
    </div>
  )
}
