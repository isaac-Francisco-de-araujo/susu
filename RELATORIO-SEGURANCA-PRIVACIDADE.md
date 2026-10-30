# Pink Petal Studio — relatório de segurança, privacidade e acessibilidade

Data: 30/10/2026.

## 1. Funcionalidades existentes e preservadas

- Frontend React/TanStack Start/Tailwind em `front/` e API Java/Spring Boot em `back/`.
- Catálogo e preços persistidos, galeria com upload JPEG, apresentação e contato.
- Agendamento público exclusivamente por WhatsApp, centralizado em `front/src/lib/config.ts`.
- Login profissional, dashboard com receitas diárias, cadastro/edição de clientes, histórico individual, agenda operacional interna, confirmações, financeiro, relatórios e configurações.
- Histórico mantém o nome e o valor do procedimento realizado; atendimentos concluídos alimentam o financeiro sem duplicação.
- Banco H2 local persistente, perfil PostgreSQL, migrações Flyway e backups existentes.

As alterações não executaram limpeza ou substituição de registros do banco em uso. As migrações e as fotos existentes foram preservadas. Os testes que gravam dados utilizaram bancos em memória e diretórios temporários separados. O comentário `integrar com o back aq` foi preservado em `front/src/lib/mock-data.ts`.

## 2. Melhorias implementadas

### Autenticação e controle de acesso

- Substituição do HTTP Basic e da credencial no `sessionStorage` por sessão no servidor.
- Cookie `STUDIO_SESSION` HttpOnly, SameSite=Strict, sem persistência da senha no navegador; identificador trocado no login para evitar fixação de sessão.
- Expiração da sessão após 30 minutos de inatividade e invalidação no logout. O navegador recarrega ao sair para descartar stores privados.
- Proteção CSRF em todas as operações de escrita, incluindo login, logout e upload. O frontend busca e renova o token de forma centralizada; uma escrita rejeitada não é repetida automaticamente.
- Remoção da senha padrão previsível. `ADMIN_PASSWORD` é configurada no ambiente do processo Java. Sem configuração, há senha temporária aleatória no terminal restrito do backend. A senha utilizada pelo provedor de autenticação fica protegida por BCrypt.
- Limitação de tentativas de login: até 10 tentativas por IP em uma janela de 15 minutos; bloqueio temporário com HTTP 429 e `Retry-After`. Mapa limitado a 1.024 endereços, com expiração.
- Exigência de papel ADMIN no backend para todos os endpoints privados e todas as mutações. As rotas do painel também verificam a sessão e redirecionam visitantes para `/login`.
- Somente ADMIN pode visualizar procedimentos/fotos inativos. Ser autenticado com outro papel não basta.
- DTO público de configurações: preferências internas de agenda não são retornadas a visitantes.
- CORS com origens explícitas e cookies, sem curinga. O proxy Vite reconhece chamadas da sua própria origem, inclusive na rede local; origens estrangeiras não são removidas ou confiadas.
- Respostas da API sem cache pela configuração do Spring Security; páginas administrativas SSR com `no-store` e `noindex`. Headers de referrer e MIME reforçados, com restrição de câmera, microfone e geolocalização no frontend.
- Erros de JSON/identificador inválido retornam mensagem genérica; erros de validação não retornam o conteúdo pessoal enviado.

### Privacidade e transparência

- Novas páginas `/privacidade`, `/termos` e `/cookies`, com links consistentes no rodapé e canal de direitos dos titulares pelo WhatsApp cadastrado.
- Documentos explicam dados, finalidades, bases legais, acesso, retenção, direitos, terceiros, cookies e limitações da implantação ainda dependentes de confirmação.
- Cadastro de clientes informa finalidade, opcionalidade do nascimento e orientação para não inserir documentos ou informações de saúde nas observações.
- Galeria informa direitos de imagem, autorização para pessoas identificáveis, descrição acessível e caráter público dos arquivos enviados.
- Fallback do frontend não inventa telefone, Instagram, endereço ou nome de profissional. Configurações já gravadas no banco foram mantidas para conferência da proprietária.
- Alegação de oito anos de experiência e afirmação não comprovada de esterilização foram retiradas do texto-modelo; metadados fixos de “Studio Bella” foram revisados. Fotos ilustrativas da apresentação foram identificadas como ilustrativas no texto alternativo.
- O diagnóstico manual de erros do Lovable não recebe erros do painel/login; mensagens de erro públicas encaminhadas por esse helper são genéricas.
- Nenhum depoimento, promoção ou avaliação foi acrescentado. Nenhum mecanismo de reserva pública interna foi criado.

### Cookies e serviços externos

