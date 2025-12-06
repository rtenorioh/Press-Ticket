import ApiToken from "../../models/ApiToken";

const DEFAULT_PERMISSIONS = [
    // Contatos
    'create:contacts',
    'read:contacts',
    'update:contacts',
    'delete:contacts',
    
    // Mensagens
    'create:messages',
    'read:messages',
    'update:messages',
    'delete:messages',
    
    // Setores
    'create:queue',
    'read:queue',
    'update:queue',
    'delete:queue',
    
    // Tags
    'create:tags',
    'read:tags',
    'update:tags',
    'delete:tags',
    
    // Tickets
    'create:tickets',
    'read:tickets',
    'update:tickets',
    'delete:tickets',
    
    // WhatsApp
    'create:whatsapp',
    'read:whatsapp',
    'update:whatsapp',
    'delete:whatsapp',
    
    // Sessões de WhatsApp
    'create:whatsappsession',
    'update:whatsappsession',
    'delete:whatsappsession',
    
    // Logs de Atividade
    'read:activity-logs',
    
    // Backups
    'create:backups',
    'read:backups',
    'update:backups',
    'delete:backups',
    
    // Logs de Erro
    'create:error-logs',
    'read:error-logs',
    'delete:error-logs',
    
    // Monitoramento de Rede
    'read:network-status',
    
    // Monitoramento de Setores
    'read:queue-monitor',
    
    // Atualização do Sistema
    'read:system-update',
    'write:system-update',
    
    // Versão e Biblioteca WhatsApp
    'read:version',
    'write:whatsapp-lib',
    
    // Sistema e Recursos
    'write:system',
    'read:system-resources',
    
    // Vídeos
    'read:videos',
    'write:videos',
    
    // Usuários
    'create:users',
    'read:users',
    'update:users',
    'delete:users',
    
    // Respostas Rápidas
    'create:quickAnswers',
    'read:quickAnswers',
    'update:quickAnswers',
    'delete:quickAnswers',
    
    // Status de Clientes
    'create:client-status',
    'read:client-status',
    'update:client-status',
    'delete:client-status',
    
    // Grupos do WhatsApp
    'read:groups',
    'write:groups',
    
    // Presença (Indicadores de Digitação/Gravação)
    'write:presence',
    
    // Autenticação
    'read:profile'
];

const ListPermissionsService = async (): Promise<string[]> => {
    const tokens = await ApiToken.findAll();
    const uniquePermissions = new Set<string>();

    DEFAULT_PERMISSIONS.forEach(p => uniquePermissions.add(p));

    for (const token of tokens) {
        if (!token.permissions) continue;

        const permissions = token.permissions as unknown as string[];
        permissions.forEach(p => uniquePermissions.add(p));
    }

    return Array.from(uniquePermissions).sort();
};

export default ListPermissionsService;