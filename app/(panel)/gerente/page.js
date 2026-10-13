"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard.js";
import Alert from "../../components/Alert.js";
import ClientRegistrationForm, { PRODUCT_OPTIONS, identificationLabel } from "../../components/ClientRegistrationForm.js";
import { getContainer } from "@/infraestructure/web/container.js";
import { toMessage } from "@/infraestructure/web/errorMessages.js";
import { formatPesos } from "@/infraestructure/web/format.js";
import { UserRole } from "@/domain/aggregates/user/value-objects/UserRole.js";

function IdentityCell({ item }) {
    if (!item.fullName)
        return <span className="muted">—</span>;

    return (
        <>
            <strong>{item.fullName}</strong>
            <br />
            {identificationLabel(item.identificationType)} {item.identification}
            <br />
            Cel. {item.phone}
        </>
    );
}

function RegisterClient({ onRegistered }) {
    const register = (input) => {
        const result = getContainer().register.execute(input);
        onRegistered();

        return `Registro exitoso. Bienvenido, ${result.name}.`;
    };

    return (
        <section className="card">
            <h2>Registrar cliente</h2>
            <ClientRegistrationForm submitLabel="Registrar" onSubmit={register} />
        </section>
    );
}

function ClientList({ refreshKey }) {
    const [users, setUsers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirming, setConfirming] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = useCallback(() => {
        setUsers(getContainer().listUsers.execute().users);
    }, []);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    const run = (action, message) => {
        setError("");
        setSuccess("");

        try {
            action();
            setSuccess(message);
            return true;
        } catch (e) {
            setError(toMessage(e));
            return false;
        } finally {
            load();
        }
    };

    const startEditing = (name) => {
        setEditing(name);
        setNewPassword("");
        setConfirming(null);
    };

    const startConfirming = (name) => {
        setConfirming(name);
        setEditing(null);
    };

    const savePassword = (event, name) => {
        event.preventDefault();
        const done = run(
            () => getContainer().changePassword.execute({ name, newPassword }),
            `Contraseña de ${name} actualizada.`,
        );
        if (done) setEditing(null);
    };

    const confirmDelete = (name) => {
        run(
            () => getContainer().deleteUser.execute({ name, confirmed: true }),
            `Usuario ${name} eliminado.`,
        );
        setConfirming(null);
    };

    return (
        <section className="card">
            <h2>Clientes</h2>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>
            {users.length === 0 ? (
                <p className="muted">No hay clientes registrados.</p>
            ) : (
                <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Identidad</th>
                            <th>Producto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.name} data-user={user.name}>
                                <td>{user.name}</td>
                                <td data-identity>
                                    <IdentityCell item={user} />
                                </td>
                                <td>{user.summary}</td>
                                <td>{user.isLocked ? "Bloqueado" : "Activo"}</td>
                                <td>
                                    {editing === user.name ? (
                                        <form onSubmit={(e) => savePassword(e, user.name)} noValidate>
                                            <input
                                                type="password"
                                                aria-label={`Nueva contraseña de ${user.name}`}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            <div className="row">
                                                <button type="submit">Guardar</button>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() => setEditing(null)}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </form>
                                    ) : confirming === user.name ? (
                                        <div>
                                            <p>¿Eliminar al usuario {user.name}? No se puede deshacer.</p>
                                            <div className="row">
                                                <button type="button" onClick={() => confirmDelete(user.name)}>
                                                    Confirmar eliminación
                                                </button>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() => setConfirming(null)}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            <button
                                                type="button"
                                                className="secondary"
                                                onClick={() => startEditing(user.name)}
                                            >
                                                Cambiar contraseña
                                            </button>
                                            {user.isLocked && (
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() =>
                                                        run(
                                                            () => getContainer().unlockUser.execute({ name: user.name }),
                                                            `Usuario ${user.name} desbloqueado.`,
                                                        )
                                                    }
                                                >
                                                    Desbloquear
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="secondary"
                                                onClick={() => startConfirming(user.name)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </section>
    );
}

function RequestsSection({ refreshKey, onChanged }) {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = useCallback(() => {
        setRequests(getContainer().listRegistrationRequests.execute().requests);
    }, []);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    const run = (action, message) => {
        setError("");
        setSuccess("");

        try {
            action();
            setSuccess(message);
        } catch (e) {
            setError(toMessage(e));
        } finally {
            load();
            onChanged();
        }
    };

    const typeLabel = (accountType) => PRODUCT_OPTIONS.find((o) => o.value === accountType)?.label ?? accountType;

    return (
        <section className="card">
            <h2>Solicitudes de registro</h2>
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>
            {requests.length === 0 ? (
                <p className="muted">No hay solicitudes de registro pendientes.</p>
            ) : (
                <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Identidad</th>
                            <th>Producto</th>
                            <th>Saldo inicial</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr key={request.name} data-request={request.name}>
                                <td>{request.name}</td>
                                <td data-identity>
                                    <IdentityCell item={request} />
                                </td>
                                <td>{typeLabel(request.accountType)}</td>
                                <td>{request.initialBalance === null ? "—" : formatPesos(request.initialBalance)}</td>
                                <td>{request.createdAt.toLocaleString("es-CO")}</td>
                                <td>
                                    <div className="row">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                run(
                                                    () => getContainer().approveRegistrationRequest.execute({ name: request.name }),
                                                    `Solicitud de ${request.name} aprobada. El cliente ya puede iniciar sesión.`,
                                                )
                                            }
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            type="button"
                                            className="secondary"
                                            onClick={() =>
                                                run(
                                                    () => getContainer().rejectRegistrationRequest.execute({ name: request.name }),
                                                    `Solicitud de ${request.name} rechazada.`,
                                                )
                                            }
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </section>
    );
}

function ManagerView({ session, logout }) {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <>
            <div className="header">
                <h1>Menú de gestión</h1>
                <button className="secondary" onClick={logout}>
                    Cerrar sesión
                </button>
            </div>
            <p className="muted">Sesión de {session.name}</p>
            <RegisterClient onRegistered={() => setRefreshKey((key) => key + 1)} />
            <RequestsSection refreshKey={refreshKey} onChanged={() => setRefreshKey((key) => key + 1)} />
            <ClientList refreshKey={refreshKey} />
        </>
    );
}

export default function ManagerPage() {
    return (
        <AuthGuard role={UserRole.GERENTE}>
            {(session, logout) => <ManagerView session={session} logout={logout} />}
        </AuthGuard>
    );
}
