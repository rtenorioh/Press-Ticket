import { v4 as uuidv4 } from 'uuid';
import ApiToken from "../../models/ApiToken";

interface TokenData {
    name: string;
    permissions: string;
}

const CreateApiTokenService = async ({ name, permissions }: TokenData): Promise<ApiToken> => {
    const token = await ApiToken.create({
        name,
        token: uuidv4(),
        permissions
    });

    return token;
};

export default CreateApiTokenService;