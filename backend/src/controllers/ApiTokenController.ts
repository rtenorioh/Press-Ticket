import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import CreateApiTokenService from "../services/ApiTokenService/CreateApiTokenService";
import DeleteApiTokenService from "../services/ApiTokenService/DeleteApiTokenService";
import FindByNameService from "../services/ApiTokenService/FindByNameService";
import ListApiTokenService from "../services/ApiTokenService/ListApiTokenService";
import ListPermissionsService from "../services/ApiTokenService/ListPermissionsService";
import ShowApiTokenService from "../services/ApiTokenService/ShowApiTokenService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { pageNumber, pageSize } = req.query;

    const { tokens, count, hasMore } = await ListApiTokenService({
        pageNumber: pageNumber ? parseInt(pageNumber as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined
    });

    return res.status(200).json({
        tokens,
        count,
        hasMore
    });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const validPermissions = await ListPermissionsService();

    const schema = Yup.object().shape({
        name: Yup.string().required(),
        permissions: Yup.array()
            .of(Yup.string().oneOf(validPermissions))
            .required()
            .min(1, "At least one permission is required")
    });

    try {
        await schema.validate(req.body);
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const { name, permissions } = req.body;

    const existingToken = await FindByNameService(name);
    if (existingToken) {
        throw new AppError("ERR_TOKEN_NAME_ALREADY_EXISTS");
    }

    const token = await CreateApiTokenService({
        name,
        permissions: JSON.stringify(permissions)
    });

    const logUserId = req.user?.id || 1;
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.CREATE,
        description: `Token de API "${token.name}" criado`,
        entityType: EntityTypes.APITOKEN,
        entityId: token.id,
        ip: clientIp,
        additionalData: {
            name: token.name,
            permissions: permissions
        }
    });

    return res.status(200).json(token);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const token = await ShowApiTokenService(+id);

    return res.status(200).json(token);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const tokenToDelete = await ShowApiTokenService(+id);
    
    await DeleteApiTokenService(+id);
    
    const logUserId = req.user?.id || 1;
    const clientIp = GetClientIp(req);
    
    await createActivityLog({
        userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
        action: ActivityActions.DELETE,
        description: `Token de API "${tokenToDelete.name}" excluído`,
        entityType: EntityTypes.APITOKEN,
        entityId: +id,
        ip: clientIp,
        additionalData: {
            name: tokenToDelete.name
        }
    });

    return res.status(200).json({ message: "Token deleted" });
};