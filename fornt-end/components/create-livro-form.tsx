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
import { IAutor, ICategoria } from "@/types/interface";
import { Etiqueta, StatusLivro } from "@/types/enums";
import { toast } from "sonner";
import { api } from "@/lib/api";
import AlertGlobal from "./alertGlobal";

export function CreateLivroForm({ closeModal, onLivroCriado, scanResult }: any) {
  // Estados para Autores
  const [autores, setAutores] = useState<IAutor[]>([]);
  const [autorSel, setAutorSel] = useState<string>("");
  const [novoAutor, setNovoAutor] = useState<boolean>(false);
  const [openAutor, setOpenAutor] = useState<boolean>(false);

  const [nomeNovoAutor, setNomeNovoAutor] = useState<string>("");
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState<string>("");

  // Estados para Categorias
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [catSel, setCatSel] = useState<string>("");
  const [novaCat, setNovaCat] = useState<boolean>(false);
  const [openCat, setOpenCat] = useState<boolean>(false);

  const [titulo, setTitulo] = useState<string>(scanResult.titulo || "");
  const [quantiade, setQuantidade] = useState<number>(1);
  const [editora, setEditora] = useState<string>(scanResult.editora || "");
  const [isbn, setIsbn] = useState<string>(scanResult.isbn || "");
  const [status, setStatus] = useState<string>(StatusLivro.DISPONIVEL);
  const [etiqueta, setEtiqueta] = useState<string>(Etiqueta.BRANCO);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Busca dados do NestJS
  async function fetchData() {
    try {
      const [resAutores, resCategorias] = await Promise.all([
        api.get('/autor'),
        api.get('/categoria')
      ])
      setAutores(resAutores.data)
      setCategorias(resCategorias.data)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      console.error("Erro ao carregar dados auxiliares")
    }
  }

  useEffect(() => {
    if (scanResult.titulo) {
      setTitulo(scanResult.titulo);
    }
    if (scanResult.editora) {
      setEditora(scanResult.editora);
    }
    if (scanResult.isbn) {
      setIsbn(formatarISBN(scanResult.isbn));
    }
    if (scanResult.autores) {
      setNovoAutor(true);
      setNomeNovoAutor(scanResult.autores[0]);
    }
  }, [scanResult.titulo, scanResult.editora, scanResult.isbn, scanResult.autor])

  useEffect(() => {
    fetchData()
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeNovaCategoria && !catSel) {
      toast.warning("Preecher os campos obricatórios.")
      return ;
    }

    if (!nomeNovoAutor && !autorSel) {
      toast.warning("Preecher os campos obricatórios.")
      return ;
    }

    if (!titulo) {
      toast.warning("Preecher os campos obricatórios.")
      return ;
    }

    const payload = {
      titulo: titulo,
      autorId: Number(autorSel),
      categoriaId: Number(catSel),
      quantidade: quantiade,
      nomeAutor: nomeNovoAutor,
      nomeCategoria: nomeNovaCategoria,
      editora,
      isbn: isbn.replaceAll("-", ""),
      status,
      etiqueta
    }

    try {
      await api.post('/livros', payload)
      toast.success("Livro salvo com sucesso!")
      onLivroCriado();
      closeModal(false)
    } catch (error: any) {
      if (error.response?.status === 401)
        window.location.href = '/login';

      setIsOpen(true)
      setMessage(error.response?.data?.message || "Erro ao salvar livro");
    }
  }

  const formatarISBN = (value: string) => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, "");
    // Aplica a máscara: 978-3-16-148410-0
    return digits
      .replace(/^(\d{3})(\d)/, "$1-$2")
      .replace(/-(\d{1})(\d)/, "-$1-$2")
      .replace(/-(\d{1}-\d{2})(\d)/, "-$1-$2")
      .replace(/-(\d{1}-\d{2}-\d{6})(\d)/, "-$1-$2")
      .replace(/-(\d{1}-\d{2}-\d{6}-\d{1}).*/, "-$1"); // Limita ao tamanho do ISBN-13
  };

  return (
    <form className="grid gap-6 py-4">
      {
        isOpen && <AlertGlobal
          isOpen={isOpen}
          setIsOpen={() => setIsOpen(false)}
          message={message}
          titulo="Erro ao cadastra livro."
        />
      }
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
        <Label htmlFor="editora" className="font-semibold">Editora (opcional)</Label>
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
          <Label htmlFor="isbn" className="font-semibold mb-2">ISBN (opcional)</Label>
          <Input
            id="isbn"
            placeholder="978-0-00-000000-0" required
            value={isbn}
            onChange={(e) => {
              const valorFormatado = formatarISBN(e.target.value);
              setIsbn(valorFormatado.replaceAll("-", ""));
            }}
            maxLength={17}
          />
        </div>

        <div>
          <Label htmlFor="status" className="font-semibold mb-2">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={StatusLivro.DISPONIVEL}>DISPONÍVEL</SelectItem>
              <SelectItem value={'INDISPONIVEL'}>INDISPONIVEL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="etiqueta" className="font-semibold mb-2">Etiqueta</Label>
          <Select value={etiqueta} onValueChange={setEtiqueta}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Etiqueta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Etiqueta.BRANCO}>BRANCO</SelectItem>
              <SelectItem value={Etiqueta.AMARELO}>AMARELO</SelectItem>
              <SelectItem value={Etiqueta.VERMELHO}>VERMELHO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantiade" className="font-semibold mb-2">Quantidade</Label>
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
              setSelected={(e) => setAutorSel(e)}
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
              setSelected={(e) => setCatSel(e)}
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

interface ISearchableSelectProps {
  items: any[];
  selected: string | null,
  setSelected: (e: string) => void;
  open: boolean;
  setOpen: (e: boolean) => void;
  placeholder: string;
  onChangeCapture?: () => void;
  value?: any;
}

export function SearchableSelect({
  items,
  selected,
  setSelected,
  open,
  setOpen,
  placeholder,
  onChangeCapture
}: ISearchableSelectProps) {
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