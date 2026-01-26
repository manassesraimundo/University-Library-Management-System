'use client';

import { HeaderMembro } from "@/components/user-nav";
import { useAuth } from "@/context/auth-context"
import { useEffect } from "react";

export default function AreaMembroLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { membro, loading } = useAuth();

    useEffect(() => {
        if (!loading && !membro) {
            window.location.href = "/login";
        }
    }, [loading, membro]);

    return (
        <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
            <HeaderMembro />
            {children}
        </div>
    )
}