'use client'

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import BotaoImprimirRelatorio from "@/components/botao-imprimir-relatorio";

export default function RelatoriosPage() {
  const [maisEmprestados, setMaisEmprestados] = useState<any>([])
  const [reservasPendentes, setReservasPendentes] = useState([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    try {
      const [resLivros, resReservas] = await Promise.all([
        api.get('/relatorios/livros-mais-emprestados-todos-tempos'),
        api.get('/relatorios/reservas-pendentes')
      ])

      // Formatando dados para o gráfico (Recharts espera { name, value })
      const dadosGrafico = resLivros.data.map((item: any) => ({
        titulo: item.titulo.length > 15
          ? item.titulo.substring(0, 15) + "..."
          : item.titulo,
        total: item._count?.emprestimos || item.total_emprestimo || 0
      }))

      setMaisEmprestados(dadosGrafico)
      setReservasPendentes(resReservas.data)
    } catch (error) {
      toast.error("Erro ao carregar relatórios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarDados() }, [])

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-1 justify-between items-start">

        <div className="flex gap-2">
          <SidebarTrigger className="mt-2" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios & Métricas</h1>
            <p className="text-muted-foreground">Análise de desempenho do acervo e fluxo de leitores.</p>
          </div>
        </div>

        <BotaoImprimirRelatorio
          dadosGrafico={maisEmprestados}
          reservas={reservasPendentes}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card de Resumo: Reservas */}
        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservasPendentes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando retirada ou devolução</p>
          </CardContent>
        </Card>

        {/* Card de Resumo: Livro do Momento */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Top Livro</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className=" font-bold ">
              {maisEmprestados[0]?.titulo || "Nenhum dado"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mais emprestado de todos os tempos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Gráfico de Barras */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Livros Mais Emprestados</CardTitle>
            <CardDescription>Ranking baseado no histórico total de empréstimos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width={"100%"} height={"100%"} >
              <BarChart data={maisEmprestados}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="titulo" fontSize={12} tickLine={true} axisLine={true} />
                <YAxis fontSize={12} tickLine={true} axisLine={true} />
                <Tooltip
                  cursor={{ fill: 'rgba(249, 168, 0, 0.15)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar
                  dataKey="total"
                  fill="#f9a800"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lista de Reservas Recentes */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Filas de Reserva</CardTitle>
            <CardDescription>Próximos leitores na espera.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservasPendentes && reservasPendentes.slice(0, 5).map((reserva: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{reserva.livro?.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {reserva.membro?.usuario?.nome} - {reserva.membro?.matricula}
                    </p>

                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {new Date(reserva.criadaEm).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
              {reservasPendentes.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10">Nenhuma reserva pendente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}