import { Request, Response, NextFunction } from "express";
import { DataTypes } from "sequelize";

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type CatchError = unknown;

export type WhereClause = Record<string, unknown>;

export type MigrationDataTypes = typeof DataTypes;

export type SocketPayload = Record<string, unknown>;

export type WWebMessage = Record<string, unknown>;
export type WWebContact = Record<string, unknown>;
export type WWebChat = Record<string, unknown>;

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Erro interno do servidor";
}
