# Backend — Java + Spring Boot

API independente do frontend Lovable, com Java 21+, Maven, Spring Web/Security, Spring Data JPA, Validation e Flyway. Verificada neste ambiente com Java 25 e Maven 3.10. Implementa autenticação, procedimentos, clientes, agenda/histórico, financeiro, configurações, upload de fotos e galeria.

## Organização

```text
back/
  pom.xml
  src/main/java/com/pinkpetal/studio/
    StudioApplication.java
    model/          # entidade JPA e contratos de entrada/saída
    repository/     # consultas e persistência via Spring Data JPA
    service/        # regras de negócio e transações
    controller/     # endpoints REST e erros de validação
    config/         # configuração HTTP/CORS
    security/       # verificação de papel e limitação de tentativas de login
  src/main/resources/
    application.properties
    application-local.properties
    application-postgres.properties
    database/migration/  # criação/versionamento do banco via Flyway
  src/test/java/         # testes de integração da API
```

Fluxo: **controller → service → repository → banco**, usando os objetos de `model`. A configuração de conexão fica nos arquivos `application-*.properties`; o SQL fica em `database/migration/`.

## Rodar localmente

Execute os comandos abaixo **dentro de `back/`**:

```sh
mvn spring-boot:run
```

API: `http://localhost:8080/api/services`. O perfil padrão `local` usa H2 em arquivo (`back/data/studio.mv.db`), mantendo os dados após reiniciar. Flyway cria a tabela automaticamente e Hibernate valida o schema. O banco começa vazio.

```sh
mvn verify
java -jar target/studio-api-0.0.1-SNAPSHOT.jar
```

`mvn verify` baixa dependências, executa os testes com H2 em memória e gera o JAR executável. Não precisa instalar Spring ou H2 separadamente.

No Windows, pare a instância que estiver executando esse JAR antes de gerar uma nova versão: o sistema pode impedir a renomeação do arquivo durante o empacotamento. Para verificar apenas o código e testes com a instância antiga aberta, use `mvn test`.

## Acesso ao painel

Defina as variáveis no ambiente do processo Java (PowerShell):

```powershell
$env:ADMIN_USERNAME = "admim"
$env:ADMIN_PASSWORD = "<defina-uma-senha-forte-exclusiva>"
mvn spring-boot:run
```

Abra `/login` no frontend. O usuário padrão é `admim`; não existe senha fixa padrão. Defina `ADMIN_USERNAME` e `ADMIN_PASSWORD` no ambiente Java. Sem senha configurada, uma senha aleatória temporária aparece no terminal e muda ao reiniciar. Não compartilhe esse terminal nem seus logs. A senha é protegida por BCrypt em memória. A aplicação não guarda a senha no navegador nem aceita autenticação HTTP Basic.

O login cria uma sessão de servidor, troca o identificador anterior e utiliza `STUDIO_SESSION` com HttpOnly e SameSite=Strict. A sessão expira após 30 minutos de inatividade. O logout invalida a sessão. Após 10 tentativas de login por IP em 15 minutos, novas tentativas recebem HTTP 429. O limitador é local à instância; por trás do proxy Vite, os acessos compartilham o IP do proxy. Para múltiplas instâncias, implante limitação no gateway e armazenamento compartilhado de sessões.

Fluxo para clientes da API: `GET /api/auth/csrf` (preservar o cookie), `POST /api/auth/login` com formulário URL-encoded (`username`, `password`) e o header CSRF retornado; depois obtenha um **novo** token CSRF, pois o login o renova. `GET /api/auth/me` verifica a sessão. Todas as escritas, incluindo `POST /api/auth/logout` e uploads, exigem o token e o cookie. O frontend centraliza isso em `front/src/lib/api.ts`.

Todas as gravações e consultas de clientes, histórico, agenda, backups e financeiro exigem ADMIN no servidor. Somente catálogo ativo, galeria ativa, configurações públicas, imagens e emissão do token CSRF são anônimos. Configurações internas (`firstWeekday`, `slotMinutes`, `remindersEnabled`) não são enviadas a visitantes.

Na publicação, sirva por HTTPS, defina `SESSION_COOKIE_SECURE=true` e prefira `/api` no mesmo domínio por reverse proxy. Com subdomínios, eles precisam pertencer ao mesmo site e a origem do frontend deve estar explicitamente em `CORS_ALLOWED_ORIGINS`; o frontend envia cookies com `credentials: include`. Domínios de sites distintos não funcionam com SameSite=Strict. Configure a implantação antes de publicar, sem relaxar a proteção CSRF.

O banco local e os backups ficam fora de `front/public`. Restrinja permissões do diretório `back/data` ao usuário do serviço e aos responsáveis autorizados; para PostgreSQL, use uma conta própria com privilégios limitados. Não há criptografia de banco/backups implementada pela aplicação: configure disco/backup criptografados e regras de acesso na infraestrutura. Fotos enviadas têm URL pública e não são um repositório de arquivos privados.

