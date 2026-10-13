"use client";

import { useState } from "react";
import Alert from "./Alert.js";
import { toMessage } from "@/infraestructure/web/errorMessages.js";
import { parseAmount } from "@/infraestructure/web/format.js";
import { AccountType } from "@/domain/aggregates/account/value-objects/AccountType.js";
import { IdentificationType } from "@/domain/aggregates/user/value-objects/IdentificationType.js";

export const PRODUCT_OPTIONS = [
    { value: AccountType.SAVINGS, label: "Cuenta de Ahorros" },
    { value: AccountType.CHECKING, label: "Cuenta Corriente" },
    { value: AccountType.CREDIT_CARD, label: "Tarjeta de Crédito" },
];

export const IDENTIFICATION_OPTIONS = [
    { value: IdentificationType.CEDULA, label: "Cédula" },
    { value: IdentificationType.PASSPORT, label: "Pasaporte" },
];

export const identificationLabel = (type) => IDENTIFICATION_OPTIONS.find((o) => o.value === type)?.label ?? type;

const EMPTY = {
    identificationType: IdentificationType.CEDULA,
    identificationNumber: "",
    fullName: "",
    phone: "",
    name: "",
    password: "",
    confirmPassword: "",
    accountType: AccountType.SAVINGS,
    balance: "",
};

// Shared by the public registration request and the manager's direct registration.
// `onSubmit` receives the input of the use case and returns the success message; it may throw a domain error.
export default function ClientRegistrationForm({ submitLabel, onSubmit }) {
    const [data, setData] = useState(EMPTY);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const needsBalance = data.accountType !== AccountType.CREDIT_CARD;
    const set = (field) => (event) => setData((current) => ({ ...current, [field]: event.target.value }));

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        let initialBalance;
        if (needsBalance) {
            initialBalance = parseAmount(data.balance);
            if (initialBalance === null) {
                setError("El saldo inicial debe ser un número mayor a 0.");
                return;
            }
        }

        try {
            const message = onSubmit({
                name: data.name.trim(),
                password: data.password,
                confirmPassword: data.confirmPassword,
                accountType: data.accountType,
                initialBalance,
                identificationType: data.identificationType,
                identificationNumber: data.identificationNumber,
                fullName: data.fullName,
                phone: data.phone,
            });
            setSuccess(message);
            setData(EMPTY);
        } catch (e) {
            setError(toMessage(e));
        }
    };

    return (
        <>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                <label>
                    Tipo de identificación
                    <select value={data.identificationType} onChange={set("identificationType")}>
                        {IDENTIFICATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Número de identificación
                    <input value={data.identificationNumber} onChange={set("identificationNumber")} autoComplete="off" />
                </label>
                <label>
                    Nombre completo
                    <input value={data.fullName} onChange={set("fullName")} autoComplete="name" />
                </label>
                <label>
                    Celular
                    <input type="tel" value={data.phone} onChange={set("phone")} autoComplete="tel" placeholder="300 123 4567" />
                </label>
                <label>
                    Nombre de usuario
                    <input value={data.name} onChange={set("name")} autoComplete="username" />
                </label>
                <label>
                    Contraseña
                    <input type="password" value={data.password} onChange={set("password")} autoComplete="new-password" />
                </label>
                <label>
                    Confirmar contraseña
                    <input
                        type="password"
                        value={data.confirmPassword}
                        onChange={set("confirmPassword")}
                        autoComplete="new-password"
                    />
                </label>
                <label>
                    Tipo de producto
                    <select value={data.accountType} onChange={set("accountType")}>
                        {PRODUCT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                {needsBalance && (
                    <label>
                        Saldo inicial
                        <input type="number" min="1" value={data.balance} onChange={set("balance")} />
                    </label>
                )}
                <button type="submit">{submitLabel}</button>
            </form>
        </>
    );
}
