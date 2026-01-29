'use client'

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Bot,
  User as UserIcon,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatIAPage() {
  const { membro } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getMessages = async () => {
    try {
      const res = await api.get('/chatbot/conversas');
      setMessages(res.data);
    } catch (error) {
      toast.error("Não foi possível carregar o histórico de mensagens.");
    }
  }

  useEffect(() => {
    getMessages();
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await api.post('/chatbot/conversar', {
        message: userMessage,
        membroId: membro?.id
      })

      setMessages(prev => [...prev, { role: 'model', content: res.data.response }])
    } catch (error) {
      toast.error("Ops! Tive um problema técnico. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const limparMensagens = async () => {
    try {
      await api.delete('/chatbot/historico/limpar/')
      setMessages([])
      toast.success("Histórico de mensagens limpo com sucesso.")
    } catch (error) {
      toast.error("Não foi possível limpar as mensagens.")
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto p-4 space-y-4">
      {/* Header Estilizado */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 p-4 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="font-bold tracking-tight">Bibliotecária Inteligente</h2>
            <div className="flex items-center gap-1.5 text-[10px] opacity-90">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              SISTEMA ATIVO
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={limparMensagens}
          className="hover:bg-white/10 text-white"
        >
          <Trash2 size={20} />
        </Button>
      </div>

      {/* Área de Mensagens */}
      <ScrollArea className="flex-1 px-4 border rounded-2xl bg-slate-50/50 shadow-inner" ref={scrollRef}>
        <div className="py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Sparkles className="text-primary h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-800">Como posso ajudar hoje?</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                Você pode perguntar: "Quais livros estão comigo?" ou "Me recomende algo sobre Tecnologia".
              </p>
            </div>
          )}

          {messages.slice(messages.length - 4, messages.length).map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                  <AvatarFallback className={msg.role === 'model' ? "bg-slate-800 text-white" : "bg-primary text-white"}>
                    {msg.role === 'model' ? <Bot size={18} /> : <UserIcon size={18} />}
                  </AvatarFallback>
                </Avatar>

                <div className={`prose prose-sm max-w-none p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                    ? 'bg-primary text-white text-brounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                  {/* O ReactMarkdown transforma o texto em HTML bonito */}
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="tex-bl mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 my-2">{children}</ul>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => (
                        <strong className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-primary'}`}>
                          {children}
                        </strong>
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium text-slate-500">Consultando acervo...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input de Mensagem */}
      <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-white p-2 rounded-2xl border shadow-lg focus-within:ring-2 ring-primary/20 transition-all">
        <Input
          placeholder="Escreva sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border-none focus-visible:ring-0 shadow-none h-12 text-base"
        />
        <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0" disabled={loading || !input.trim()}>
          <Send size={18} />
        </Button>
      </form>

      <p className="text-[10px] text-center text-muted-foreground">
        A IA pode cometer erros. Verifique informações importantes com a administração.
      </p>
    </div>
  )
}