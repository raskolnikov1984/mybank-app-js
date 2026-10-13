"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getContainer, getSession } from "@/infraestructure/web/container.js";

// Renders its children only when there is a session with the expected role.
export default function AuthGuard({ role, children }) {
    const router = useRouter();
    const [session, setSession] = useState(null);

    useEffect(() => {
        getContainer();
        const current = getSession();

        if (!current || current.role !== role) {
            router.replace("/");
            return;
        }

        setSession(current);
    }, [role, router]);

    if (!session) return null;

    const logout = () => {
        clearSession();
        router.replace("/");
    };

    return children(session, logout);
}
