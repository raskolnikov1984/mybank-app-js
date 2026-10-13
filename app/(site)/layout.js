import "../site.css";
import SiteHeader from "../components/site/SiteHeader.js";
import SiteFooter from "../components/site/SiteFooter.js";

export default function SiteLayout({ children }) {
    return (
        <div className="site-shell">
            <a className="skip-link" href="#contenido">
                Saltar al contenido
            </a>
            <SiteHeader />
            <main id="contenido" tabIndex={-1} className="site-main">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
