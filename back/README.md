# back/ — Backend (ainda não implementado)

## Estado atual (auditoria 20/10/2026)

**Não existe backend real neste repositório.** O app é 100% frontend:

- Dados de procedimentos, agenda, clientes e financeiro são simulados no frontend; os tipos e dados centrais ficam em `front/src/lib/mock-data.ts`.
- Procedimentos editados no painel ficam só no `localStorage` do navegador (`front/src/lib/services-store.ts`, chave `studio-services`) — não são compartilhados entre aparelhos.
- Agendamentos, clientes, lançamentos financeiros e configurações editados no painel vivem só na memória da página e somem ao recarregar.
- Não há login: `/admin` é acessível a qualquer pessoa.
- Agendamento público = link `wa.me` (`front/src/lib/config.ts`), sem gravação.
- `front/src/server.ts` e `front/src/start.ts` são apenas o servidor de renderização (SSR) da plataforma, não uma API de negócio.

Esta pasta reserva o espaço para o futuro backend Python/FastAPI. Nenhuma API, banco de dados, autenticação ou persistência real foi criada nesta reorganização.

## Estrutura planejada (Python/FastAPI)

```text
back/
  app/
    api/           # routers/controllers REST (procedimentos, agenda, clientes, financeiro)
    services/      # regras de negócio
    repositories/  # acesso ao banco
    models/        # modelos ORM + schemas Pydantic
    core/          # config, autenticação, conexão com banco
  tests/
  requirements.txt
```

## O que falta para persistência real

1. Banco de dados e modelos: Service, Appointment, Client, FinancialEntry, Expense, StudioSettings.
2. Endpoints REST espelhando os tipos de `front/src/lib/mock-data.ts`.
3. Autenticação da profissional para proteger `/admin`.
4. No frontend: substituir mocks e estados locais por chamadas à API; centralizar contratos em `front/src/lib/mock-data.ts` e o catálogo em `front/src/lib/services-store.ts`.
