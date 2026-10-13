# Architecture

```
mybank-app-js/
├── 📁 app/                  # Web UI (Next.js App Router, client components)
│   ├── page.js              # Login
│   ├── cliente/page.js      # Client view (deposit, withdraw, movements, monthly statement)
│   ├── gerente/page.js      # Manager view (register clients with a product type)
│   └── components/
│
├── 📁 src/
│   ├── domain/              # Entities and value objects (no external dependencies)
│   │   └── aggregates/account/   # Account (abstract) -> SavingsAccount, CheckingAccount, CreditCard
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
