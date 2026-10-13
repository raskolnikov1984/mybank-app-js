import Link from "next/link";
import { bank, products } from "../content/bank.js";

export const metadata = {
    title: "Banco Mi Plata | Tu dinero, con tranquilidad",
    description: "Cuenta de ahorros, cuenta corriente y tarjeta de crédito con reglas claras. Solicita tu registro en Banco Mi Plata.",
};

function Hero() {
    return (
        <section className="hero" aria-labelledby="hero-title">
            <svg className="hero-art" viewBox="0 0 600 400" aria-hidden="true" focusable="false">
                <circle cx="520" cy="60" r="140" fill="#ffffff" opacity="0.06" />
                <circle cx="470" cy="330" r="90" fill="#e0a526" opacity="0.18" />
                <circle cx="60" cy="360" r="120" fill="#ffffff" opacity="0.05" />
            </svg>
            <div className="hero-inner">
                <p className="eyebrow">{bank.tagline}</p>
                <h1 id="hero-title">
                    {bank.name}: tu plata, segura y a tu ritmo
                </h1>
                <p className="hero-text">{bank.summary}</p>
                <div className="hero-actions">
                    <Link href="/registro" className="btn btn-primary btn-lg">
                        Registrarse
                    </Link>
                    <Link href="/login" className="btn btn-outline btn-lg">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </section>
    );
}

function About() {
    const { about } = bank;

    return (
        <section className="section" id="nosotros" aria-labelledby="about-title">
            <div className="section-inner">
                <h2 id="about-title" className="section-title">
                    {about.title}
                </h2>
                <p className="section-lead">{about.mission}</p>
                <ul className="card-grid">
                    {about.values.map((value) => (
                        <li key={value.title} className="card">
                            <h3>{value.title}</h3>
                            <p>{value.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Products() {
    return (
        <section className="section section-alt" id="productos" aria-labelledby="products-title">
            <div className="section-inner">
                <h2 id="products-title" className="section-title">
                    Nuestros productos
                </h2>
                <p className="section-lead">Tres productos para cada momento de tu vida financiera.</p>
                <ul className="card-grid">
                    {products.map((product) => (
                        <li key={product.id} className="card product-card" data-product={product.id}>
                            <h3>{product.title}</h3>
                            <p>{product.text}</p>
                            <ul className="conditions">
                                {product.conditions.map((condition) => (
                                    <li key={condition}>{condition}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Steps() {
    return (
        <section className="section" id="como-empezar" aria-labelledby="steps-title">
            <div className="section-inner">
                <h2 id="steps-title" className="section-title">
                    Cómo empezar
                </h2>
                <ol className="steps">
                    {bank.steps.map((step, index) => (
                        <li key={step.title} className="step">
                            <span className="step-number" aria-hidden="true">
                                {index + 1}
                            </span>
                            <div>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <p className="section-cta">
                    <Link href="/registro" className="btn btn-primary btn-lg">
                        Solicitar mi registro
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default function LandingPage() {
    return (
        <>
            <Hero />
            <About />
            <Products />
            <Steps />
        </>
    );
}
