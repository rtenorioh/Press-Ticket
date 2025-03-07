import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import ListApiTokenService from "../services/ApiTokenService/ListApiTokenService";
import CreateApiTokenService from "../services/ApiTokenService/CreateApiTokenService";
import ShowApiTokenService from "../services/ApiTokenService/ShowApiTokenService";
import DeleteApiTokenService from "../services/ApiTokenService/DeleteApiTokenService";
import FindByNameService from "../services/ApiTokenService/FindByNameService";
import ListPermissionsService from "../services/ApiTokenService/ListPermissionsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, pageSize } = req.query;

  const { tokens, count, hasMore } = await ListApiTokenService({
    pageNumber: pageNumber ? parseInt(pageNumber as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined
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
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { name } = req.body;

  const existingToken = await FindByNameService(name);
  if (existingToken) {
    throw new AppError("ERR_TOKEN_NAME_ALREADY_EXISTS");
  }

  const token = await CreateApiTokenService(req.body);

  return res.status(200).json(token);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const token = await ShowApiTokenService(+id);

  return res.status(200).json(token);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  await DeleteApiTokenService(+id);

  return res.status(200).json({ message: "Token deleted" });
};
