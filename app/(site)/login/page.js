"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "../../components/Alert.js";
import { getContainer, setSession } from "@/infraestructure/web/container.js";
import { toMessage } from "@/infraestructure/web/errorMessages.js";
import { UserRole } from "@/domain/aggregates/user/value-objects/UserRole.js";

const DEFAULT_ATTEMPTS = { maxAttempts: 3, remainingAttempts: 3, isLocked: false };

export default function LoginPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(DEFAULT_ATTEMPTS);

    // Unknown or empty names keep the default counter, so nothing extra is revealed.
    const refreshAttempts = (typedName) => {
        const status = getContainer().getLoginStatus.execute({ name: typedName.trim() });
        setAttempts(status.exists ? status : DEFAULT_ATTEMPTS);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
        refreshAttempts(event.target.value);
    };

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
            refreshAttempts(name);
        }
    };

    const counterClass = attempts.isLocked
        ? "attempts attempts-locked"
        : attempts.remainingAttempts <= 1
          ? "attempts attempts-low"
          : "attempts";

    return (
        <div className="auth-page">
            <h1>Iniciar sesión</h1>
            <p className="auth-lead">Ingresa con tu usuario y contraseña de Banco Mi Plata.</p>
            <section className="card" aria-label="Formulario de inicio de sesión">
                <p className={counterClass} role="status" aria-live="polite" data-attempts>
                    Intentos restantes: {attempts.remainingAttempts} de {attempts.maxAttempts}
                </p>
                <Alert type="error">{error}</Alert>
                {attempts.isLocked && !error && (
                    <p className="attempts-note" data-blocked>
                        Esta cuenta está bloqueada por 24 horas por exceder los intentos fallidos. Comunícate con tu banco.
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <label>
                        Nombre de usuario
                        <input
                            value={name}
                            onChange={handleNameChange}
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
            <p className="auth-alt">
                ¿Aún no eres cliente? <Link href="/registro">Solicita tu registro</Link>
            </p>
        </div>
    );
}
