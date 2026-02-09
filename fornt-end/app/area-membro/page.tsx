'use client'

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Book,
  Clock,
  History,
  BookmarkCheck
} from "lucide-react"
import { CardResume } from "@/components/card-resume"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { api } from "@/lib/api"
import { IMembro } from "@/types/interface"

export default function MembroDashboard() {
  const [dados, setDados] = useState<IMembro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const carregarPainelMembro = async () => {
    try {
      const res = await api.get('/membros/meu-painel')
      setDados(res.data)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      console.log("Erro ao carregar dados do membro")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPainelMembro()
  }, [])

  if (loading) return <div className="p-10 text-center">Carregando seu acervo...</div>

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Olá, {dados?.usuario?.nome ? dados?.usuario?.nome : 'Membro'}</h1>
          <p className="text-muted-foreground">Matrícula: {dados?.matricula} • Tipo: {dados?.tipo}</p>
        </div>
        <Badge variant={dados?.ativo ? "success" : "destructive"} className="h-6">
          {dados?.ativo ? "Conta Ativa" : "Conta Suspensa"}
        </Badge>
      </header>

      {/* Cards de Resumo baseados no Schema */}
      <div className="grid gap-4 md:grid-cols-3">
        <CardResume
          title="Empréstimos Ativos"
          value={dados?.emprestimos?.filter((e: any) => !e.dataDevolucao).length || 0}
          icon={<Book size={20} />}
        />
        <CardResume
          title="Minhas Reservas"
          value={dados?.reservas?.length || 0}
          icon={<Clock size={20} className="text-orange-500" />}
        />
        <CardResume
          title="Livros já lidos"
          value={dados?.historico?.length || 0}
          icon={<History size={20} className="text-blue-500" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lista de Empréstimos Atuais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookmarkCheck className="text-green-600" /> Meus Empréstimos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livro</TableHead>
                  <TableHead>Devolução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dias restantes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                { dados?.emprestimos && dados?.emprestimos.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {emp.exemplar.livro.titulo.length > 10
                        ? emp.exemplar.livro?.titulo.substring(0, 16) + "..."
                        : emp.exemplar.livro?.titulo
                      }
                    </TableCell>
                    <TableCell>{format(new Date(emp.dataPrevista), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={new Date(emp.dataPrevista) < new Date() ? "destructive" : "success"}>
                        {new Date(emp.dataPrevista) < new Date() ? "Atrasado" : "No prazo"}
                      </Badge>
                    </TableCell>
                    {/* CALCULAR DIAS RESTANTES */}
                    <TableCell>
                      {(() => {
                        const agora = new Date();
                        const prevista = new Date(emp.dataPrevista);
                        const diffMs = prevista.getTime() - agora.getTime();
                        // Já passou do prazo
                        if (diffMs <= 0) return 0;
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        // Se for hoje, calcular horas
                        if (diffDays === 0) {
                          const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
                          if (diffHours <= 1) {
                            const diffMint = Math.ceil(diffMs / (1000 * 60));
                            return `${diffMint}min`;
                          }
                          return `${diffHours}h`;
                        }
                        return diffDays;
                      })()}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Minhas Reservas / Fila de Espera */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reservas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              { dados?.reservas && dados?.reservas.map((res) => (
                <div key={res.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                  <div>
                    <p className="font-semibold text-sm">{res.livro?.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      Reservado em: {format(new Date(res.criadaEm), 'PPP', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                    Aguardando
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
