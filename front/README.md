# Frontend

Código React, TanStack Start, TypeScript e Tailwind do Pink Petal Studio.

- `src/routes/`: páginas públicas e painel profissional; URLs preservadas.
- `src/components/`, `src/hooks/`: interface reutilizável.
- `src/lib/`: mocks, contratos, catálogo local e links WhatsApp.
- `src/assets/`, `public/`: imagens e arquivos públicos.
- `src/server.ts`, `src/start.ts`: renderização SSR da plataforma, não API de negócio.

As configurações do frontend ficam nesta pasta. Execute `bun run dev`, `bun run build` e `bun run lint` **na raiz do repositório**: os lançadores e o manifesto únicos da raiz preservam o contrato do Lovable. Os atalhos `src`, `public` e `components.json` da raiz apontam para os arquivos reais daqui; não são cópias nem outro frontend.

Não há API, banco de dados ou login real. O catálogo usa localStorage (`studio-services`); demais edições administrativas ficam na memória da página. Os botões públicos de agendamento abrem WhatsApp com mensagem pronta. Nome do studio e contatos continuam com os valores demonstrativos anteriores.