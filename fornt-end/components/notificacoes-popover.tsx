'use client'

import { useEffect, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCheck, Clock, Info, CheckLine } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Notificacao {
  id: number
  titulo: string
  mensagem: string
  criadaEm: Date
  lida: boolean
}

export function NotificacoesPopover() {
  const route = useRouter()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])

  const getNotificacaoesNaoLidas = async () => {
    try {
      const response = await api.get('/membros/notificacoes/')
      const todasNotificacoes: Notificacao[] = response.data;
      const naoLidas = todasNotificacoes.filter(n => !n.lida)

      setNotificacoes(naoLidas)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      console.error("Erro ao buscar notificações não lidas:", error);
    }
  }

  const marcarComoLidas = async (notificacaoId: number) => {
    try {
      await api.patch(`/membros/notificacoes/${notificacaoId}/mark-as-read`)
      getNotificacaoesNaoLidas();
      toast.success("Notificação marcada como lida.")
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      console.error("Erro ao marcar todas como lidas:", error);
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      await api.patch(`/membros/notificacoes/mark-all-as-read`)
      getNotificacaoesNaoLidas();
      toast.success("Todas as notificações foram marcadas como lidas.")
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';
      
      console.error("Erro ao marcar todas como lidas:", error);
    }
  }

  useEffect(() => {
    getNotificacaoesNaoLidas();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          {notificacoes.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
            </span>
          )}
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-bold text-sm">Notificações</h4>
          {notificacoes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7 px-2"
              onClick={marcarTodasComoLidas}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-xs">Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => marcarComoLidas(notificacao.id)}
                  className={`p-4 border-b last:border-0 cursor-pointer transition-colors hover:bg-slate-50 relative ${!notificacao.lida ? "bg-primary/5" : ""
                    }`}
                >
                  {!notificacao.lida && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                  )}
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      {notificacao.lida ? (
                        <CheckLine className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm leading-none ${!notificacao.lida ? "font-bold" : "font-medium text-slate-600"}`}>
                        {notificacao.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notificacao.mensagem}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(notificacao.criadaEm, { addSuffix: true, locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button
            variant="link"
            className="text-xs h-auto py-1"
            onClick={() => route.push('/area-membro/notificacoes')}
          >
            Ver todo o histórico
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}