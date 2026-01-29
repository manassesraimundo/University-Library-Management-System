'use client'

import { useAuth } from "@/context/auth-context";
import { Role } from "@/types/enums";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const router = useRouter()
  const { user, membro, loading } = useAuth()

  useEffect(() => {
    if (loading) return ;

    if (membro?.matricula) {
      router.replace('/area-membro')
      return
    }

    if (user?.role === Role.ADMIN || user?.role === Role.BIBLIOTECARIO) {
      router.replace('/dashboard')
      return
    }
    else
      router.replace('/login');
  }, [user, membro, loading, router]);

  return null;
}
