import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: "Termos de Uso | Suellen studios" }] }),
  component: Terms,
});

function Terms() {
  return <LegalPage title="Termos de Uso">
    <h2>Uso do site</h2>
    <p>O site apresenta o estabelecimento, seus serviços, preços, portfólio e canais de contato. A consulta ao catálogo é pública e gratuita. Utilize os canais de forma respeitosa e forneça informações verdadeiras quando solicitar atendimento.</p>
    <h2>Serviços e agendamento</h2>
    <p>O agendamento ocorre exclusivamente pelo WhatsApp. Clicar em um botão ou visualizar um serviço não confirma um horário: a disponibilidade e as condições do atendimento são combinadas diretamente com o estabelecimento. O painel administrativo é de uso interno e não permite reservas por visitantes.</p>
    <p>Os valores apresentados são os cadastrados pelo estabelecimento. Detalhes do procedimento, eventuais necessidades específicas e condições devem ser esclarecidos antes da contratação. Fotografias de trabalhos não garantem resultado idêntico para todas as pessoas. Permanecem assegurados os direitos previstos na legislação aplicável.</p>
    <h2>Área profissional</h2>
    <p>O acesso ao painel é restrito a administradores autorizados. Credenciais não devem ser compartilhadas. Não é permitido tentar acessar cadastros, informações financeiras ou recursos protegidos sem autorização, nem interferir no funcionamento do serviço.</p>
    <h2>Imagens e direitos autorais</h2>
    <p>As imagens, marcas e conteúdos publicados devem ser próprios ou utilizados com licença ou autorização. Sua publicação não concede autorização para reprodução comercial por terceiros. Caso identifique uso indevido de imagem ou conteúdo, entre em contato para análise. Fotos identificáveis de clientes dependem da autorização adequada.</p>
    <h2>Links externos e disponibilidade</h2>
    <p>WhatsApp, Instagram, mapas e outros serviços externos possuem termos próprios. O site pode ficar temporariamente indisponível durante manutenção ou falhas técnicas. Dúvidas sobre serviços e informações publicadas podem ser encaminhadas ao estabelecimento pelo contato abaixo.</p>
    <h2>Atualizações</h2>
    <p>Estes termos podem ser atualizados para refletir mudanças no serviço. A data da versão fica indicada nesta página. Alterações não afastam direitos adquiridos nem obrigações legais.</p>
  </LegalPage>;
}
