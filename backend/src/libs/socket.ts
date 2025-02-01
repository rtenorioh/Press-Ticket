import { Server } from "http";
import { verify } from "jsonwebtoken";
import { Server as SocketIO } from "socket.io";
import authConfig from "../config/auth";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import User from "../models/User";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  iat: number;
  exp: number;
}

interface UserStatus {
  userId: number;
  online: boolean;
}

let io: SocketIO;

export const setIO = (io: SocketIO): void => {
  io = io;
};

export const initIO = (httpServer: Server): void => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io'
  });

  logger.info("Servidor Socket.IO iniciado", {
    corsOrigin: process.env.FRONTEND_URL || "http://localhost:3000",
    transports: ['websocket', 'polling']
  });

  io.on("connection", async socket => {
    logger.info("Tentativa de conexão socket", { 
      socketId: socket.id,
      transport: socket.conn.transport.name
    });

    const { token } = socket.handshake.query;

    if (!token || typeof token !== "string") {
      logger.warn("Conexão rejeitada: Token não fornecido ou inválido", { socketId: socket.id });
      socket.disconnect();
      return;
    }

    try {
      const decoded = verify(token, authConfig.secret) as TokenPayload;
      const { id: userId } = decoded;

      // Validação adicional do token
      if (!userId) {
        logger.warn("Conexão rejeitada: Token sem userId", { socketId: socket.id });
        socket.disconnect();
        return;
      }

      try {
        const user = await User.findByPk(userId);
        if (!user) {
          logger.warn("Conexão rejeitada: Usuário não encontrado", { 
            socketId: socket.id,
            userId 
          });
          socket.disconnect();
          return;
        }

        const userRoom = io.sockets.adapter.rooms.get(userId.toString());
        const hasConnectedSockets = userRoom && userRoom.size > 0;

        if (!hasConnectedSockets) {
          await User.update({ online: true }, { where: { id: userId } });
        }

        socket.join(userId.toString());
        logger.info("Conexão socket estabelecida", { 
          userId,
          socketId: socket.id
        });

      } catch (err) {
        logger.error("Erro ao processar usuário do socket", {
          error: err.message,
          socketId: socket.id,
          userId
        });
        socket.disconnect();
      }
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        logger.warn("Conexão rejeitada: Token inválido", {
          error: err.message,
          socketId: socket.id
        });
      } else if (err.name === "TokenExpiredError") {
        logger.warn("Conexão rejeitada: Token expirado", {
          error: err.message,
          socketId: socket.id
        });
      } else {
        logger.error("Erro na validação do token", {
          error: err.message,
          socketId: socket.id
        });
      }
      socket.disconnect();
    }

    socket.onAny((eventName: string, ...args: unknown[]) => {
      logger.debug("Evento recebido", {
        event: eventName,
        socketId: socket.id,
        args
      });
    });

    socket.on("userStatus", async ({ userId, online }: UserStatus) => {
      logger.info("Alteração de status do usuário", {
        userId,
        online,
        socketId: socket.id
      });

      try {
        await User.update({ online }, { where: { id: userId } });
      } catch (err) {
        logger.error("Erro ao atualizar status do usuário", {
          error: err.message,
          userId,
          online
        });
      }
    });

    socket.on("disconnect", async () => {
      logger.info("Cliente desconectado", { socketId: socket.id });

      try {
        const { id: userId } = verify(token as string, authConfig.secret) as TokenPayload;
        const userRoom = io.sockets.adapter.rooms.get(userId.toString());
        const hasConnectedSockets = userRoom && userRoom.size > 0;

        if (!hasConnectedSockets) {
          await User.update({ online: false }, { where: { id: userId } });
        }
      } catch (err) {
        logger.error("Erro ao processar desconexão", {
          error: err.message,
          socketId: socket.id
        });
      }
    });

    socket.on("logout", async () => {
      logger.info("Logout solicitado", { socketId: socket.id });

      try {
        const { id: userId } = verify(token as string, authConfig.secret) as TokenPayload;
        await User.update(
          { online: false },
          { where: { id: userId } }
        );

        socket.leave(userId.toString());
        logger.info("Usuário removido da sala após logout", {
          userId,
          socketId: socket.id
        });
      } catch (err) {
        logger.error("Erro ao processar logout", {
          error: err.message,
          socketId: socket.id
        });
      }
    });

    socket.on("joinChatBox", (ticketId: string) => {
      logger.info("Usuário entrou no chat", {
        ticketId,
        socketId: socket.id
      });
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("Usuário entrou no canal de notificações", {
        socketId: socket.id
      });
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info("Usuário entrou no canal de tickets", {
        status,
        socketId: socket.id
      });
      socket.join(status);
    });
  });

  // Log socket.io errors
  io.on("connect_error", (err: Error) => {
    logger.error("Connection error:", err);
  });
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
