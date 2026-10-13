// Single source of the texts shown on the public pages.
// Corporate data, contact details and social links are fictional placeholders: edit them here.

export const bank = {
    name: "Banco Mi Plata",
    shortName: "Mi Plata",
    tagline: "Tu dinero, con tranquilidad",
    summary:
        "Abre tu cuenta de ahorros, tu cuenta corriente o tu tarjeta de crédito en un solo lugar, con reglas claras y sin letra pequeña.",
    about: {
        title: "Quiénes somos",
        mission:
            "Somos una entidad financiera cercana que acompaña a personas y familias a cuidar, mover y hacer crecer su dinero. Nuestra misión es ofrecer productos sencillos y transparentes que se adapten a la vida diaria de cada cliente.",
        values: [
            { title: "Confianza", text: "Cuidamos tu dinero como si fuera nuestro y respondemos por cada operación." },
            { title: "Transparencia", text: "Las condiciones de cada producto son claras desde el primer día." },
            { title: "Cercanía", text: "Cada solicitud la revisa una persona de nuestra sucursal." },
            { title: "Innovación", text: "Mejoramos continuamente para que operar con nosotros sea fácil." },
        ],
    },
    steps: [
        { title: "Solicita tu registro", text: "Completa el formulario con tus datos y el producto que quieres." },
        { title: "Aprobación del gerente", text: "El gerente de la sucursal revisa tu solicitud y la aprueba." },
        { title: "Inicia sesión", text: "Con tu usuario y contraseña consultas, consignas y retiras." },
    ],
    corporate: {
        legalName: "Mi Plata S.A.",
        taxId: "NIT 900.123.456-7",
        address: "Carrera 10 # 20-30, Bogotá, Colombia",
        phone: "+57 601 555 0100",
        email: "contacto@miplata.example",
        hours: "Lunes a viernes, 8:00 a. m. a 5:00 p. m.",
    },
};

export const products = [
    {
        id: "ahorros",
        title: "Cuenta de Ahorros",
        text: "Pensada para guardar tu dinero a mediano y largo plazo y generar rendimientos.",
        conditions: [
            "Interés del 1,5 % mensual, aplicado en cada retiro",
            "Consigna y retira cuando quieras",
            "El retiro no puede superar tu saldo disponible",
        ],
    },
    {
        id: "corriente",
        title: "Cuenta Corriente",
        text: "Para la gestión diaria: recibir tu nómina, pagar facturas y transferir con frecuencia.",
        conditions: [
            "No genera intereses ni comisiones",
            "Sobregiro de hasta el 20 % adicional sobre tu saldo",
            "Con $1.000.000 puedes retirar hasta $1.200.000",
        ],
    },
    {
        id: "tarjeta",
        title: "Tarjeta de Crédito",
        text: "Compra hoy y paga después con un cupo claro y fácil de seguir.",
        conditions: [
            "Cupo de $2.000.000",
            "Interés mensual del 2 % sobre la deuda",
            "Tus pagos reducen la deuda y liberan cupo",
        ],
    },
];

export const socialLinks = [
    { id: "facebook", name: "Facebook", href: "https://www.facebook.com/" },
    { id: "instagram", name: "Instagram", href: "https://www.instagram.com/" },
    { id: "x", name: "X", href: "https://x.com/" },
    { id: "linkedin", name: "LinkedIn", href: "https://www.linkedin.com/" },
];
