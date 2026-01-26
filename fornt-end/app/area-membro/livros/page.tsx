'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Search, BookMarked, Info, Filter } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"

export default function ExplorarLivrosPage() {
    const [livros, setLivros] = useState<any>([])
    const [busca, setBusca] = useState("")
    const [loading, setLoading] = useState(true)
    const [statusFiltro, setStatusFiltro] = useState("DISPONIVEL")
    const [page, setPage] = useState(1)

    const { membro } = useAuth();

    const carregarLivros = async () => {
        try {
            if (statusFiltro === "INDISPUNIVEIS") {
                const [resEmprestados, resReservados] = await Promise.all([
                    api.get(`/livros?titulo=${busca}`, {
                        params: {
                            status: 'EMPRESTADO',
                            page: page,
                            limit: 20
                        }
                    }),
                    api.get(`/livros?titulo=${busca}`, {
                        params: {
                            status: 'RESERVADO',
                            page: page,
                            limit: 20
                        }
                    })
                ]);

                const combinados = [...resEmprestados.data, ...resReservados.data]
                setLivros(combinados)
                return;
            }

            const res = await api.get(`/livros?titulo=${busca}`, {
                params: {
                    status: statusFiltro,
                    page: page,
                    limit: 20
                }
            })
            setLivros(res.data)
        } catch (error) {
            toast.error("Erro ao carregar acervo")
        } finally {
            setLoading(false)
        }
    }

    const filtrados = livros.filter((l: any) =>
        l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        l.autor.nome.toLowerCase().includes(busca.toLowerCase())
    )

    const realizarReserva = async (livroId: string) => {
        try {
            await api.post(`/reservas`, { livroId, matricula: membro?.matricula })
            toast.success("Livro reservado com sucesso!")
            
        } catch (error: any) {
            toast.error(error.response?.data?.message  || "Erro ao reservar livro")
        }
    }

    useEffect(() => { carregarLivros() }, [busca, statusFiltro])

    return (
        <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen">
            {/* Cabeçalho de Busca */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Acervo Digital</h1>
                    <p className="text-muted-foreground">Explore milhares de títulos disponíveis para empréstimo.</p>
                </div>

                <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Buscar por título, autor ou ISBN..."
                            className="pl-10"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DISPONIVEL">DISPONIVEL</SelectItem>
                            <SelectItem value="INDISPUNIVEIS">INDISPUNIVEIS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid de Livros */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filtrados.map((livro: any) => (
                        <Card key={livro.id} className="overflow-hidden hover:shadow-lg transition-all border-none shadow-sm">
                            <div className="aspect-[3/4] bg-slate-100 relative group">
                                {/* Badge de Disponibilidade */}
                                <div className="absolute top-2 right-2 z-10">
                                    <Badge variant={livro.status === 'DISPONIVEL' ? "success" : "destructive"}>
                                        {livro.status === 'DISPONIVEL' ? "Disponível" : "Indisponível"}
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
                                <p className="text-xs text-muted-foreground truncate">{livro.autor.nome}</p>
                            </CardHeader>

                            <CardContent className="p-4 pt-2">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-semibold">
                                    <span>{livro.categoria?.nome || 'Geral'}</span>
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-0">
                                <Button
                                    className="w-full"
                                    variant={livro.quantidade > 1 ? "default" : "outline"}
                                    disabled={livro.status === 'DISPONIVEL' ? true : false}
                                    onClick={() => realizarReserva(livro.id)}
                                >
                                    {livro.status === 'DISPONIVEL' ? "Empresrimo na biblioteca" : "Reservar Livro"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}