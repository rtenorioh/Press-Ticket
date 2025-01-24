import User from "../../models/User";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import Queue from "../../models/Queue";
import { getIO } from "../../libs/socket";
import { v4 as uuidv4 } from "uuid";
import UserSession from "../../models/UserSession";
import { SerializeUser } from "../../helpers/SerializeUser";

interface Request {
  email: string;
  password: string;
}

interface Response {
  serializedUser: {
    id: number;
    name: string;
    email: string;
    profile: string;
    online: boolean;
    isTricked: boolean;
    startWork: string;
    endWork: string;
    createdAt: Date;
    queues: Queue[];
  };
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email },
    include: ["queues"]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const Hr = new Date();

  const hh: number = Hr.getHours() * 60 * 60;
  const mm: number = Hr.getMinutes() * 60;
  const hora = hh + mm;

  const inicio: string = user.startWork;
  const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
  const mminicio = Number(inicio.split(":")[1]) * 60;
  const horainicio = hhinicio + mminicio;

  const termino: string = user.endWork;
  const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
  const mmtermino = Number(termino.split(":")[1]) * 60;
  const horatermino = hhtermino + mmtermino;

  if (hora < horainicio || hora > horatermino) {
    throw new AppError("ERR_OUT_OF_HOURS", 401);
  }

  if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  // Atualiza o status online do usuário
  await user.update({ online: true });
  
  // Emite evento de atualização de status
  const io = getIO();
  io.emit("userSessionUpdate", {
    userId: user.id,
    online: true
  });

  const lastSession = await UserSession.findOne({
    where: {
      userId: user.id,
      logoutAt: null
    }
  });

  if (lastSession) {
    const lastActivity = new Date(lastSession.lastActivity).getTime();
    const currentTime = new Date().getTime();
    const diffHours = (currentTime - lastActivity) / (1000 * 60 * 60);

    if (diffHours >= 8) {
      await lastSession.update({
        logoutAt: new Date()
      });

      await user.update({
        online: false,
        currentSessionId: null
      });

      io.emit("userSessionExpired", {
        userId: user.id,
        expired: true,
        message: "ERR_SESSION_EXPIRED"
      });

      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Se já existe uma sessão ativa, atualiza em vez de criar nova
    await lastSession.update({
      lastActivity: new Date()
    });
  } else {
    const newSessionId = uuidv4();

    await UserSession.create({
      userId: user.id,
      sessionId: newSessionId,
      loginAt: new Date(),
      lastActivity: new Date()
    });

    await user.update({
      online: true,
      currentSessionId: newSessionId
    });
  }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const serializedUser = await SerializeUser(user);

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;