- O código da aplicação não instala pixels de publicidade ou ferramentas opcionais de medição de audiência. `analytics.ts` calcula indicadores internos de negócio, não rastreia visitantes.
- O cookie de sessão/CSRF é necessário ao painel; não foi acrescentado banner de consentimento desnecessário.
- Google Fonts permanece como serviço externo de fontes e está informado nos documentos. WhatsApp, Instagram e mapas são acessados por links.
- O ambiente Lovable pode injetar ferramentas próprias de prévia/diagnóstico. A versão efetivamente publicada deve ser reavaliada após implantação ou inclusão de terceiros. Se for adicionado rastreamento opcional, implementar consentimento prévio com rejeição e preferências revogáveis antes de ativá-lo.

### Acessibilidade e experiência

- Contraste reforçado nos tons rosa, WhatsApp e estados de erro/aviso/informação, preservando a identidade visual.
- Links para pular ao conteúdo no site e no painel; foco visível e compensação do cabeçalho fixo.
- Um título principal nas páginas públicas revisadas; navegações com nomes acessíveis e indicação da página atual.
- Modal nativo com nome acessível, fundo inerte, foco contido, Escape e restauração do foco no elemento de origem.
- Menu administrativo móvel fora da ordem de foco quando fechado; quando aberto, foco contido, fundo inerte e fechamento por Escape.
- Menu público com estado expandido e fechamento por Escape.
- Tabela de relatórios com região nomeada e rolagem acessível pelo teclado.
- Campo telefônico semântico, mensagens de erro por `role=alert`, estados de carregamento e nascimento opcional preservados.
- Mensagem de serviço no WhatsApp: `Olá, gostaria de agendar [nome do procedimento].`, codificada dinamicamente sem acrescentar dados da cliente.

## 3. Rotas

### Públicas

| Rota | Finalidade |
| --- | --- |
| `/` | Home e catálogo |
| `/sobre` | Apresentação |
| `/servicos` | Procedimentos e preços |
| `/trabalhos` | Galeria |
| `/contato` | Contatos cadastrados |
| `/privacidade` | Política de Privacidade |
| `/termos` | Termos de Uso |
| `/cookies` | Política de Cookies |
| `/login` | Entrada do painel, sem dados privados |

### Protegidas

| Rota existente | Finalidade |
| --- | --- |
| `/admin` | Dashboard, faturamento diário e clientes para confirmação |
| `/admin/clientes` | Cadastro, consulta e histórico individual |
| `/admin/agenda` | Registro operacional, status e confirmações de atendimentos combinados por WhatsApp |
| `/admin/procedimentos` | Gestão de serviços, preços e fotos |
| `/admin/trabalhos` | Gestão da galeria |
| `/admin/financeiro` | Entradas, despesas e filtros |
| `/admin/relatorios` | Indicadores e procedimentos mais realizados |
| `/admin/configuracoes` | Dados do estabelecimento e backup |

Foram mantidas as rotas existentes, adaptando as sugestões: “serviços” corresponde a `/admin/procedimentos`, o histórico fica na ficha da cliente e as confirmações ficam no dashboard e na agenda. O layout `/admin` continua apenas com `Outlet`; o dashboard permanece no índice.

### Endpoints

- Públicos de leitura: `GET /api/services`, `GET /api/services/{id}` (apenas ativos para visitantes), `GET /api/gallery` (ativos), `GET /api/settings` (DTO público) e `GET /api/uploads/{arquivo}`.
- Inicialização de segurança: `GET /api/auth/csrf`; não concede acesso a dados privados.
- Login: `POST /api/auth/login`, com usuário, senha e CSRF.
- Logout: `POST /api/auth/logout`, com CSRF e invalidação de sessão.
- Protegidos: `/api/auth/me`, clientes e histórico, agenda, financeiro, backups e todas as gravações de serviços, galeria, configurações e uploads.
- As imagens enviadas têm URL pública mesmo quando ocultas na listagem. Ocultar uma foto não transforma seu arquivo em conteúdo privado.

## 4. Testes e resultados

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado |
| `npm test` | 10 testes aprovados |
| `npm run build` | Compilação de cliente, SSR e Nitro aprovada |
| `mvn test` em `back/` | 18 testes aprovados, sem falhas ou erros |
| `mvn -DskipTests package` em `back/` | JAR gerado após os testes |
| Chrome headless + Playwright | 27 verificações de integração aprovadas |
| axe com tags WCAG 2 A/AA, 2.1 AA e 2.2 AA | Zero violações nas páginas e estados examinados após correções |
| Rede local `http://192.168.1.68:5173` | Frontend HTTP 200, configurações públicas HTTP 200, clientes sem autenticação HTTP 401 |
| Login pelo IP da rede e origem estrangeira | Mesma origem alcança a autenticação (HTTP 401 para senha inválida); origem estrangeira é rejeitada (HTTP 403) |

