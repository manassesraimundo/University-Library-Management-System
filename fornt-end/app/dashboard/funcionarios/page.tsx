'use client'

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PowerOff, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Shield } from "lucide-react";
import { CreateFuncionarioModal } from "@/components/create-funcionario-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TooglePermicao } from "@/components/toogle-permicao";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { IUsuario } from "@/types/interface";
import { Role } from "@/types/enums";

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<IUsuario[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [filtroStatus, setFiltroStatus] = useState<boolean>(true);

  const carregarFuncionarios = async () => {
    try {
      const res = await api.get(`/usuarios?status=${filtroStatus}`)
      setFuncionarios(res.data)
    } catch (error) {
      toast.error("Erro ao carregar funcionários")
    } finally {
      setLoading(false)
    }
  }

  const buscarPorNomeOuEmail = async () => {
    try {
      const funcio = await api.get(`/usuarios?nome=${busca}`)
      setFuncionarios(funcio.data)
    } catch (error) {
      toast.error("Erro ao buscar funcionários")
    }
  };

  const handleToggleStatus = async (id: string, statusAtual: boolean) => {
    try {
      await api.patch(`/usuarios/${id}`, { ativo: !statusAtual });

      toast.success(statusAtual ? "Acesso revogado!" : "Acesso restaurado!");
      carregarFuncionarios();
    } catch (error) {
      toast.error("Não foi possível alterar o status.");
    }
  };

  useEffect(() => {
    carregarFuncionarios()
  }, [filtroStatus])

  useEffect(() => {
    buscarPorNomeOuEmail();
  }, [busca])


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Funcionários</h1>
            <p className="text-muted-foreground">Administre quem tem acesso ao painel do BIBLIO-TECH.</p>
          </div>
        </div>
        <CreateFuncionarioModal onSucesso={carregarFuncionarios} />
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ver Inativos</span>
          <Switch
            checked={filtroStatus === false}
            onCheckedChange={(checked) => setFiltroStatus(checked ? false : true)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo/Nível</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Carregando lista de colaboradores...
                </TableCell>
              </TableRow>
            ) : (funcionarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum funcionário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              funcionarios.map((func: IUsuario) => (
                <TableRow key={func.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      {func.nome}
                      <span className="text-[10px] text-muted-foreground">ID: {func.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{func.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {func.role === Role.ADMIN && (<Shield size={14} className="text-primary" />)}
                      <span className="text-sm">{func.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={func.ativo ? "success" : "secondary"}>
                      {func.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48 p-1">
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Ações de Gestão
                        </DropdownMenuLabel>

                        <TooglePermicao
                          funcionario={func}
                          onSucesso={carregarFuncionarios}
                        />

                        <div className="h-px bg-slate-100 my-1" /> {/* Divisor */}

                        <DropdownMenuItem
                          className={`flex items-center gap-2 cursor-pointer font-medium ${func.ativo ? 'text-red-600 focus:text-red-600 focus:bg-red-50' : 'text-green-600 focus:text-green-600 focus:bg-green-50'
                            }`}
                          onClick={() => handleToggleStatus(String(func.id), func.ativo)}
                        >
                          {func.ativo ? (
                            <>
                              <PowerOff size={14} />
                              <span>Desativar Acesso</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} />
                              <span>Reativar Acesso</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
