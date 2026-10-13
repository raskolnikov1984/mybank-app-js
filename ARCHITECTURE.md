# Architecture

```
mybank-app-js/
├── 📁 app/                  # Web UI (Next.js App Router)
│   ├── layout.js            # Root layout (html, body, global styles)
│   ├── (site)/              # Public shell: header, footer, skip link (site.css)
│   │   ├── page.js          # Landing page
│   │   ├── login/page.js    # Login
│   │   └── registro/page.js # Registration request
│   ├── (panel)/             # Panels shell (container)
│   │   ├── cliente/page.js  # Client view (deposit, withdraw, movements, monthly statement)
│   │   └── gerente/page.js  # Manager view (requests, registration, client administration)
│   ├── components/          # Alert, AuthGuard and site/ (Logo, SiteHeader, SiteFooter)
│   └── content/bank.js      # Texts of the public pages (fictional corporate data)
│
├── 📁 src/
│   ├── domain/              # Entities and value objects (no external dependencies)
│   │   ├── aggregates/account/       # Account (abstract) -> SavingsAccount, CheckingAccount, CreditCard
│   │   └── aggregates/registration/  # RegistrationRequest (pending registration awaiting the manager)
│   ├── application/         # Use cases, DTOs and ports (depends only on domain)
│   ├── infraestructure/     # Adapters
│   │   ├── repositories/    # In-memory (console) and LocalStorage (web) implementations of the ports
│   │   ├── ui/              # Console prompt
│   │   └── web/             # Browser composition root, error messages, formatting
│   └── main.js              # Console entry point / composition root
│
├── 📁 tests/
│   └── unit/
│       ├── application/
│       └── infraestructure/
│
├── 📁 docs/                 # UML diagram
├── 📁 openspec/             # Specs and changes (spec-driven development)
├── jsconfig.json            # "@/*" alias -> src/*
├── next.config.mjs
├── package.json
├── README.md
└── ARCHITECTURE.md
```

The same domain and use cases back two adapters: the console (`src/main.js`, in-memory repositories) and the web app (`app/`, wired in `src/infraestructure/web/container.js` with LocalStorage repositories). `src/domain` and `src/application` must not import `node:*` modules so they can run in the browser.
