'use client'

import { useState, useEffect } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { 
    Check, 
    ChevronsUpDown, 
    Plus, 
    BookOpen, 
    User, 
    Filter 
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "./ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function CreateLivroForm({ closeModal, onLivroCriado }: any) {
    // Estados para Autores
    const [autores, setAutores] = useState<{ id: number; nome: string }[]>([])
    const [autorSel, setAutorSel] = useState("")
    const [novoAutor, setNovoAutor] = useState(false)
    const [openAutor, setOpenAutor] = useState(false)

    const [nomeNovoAutor, setNomeNovoAutor] = useState("")
    const [nomeNovaCategoria, setNomeNovaCategoria] = useState("")

    // Estados para Categorias
    const [categorias, setCategorias] = useState<{ id: number; nome: string }[]>([])
    const [catSel, setCatSel] = useState("")
    const [novaCat, setNovaCat] = useState(false)
    const [openCat, setOpenCat] = useState(false)

    const [titulo, setTitulo] = useState("")
    const [quantiade, setQuantidade] = useState(1);
    const [editora, setEditora] = useState("")
    const [isbn, setIsbn] = useState("")
    const [status, setStatus] = useState("DISPONIVEL")

    // Busca dados do NestJS
    async function fetchData() {
        try {
            const [resAutores, resCategorias] = await Promise.all([
                api.get('/autor'),
                api.get('/categoria')
            ])
            setAutores(resAutores.data)
            setCategorias(resCategorias.data)
        } catch (error) {
            console.error("Erro ao carregar dados auxiliares", error)
        }
    }
    
    useEffect(() => {
        fetchData()
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            titulo: titulo,
            autorId: Number(autorSel),
            categoriaId: Number(catSel),
            quantidade: quantiade,
            nomeAutor: nomeNovoAutor,
            nomeCategoria: nomeNovaCategoria,
            editora,
            isbn,
            status
        }

        try {
            await api.post('/livros', payload)
            toast.success("Livro salvo com sucesso!")
            onLivroCriado();
            closeModal(false)
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao salvar livro")
        }
    }

    return (
        <form className="grid gap-6 py-4">
            {/* TÍTULO */}
            <div className="grid gap-2">
                <Label htmlFor="titulo" className="font-semibold">Título do Livro</Label>
                <Input
                    id="titulo"
                    placeholder="Ex: A República" required
                    value={titulo}
                    onChange={(t) => setTitulo(t.target.value)}
                />
            </div>
            {/* EDITORA */}
            <div className="grid gap-2">
                <Label htmlFor="titulo" className="font-semibold">Editora (opcional)</Label>
                <Input
                    id="editora"
                    placeholder="Editora..." required
                    value={editora}
                    onChange={(t) => setEditora(t.target.value)}
                />
            </div>
            {/* QUANTIDADE */}
            <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                    <Label htmlFor="titulo" className="font-semibold mb-2">ISBN (opcional)</Label>
                    <Input
                        id="isbn"
                        placeholder="isbn" required
                        value={isbn}
                        onChange={(t) => setIsbn(t.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="titulo" className="font-semibold mb-2">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DISPONIVEL">DISPONIVEL</SelectItem>
                            <SelectItem value="RESERVADO">RESERVADO</SelectItem>
                            <SelectItem value="EMPRESTADO">EMPRESTADO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="titulo" className="font-semibold mb-2">Quantidade</Label>
                    <Input
                        id="quantiade"
                        type="number"
                        placeholder="Quantidade" required
                        value={quantiade}
                        onChange={(t) => setQuantidade(Number(t.target.value))}
                    />
                </div>
            </div>

            <div>
                {/* SEÇÃO DO AUTOR */}
                <div className="grid gap-2 mb-3 mt-2">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2"><User size={14} /> Autor</Label>
                        <Button
                            type="button" variant="link" size="sm" className="h-auto p-0 text-xs"
                            onClick={() => { setNovoAutor(!novoAutor); setAutorSel(""); }}
                        >
                            {novoAutor ? "Ver lista" : "Novo?"}
                        </Button>
                    </div>

                    {novoAutor ? (
                        <Input
                            placeholder="Nome do autor"
                            className="border-blue-200"
                            required
                            value={nomeNovoAutor}
                            onChange={(t) => setNomeNovoAutor(t.target.value)}
                        />
                    ) : (
                        <SearchableSelect
                            items={autores}
                            selected={autorSel}
                            setSelected={setAutorSel}
                            open={openAutor}
                            setOpen={setOpenAutor}
                            placeholder="Selecionar autor..."
                        />
                    )}
                </div>

                {/* SEÇÃO DA CATEGORIA */}
                <div className="grid gap-2 mt-5">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2"><BookOpen size={14} /> Categoria</Label>
                        <Button
                            type="button" variant="link" size="sm" className="h-auto p-0 text-xs"
                            onClick={() => { setNovaCat(!novaCat); setCatSel(""); }}
                        >
                            {novaCat ? "Ver lista" : "Nova?"}
                        </Button>
                    </div>

                    {novaCat ? (
                        <Input
                            placeholder="Ex: Filosofia"
                            className="border-blue-200"
                            required
                            value={nomeNovaCategoria}
                            onChange={(t) => setNomeNovaCategoria(t.target.value)}
                        />
                    ) : (
                        <SearchableSelect
                            items={categorias}
                            selected={catSel}
                            setSelected={setCatSel}
                            open={openCat}
                            setOpen={setOpenCat}
                            placeholder="Selecionar categoria..."
                        />
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                    <Button
                        onClick={() => closeModal(false)}
                        variant="outline"
                        type="button"
                        className="px-8 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Button>

                    <Button
                        // type="submit"
                        onClick={handleSubmit}
                        className="px-8 bg-emerald-600 hover:bg-emerald-7000 shadow-sm"
                    >
                        Salvar Livro
                    </Button>
                </div>
            </div>
        </form>
    )
}

export function SearchableSelect({ items, selected, setSelected, open, setOpen, placeholder, onChangeCapture, value}: any) {
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {/* Alterado: Procura pelo ID para mostrar o nome no botão */}
                    {selected
                        ? items?.find((i: any) => i.id === selected)?.nome
                        : placeholder
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder="Pesquisar..." onValueChange={onChangeCapture} />
                    <CommandList>
                        <CommandEmpty>Não encontrado.</CommandEmpty>
                        <CommandGroup>
                            {items?.map((item: any) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.nome || item.titulo} // O value é usado para a busca interna do Command
                                    onSelect={() => {
                                        // Alterado: Agora enviamos o ID para o estado
                                        setSelected(item.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn(
                                        "mr-2 h-4 w-4",
                                        // Alterado: Compara ID com ID
                                        selected === item.id ? "opacity-100" : "opacity-0"
                                    )} />
                                    {item.nome}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}