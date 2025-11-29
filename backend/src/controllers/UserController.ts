import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";
import CheckSettingsHelper from "../helpers/CheckSettings";

import CreateUserService from "../services/UserServices/CreateUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import ShowUserService from "../services/UserServices/ShowUserService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import { createActivityLog, ActivityActions, EntityTypes } from "../services/ActivityLogService";
import GetClientIp from "../helpers/GetClientIp";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { users } = await ListUsersService({});

  if (users.length >= Number(process.env.USER_LIMIT)) {
    throw new AppError("ERR_USER_CREATION_COUNT", 403);
  }

  const {
    email,
    password,
    name,
    profile,
    isTricked,
    queueIds,
    whatsappIds,
    startWork,
    endWork,
    active
  } = req.body;

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    isTricked,
    queueIds,
    whatsappIds,
    startWork,
    endWork,
    active
  });

  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.CREATE,
    description: `Usuário ${user.name} (${user.email}) criado com perfil ${user.profile}`,
    entityType: EntityTypes.USER,
    entityId: user.id,
    ip: clientIp,
    additionalData: {
      email: user.email,
      profile: user.profile
    }
  });

  const io = getIO();
  io.emit("user", {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  const newUserId = userId.toString();
  const sessionUserId = req.user.id.toString();

  if (req.user.profile !== "admin" && sessionUserId !== newUserId) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const userData = req.body;

  const user = await UpdateUserService({ userData, userId });
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  
  if (user) {
    await createActivityLog({
      userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
      action: ActivityActions.UPDATE,
      description: `Usuário ${user.name} (${user.email}) atualizado`,
      entityType: EntityTypes.USER,
      entityId: user.id,
      ip: clientIp,
      additionalData: userData
    });
  }

  const io = getIO();
  io.emit("user", {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (req.user.profile !== "admin" && req.user.profile !== "masteradmin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const userToDelete = await ShowUserService(userId);
  
  await DeleteUserService(userId);
  const logUserId = req.user?.id || 1;
  const clientIp = GetClientIp(req);
  
  await createActivityLog({
    userId: typeof logUserId === 'string' ? parseInt(logUserId) : logUserId,
    action: ActivityActions.DELETE,
    description: `Usuário ${userToDelete.name} (${userToDelete.email}) excluído`,
    entityType: EntityTypes.USER,
    entityId: parseInt(userId),
    ip: clientIp,
    additionalData: {
      email: userToDelete.email,
      profile: userToDelete.profile
    }
  });

  const io = getIO();
  io.emit("user", {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};
