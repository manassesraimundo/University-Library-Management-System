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
      <div className="flex items-center gap-4 text-primary font-bold text-lg">
        {/* Logo ou Breadcrumbs aqui */}
        BIBLIO-TECH
      </div>

      <div className="flex items-center gap-4">
        <NotificacoesPopover />
        <UserNav />
      </div>
    </header>
  )
}