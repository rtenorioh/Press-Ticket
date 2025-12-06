import swaggerJsdoc from 'swagger-jsdoc';

const backendUrl = process.env.BACKEND_URL || 'http://localhost';
const port = process.env.PORT || '4000';
const isProduction = process.env.NODE_ENV === 'production';

const apiUrl = isProduction ? backendUrl : `http://localhost:${port}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentação da API do Press Ticket®',
      version: '1.3.0',
      description: 'Documentação da API para envio de mensagens e gerenciamento de contatos.',
      contact: {
        email: 'robson.tenorio@gmail.com'
      }
    },
    servers: [
      {
        url: apiUrl,
        description: isProduction ? 'API Press Ticket®' : 'Desenvolvimento Local'
      }
    ],
    components: {
      securitySchemes: {
        apiToken: {
          type: 'apiKey',
          name: 'x-api-token',
          in: 'header',
          description: 'Token de API para autenticação. Requer permissões específicas para cada rota.'
        }
      }
    },
    tags: [
      { name: 'ActivityLogs', description: 'Logs de atividade do sistema' },
      { name: 'Authentication', description: 'Autenticação e gerenciamento de sessão' },
      { name: 'Backups', description: 'Backup e restauração do banco de dados' },
      { name: 'Client Status', description: 'Status de clientes' },
      { name: 'Contacts', description: 'Gerenciamento de contatos' },
      { name: 'ErrorLogs', description: 'Logs de erros do sistema' },
      { name: 'Messages', description: 'Operações relacionadas a mensagens' },
      { name: 'NetworkMonitor', description: 'Monitoramento de rede' },
      { name: 'Presence', description: 'Indicadores de presença (digitando, gravando)' },
      { name: 'QueueMonitor', description: 'Monitoramento de setores' },
      { name: 'Quick Answers', description: 'Respostas rápidas' },
      { name: 'Setores', description: 'Gerenciamento de setores' },
      { name: 'System', description: 'Recursos e monitoramento do sistema' },
      { name: 'SystemUpdate', description: 'Atualizações do sistema' },
      { name: 'Tags', description: 'Gerenciamento de tags' },
      { name: 'Tickets', description: 'Gerenciamento de tickets' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      { name: 'Version', description: 'Versão do sistema e biblioteca WhatsApp' },
      { name: 'Videos', description: 'Gerenciamento de vídeos' },
      { name: 'WhatsApp', description: 'Gerenciamento de conexões WhatsApp' },
      { name: 'WhatsApp Groups', description: 'Gerenciamento de grupos do WhatsApp' },
      { name: 'WhatsAppLibrary', description: 'Biblioteca do WhatsApp' },
      { name: 'WhatsAppSession', description: 'Sessões de WhatsApp' }
    ]
  },
  apis: [
    process.env.NODE_ENV === 'production' 
      ? './dist/routes/openApiRoutes.js'
      : './src/routes/openApiRoutes.ts',
    process.env.NODE_ENV === 'production'
      ? './dist/controllers/*Controller.js'
      : './src/controllers/*Controller.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
