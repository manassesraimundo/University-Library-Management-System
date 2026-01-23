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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, Search } from "lucide-react";
import { CreateEmprestimoModal } from "@/components/create-emprestimo-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";

export default function EmprestimosPage() {
    const [emprestimos, setEmprestimos] = useState([])
    const [status, setStatus] = useState('ativos')
    const [input, setInput] = useState("")

    /* GAREGANDO O EMPRESTIMOS DE TODOS OS MEMBRO */
    const carregarEmprestimosAtivos = async () => {
        try {
            const response = await api.get('/emprestimos/todos')
            const res = response.data;
            const ativos = res.filter((emp: any) => !emp.dataDevolucao)
            setEmprestimos(ativos)
        } catch (error: any) {
            toast.error("Erro ao carregar dados dos empréstimos")
            if (error.response?.status === 401) window.location.href = '/login'
        }
    }

    const carregarEmprestimosAtraso = async () => {
        try {
            const response = await api.get('/emprestimos/todos/atrasos')
            setEmprestimos(response.data)
        } catch (error: any) {
            toast.error("Erro ao carregar dados dos empréstimos")
            if (error.response?.status === 401) window.location.href = '/login'
        }
    }

    const carregarEmprestimos = async () => {
        try {
            const response = await api.get('/emprestimos/todos')
            const res = response.data
            const ativos = res.filter((emp: any) => emp.dataDevolucao)
            setEmprestimos(ativos)
        } catch (error: any) {
            toast.error("Erro ao carregar dados dos empréstimos")
            if (error.response?.status === 401) window.location.href = '/login'
        }
    }

    /* GAREGANDO O EMPRESTIMOS DE UM MEMBRO ESPECIFICO */
    const carregarEmprestimosByMembroAtivos = async () => {
        try {
            const response = await api.get(`/emprestimos/${input}`)
            const res = response.data;
            const ativos = res.filter((emp: any) => !emp.dataDevolucao)
            setEmprestimos(ativos)
        } catch (error: any) {
            toast.error("Erro ao carregar dados dos empréstimos")
            if (error.response?.status === 401) window.location.href = '/login'
        }
    }

    const getAllEmprestimosByMembroAtraso = async () => {
        try {
            const response = await api.get(`/emprestimos/${input}/atrasos`)
            setEmprestimos(response.data)
        } catch (error: any) {
            toast.error("Erro ao carregar dados dos empréstimos")
            if (error.response?.status === 401) window.location.href = '/login'
        }
    }

    const carregarEmprestimosByMembro = async () => {
        try {
            const response = await api.get(`/emprestimos/${input}`)
            const res = response.data
            const ativos = res.filter((emp: any) => emp.dataDevolucao)
            setEmprestimos(ativos)
        } catch (error: any) {
            toast.error("Erro ao carregar dados dos empréstimos")
            if (error.response?.status === 401) window.location.href = '/login'
        }
    }

    useEffect(() => {
        if (input.length !== 8) {
            if (status === 'ativos')
                carregarEmprestimosAtivos()
            else if (status === 'atrasados')
                carregarEmprestimosAtraso()
            else
                carregarEmprestimos()
        }
        else if (input.length === 8) {
            if (status === 'ativos')
                carregarEmprestimosByMembroAtivos()
            else if (status === 'atrasados')
                getAllEmprestimosByMembroAtraso()
            else
                carregarEmprestimosByMembro()
        }

    }, [status, input]);

    const handleDevolucao = async (id: number) => {
        try {
            await api.post('/emprestimos/devolucao', {
                emprestimoId: id
            })

            toast.success("Livro devolvido com sucesso!")
            carregarEmprestimos()
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao processar devolução"
            toast.error(msg)
        }
    }

    const handleRenovacao = async (id: number) => {
        try {
            await api.post('/emprestimos/renovar', {
                emprestimoId: id
            })

            toast.success("Prazo renovado com sucesso!")
            carregarEmprestimos()
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao renovar"
            toast.error(msg)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-bold">Fluxo de Empréstimos</h1>
                </div>
                <CreateEmprestimoModal onSucesso={carregarEmprestimos} />
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 ml-2 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Buscar por empréstimo do membro pelo número de matricula..."
                        value={input}
                        onChange={(t) => setInput(t.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue={status} onValueChange={setStatus} className="w-full">
                <TabsList>
                    <TabsTrigger value="ativos">Ativos</TabsTrigger>
                    <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
                    <TabsTrigger value="todos">Histórico Total</TabsTrigger>
                </TabsList>

                <TabsContent value={status} className="bg-white border rounded-xl p-4 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Livro</TableHead>
                                <TableHead>Membro</TableHead>
                                <TableHead>Data Empréstimo</TableHead>
                                <TableHead>Devolução Prevista</TableHead>
                                <TableHead>Data da Devolução</TableHead>
                                <TableHead>Número de renovações</TableHead>
                                {
                                    status !== 'ativos' && (<TableHead>Multa</TableHead>)

                                }
                                {
                                    status !== 'todos' && (<TableHead className="text-right">Ações</TableHead>)
                                }

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                emprestimos.length !== 0 ? emprestimos.map((emp: any) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">{emp.livro?.titulo}</TableCell>
                                        <TableCell>{emp.membro?.matricula}</TableCell>
                                        <TableCell>{new Date(emp.dataEmprestimo).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                                {new Date(emp.dataPrevista).toLocaleDateString()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                                {emp.dataDevolucao && new Date(emp.dataDevolucao).toLocaleDateString()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                                {emp.renovacoes}
                                            </Badge>
                                        </TableCell>
                                        {
                                            status !== 'ativos' && (
                                                <TableCell>
                                                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                                                        {emp.multa?.valor ? emp.multa?.valor : '0.00kz'}
                                                    </Badge>
                                                </TableCell>
                                            )
                                        }
                                        {
                                            status !== 'todos' && (
                                                <TableCell className="text-right space-x-2">
                                                    {
                                                        status !== 'atrasados' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleRenovacao(emp.id)}>
                                                                <RefreshCw className="mr-2 h-3 w-3" /> Renovar
                                                            </Button>
                                                        )
                                                    }
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDevolucao(emp.id)}>
                                                        <CheckCircle className="mr-2 h-3 w-3" /> Devolver
                                                    </Button>
                                                </TableCell>
                                            )
                                        }
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            Nenhum empréstimos encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </div>
    )
}