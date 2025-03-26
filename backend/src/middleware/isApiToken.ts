import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import FindByTokenService from "../services/ApiTokenService/FindByTokenService";
import ListPermissionsService from "../services/ApiTokenService/ListPermissionsService";

interface ApiTokenRequest extends Request {
    apiToken?: {
        token: string;
        permissions: {
            [key: string]: boolean;
        };
    };
}

const isApiToken = async (req: ApiTokenRequest, res: Response, next: NextFunction): Promise<void> => {
    const apiToken = req.headers["x-api-token"] as string;

    if (!apiToken) {
        throw new AppError("ERR_API_TOKEN_REQUIRED", 401);
    }

    try {
        const token = await FindByTokenService(apiToken);
        const allPermissions = await ListPermissionsService();
        console.log("allPermissions", allPermissions);
        let permissionsArray: string[] = [];
        try {
            permissionsArray = JSON.parse(token.permissions || '[]');
        } catch (error) {
            console.error("Error parsing permissions:", error);
        }

        const permissionsObj = allPermissions.reduce((acc, permission) => {
            acc[permission] = permissionsArray.includes(permission);
            return acc;
        }, {} as { [key: string]: boolean });

        req.apiToken = {
            token: apiToken,
            permissions: permissionsObj
        };

        return next();
    } catch (err) {
        throw new AppError("ERR_INVALID_API_TOKEN", 401);
    }
};

export default isApiToken;