## Endpoints implementados

| Método | Endpoint                        | Resultado                                                                   |
| ------ | ------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/services`                 | Todos os procedimentos para o administrador; somente ativos para visitantes |
| GET    | `/api/services?activeOnly=true` | Somente os ativos                                                           |
| GET    | `/api/services/{id}`            | Procedimento por UUID                                                       |
| POST   | `/api/services`                 | Criação, HTTP 201 e header Location                                         |
| PUT    | `/api/services/{id}`            | Atualização completa                                                        |
| DELETE | `/api/services/{id}`            | Exclusão, HTTP 204                                                          |

Exemplo de corpo para POST/PUT (campos obrigatórios; textos descritivos podem ser vazios):

```json
{
  "name": "Manicure",
  "short": "Cuidado essencial",
  "description": "Cutilagem e esmaltação",
  "price": 30.5,
  "duration": "40 min",
  "icon": "Sparkles",
  "image": "",
  "active": true
}
```

O contrato segue os campos de `Service` em `front/src/lib/mock-data.ts`, mas gera IDs UUID. Preço usa `BigDecimal`, com até duas casas decimais. Dados inválidos retornam 400; UUID inexistente retorna 404.

## Clientes, histórico, configurações e fotos

| Métodos     | Endpoint                    | Função                                                                             |
| ----------- | --------------------------- | ---------------------------------------------------------------------------------- |
| GET, POST   | `/api/clients`              | Listar e cadastrar clientes                                                        |
| PUT, DELETE | `/api/clients/{id}`         | Editar/excluir cliente sem atendimentos vinculados                                 |
| GET         | `/api/clients/{id}/history` | Procedimentos com status `Atendido`, mais recentes primeiro                        |
| GET, POST   | `/api/appointments`         | Listar e criar agendamentos                                                        |
| PUT         | `/api/appointments/{id}`    | Editar data, cliente, procedimento, valor, pagamento, notas e status               |
| GET, PUT    | `/api/settings`             | Informações públicas do studio e preferências da agenda                            |
| POST        | `/api/uploads`              | Multipart com campo `file`: foto JPG/JPEG                                          |
| GET         | `/api/uploads/{filename}`   | Exibir a imagem persistida                                                         |
| GET, POST   | `/api/gallery`              | Listar/adicionar fotos da galeria                                                  |
| PUT, DELETE | `/api/gallery/{id}`         | Editar/retirar fotos da galeria                                                    |
| GET, POST   | `/api/finance`              | Extrato com atendimentos concluídos e lançamentos manuais; criar lançamento manual |
| PUT, DELETE | `/api/finance/{id}`         | Editar/excluir lançamento manual                                                   |

O histórico pertence ao UUID da cliente, não ao nome. O nome do procedimento e o preço ficam registrados no agendamento; renomear ou excluir o procedimento do catálogo não apaga o histórico. Total de visitas, total gasto e último procedimento são calculados a partir dos atendimentos concluídos. Uma cliente com agendamentos não pode ser excluída (409), preservando esses vínculos.

A agenda usa datas completas no horário local do studio (`startsAt`, por exemplo `2026-10-22T09:00:00`), não somente o dia do mês. Não há envio automático de mensagens: a preferência de lembretes exibe um link WhatsApp com mensagem pronta nas 24 horas anteriores aos agendamentos pendentes/confirmados; a profissional faz o envio.

A duração aceita minutos (`40 min`, `90`) ou horas (`1h30`, `2 horas`) e é registrada em `durationMinutes` no agendamento. Novos horários devem comportar o atendimento inteiro dentro do expediente. Sobreposições retornam 409; cancelados e não atendidos não ocupam horário. Um bloqueio transacional na configuração do studio serializa solicitações simultâneas para a única profissional. Alterar nome/duração do catálogo não modifica a duração dos atendimentos existentes.

O financeiro projeta cada atendimento `Atendido` como uma entrada na sua data, sem copiar registros: edição, mudança de valor ou cancelamento são refletidos sem duplicação. Lançamentos manuais têm `type` (`Entrada`/`Despesa`), `description`, `date` (ISO), `payment` e `amount` positivo com duas casas. A resposta inclui `source` (`manual`/`appointment`); entradas de atendimento são editadas pela agenda. Os totais de clientes são calculados em uma consulta agregada, evitando uma consulta de histórico por cliente na listagem.

As imagens são verificadas pelo conteúdo JPEG e regravadas pelo servidor, com nome UUID. Limites: 5 MB por arquivo e 25 megapixels. O destino padrão é `back/data/uploads/`, configurável por `UPLOAD_DIRECTORY`. Os registros da galeria guardam título, imagem, visibilidade e ordem. As imagens existentes são preservadas quando um registro é editado/excluído para não quebrar outras referências. Para transferir a instalação local, preserve o banco e a pasta de uploads juntos.

A migração `V2` adiciona as tabelas sem recriar a tabela de procedimentos da `V1`. As configurações iniciais preservam os valores demonstrativos anteriores; clientes, agenda e galeria começam vazios, sem copiar dados fictícios do frontend.

`V3` adiciona financeiro e duração dos agendamentos; `V4` preenche a duração dos registros existentes usando o catálogo atual. Se o procedimento já foi removido ou sua duração antiga não pode ser interpretada, a duração inicial é 30 minutos. O nome e o valor históricos são preservados.

## Backup local: banco e fotos

Em **Painel → Configurações → Baixar backup completo**, o administrador pode baixar um ZIP com `database.sql`, a pasta `uploads/` e instruções de restauração. `GET /api/backups` exige autenticação ADMIN e não permite cache. O SQL é gerado pelo H2 com a API em funcionamento, sem copiar o arquivo de banco aberto; inclui dados, schema e histórico Flyway. Fotos usam nomes imutáveis, preservando referências da cópia do banco.

Por padrão, uma cópia é salva em `back/data/backups/` um minuto após iniciar a API e a cada 24 horas enquanto o processo estiver ligado. São mantidas as sete últimas cópias automáticas. Downloads manuais não entram nessa retenção. Configuração:

- `BACKUP_ENABLED=false`: desativa a rotina automática.
- `BACKUP_DIRECTORY`: muda o destino das cópias automáticas.
- `app.backup-retention`: quantidade de arquivos automáticos mantidos (mínimo 1).
- `app.backup-initial-delay-ms` e `app.backup-interval-ms`: alteram os intervalos.

Guarde também uma cópia fora do computador. O backup integrado atende ao H2 local. Para PostgreSQL, use `pg_dump` junto com uma cópia da pasta `UPLOAD_DIRECTORY`; a rotina H2 não é executada nesse perfil.

### Restaurar uma cópia H2

1. Pare a API e extraia o ZIP em uma pasta. Preserve a instalação atual até conferir a restauração.
2. Dentro de `back/`, restaure o SQL em um banco **novo** (o destino `data/studio-restored.mv.db` não deve existir). No PowerShell, ajuste os caminhos do SQL e do JAR H2 para sua instalação:

```powershell
java -cp "$env:USERPROFILE/.m2/repository/com/h2database/h2/2.3.232/h2-2.3.232.jar" org.h2.tools.RunScript -url "jdbc:h2:file:./data/studio-restored;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH" -user sa -script "C:/backup-extraido/database.sql"
```

3. Copie a pasta extraída `uploads/` para um destino novo, por exemplo `back/data/uploads-restored/`.
4. Aponte a API para os dados restaurados e inicie:

```powershell
$env:SPRING_DATASOURCE_URL = "jdbc:h2:file:./data/studio-restored;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH"
$env:UPLOAD_DIRECTORY = "./data/uploads-restored"
mvn spring-boot:run
```

5. Confira clientes, agenda, financeiro e fotos no painel antes de substituir a instalação antiga. As credenciais administrativas continuam sendo definidas pelas variáveis do servidor, não pelo backup.

## PostgreSQL

Configure as variáveis no terminal antes de iniciar (exemplo PowerShell):

```powershell
$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/studio"
$env:DATABASE_USERNAME = "studio"
$env:DATABASE_PASSWORD = "sua-senha"
mvn spring-boot:run
```

O driver PostgreSQL já está incluído. O servidor PostgreSQL e o banco devem existir; não são instalados pelo Maven. O perfil está configurado, mas não foi testado contra uma instância PostgreSQL neste ambiente. Use um banco/schema dedicado à API Java, com migrações gerenciadas pelo Flyway.

Variáveis opcionais: `PORT` (8080), `SERVER_ADDRESS` (127.0.0.1) e `CORS_ALLOWED_ORIGINS` (origens separadas por vírgula; padrão localhost e 127.0.0.1 nas portas 5173 e 8081). Spring não carrega o `.env` da raiz automaticamente.

## Integração e estado atual

- CRUD de procedimentos implementado e testado com persistência H2.
- Frontend conectado pelo store `front/src/lib/services-store.ts`: catálogo público e CRUD no painel usam a API. Rode o frontend na porta 5173; o proxy Vite encaminha `/api` para a porta 8080.
- Clientes, agenda, histórico, configurações, uploads, galeria e financeiro estão conectados via `front/src/lib/studio-store.ts`. Dashboard e relatórios usam esses dados reais.
- Autenticação Spring Security implementada; `/admin` no frontend exige login em `/login`.
- Agendamento público continua via WhatsApp em `front/src/lib/config.ts`.
- O schema do banco é versionado exclusivamente pelas migrações Flyway em `src/main/resources/database/migration/` e `src/main/java/database/migration/`.
