"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGuard from "../components/AuthGuard.js";
import Alert from "../components/Alert.js";
import { getContainer } from "@/infraestructure/web/container.js";
import { toMessage } from "@/infraestructure/web/errorMessages.js";
import { formatMoney, MOVEMENT_LABELS, parseAmount } from "@/infraestructure/web/format.js";
import { UserRole } from "@/domain/aggregates/user/value-objects/UserRole.js";

function AmountForm({ label, onSubmit }) {
    const [amount, setAmount] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        if (onSubmit(amount)) setAmount("");
    };

    return (
        <form onSubmit={handleSubmit} className="card" noValidate>
            <label>
                {label}
                <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </label>
            <button type="submit">{label}</button>
        </form>
    );
}

function ClientView({ name }) {
    const [info, setInfo] = useState(null);
    const [movements, setMovements] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const refresh = useCallback(() => {
        const container = getContainer();
        setInfo(container.getBalance.execute(name));
        setMovements(container.getMovements.execute(name).movements);
    }, [name]);

    useEffect(() => {
        try {
            refresh();
        } catch (e) {
            setError(toMessage(e));
        }
    }, [refresh]);

    const run = (action, successMessage) => {
        setError("");
        setSuccess("");

        try {
            const result = action();
            refresh();
            setSuccess(typeof successMessage === "function" ? successMessage(result) : successMessage);
            return true;
        } catch (e) {
            setError(toMessage(e));
            return false;
        }
    };

    const withAmount = (value, execute, message) => {
        const amount = parseAmount(value);
        if (amount === null) {
            setError("El monto debe ser un número mayor a 0.");
            setSuccess("");
            return false;
        }
        return run(() => execute(amount), message);
    };

    const container = () => getContainer();

    return (
        <>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>

            {info && (
                <section className="card">
                    <h2>{info.typeName}</h2>
                    <p className="summary">{info.summary}</p>
                </section>
            )}

            <div className="row">
                <div style={{ flex: 1, minWidth: 240 }}>
                    <AmountForm
                        label="Consignar"
                        onSubmit={(value) =>
                            withAmount(
                                value,
                                (amount) => container().deposit.execute({ accountId: name, amount }),
                                "Consignación exitosa.",
                            )
                        }
                    />
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <AmountForm
                        label="Retirar"
                        onSubmit={(value) =>
                            withAmount(
                                value,
                                (amount) => container().withdraw.execute({ accountId: name, amount }),
                                "Retiro exitoso.",
                            )
                        }
                    />
                </div>
            </div>

            {info?.supportsMonthlyStatement && (
                <section className="card">
                    <h2>Estado mensual</h2>
                    <p className="muted">Aplica los intereses de tu tarjeta sobre la deuda actual.</p>
                    <button
                        onClick={() =>
                            run(
                                () => container().applyMonthlyStatement.execute(name).statement,
                                (s) =>
                                    `Estado mensual aplicado. Intereses: ${formatMoney(s.interest)}.`,
                            )
                        }
                    >
                        Aplicar estado mensual
                    </button>
                </section>
            )}

            <section className="card">
                <h2>Movimientos</h2>
                {movements.length === 0 ? (
                    <p className="muted">No hay movimientos registrados.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map((m, index) => (
                                <tr key={index}>
                                    <td>{m.getDate().toLocaleString("es-CO")}</td>
                                    <td>{MOVEMENT_LABELS[m.getType()] ?? m.getType()}</td>
                                    <td>{formatMoney(m.getAmount())}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </>
    );
}

export default function ClientPage() {
    return (
        <AuthGuard role={UserRole.CLIENTE}>
            {(session, logout) => (
                <>
                    <div className="header">
                        <h1>Hola, {session.name}</h1>
                        <button className="secondary" onClick={logout}>
                            Cerrar sesión
                        </button>
                    </div>
                    <ClientView name={session.name} />
                </>
            )}
        </AuthGuard>
    );
}
