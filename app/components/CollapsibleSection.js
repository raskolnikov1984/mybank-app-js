"use client";

import { useId, useState } from "react";

export default function CollapsibleSection({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);
    const bodyId = useId();

    return (
        <section className="card">
            <button
                type="button"
                className="section-toggle"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() => setOpen((value) => !value)}
            >
                <h2>{title}</h2>
                <span aria-hidden="true">{open ? "Ocultar ▲" : "Mostrar ▼"}</span>
            </button>
            <div id={bodyId} hidden={!open}>
                {children}
            </div>
        </section>
    );
}
