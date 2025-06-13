
import React from 'react';

const TermsOfService = () => {
  return (
    <div className="prose prose-sm max-w-none">
      <h1>Termos de Uso - Mango</h1>
      <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
      
      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao utilizar o Mango, você concorda com estes Termos de Uso e nossa Política de Privacidade. 
        Se você não concorda com qualquer parte destes termos, não deve usar nosso serviço.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O Mango é uma plataforma de gestão financeira pessoal que permite aos usuários:
      </p>
      <ul>
        <li>Controlar receitas e despesas</li>
        <li>Categorizar transações financeiras</li>
        <li>Definir e acompanhar metas financeiras</li>
        <li>Conectar contas bancárias via Open Finance</li>
        <li>Gerar relatórios e análises financeiras</li>
      </ul>

      <h2>3. Proteção de Dados Financeiros</h2>
      <h3>3.1 Coleta de Dados</h3>
      <p>Coletamos e processamos os seguintes tipos de dados financeiros:</p>
      <ul>
        <li>Informações de contas bancárias</li>
        <li>Histórico de transações</li>
        <li>Dados de cartões de crédito e débito</li>
        <li>Informações de investimentos</li>
        <li>Metas e objetivos financeiros</li>
      </ul>

      <h3>3.2 Uso dos Dados</h3>
      <p>Seus dados financeiros são utilizados exclusivamente para:</p>
      <ul>
        <li>Fornecer os serviços de gestão financeira</li>
        <li>Gerar relatórios e análises personalizadas</li>
        <li>Melhorar a experiência do usuário</li>
        <li>Cumprir obrigações legais e regulamentares</li>
      </ul>

      <h3>3.3 Segurança dos Dados</h3>
      <p>Implementamos medidas rigorosas de segurança:</p>
      <ul>
        <li>Criptografia de dados em trânsito e em repouso</li>
        <li>Autenticação multifator</li>
        <li>Monitoramento contínuo de segurança</li>
        <li>Auditorias regulares de segurança</li>
        <li>Conformidade com padrões PCI DSS</li>
      </ul>

      <h2>4. Open Finance e Conexões Bancárias</h2>
      <p>
        Ao conectar suas contas bancárias através do Open Finance:
      </p>
      <ul>
        <li>Você autoriza o acesso aos seus dados bancários</li>
        <li>Garantimos que apenas dados necessários são coletados</li>
        <li>Você pode revogar o acesso a qualquer momento</li>
        <li>Cumprimos todas as regulamentações do Banco Central</li>
      </ul>

      <h2>5. Responsabilidades do Usuário</h2>
      <p>Você se compromete a:</p>
      <ul>
        <li>Fornecer informações precisas e atualizadas</li>
        <li>Manter a confidencialidade de suas credenciais</li>
        <li>Notificar imediatamente sobre uso não autorizado</li>
        <li>Usar o serviço apenas para fins legais</li>
        <li>Não tentar contornar medidas de segurança</li>
      </ul>

      <h2>6. Privacidade e Compartilhamento</h2>
      <p>
        Seus dados financeiros <strong>NUNCA</strong> serão:
      </p>
      <ul>
        <li>Vendidos para terceiros</li>
        <li>Compartilhados para fins comerciais</li>
        <li>Utilizados para marketing sem consentimento</li>
      </ul>
      <p>
        Podemos compartilhar dados apenas quando:
      </p>
      <ul>
        <li>Exigido por lei ou ordem judicial</li>
        <li>Necessário para prestação do serviço (com parceiros certificados)</li>
        <li>Você der consentimento explícito</li>
      </ul>

      <h2>7. Retenção e Exclusão de Dados</h2>
      <ul>
        <li>Seus dados são mantidos enquanto sua conta estiver ativa</li>
        <li>Você pode solicitar a exclusão de seus dados a qualquer momento</li>
        <li>Dados serão excluídos em até 30 dias após solicitação</li>
        <li>Alguns dados podem ser mantidos por obrigações legais</li>
      </ul>

      <h2>8. Limitação de Responsabilidade</h2>
      <p>
        O Mango não se responsabiliza por:
      </p>
      <ul>
        <li>Decisões financeiras baseadas nas informações fornecidas</li>
        <li>Perdas resultantes de uso inadequado da plataforma</li>
        <li>Falhas em sistemas de terceiros (bancos, operadoras)</li>
        <li>Interrupções temporárias do serviço</li>
      </ul>

      <h2>9. Conformidade Regulatória</h2>
      <p>
        O Mango está em conformidade com:
      </p>
      <ul>
        <li>Lei Geral de Proteção de Dados (LGPD)</li>
        <li>Regulamentações do Banco Central do Brasil</li>
        <li>Normas do Open Finance</li>
        <li>Padrões internacionais de segurança financeira</li>
      </ul>

      <h2>10. Alterações nos Termos</h2>
      <p>
        Podemos atualizar estes termos periodicamente. Você será notificado sobre 
        mudanças significativas por email ou através da plataforma.
      </p>

      <h2>11. Contato</h2>
      <p>
        Para questões sobre estes termos ou proteção de dados, entre em contato:
      </p>
      <ul>
        <li>Email: privacidade@mango.com.br</li>
        <li>Telefone: (11) 9999-9999</li>
        <li>Endereço: [Endereço da empresa]</li>
      </ul>

      <h2>12. Disposições Gerais</h2>
      <p>
        Estes termos são regidos pelas leis brasileiras. Qualquer disputa será 
        resolvida nos tribunais competentes do Brasil.
      </p>
    </div>
  );
};

export default TermsOfService;
