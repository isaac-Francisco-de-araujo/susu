# Pink Petal Studio

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

O frontend Lovable fica em `front/`; a API Java/Spring Boot fica em `back/`, organizada em model, repository, service, controller e database. Procedimentos, clientes, agenda/histórico, configurações, galeria e financeiro estão conectados à API. Dashboard e relatórios calculam indicadores a partir dos dados reais. As fotos JPG/JPEG são enviadas pelo computador e armazenadas no backend. O painel exige login em `/login`.

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
│   ├── src/                 # API Java em camadas, banco e testes
│   ├── pom.xml              # dependências Maven do backend
│   └── README.md            # execução, endpoints e PostgreSQL
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

Para o **backend**, execute `mvn spring-boot:run` dentro de `back/`. A API atende em `http://localhost:8080/api/services`, usando H2 local por padrão e perfil PostgreSQL configurável. Execute `mvn verify` na mesma pasta para testar e gerar o JAR. Consulte [back/README.md](back/README.md).

Configure `ADMIN_USERNAME` (padrão `admim`) e uma `ADMIN_PASSWORD` forte no ambiente do processo Java. Sem senha configurada, o backend gera uma senha temporária e a exibe no terminal a cada inicialização; mantenha esse terminal e seus logs privados. O `.env` da raiz não é carregado pelo Spring. O painel usa sessão HttpOnly, CSRF e expiração após 30 minutos de inatividade. Na publicação HTTPS, defina `SESSION_COOKIE_SECURE=true` e encaminhe `/api` pelo mesmo domínio do site. Reinicie o backend para aplicar as alterações.

Verificações: `npm run typecheck`, `npm run lint`, `npm test` (Node 22.18+ ou 24+) e `npm run build` na raiz; `mvn verify` em `back/`. Pare uma instância executada a partir do JAR antes de recompilar o mesmo arquivo no Windows.

Para usar frontend e backend juntos, mantenha a API rodando e execute `npm run dev -- --port 5173` na raiz. Acesse `http://localhost:5173/admin/procedimentos` para cadastrar os procedimentos; eles aparecerão na Home e em `/servicos`. Consulte [front/README.md](front/README.md) para configurar a URL da API na publicação.

URLs, aparência, navegação e configurações de publicação não foram alteradas. Os imports relativos continuam válidos porque a árvore de código foi movida inteira; o alias `@` agora aponta para `front/src`.

Consulte [o relatório de segurança, privacidade e acessibilidade](RELATORIO-SEGURANCA-PRIVACIDADE.md) para as melhorias, rotas, testes e pendências de implantação e revisão jurídica.

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
