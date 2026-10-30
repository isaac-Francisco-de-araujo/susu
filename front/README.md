# Frontend

Código React, TanStack Start, TypeScript e Tailwind do Pink Petal Studio.

- `src/routes/`: páginas públicas e painel profissional; URLs preservadas.
- `src/components/`: interface reutilizável.
- `src/lib/`: contratos, stores de API, mocks das áreas ainda demonstrativas e links WhatsApp.
- `src/assets/`, `public/`: imagens e arquivos públicos.
- `src/server.ts`, `src/start.ts`: renderização SSR da plataforma, não API de negócio.

As configurações do frontend ficam nesta pasta. Execute `bun run dev`, `bun run build` e `bun run lint` **na raiz do repositório**: os lançadores e o manifesto únicos da raiz preservam o contrato do Lovable. Os atalhos `src`, `public` e `components.json` da raiz apontam para os arquivos reais daqui; não são cópias nem outro frontend.

No Windows, o Git pode materializar esses atalhos como arquivos de texto. O Vite usa explicitamente `front/src` e `front/public`, então a execução não depende dos atalhos. Sem Bun instalado globalmente, instale com `npx --yes bun install --frozen-lockfile` na raiz e execute `npm run dev`, `npm run build` e `npm run lint`.

## Catálogo conectado à API

`src/lib/services-store.ts` consulta a API Java/Spring Boot e compartilha os procedimentos entre painel, Home, página de serviços e seletor da agenda. Cadastro, edição, ativação/desativação e exclusão são gravados no banco. O catálogo não usa mais `localStorage` nem os procedimentos de demonstração como fallback. Dados antigos da chave `studio-services` não são importados automaticamente.

Para executar os dois processos:

1. Dentro de `back/`: `mvn spring-boot:run` (API na porta 8080).
2. Na raiz: `npm run dev -- --port 5173` (site na porta 5173).
3. Abra `http://localhost:5173/admin/procedimentos` e cadastre o primeiro procedimento. O banco começa vazio.

O Vite encaminha `/api` para `http://127.0.0.1:8080`. É possível configurar `BACKEND_URL` no ambiente do Vite. A sessão usa SameSite=Strict: na publicação, prefira `/api` por reverse proxy no mesmo domínio. Uma API em subdomínio do mesmo site requer `VITE_API_URL` e `CORS_ALLOWED_ORIGINS` explícitos. Domínios de sites diferentes não compartilham esse cookie. Consulte `.env.example` na raiz.

O proxy Vite existe somente em desenvolvimento. Na publicação, configure `VITE_API_URL` antes do build, ou forneça um reverse proxy para `/api` no mesmo domínio. Reinicie o Vite/recompile após alterar as variáveis. O backend Java precisa estar publicado e acessível ao navegador; `localhost` refere-se ao aparelho de quem abre o site.

Home, serviços e trabalhos também carregam catálogo/galeria durante o SSR, sem compartilhar dados entre requisições. Para essa consulta servidor-servidor, configure `SERVER_API_URL` no ambiente do servidor frontend com a URL completa da API (incluindo `/api`); no desenvolvimento, o padrão usa `BACKEND_URL` ou `http://127.0.0.1:8080`. Se a consulta SSR falhar, a interface continua tentando carregar os dados pelo navegador.

O catálogo busca os dados ao abrir a interface e ao voltar o foco à janela. Alterações feitas no painel atualizam o store compartilhado depois que a API confirma a gravação. Erros mantêm o formulário aberto para nova tentativa.

## Testar pelo celular na mesma rede Wi-Fi

1. Consulte o IPv4 do computador com `ipconfig` (por exemplo, `192.168.1.15`).
2. Inicie a API dentro de `back/`, com senha administrativa configurada no ambiente. O proxy Vite reconhece chamadas da mesma origem, inclusive pelo IP da rede, e encaminha essas requisições como servidor-servidor; origens estrangeiras continuam sujeitas à rejeição CORS.

3. Na raiz, execute `npm run dev -- --host 0.0.0.0 --port 5173`.
4. Com o celular no mesmo Wi-Fi, abra `http://192.168.1.15:5173`. Se o Windows solicitar, permita o acesso do Node à rede privada.

