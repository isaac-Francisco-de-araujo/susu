# Studio de manicure: site público e painel administrativo

## Objetivo
Construir uma experiência mobile-first completa, sofisticada e funcional em português, com dados demonstrativos e estrutura pronta para futura API REST em Python/FastAPI.

## Experiência pública
- Criar navegação responsiva e páginas próprias para Início, Serviços, Trabalhos, Sobre, Contato e Agendamento.
- Montar uma home editorial com imagem de destaque, serviços principais, galeria ampliável, apresentação profissional, chamada de agendamento e contato.
- Implementar o fluxo de agendamento em etapas: procedimento, data, horário, dados pessoais, observação, revisão e confirmação.
- Usar horários disponíveis simulados, validação dos campos e links de WhatsApp com mensagens pré-preenchidas.

## Painel profissional
- Criar uma área administrativa separada com navegação lateral no desktop e navegação compacta no celular.
- Dashboard com indicadores, próximos horários, faturamento, procedimento mais realizado e clientes para reativar.
- Agenda mensal navegável, seleção de dia, indicadores de ocupação e estados dos atendimentos.
- Criar, editar, cancelar, confirmar e concluir atendimentos usando estados locais demonstrativos e formulários em modal.
- Criar telas de clientes, detalhes e histórico, procedimentos, financeiro, relatórios e configurações.
- Incluir pesquisa, filtros, gráficos, formulários, ações de edição/exclusão e atalhos de WhatsApp simulados.

## Direção visual
- Identidade rosa elegante e contida, combinada com branco, cinza suave e texto carvão.
- Tipografia contemporânea com um toque editorial nos títulos, superfícies claras, sombras leves e cantos moderados.
- Imagens próprias do projeto para manicure/pedicure, galeria e apresentação da profissional.
- Animações discretas, estados de foco claros, alvos de toque confortáveis e conteúdo adaptado a celular e desktop.

## Organização técnica
- Centralizar tipos e dados simulados para facilitar a futura troca por chamadas HTTP.
- Criar componentes reutilizáveis para navegação, botões, campos, cartões, modais, estados e gráficos.
- Usar páginas independentes com metadados próprios e preservar a arquitetura TanStack existente.
- Não adicionar banco de dados, autenticação real ou integração externa definitiva nesta etapa.

## Validação
- Verificar compilação e erros de execução.
- Exercitar no navegador os fluxos centrais: navegação pública, ampliação da galeria, agendamento completo, agenda administrativa e operações principais.
- Conferir visualmente em tamanhos de celular e desktop, corrigindo sobreposições e problemas de leitura.
