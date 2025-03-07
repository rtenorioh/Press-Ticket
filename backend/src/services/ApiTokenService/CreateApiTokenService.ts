import { v4 as uuidv4 } from 'uuid';
import ApiToken from "../../models/ApiToken";

interface TokenData {
  name: string;
  permissions: number[];
}

const CreateApiTokenService = async (data: TokenData): Promise<ApiToken> => {
  const token = uuidv4();

  const apiToken = await ApiToken.create({
    name: data.name,
    token: token,
    permissions: data.permissions
  });

  return apiToken;
};

export default CreateApiTokenService;
