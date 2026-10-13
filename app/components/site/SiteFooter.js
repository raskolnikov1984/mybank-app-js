import Logo from "./Logo.js";
import { bank, socialLinks } from "../../content/bank.js";

export default function SiteFooter() {
    const { corporate } = bank;

    return (
        <footer className="site-footer">
            <div className="footer-grid">
                <div>
                    <p className="footer-brand">
                        <Logo size={32} />
                        <span>{bank.name}</span>
                    </p>
                    <p className="footer-text">{bank.tagline}.</p>
                </div>
                <div>
                    <h2 className="footer-title">Información corporativa</h2>
                    <ul className="footer-list">
                        <li>{corporate.legalName}</li>
                        <li>{corporate.taxId}</li>
                        <li>{corporate.address}</li>
                        <li>Tel. {corporate.phone}</li>
                        <li>{corporate.email}</li>
                        <li>{corporate.hours}</li>
                    </ul>
                </div>
                <div>
                    <h2 className="footer-title">Síguenos</h2>
                    <ul className="footer-list social-list">
                        {socialLinks.map((link) => (
                            <li key={link.id}>
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${bank.shortName} en ${link.name}`}
                                    data-social={link.id}
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <p className="footer-copy">
                © {new Date().getFullYear()} {corporate.legalName} Todos los derechos reservados.
            </p>
        </footer>
    );
}
