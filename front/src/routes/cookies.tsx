import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Política de Cookies | Suellen studios" }] }),
  component: Cookies,
});

function Cookies() {
  return <LegalPage title="Política de Cookies">
    <h2>Cookies necessários</h2>
    <p>A navegação pública não exige um cookie de autenticação. Ao entrar no painel, iniciar uma sessão de segurança ou encerrar o acesso, o backend utiliza o cookie STUDIO_SESSION para identificar a sessão e proteger operações contra falsificação de solicitações (CSRF). Ele não contém a senha, não pode ser lido por JavaScript e tem restrição SameSite. A sessão expira após 30 minutos de inatividade no servidor e é invalidada ao sair do painel.</p>
    <h2>Rastreamento opcional</h2>
    <p>O código da aplicação não instala ferramentas de publicidade, pixels de marketing ou medição de audiência opcionais. Por isso, não há um banner de consentimento para essas categorias. Se forem adicionadas, seu uso deverá aguardar a escolha do visitante, com opção de rejeição e alteração posterior das preferências.</p>
    <h2>Terceiros</h2>
    <p>O Google Fonts fornece as fontes utilizadas na interface e recebe dados técnicos de conexão. Links para WhatsApp, Instagram e mapas abrem ambientes externos que podem utilizar seus próprios cookies. O editor e a prévia Lovable podem acrescentar recursos de diagnóstico da plataforma; as condições da versão publicada devem ser verificadas a cada implantação.</p>
    <h2>Controle pelo navegador</h2>
    <p>Você pode consultar ou apagar cookies nas configurações do navegador. Bloquear o cookie necessário impede o login e as operações do painel. A aplicação não armazena senhas no localStorage ou sessionStorage.</p>
  </LegalPage>;
}
