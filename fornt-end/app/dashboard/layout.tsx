'use client'

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter()
  const { user, membro, loading } = useAuth()

  useEffect(() => {
    if (loading) return ;

    if (membro?.matricula)
      router.replace('/area-membro')

  }, [membro, loading])

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
