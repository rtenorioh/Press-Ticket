import ApiToken from "../../models/ApiToken";

interface TokenData {
    name: string;
    permissions: string;
}

const CreateApiTokenService = async ({ name, permissions }: TokenData): Promise<ApiToken> => {
    const token = await ApiToken.create({
        name,
        token: crypto.randomUUID(),
        permissions
    });

    return token;
};

export default CreateApiTokenService;