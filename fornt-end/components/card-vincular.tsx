'use client'

import { Loader2, Mail, UserIcon, UserPlus, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { IMembro } from "@/types/interface";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ICardVincularProps {
  dados: IMembro | null;
  carregarPainelMembro: () => void;
  setVincular: () => void;

}

export function CardVincular({ dados, carregarPainelMembro, setVincular }: ICardVincularProps) {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCriarUsuario = async () => {
    setLoading(true)
    try {
      await api.post(`/membros/vincular-usuario`, { nome, email })

      toast.success("Usuário criado! Agora você pode acessar o sistema.")

      carregarPainelMembro()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <Card className="max-w-[450px] w-full border-dashed border-2 border-primary/20 shadow-xl relative">

        {/* Botão posicionado no canto superior direito */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          onClick={setVincular}
        >
          <XCircle /> Agora não
        </Button>

        <CardHeader className="text-center pt-10">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="text-primary" size={32} />
          </div>
          <CardTitle className="text-2xl">Finalizar Cadastro</CardTitle>
          <CardDescription>
            Sua matrícula <strong>{dados?.matricula}</strong> foi encontrada, mas você ainda não possui uma conta de acesso.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <UserIcon size={14} /> Nome Completo
            </Label>
            <Input
              id="nome"
              placeholder="Como deseja ser chamado?"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={14} /> E-mail de Acesso
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="w-full mt-4 bg-primary hover:bg-primary/90"
            onClick={handleCriarUsuario}
            disabled={loading || !nome || !email}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Criar minha conta"}
          </Button>
        </CardContent>
        <div className="p-4 bg-slate-50 text-[10px] text-center text-muted-foreground rounded-b-lg border-t">
          BIBLIO-TECH • GESTÃO DE ACERVO
        </div>
      </Card>
    </div>
  )
}