import ApiToken from "../../models/ApiToken";

interface Request {
    pageNumber?: number;
    pageSize?: number;
}

interface Response {
    tokens: ApiToken[];
    count: number;
    hasMore: boolean;
}

const ListApiTokenService = async ({ pageNumber = 1, pageSize = 20 }: Request): Promise<Response> => {
    const offset = (pageNumber - 1) * pageSize;

    const { count, rows: tokens } = await ApiToken.findAndCountAll({
        limit: pageSize,
        offset,
        order: [["createdAt", "DESC"]]
    });

    const hasMore = offset + tokens.length < count;

    return {
        tokens,
        count,
        hasMore
    };
};

export default ListApiTokenService;