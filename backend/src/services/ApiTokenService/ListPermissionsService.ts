import ApiToken from "../../models/ApiToken";

const ListPermissionsService = async (): Promise<string[]> => {
  const tokens = await ApiToken.findAll();
  const uniquePermissions = new Set<string>();

  for (const token of tokens) {
    if (!token.permissions) continue;
    
    try {
      // Tenta fazer parse como JSON primeiro
      let permissions: string | string[];
      try {
        permissions = JSON.parse(token.permissions);
      } catch {
        // Se falhar, assume que é uma string simples
        permissions = token.permissions;
      }

      // Se for array, adiciona cada item
      if (Array.isArray(permissions)) {
        permissions.forEach(p => uniquePermissions.add(p));
      } 
      // Se for string, adiciona ela diretamente
      else if (typeof permissions === 'string') {
        uniquePermissions.add(permissions);
      }
    } catch (error) {
      console.error(`Error processing permissions for token ${token.id}:`, error);
    }
  }

  return Array.from(uniquePermissions).sort();
};

export default ListPermissionsService;
