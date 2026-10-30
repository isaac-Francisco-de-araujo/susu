import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Política de Privacidade | Pink Petal Studio" }] }),
  component: Privacy,
});

function Privacy() {
  return <LegalPage title="Política de Privacidade">
    <h2>Dados e finalidades</h2>
    <p>A consulta às páginas públicas não exige cadastro. Para prestar e administrar os serviços, o estabelecimento pode registrar nome, telefone, datas de atendimento, procedimentos realizados, valores, forma e situação de pagamento e observações estritamente necessárias. A data de nascimento é opcional e só deve ser informada quando houver finalidade explicada à cliente. Não é necessário fornecer documentos, dados de cartão ou informações de saúde pelo site.</p>
    <p>O agendamento é realizado exclusivamente pelo WhatsApp. As mensagens são tratadas também pela plataforma WhatsApp segundo suas próprias políticas. O painel profissional organiza o cadastro, o histórico, o financeiro e as confirmações dos atendimentos combinados com a cliente.</p>
    <h2>Bases legais</h2>
    <p>Os dados necessários para atender a uma solicitação e prestar os serviços são tratados para procedimentos preliminares e execução de contrato (art. 7º, V, da LGPD). Registros sujeitos a obrigações legais ou regulatórias podem ser conservados para essas obrigações (art. 7º, II). Eventual uso de legítimo interesse exige avaliação documentada da necessidade, expectativa da cliente e proteção de seus direitos. Publicidade, uso identificável de imagem e outras finalidades que dependam de consentimento precisam de autorização específica, livre e revogável; não decorrem do simples uso deste site.</p>
    <h2>Acesso, armazenamento e proteção</h2>
    <p>Os registros pessoais e financeiros são armazenados no banco do backend, com acesso ao sistema reservado a administradores autorizados. A autenticação utiliza senha protegida por hash e sessão com cookie HttpOnly e expiração por inatividade. Arquivos de backup também podem conter dados pessoais e exigem os mesmos cuidados de acesso. Fotos publicadas na galeria são públicas; o estabelecimento deve possuir os direitos de uso e as autorizações necessárias.</p>
    <p>Não vendemos dados pessoais. Prestadores de hospedagem e infraestrutura podem processar dados na medida necessária à operação. A escolha de provedores, localização do armazenamento e eventual transferência internacional devem ser informadas pelo estabelecimento conforme sua implantação.</p>
    <h2>Retenção e exclusão</h2>
    <p>Os dados devem permanecer apenas pelo tempo necessário às finalidades informadas, às obrigações legais e ao exercício regular de direitos. Os prazos específicos dependem do tipo de registro e das obrigações aplicáveis ao estabelecimento. O sistema não elimina automaticamente históricos financeiros ou de atendimento. Solicitações de exclusão são analisadas individualmente, incluindo cópias de segurança e registros cuja guarda seja obrigatória, com explicação sobre eventuais limitações.</p>
    <h2>Seus direitos</h2>
    <p>Você pode solicitar confirmação do tratamento, acesso, correção, informação sobre compartilhamento, anonimização, bloqueio ou eliminação de dados desnecessários ou tratados irregularmente, portabilidade quando regulamentada e aplicável, revogação do consentimento e exclusão dos dados tratados com essa base, ressalvadas as hipóteses legais de conservação. Também pode se opor ao tratamento nas hipóteses legais e apresentar petição à ANPD. O atendimento ocorre pelo canal abaixo, observados os prazos legais e a verificação proporcional de identidade.</p>
    <h2>Serviços externos e navegação</h2>
    <p>Links de WhatsApp, Instagram e mapas levam a serviços externos somente quando acionados. As fontes visuais são solicitadas ao Google Fonts, o que pode transmitir endereço IP e dados técnicos de conexão ao provedor. O ambiente de edição Lovable pode incluir ferramentas próprias de diagnóstico, sujeitas às condições da plataforma. Consulte também a <Link to="/cookies" className="text-primary underline">Política de Cookies</Link>.</p>
  </LegalPage>;
}
