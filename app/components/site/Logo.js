export default function Logo({ size = 36 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            role="img"
            aria-label="Logotipo de Banco Mi Plata"
            focusable="false"
        >
            <circle cx="24" cy="24" r="22" fill="#0b6e4f" />
            <circle cx="24" cy="24" r="22" fill="none" stroke="#e0a526" strokeWidth="2" />
            <path
                d="M13 33V15l11 12 11-12v18"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="24" cy="38" r="2" fill="#e0a526" />
        </svg>
    );
}
