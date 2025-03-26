import ApiToken from "../../models/ApiToken";

const FindByNameService = async (name: string): Promise<ApiToken | null> => {
    const token = await ApiToken.findOne({
        where: {
            name: name
        }
    });
    return token;
};

export default FindByNameService;