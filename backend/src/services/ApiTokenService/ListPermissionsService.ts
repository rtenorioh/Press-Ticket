import ApiToken from "../../models/ApiToken";

const DEFAULT_PERMISSIONS = [
    // Contatos
    'create:contacts',
    'read:contacts',
    'update:contacts',
    'delete:contacts',
    
    // Mensagens
    'create:messages',
    'create:medias',
    
    // Filas/Setores
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
    'delete:whatsappsession'
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