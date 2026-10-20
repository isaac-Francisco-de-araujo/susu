# Pink Petal Studio

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

O código do frontend está fisicamente em `front/`; `back/` reserva o futuro backend e contém apenas documentação honesta do estado atual.

```text
/
├── front/
│   ├── src/                 # páginas, componentes, mocks, estilos e SSR
│   ├── public/              # favicon e robots.txt
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── components.json
│   └── README.md
├── back/
│   └── README.md            # sem API ou banco implementados
├── src -> front/src         # compatibilidade Lovable, sem cópia
├── public -> front/public
├── components.json -> front/components.json
├── vite.config.ts           # encaminha para front/
├── tsconfig.json            # estende front/tsconfig.json
├── eslint.config.js         # encaminha para front/
├── package.json             # dependências e comandos únicos
└── bun.lock
```

Execute instalação e comandos **na raiz**, não dentro de `front/`: `bun install`, `bun run dev`, `bun run build`, `bun run lint`. O manifesto, lockfile e saída de compilação permanecem na raiz para compatibilidade com o Lovable. Não existe um segundo projeto frontend ou cópia do código.

URLs, aparência, navegação e configurações de publicação não foram alteradas. Os imports relativos continuam válidos porque a árvore de código foi movida inteira; o alias `@` agora aponta para `front/src`.

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
