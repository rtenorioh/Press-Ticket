import { WAState } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";

interface HealthCheckData {
  whatsappId: number;
  name: string;
  number: string;
  state: WAState | null;
  uptime: number;
  lastActivity: Date;
  messagesProcessed: number;
  errors: number;
  latency: number;
  platform: string;
  pushname: string;
  wwebVersion: string;
  isConnected: boolean;
}

interface WhatsappHealth {
  startTime?: Date;
  messagesProcessed?: number;
  errors?: number;
  lastActivity?: Date;
}

const whatsappHealthData: Map<number, WhatsappHealth> = new Map();

export const initializeHealthTracking = (whatsappId: number): void => {
  if (!whatsappHealthData.has(whatsappId)) {
    whatsappHealthData.set(whatsappId, {
      startTime: new Date(),
      messagesProcessed: 0,
      errors: 0,
      lastActivity: new Date()
    });
  }
};

export const incrementMessageCount = (whatsappId: number): void => {
  const health = whatsappHealthData.get(whatsappId);
  if (health) {
    health.messagesProcessed = (health.messagesProcessed || 0) + 1;
    health.lastActivity = new Date();
  }
};

export const incrementErrorCount = (whatsappId: number): void => {
  const health = whatsappHealthData.get(whatsappId);
  if (health) {
    health.errors = (health.errors || 0) + 1;
    health.lastActivity = new Date();
  }
};

export const updateLastActivity = (whatsappId: number): void => {
  const health = whatsappHealthData.get(whatsappId);
  if (health) {
    health.lastActivity = new Date();
  }
};

const calculateLatency = async (wbot: any): Promise<number> => {
  try {
    const startTime = Date.now();
    await wbot.pupPage.evaluate(() => (window as any).Store.AppState.state);
    return Date.now() - startTime;
  } catch (error) {
    return -1;
  }
};

const getHealthCheckService = async (whatsappId: number): Promise<HealthCheckData> => {
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  
  if (!whatsapp) {
    throw new Error("Whatsapp não encontrado");
  }

  initializeHealthTracking(whatsappId);
  const health = whatsappHealthData.get(whatsappId)!;

  try {
    const wbot = getWbot(whatsappId);
    
    const [state, info, wwebVersion, latency] = await Promise.all([
      wbot.getState().catch(() => null),
      wbot.info ? Promise.resolve(wbot.info) : Promise.resolve(null),
      wbot.getWWebVersion().catch(() => "Unknown"),
      calculateLatency(wbot)
    ]);

    const uptime = health.startTime 
      ? Math.floor((Date.now() - health.startTime.getTime()) / 1000)
      : 0;

    const isConnected = state === WAState.CONNECTED;

    return {
      whatsappId: whatsapp.id,
      name: whatsapp.name,
      number: whatsapp.number || "N/A",
      state: state || null,
      uptime,
      lastActivity: health.lastActivity || new Date(),
      messagesProcessed: health.messagesProcessed || 0,
      errors: health.errors || 0,
      latency,
      platform: info?.platform || "Unknown",
      pushname: info?.pushname || "Unknown",
      wwebVersion,
      isConnected
    };
  } catch (error) {
    return {
      whatsappId: whatsapp.id,
      name: whatsapp.name,
      number: whatsapp.number || "N/A",
      state: null,
      uptime: 0,
      lastActivity: health.lastActivity || new Date(),
      messagesProcessed: health.messagesProcessed || 0,
      errors: health.errors || 0,
      latency: -1,
      platform: "Unknown",
      pushname: "Unknown",
      wwebVersion: "Unknown",
      isConnected: false
    };
  }
};

const getAllHealthChecks = async (): Promise<HealthCheckData[]> => {
  const whatsapps = await Whatsapp.findAll({
    where: { type: "wwebjs" },
    attributes: ["id", "name", "number", "status"]
  });

  const healthChecks = await Promise.all(
    whatsapps.map(async (whatsapp) => {
      try {
        return await getHealthCheckService(whatsapp.id);
      } catch (error) {
        initializeHealthTracking(whatsapp.id);
        const health = whatsappHealthData.get(whatsapp.id)!;
        
        return {
          whatsappId: whatsapp.id,
          name: whatsapp.name,
          number: whatsapp.number || "N/A",
          state: null,
          uptime: 0,
          lastActivity: health.lastActivity || new Date(),
          messagesProcessed: health.messagesProcessed || 0,
          errors: health.errors || 0,
          latency: -1,
          platform: "Unknown",
          pushname: "Unknown",
          wwebVersion: "Unknown",
          isConnected: false
        };
      }
    })
  );

  return healthChecks;
};

export { getHealthCheckService, getAllHealthChecks };
