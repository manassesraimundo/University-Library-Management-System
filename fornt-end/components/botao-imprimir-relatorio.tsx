'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { IReserva } from "@/types/interface";

interface IBotaoImprimirRelatorioProps {
  dadosGrafico: { tituloPrint: string }[];
  reservas: IReserva[];
}
export default function BotaoImprimirRelatorio({ dadosGrafico, reservas }: IBotaoImprimirRelatorioProps) {
  const [open, setOpen] = useState<boolean>(false);

  const acionarImpressao = () => {
    setTimeout(() => {
      window.print();
      setOpen(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 shadow-md cursor-pointer">
          <Printer size={18} />
          Gerar Relatório
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-none shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="text-primary" />
            Pré-visualização do Relatório
          </DialogTitle>
        </DialogHeader>

        {/* CONTEÚDO PARA IMPRESSÃO */}
        <div id="area-impressao-relatorio" className="bg-white p-4 sm:p-8 space-y-6 text-slate-900">
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <h2 className="text-2xl font-bold uppercase">Relatório de Gestão Bibliotecária</h2>
            <p className="text-sm text-slate-600">Documento Oficial • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-slate-200 rounded-lg">
              <p className="text-[10px] uppercase font-black text-slate-500">Reservas Pendentes</p>
              <p className="text-2xl font-bold">{reservas?.length || 0}</p>
            </div>
            <div className="p-4 border-2 border-slate-200 rounded-lg">
              <p className="text-[10px] uppercase font-black text-slate-500">Título Mais Popular</p>
              <p className="text-md font-bold truncate">{dadosGrafico[0]?.tituloPrint || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold border-l-4 border-primary pl-2 uppercase tracking-wide">Análise de Fluxo</h3>
            <p className="text-sm leading-relaxed text-justify">
              Este relatório sintetiza o estado atual do acervo. Constatamos que
              <strong> {reservas?.length || 0} </strong> solicitações de reserva aguardam atendimento.
              O título <em>"{dadosGrafico[0]?.tituloPrint || "N/A"}"</em> mantém-se como o mais requisitado do período.
            </p>
          </div>

          {/* Rodapé visível apenas na impressão */}
          <div className="hidden print:block pt-32">
            <div className="flex justify-between items-end border-t pt-4 text-[10px] ">
              <div className="space-y-1">
                <p>Gerado por: Sistema de Gestão Biblio-Tech</p>
                <p>ID de Autenticidade: {Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
              </div>
              <div className="text-center border-t border-slate-400 px-8 pt-2">
                Assinatura do Responsável
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={acionarImpressao} className="bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer">
            <Printer size={16} className="mr-2" />
            Confirmar Impressão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}