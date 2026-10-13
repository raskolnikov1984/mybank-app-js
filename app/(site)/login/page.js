"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "./components/Alert.js";
import { getContainer, setSession } from "@/infraestructure/web/container.js";
import { toMessage } from "@/infraestructure/web/errorMessages.js";
import { UserRole } from "@/domain/aggregates/user/value-objects/UserRole.js";

export default function LoginPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getContainer();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        try {
            const { user } = getContainer().login.execute({ name: name.trim(), password });
            const role = user.getRole();

            setSession({ name: user.getName(), role });
            router.push(role === UserRole.GERENTE ? "/gerente" : "/cliente");
        } catch (e) {
            setError(toMessage(e));
        }
    };

    return (
        <>
            <h1>Banco Mi Plata</h1>
            <section className="card">
                <h2>Iniciar sesión</h2>
                <Alert type="error">{error}</Alert>
                <form onSubmit={handleSubmit}>
                    <label>
                        Nombre de usuario
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="username"
                        />
                    </label>
                    <label>
                        Contraseña
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </label>
                    <button type="submit">Ingresar</button>
                </form>
            </section>
        </>
    );
}
