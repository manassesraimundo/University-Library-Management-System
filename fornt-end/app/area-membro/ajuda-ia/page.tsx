'use client'

import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Trash2, 
  Loader2, 
  Sparkles 
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatIAPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await api.post('/chatbot/conversar', { 
        mensagem: userMessage,
        membroId: user?.id // Ajuste conforme seu DTO espera
      })

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch (error) {
      toast.error("A IA está indisponível no momento.")
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm("Deseja apagar todo o histórico da conversa?")) return
    
    try {
      await api.delete(`/chatbot/historico/limpar/${user?.id}`)
      setMessages([])
      toast.success("Histórico limpo!")
    } catch (error) {
      toast.error("Erro ao limpar histórico.")
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto p-4 space-y-4">
      {/* Header do Chat */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold">Assistente Biblio-Tech</h2>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              IA Online
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClearHistory} title="Limpar conversa">
          <Trash2 size={18} className="text-muted-foreground hover:text-red-500" />
        </Button>
      </div>

      {/* Área de Mensagens */}
      <ScrollArea className="flex-1 p-4 bg-white rounded-xl border shadow-inner" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Sparkles className="text-primary/20" size={48} />
              <p className="text-muted-foreground text-sm max-w-[250px]">
                Olá! Eu sou sua IA bibliotecária. Pergunte-me sobre livros, prazos ou recomendações.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className={msg.role === 'assistant' ? "bg-primary text-white" : ""}>
                    {msg.role === 'assistant' ? <Bot size={16} /> : <UserIcon size={16} />}
                  </AvatarFallback>
                </Avatar>
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground italic">Digitando...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input de Mensagem */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input 
          placeholder="Digite sua dúvida aqui..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-12 bg-white"
        />
        <Button type="submit" size="icon" className="h-12 w-12" disabled={loading}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}