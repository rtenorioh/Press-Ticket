import { Request, Response } from "express";
import CacheService from "../services/CacheService";
import ContactCache from "../helpers/ContactCache";
import MessageCache from "../helpers/MessageCache";

export const getCacheStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const globalStats = CacheService.getStats();
  const contactStats = ContactCache.getCacheStats();
  const messageStats = MessageCache.getCacheStats();

  return res.json({
    global: globalStats,
    contacts: contactStats,
    messages: messageStats,
    totalKeys: CacheService.keys().length
  });
};

export const flushCache = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { type } = req.body;

  switch (type) {
    case "contacts":
      ContactCache.invalidateAll();
      break;
    case "messages":
      MessageCache.invalidateAll();
      break;
    case "all":
      CacheService.flush();
      break;
    default:
      return res.status(400).json({ 
        error: "Invalid cache type. Use: contacts, messages, or all" 
      });
  }

  return res.json({ 
    message: `Cache ${type} flushed successfully` 
  });
};

export const getCacheKeys = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { prefix } = req.query;
  
  let keys = CacheService.keys();
  
  if (prefix) {
    keys = keys.filter(key => key.startsWith(prefix as string));
  }

  return res.json({
    total: keys.length,
    keys: keys.slice(0, 100)
  });
};
