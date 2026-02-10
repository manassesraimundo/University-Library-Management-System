'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  BookMarked,
  Bell,
  HelpCircle,
  PanelBottom,
  Book,
  BookA,
  Clock,
  Bookmark
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { NotificacoesPopover } from "./notificacoes-popover";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export function UserNav() {
  const { membro, logout } = useAuth()
  const router = useRouter();

  const iniciais = membro?.usuario?.nome
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {iniciais || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{membro?.usuario?.nome}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {membro?.usuario?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <PanelBottom className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro')}
            >
              Meu Painel
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/perfil')}
            >
              Meu Perfil
            </span>
            {/* <DropdownMenuShortcut>⇧P</DropdownMenuShortcut> */}
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <BookA className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/livros')}
            >
              Aservo de Livro
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <BookMarked className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/emprestimos')}
            >
              Empréstimos
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/reservas')}
            >
              Reservas
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <BookMarked className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/recomendacoes')}
            >
              Ver Recomendação
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/ajuda-ia')}
            >
              Central de Ajuda
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span
              onClick={() => router.push('/area-membro/notificacoes')}
            >Notificações</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        //   onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span
            onClick={() => {
              logout();
              toast.success("Logout com Sucesso.")
              router.push('/login');
            }}
          >
            Sair do Sistema
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function HeaderMembro() {

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="text-primary w-full font-bold text-lg flex flex-col items-start justify-center">
        <Link href={'/area-membro'}>
          <div className="relative group transition-transform duration-300 hover:scale-105">
            {/* Círculo de fundo suave para destacar o logo */}
            <div className="absolute -inset-2 bg-primary/5 rounded-full blur-sm group-hover:bg-primary/10 transition-colors" />

            <Image
              alt="logo"
              src="/logo.png"
              width={100} // Ajustado para um tamanho de ícone/logo equilibrado
              height={100}
              className="relative object-contain"
            />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-primary font-black text-sm tracking-tighter leading-none text-end">
              BIBLIO<span className="text-slate-400 font-light">TECH</span>
            </h2>
            <div className="h-[1px] w-8 bg-primary/20 rounded-full mt-1" />
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <NotificacoesPopover />
        <UserNav />
      </div>
    </header>
  )
}