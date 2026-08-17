# Architecture

```
mybank-app-js/
├── 📁 src/
│   ├── domain/          # Entidades puras (0 dependencias externas)
│   ├── application/     # Casos de uso (depende solo de domain)
│   ├── infrastructure/  # Adaptadores (localStorage, prompt, etc.)
│   └── main.js          # Punto de entrada / Composition Root
│
├── 📁 tests/
│   ├── unit/
│   │   ├── domain/
│   │   └── application/
│   └── integration/
│
├── .gitignore
├── package.json
├── README.md
└── ARCHITECTURE.md
```