Mantenha `VITE_API_URL=/api`: o navegador usa o proxy do frontend, e a API pode continuar escutando apenas em `127.0.0.1:8080`. Para acesso pela internet, utilize a URL publicada com HTTPS.

## Novos fluxos administrativos

- **Clientes** (`/admin/clientes`): cadastro persistente, edição de nascimento/observações e histórico individual. O cartão mostra o último procedimento realizado, data, visitas e total gasto. Em **Histórico**, aparecem somente os agendamentos da cliente com status **Atendido**.
- **Agenda** (`/admin/agenda`): escolha a cliente cadastrada e o procedimento, informe data, horário, pagamento e observações. Marque como **Atendido** após realizar o serviço para entrar no histórico. Navegação de meses também funciona entre anos.
- **Configurações** (`/admin/configuracoes`): salva nome do studio/profissional, WhatsApp com DDI/DDD, Instagram, endereço, primeiro dia da semana, intervalo e início/término do atendimento. Os dados públicos aparecem no site; as preferências de atendimento ajustam o calendário e a lista de horários. A opção de lembretes controla o link de WhatsApp nas 24 horas anteriores ao agendamento; o envio da mensagem é manual.
- **Procedimentos** (`/admin/procedimentos`): seletor de arquivo JPG/JPEG do computador em vez de campo URL, com prévia e upload persistente. Fotos de até 5 MB.
- **Meus trabalhos** (`/admin/trabalhos`): adicionar fotos JPG/JPEG, substituir a imagem, editar título, ordenar, ocultar e excluir. A Home mostra até quatro fotos visíveis e `/trabalhos` mostra todas, com ampliação.
- **Dashboard** (`/admin`): agenda futura, confirmações pendentes, receitas do dia e últimos sete dias, e procedimento mais realizado no mês, calculados sobre os registros reais.
- **Financeiro** (`/admin/financeiro`): lançamentos manuais persistidos, edição/exclusão e filtros por dia, semana, mês, ano ou intervalo personalizado. Usa a data informada no formulário. Atendimentos concluídos geram entradas automaticamente; alterá-los/cancelá-los na agenda atualiza a receita sem duplicar lançamentos.
- **Relatórios** (`/admin/relatorios`): mês selecionável, clientes atendidas, primeira visita, retornos, quantidade/receita/ticket médio por procedimento. Reativação considera clientes sem atendimento concluído há mais de 45 dias a partir de hoje.

Os uploads também passam pelo proxy `/api`, e `mediaUrl` ajusta os endereços para uma API externa quando `VITE_API_URL` estiver configurada. Clientes, agenda e galeria começam vazios para receber os dados reais.

O painel exige login em `/login`, validado pela API. O usuário/senha vêm de `ADMIN_USERNAME`/`ADMIN_PASSWORD` no backend, sem senha fixa padrão. A autenticação usa cookie de sessão HttpOnly/SameSite=Strict, rotação do identificador no login, CSRF e expiração por inatividade. Sair invalida a sessão no servidor e descarta os stores privados. Credenciais antigas em `sessionStorage` são removidas. As rotas administrativas são renderizadas somente no cliente e verificam o acesso antes de abrir; o backend exige ADMIN independentemente do frontend. Não há cadastro público de usuários.

Os botões públicos de agendamento abrem WhatsApp com mensagem pronta. Consultas anônimas retornam somente procedimentos/fotos ativos. Gravações, dados de clientes, agenda e financeiro exigem autenticação no backend. Consulte `../back/README.md` para os endpoints.

`npm test` na raiz executa testes de períodos, cálculos financeiros, sincronização dos stores e transporte de sessão/CSRF usando o runner do Node (22.18+ ou 24+), sem dependências adicionais.

As páginas `/privacidade`, `/termos` e `/cookies` são públicas e estão no rodapé. O site usa somente o cookie necessário à sessão; não adiciona banner ou rastreamento opcional. As fontes continuam sendo carregadas pelo Google Fonts, informado na política. Confira o relatório da raiz para as pendências jurídicas e de infraestrutura.
