import ApiToken from "../../models/ApiToken";

const ListPermissionsService = async (): Promise<string[]> => {
    const tokens = await ApiToken.findAll();
    const uniquePermissions = new Set<string>();

    for (const token of tokens) {
        if (!token.permissions) continue;

        try {
            let permissions: string | string[];
            try {
                permissions = JSON.parse(token.permissions);
            } catch {
                permissions = token.permissions;
            }

            if (Array.isArray(permissions)) {
                permissions.forEach(p => uniquePermissions.add(p));
            } else if (typeof permissions === 'string') {
                uniquePermissions.add(permissions);
            }
        } catch (error) {
            console.error(`Error processing permissions for token ${token.id}:`, error);
        }
    }

    return Array.from(uniquePermissions).sort();
};

export default ListPermissionsService;