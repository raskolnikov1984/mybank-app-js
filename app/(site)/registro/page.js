"use client";

import { useEffect } from "react";
import Link from "next/link";
import ClientRegistrationForm from "../../components/ClientRegistrationForm.js";
import { getContainer } from "@/infraestructure/web/container.js";

export default function RegistrationPage() {
    useEffect(() => {
        getContainer();
    }, []);

    const submit = (input) => {
        const result = getContainer().submitRegistrationRequest.execute(input);

        return `Solicitud enviada. El gerente revisará la solicitud de ${result.name} y, cuando la apruebe, podrás iniciar sesión.`;
    };

    return (
        <div className="auth-page auth-page-wide">
            <h1>Solicitar registro</h1>
            <p className="auth-lead">
                Completa tus datos y elige tu producto. El gerente de la sucursal revisará tu solicitud.
            </p>
            <section className="card" aria-label="Formulario de solicitud de registro">
                <ClientRegistrationForm submitLabel="Enviar solicitud" onSubmit={submit} />
            </section>
            <p className="auth-alt">
                ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
        </div>
    );
}