Os testes Spring verificam acesso público, bloqueio de anônimos e de papel sem permissão, login real, rotação de sessão, logout, proteção CSRF, tentativa com Basic rejeitada, limitação de tentativas, serviços inativos, CRUD, validações, concorrência de agenda, histórico, financeiro, uploads JPEG e backup/restauração isolados.

Os testes do frontend verificam períodos, cálculos financeiros, CSV, retorno de clientes, sincronização de stores, cookies/CSRF no transporte e ausência de repetição automática de escritas.

O navegador verificou as oito rotas públicas de conteúdo e as oito rotas administrativas, redirecionamento sem login, erro de login, cookie HttpOnly/SameSite, ausência de credencial no armazenamento JavaScript, escrita bloqueada sem CSRF, cadastro real por formulário com validação, histórico/financeiro integrados, upload/galeria, mensagem de WhatsApp, foco de modais e menus, Escape, logout e ausência de overflow horizontal a 390 px. Também foram examinados Home e dashboard a 1440 px.

Artefatos locais da execução final: `C:/Users/florb/AppData/Local/Temp/opencode/susu-security-n0mPBc/` (`results.json`, `home-desktop.png`, `admin-desktop.png`). O roteiro local usado está em `C:/Users/florb/AppData/Local/Temp/opencode/susu-security-accessibility.mjs`; depende de Chrome, Playwright e axe instalados nesse diretório temporário. Os fixtures ficaram em memória e não foram inseridos no banco em uso.

Os testes automatizados não equivalem à certificação WCAG nem à validação jurídica completa. Ainda é necessária revisão humana com leitores de tela, aparelhos reais e cenários não contemplados pelo roteiro. Avisos da cadeia Vite/Nitro sobre plugins/empacotamento e um aviso de metadados de repositório Maven não impediram os builds ou os testes.

## 5. Arquivos modificados nesta atualização

Os caminhos abaixo identificam esta entrega; o repositório já continha outras alterações antes da revisão.

### Raiz e documentação

- `.env.example`
- `.gitignore` (proteção para novos arquivos locais de ambiente)
- `package.json` (inclusão dos testes de transporte no comando existente)
- `README.md`
- `RELATORIO-SEGURANCA-PRIVACIDADE.md`
- `front/README.md`
- `back/README.md`

### Frontend

- `front/vite.config.ts`
- `front/src/server.ts`
- `front/src/styles.css`
- `front/src/lib/api.ts`
- `front/src/lib/api.test.ts` (novo)
- `front/src/lib/auth.ts`
- `front/src/lib/config.ts`
- `front/src/lib/studio-store.ts`
- `front/src/lib/lovable-error-reporting.ts`
- `front/src/components/ui-kit.tsx`
- `front/src/components/public-shell.tsx`
- `front/src/components/admin-shell.tsx`
- `front/src/components/legal-page.tsx` (novo)
- `front/src/routes/__root.tsx`
- `front/src/routes/admin.tsx`
- `front/src/routes/login.tsx`
- `front/src/routes/index.tsx`
- `front/src/routes/sobre.tsx`
- `front/src/routes/servicos.tsx`
- `front/src/routes/trabalhos.tsx`
- `front/src/routes/contato.tsx`
- `front/src/routes/privacidade.tsx` (novo)
- `front/src/routes/termos.tsx` (novo)
- `front/src/routes/cookies.tsx` (novo)
- `front/src/routes/admin.clientes.tsx`
- `front/src/routes/admin.trabalhos.tsx`
- `front/src/routes/admin.relatorios.tsx`
- `front/src/routeTree.gen.ts` (gerado pelo roteador para as páginas legais)

### Backend

Prefixo Java: `back/src/main/java/com/pinkpetal/studio/`.

- `config/SecurityConfiguration.java`
- `config/WebConfiguration.java`
- `security/AdminAccess.java` (novo)
- `security/LoginAttemptFilter.java` (novo)
- `model/PublicSettingsResponse.java` (novo)
- `controller/AuthController.java`
- `controller/SettingsController.java`
- `controller/ProcedureController.java`
- `controller/GalleryController.java`
- `controller/ApiExceptionHandler.java`
- `back/src/main/resources/application.properties`

Prefixo de testes: `back/src/test/java/com/pinkpetal/studio/`.

- `SecurityApiTest.java`
- `CsrfTestConfiguration.java` (novo)
- `StudioFeaturesTest.java`
- `OperationalFlowsTest.java`
- `ProcedureApiTest.java`
- `BackupApiTest.java`

## 6. Implantação e pendências técnicas

