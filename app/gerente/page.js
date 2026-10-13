"use client";

import { useState } from "react";
import AuthGuard from "../components/AuthGuard.js";
import Alert from "../components/Alert.js";
import { getContainer } from "@/infraestructure/web/container.js";
import { toMessage } from "@/infraestructure/web/errorMessages.js";
import { parseAmount } from "@/infraestructure/web/format.js";
import { UserRole } from "@/domain/aggregates/user/value-objects/UserRole.js";
import { AccountType } from "@/domain/aggregates/account/value-objects/AccountType.js";

const TYPE_OPTIONS = [
    { value: AccountType.SAVINGS, label: "Cuenta de Ahorros" },
    { value: AccountType.CHECKING, label: "Cuenta Corriente" },
    { value: AccountType.CREDIT_CARD, label: "Tarjeta de Crédito" },
];

function RegisterClient() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [accountType, setAccountType] = useState(AccountType.SAVINGS);
    const [balance, setBalance] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const needsBalance = accountType !== AccountType.CREDIT_CARD;

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        let initialBalance;
        if (needsBalance) {
            initialBalance = parseAmount(balance);
            if (initialBalance === null) {
                setError("El saldo inicial debe ser un número mayor a 0.");
                return;
            }
        }

        try {
            const result = getContainer().register.execute({
                name: name.trim(),
                password,
                accountType,
                initialBalance,
            });
            setSuccess(`Registro exitoso. Bienvenido, ${result.name}.`);
            setName("");
            setPassword("");
            setBalance("");
        } catch (e) {
            setError(toMessage(e));
        }
    };

    return (
        <section className="card">
            <h2>Registrar cliente</h2>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                <label>
                    Nombre de usuario
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                    Contraseña
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <label>
                    Tipo de producto
                    <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                        {TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                {needsBalance && (
                    <label>
                        Saldo inicial
                        <input
                            type="number"
                            min="1"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                        />
                    </label>
                )}
                <button type="submit">Registrar</button>
            </form>
        </section>
    );
}

export default function ManagerPage() {
    return (
        <AuthGuard role={UserRole.GERENTE}>
            {(session, logout) => (
                <>
                    <div className="header">
                        <h1>Menú de gestión</h1>
                        <button className="secondary" onClick={logout}>
                            Cerrar sesión
                        </button>
                    </div>
                    <p className="muted">Sesión de {session.name}</p>
                    <RegisterClient />
                </>
            )}
        </AuthGuard>
    );
}
