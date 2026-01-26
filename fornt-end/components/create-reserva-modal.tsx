'use client'

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { 
    CalendarClock, 
    Calendar as CalendarIcon, 
    Loader2 
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SearchableSelect } from "./create-livro-form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function CreateReservaModal({ onSucesso }: { onSucesso: () => void }) {
    const [livros, setLivros] = useState<any>([])
    const [libvroSel, setLivroSel] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [open, setOpen] = useState("")
    const [matricula, setMatricula] = useState("")
    const [tituloLivro, setTituloLivro] = useState("")
    const [loading, setLoading] = useState(false)

    const [timeZone, setTimeZone] = useState<string | undefined>(undefined)

    // NOVO: Estado para a data da reserva
    const [dataReserva, setDataReserva] = useState<Date | undefined>(new Date())

    const carregarLivros = async () => {
        try {
            const [resEmprestados, resReservados] = await Promise.all([
                api.get(`/livros?titulo=${tituloLivro}&status=EMPRESTADO`),
                api.get(`/livros?titulo=${tituloLivro}&status=RESERVADO`)
            ]);
            const formatados1 = resEmprestados.data.map((l: any) => ({ id: l.id, nome: l.titulo }));
            const formatados2 = resReservados.data.map((l: any) => ({ id: l.id, nome: l.titulo }));
            setLivros([...formatados1, ...formatados2])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (isOpen) carregarLivros();
    }, [tituloLivro, isOpen])

    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }, [])

    const handleCriar = async () => {
        if (!libvroSel || !matricula) {
            return toast.error("Preencha todos os campos corretamente.");
        }

        // alert("matricula: " + matricula + "\nlivroId: " + libvroSel + "\ndataReserva: " + dataReserva.toISOString())
        setLoading(true)
        try {
            await api.post('/reservas', {
                livroId: libvroSel,
                matricula: matricula
                // paraData: dataReserva.toISOString()
            });
            toast.success("Reserva criada com sucesso!");
            onSucesso();
            setIsOpen(false);

            setMatricula("");
            setLivroSel("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao criar reserva");
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><CalendarClock size={18} /> Nova Reserva</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reservar Livro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Selecionar Livro</Label>
                        <SearchableSelect
                            items={livros}
                            selected={libvroSel}
                            setSelected={setLivroSel}
                            open={open}
                            setOpen={setOpen}
                            placeholder="Pesquisar livro indisponível..."
                            value={tituloLivro}
                            onChangeCapture={setTituloLivro}
                        />
                    </div>

                    {/* SEÇÃO DO CALENDÁRIO */}
                    {/* <div className="grid gap-2">
                        <Label>Data Prevista para Retirada</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dataReserva && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dataReserva ? format(dataReserva, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    timeZone={timeZone}
                                    mode="single"
                                    selected={dataReserva}
                                    onSelect={setDataReserva}
                                    disabled={(date) => date < new Date()} // Bloqueia datas passadas
                                />
                            </PopoverContent>
                        </Popover>
                    </div> */}

                    <div className="grid gap-2">
                        <Label>Matrícula do Membro</Label>
                        <Input
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            placeholder="Ex: 2023..."
                        />
                    </div>

                    <div className="flex justify-end items-center gap-3 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCriar}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Confirmar Reserva"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}