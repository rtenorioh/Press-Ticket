import ApiToken from "../../models/ApiToken";

const DEFAULT_PERMISSIONS = [
  'create:contacts',
  'read:contacts',
  'update:contacts',
  'delete:contacts',
  'create:messages',
  'create:medias',
  'read:whatsapps',
  'update:whatsapps'
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
