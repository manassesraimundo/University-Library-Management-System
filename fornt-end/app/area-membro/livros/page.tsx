'use client'

import { useEffect, useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, BookMarked, Info, Filter } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { ICategoria, ILivro } from "@/types/interface"
import { Etiqueta } from "@/types/enums"
import AlertGlobal from "@/components/alertGlobal"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function ExplorarLivrosPage() {
  const [livros, setLivros] = useState<ILivro[]>([]);
  const [caterorias, setCategorias] = useState<ICategoria[]>([]);
  const [categoriaInput, setCategoriaInput] = useState<string>('null');
  const [busca, setBusca] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [etiqueta, setEtiqueta] = useState<string>(Etiqueta.BRANCO);
  const [page, setPage] = useState<number>(1);

  const [message, setMessage] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { membro } = useAuth();

  const carregarLivros = async () => {
    try {
      if (categoriaInput !== 'null') {
        const res = await api.get(`/livros/categoria/${categoriaInput}?etiqueta=${etiqueta}`, {
          params: {
            page: page,
            limit: 20
          }
        });
        const data = res.data;

        setLivros(data);
        console.log(data);
        return;
      }
      const res = await api.get(`/livros?titulo=${busca}`, {
        params: {
          etiqueta,
          page: page,
          limit: 20
        }
      });
      setLivros(res.data);
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      toast.error(error.response?.data?.message || "Erro ao carregar acervo")
    } finally {
      setLoading(false)
    }
  }

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/categoria');
      const data = response.data;

      setCategorias(data);
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      toast.error(error.response?.data?.message || "Erro ao carregar caterorias")
    }
  }

  const filtrados = livros.filter((l) =>
    l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    l.autor.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const realizarReserva = async (livroId: number) => {
    try {
      await api.post(`/reservas`, { livroId, matricula: membro?.matricula })
      toast.success("Livro reservado com sucesso!")

    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      setMessage(error.response?.data?.message || "Erro ao reservar livro");
      setIsOpen(true);
    }
  }

  useEffect(() => {
    carregarLivros();
    carregarCategorias();
  }, [busca, etiqueta, isOpen, categoriaInput]);

  return (
    <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen max-w-7xl mx-auto">
      {
        isOpen && <AlertGlobal
          isOpen={isOpen}
          setIsOpen={() => setIsOpen(false)}
          message={message}
          titulo="Aviso"
        />
      }
      {/* Cabeçalho de Busca */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acervo Digital</h1>
          <p className="text-muted-foreground">Explore milhares de títulos disponíveis para empréstimo.</p>
        </div>

        <div className="flex gap-4 items-center justify-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="relative flex-1">
            {/* <Label htmlFor="input" className="font-semibold mb-2">Pesquisar</Label> */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                id="input"
                placeholder="Buscar por título, autor ou ISBN..."
                className="pl-10"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div>
            {/* <Label htmlFor="etiqueta" className="font-semibold mb-2">Etiqueta</Label> */}
            <Select value={categoriaInput} onValueChange={setCategoriaInput}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='null'>Selecionar categoria</SelectItem>
                {
                  caterorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            {/* <Label htmlFor="etiqueta" className="font-semibold mb-2">Etiqueta</Label> */}
            <Select value={etiqueta} onValueChange={setEtiqueta}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Etiqueta.BRANCO}>BRANCO</SelectItem>
                <SelectItem value={Etiqueta.AMARELO}>AMARELO</SelectItem>
                <SelectItem value={Etiqueta.VERMELHO}>VERMELHO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid de Livros */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtrados.map((livro) => (
            <Card key={livro.id} className="overflow-hidden hover:shadow-lg transition-all border-none shadow-sm">
              <div className="aspect-[3/4] bg-slate-100 relative group">
                {/* Badge de Disponibilidade */}
                <div className="absolute top-2 right-2 z-10 justify-between">
                  <Badge
                    variant={
                      livro.etiqueta === Etiqueta.BRANCO ? "outline"
                        : livro.etiqueta === Etiqueta.AMARELO ? "yellow" : "destructive"
                    }
                  >
                    {
                      livro.etiqueta === Etiqueta.BRANCO ? 'Branco'
                        : livro.etiqueta === Etiqueta.AMARELO ? 'Amarelo' : 'Vermelho'
                    }
                  </Badge>
                  <Badge
                    variant={
                      livro._count && livro._count.exemplares > 1 ? "success"
                        : "destructive"
                    }
                  >
                    {livro._count && livro._count.exemplares > 1 ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>

                {/* Simulação de Capa - Se tiver URL de imagem use aqui */}
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <BookMarked size={48} strokeWidth={1} />
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Info size={14} /> Detalhes
                  </Button>
                </div>
              </div>

              <CardHeader className="p-4 pb-0">
                <h3 className="font-bold text-sm leading-none truncate">{livro.titulo}</h3>
                <p className="text-xs text-muted-foreground truncate">{livro.autor?.nome}</p>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-semibold">
                  <span>{livro.categoria?.nome || 'Geral'}</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  variant={livro._count && livro._count.exemplares > 1 ? "outline" : "default"}
                  onClick={() => realizarReserva(livro.id)}
                >
                  {livro._count && livro._count.exemplares > 1 ? "Emprestar Livro" : "Reservar Livro"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}