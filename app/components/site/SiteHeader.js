import Link from "next/link";
import Logo from "./Logo.js";
import { bank } from "../../content/bank.js";

export default function SiteHeader() {
    return (
        <header className="site-header">
            <nav className="site-nav" aria-label="Navegación principal">
                <Link href="/" className="brand">
                    <Logo />
                    <span>{bank.name}</span>
                </Link>
                <ul className="nav-links">
                    <li>
                        <Link href="/login" className="btn btn-ghost">
                            Iniciar sesión
                        </Link>
                    </li>
                    <li>
                        <Link href="/registro" className="btn btn-primary">
                            Registrarse
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
