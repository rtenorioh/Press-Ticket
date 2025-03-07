import { Request, Response, NextFunction } from "express";
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

const isApiToken = (requiredPermission?: string) => {
  return async (req: ApiTokenRequest, res: Response, next: NextFunction): Promise<void> => {
    const apiToken = req.headers["x-api-token"] as string;

    if (!apiToken) {
      throw new AppError("ERR_API_TOKEN_REQUIRED", 401);
    }

    try {
      const token = await FindByTokenService(apiToken);
      
      const permissionsArray = (token.permissions as unknown as string[]) || [];
      
      if (requiredPermission && !permissionsArray.includes(requiredPermission)) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }
      
      const allPermissions = await ListPermissionsService();
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
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("ERR_INVALID_API_TOKEN", 401);
    }
  };
};

export default isApiToken;