1. **Credencial administrativa:** configurar senha forte exclusiva no ambiente Java e restringir acesso ao terminal/logs. Não existe mais a senha padrão anterior. A instância local atualizada foi reiniciada; se não houver `ADMIN_PASSWORD` no ambiente, a senha temporária está no log local restrito `C:/Users/florb/AppData/Local/Temp/opencode/susu-back-secure.stdout.log`. O usuário padrão continua `admim`, salvo configuração explícita.
2. **HTTPS e cookie Secure:** na publicação, definir `SESSION_COOKIE_SECURE=true`. A rede local HTTP é apenas o ambiente de desenvolvimento. Frontend e API devem usar o mesmo site; preferir `/api` por reverse proxy no mesmo domínio. O proxy do Vite não existe no build publicado.
3. **Banco e backups:** implementar permissões restritas no sistema operacional, conta PostgreSQL de menor privilégio, TLS conforme provedor, criptografia de disco/backup, guarda externa controlada e restauração periódica. A aplicação não criptografa o arquivo H2 nem os ZIPs. O banco não tem política de acesso por linha: a autorização administrativa é aplicada no servidor, que é o único intermediário de acesso ao banco.
4. **Retenção e direitos:** definir tabela de retenção, rotina de revisão e procedimento para acesso, correção, anonimização/exclusão e tratamento de backups. A exclusão de cliente com histórico continua bloqueada para preservar integridade; anonimização de histórico não foi automatizada. Cada solicitação precisa ser analisada conforme obrigações legais.
5. **Consentimentos:** guardar autorizações reais de imagem e eventuais consentimentos específicos fora do formulário de cadastro básico. Não utilizar campos livres para dados sensíveis sem análise de necessidade, base legal e proteção correspondente. Não há módulo de marketing ou registro automatizado de consentimentos nesta entrega.
6. **Escala e administração:** contas continuam no provedor em memória configurado pelo ambiente, sem gerenciamento multiadministrador, recuperação de senha ou MFA. O limitador e as sessões são locais à instância; em escala, usar gateway e sessão compartilhada com configuração de proxy confiável.
7. **Acessibilidade:** completar revisão com NVDA/VoiceOver, zoom, dispositivos reais e conteúdo futuro da galeria. Exigir descrições úteis nas novas fotos e revalidar contrastes ao alterar as cores.
8. **Terceiros e publicação:** confirmar provedores, regiões, contratos, transferências internacionais e scripts efetivamente injetados pelo ambiente publicado. Avaliar hospedar fontes localmente para reduzir requisições ao Google. Uma política CSP com nonces e proteção contra enquadramento deve ser validada com o SSR e a prévia Lovable antes de implantação.
9. **Arquivos de ambiente:** o `.env` existente já é rastreado pelo Git e contém identificadores/URL e chave publicável da integração anterior, não uma senha administrativa ou chave privada. Ele foi preservado. O `.gitignore` agora impede novos arquivos de ambiente locais, mas não remove arquivos que já são rastreados: não adicione segredos ao `.env` atual. Na revisão de publicação, retire-o do versionamento por um commit normal, mantendo os valores necessários no ambiente da plataforma. Não reescreva o histórico conectado ao Lovable.

## 7. Informações necessárias da proprietária

- Identificação real da responsável/controladora e, quando aplicável, razão social, nome comercial e CNPJ; canal formal de privacidade e eventual encarregado ou justificativa da dispensa aplicável.
- Confirmação de nome do estabelecimento/profissional, telefone, Instagram, endereço e horários. O banco atual ainda contém o endereço do modelo “Rua das Flores, 120 — Centro”; ele foi preservado e precisa ser conferido antes da publicação.
- Confirmação dos preços e descrições cadastrados e das condições reais de atendimento.
- Comprovação de titularidade/licença das imagens de apresentação e fotos publicadas, autorizações de imagem e origem de qualquer avaliação futura. Arquivos existentes foram preservados, sem presumir que a licença tenha sido comprovada.
- Finalidade concreta para coletar nascimento, observações, contatos de retorno e eventual tratamento de dados sensíveis; registros de consentimento quando necessários.
- Provedores de hospedagem, responsáveis com acesso a dados, localização do armazenamento e rotina desejada de retenção/backup.

## 8. Revisão jurídica necessária

Validar identidade e responsabilidades da controladora, bases legais por finalidade, eventual legítimo interesse e seu teste de balanceamento, prazos fiscais/civis e retenção, exercício dos direitos dos titulares, dados sensíveis, uso de imagem, operadores, transferências internacionais, resposta a incidentes, documentos públicos e condições efetivas de contratação. A política menciona pontos dependentes da implantação sem inventar fornecedores ou dados comerciais. Esta entrega melhora controles técnicos e transparência, mas não declara conformidade legal integral.
