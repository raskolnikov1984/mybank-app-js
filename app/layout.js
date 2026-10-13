import "./globals.css";

export const metadata = {
    title: "Banco Mi Plata",
    description: "Simulador de transacciones bancarias de la sucursal Mi Plata",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <main className="container">{children}</main>
            </body>
        </html>
    );
}
