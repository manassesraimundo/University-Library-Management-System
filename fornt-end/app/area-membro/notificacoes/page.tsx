'use client'

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  CalendarClock,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { INotificacao } from "@/types/interface";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<INotificacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtro, setFiltro] = useState<string>('todas');

  const carregarNotificacoes = async () => {
    try {
      const res = await api.get('membros/notificacoes')
      const naoLidas = res.data.filter((notif: any) => !notif.lida)

      if (filtro === 'nao-lidas')
        setNotificacoes(naoLidas) 
      else
        setNotificacoes(res.data)
    } catch (error) {
      toast.error("Erro ao carregar seu histórico.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarNotificacoes() }, [notificacoes, filtro])

  const marcarLida = async (id: string) => {
    try {
      await api.patch(`membros/notificacoes/${id}/mark-as-read`)
      carregarNotificacoes()
    } catch (error) { 
      toast.error("Erro ao marcar notificação como lida.")
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      await api.patch(`membros/notificacoes/mark-all-as-read`)
      carregarNotificacoes()
      toast.success("Todas as notificações foram marcadas como lidas.")
    } catch (error) { 
      toast.error("Erro ao marcar todas as notificações como lidas.")
    }
  }

  const limparHistorico = async () => {
    try {
      await api.delete(`membros/notificacoes/clear-history`)
      carregarNotificacoes()
      toast.success("Histórico de notificações limpo com sucesso.")
    } catch (error) { 
      toast.error("Erro ao limpar o histórico de notificações.")
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Notificações</h1>
          <p className="text-muted-foreground">Gerencie seus alertas e avisos da biblioteca.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={marcarTodasComoLidas}
            disabled={notificacoes.length === 0 ? true : false}
          >
            <CheckCheck size={16} /> Marcar tudo como lido
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-2"
            onClick={limparHistorico}
            disabled={notificacoes.length === 0 ? true : false}
          >
            <Trash2 size={16} /> Limpar histórico
          </Button>
        </div>
      </div>

      <Tabs defaultValue={filtro} onValueChange={setFiltro} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="nao-lidas">Não Lidas</TabsTrigger>
        </TabsList>

        <TabsContent value={filtro} className="mt-6 space-y-4">
          {notificacoes.length === 0 && !loading ? (
             <Card className="border-dashed py-20 flex flex-col items-center opacity-50">
                <Bell size={48} className="mb-4" />
                <p>Nenhuma notificação encontrada.</p>
             </Card>
          ) : (
            notificacoes.map((notif: any) => (
              <Card 
                key={notif.id} 
                className={`transition-all ${!notif.lida ? 'border-l-4 border-l-primary bg-primary/5' : 'bg-white opacity-80'}`}
              >
                <div className="p-4 flex gap-4 items-start">
                  <div className={`p-2 rounded-full ${getIconBg(notif.tipo)}`}>
                    {getIcon(notif.tipo)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm ${!notif.lida ? 'font-bold' : 'font-semibold'}`}>
                        {notif.titulo}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(notif.criadaEm), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {notif.mensagem}
                    </p>
                    
                    {!notif.lida && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs text-primary font-bold"
                        onClick={() => marcarLida(notif.id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>

                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={14} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Funções Auxiliares para UI
function getIcon(tipo: string) {
  switch (tipo) {
    case 'ATRASO': return <AlertCircle size={18} className="text-red-600" />
    case 'RESERVA': return <BookOpen size={18} className="text-blue-600" />
    case 'DEVOLUCAO': return <CalendarClock size={18} className="text-green-600" />
    default: return <Bell size={18} className="text-slate-600" />
  }
}

function getIconBg(tipo: string) {
  switch (tipo) {
    case 'ATRASO': return 'bg-red-100'
    case 'RESERVA': return 'bg-blue-100'
    case 'DEVOLUCAO': return 'bg-green-100'
    default: return 'bg-slate-100'
  }
}