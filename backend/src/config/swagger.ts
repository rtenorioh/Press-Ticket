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
      { name: 'Messages', description: 'Operações relacionadas a mensagens' },
      { name: 'Contacts', description: 'Gerenciamento de contatos' },
      { name: 'Tickets', description: 'Gerenciamento de tickets' },
      { name: 'Setores', description: 'Gerenciamento de setores/filas' },
      { name: 'Tags', description: 'Gerenciamento de tags' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      { name: 'Quick Answers', description: 'Respostas rápidas' },
      { name: 'Client Status', description: 'Status de clientes' },
      { name: 'WhatsApp Groups', description: 'Gerenciamento de grupos do WhatsApp' },
      { name: 'Videos', description: 'Gerenciamento de vídeos' }
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
