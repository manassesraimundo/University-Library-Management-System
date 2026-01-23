'use client'

import { useEffect, useState } from "react";
import { 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "./ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SearchableSelect } from "./create-livro-form";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function CreateEmprestimoModal({ onSucesso }: any) {
    const [livros, setLivros] = useState([])
    const [livroNomeSel, setLivroNomeSel] = useState("") // Nome para o Select
    const [membroMatricula, setMembroMatricula] = useState("")
    const [titulo, setTitulo] = useState("")
    const [openLivro, setOpenLivro] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false) // Controle manual do Dialog

    const pegarLivrosDisponiveis = async () => {
        try {
            const response = await api.get(`/livros?titulo=${titulo}`, { params: { status: 'DISPONIVEL' } })
            
            const formatados = response.data.map((l: any) => ({
                id: l.id,
                nome: l.titulo 
            }))
            setLivros(formatados)
        } catch (error: any) {
            toast.error('Erro ao carregar acervo.')
        }
    }

    useEffect(() => {
        if (isDialogOpen) pegarLivrosDisponiveis()
    }, [isDialogOpen, titulo])

    const handleSubmit = async () => {
        if (!livroNomeSel || !membroMatricula) {
            return toast.warning("Preencha todos os campos.")
        }
        
        setIsSubmitting(true)
        try {
            await api.post('/emprestimos', {
                livroId: Number(livroNomeSel),
                matricula: membroMatricula
            })

            toast.success("Empréstimo registrado com sucesso!")
            
            // Limpar estados
            setLivroNomeSel("")
            setMembroMatricula("")
            setIsDialogOpen(false) // Fecha o modal
            
            if (onSucesso) onSucesso() // Atualiza a lista na página pai
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao registrar empréstimo"
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><Plus size={18} /> Novo Empréstimo</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Registrar Saída de Livro</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Selecione o Livro (Disponíveis)</Label>
                        <SearchableSelect
                            items={livros}
                            selected={livroNomeSel}
                            setSelected={setLivroNomeSel}
                            open={openLivro}
                            setOpen={setOpenLivro}
                            placeholder="Pesquisar livro pelo título..."
                            value={titulo}
                            onChangeCapture={setTitulo}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Matrícula do Membro</Label>
                        <Input
                            placeholder="Ex: 2023001"
                            value={membroMatricula}
                            onChange={(e) => setMembroMatricula(e.target.value)}
                        />
                    </div>

                    <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isSubmitting ? "Processando..." : "Finalizar Empréstimo"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}