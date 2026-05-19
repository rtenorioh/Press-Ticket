import axios, { AxiosInstance } from "axios";

const NOTIFICAME_BASE_URL = "https://api.notificame.com.br";

export function createNotificameClient(hubToken: string): AxiosInstance {
  return axios.create({
    baseURL: NOTIFICAME_BASE_URL,
    headers: {
      "X-Api-Token": hubToken,
      "Content-Type": "application/json"
    },
    timeout: 30000
  });
}

export type NotificameChannel =
  | "facebook"
  | "instagram"
  | "telegram"
  | "webchat"
  | "email"
  | "whatsapp";

export interface NotificameContent {
  type: "text" | "file" | "template" | "reply_text" | "email" | "location";
  text?: string;
  fileUrl?: string;
  fileMimeType?: string;
  fileCaption?: string;
  messsageId?: string; // typo intencional — API oficial usa 3 "s"
  template?: Record<string, unknown>;
  subject?: string;
  html?: string;
  attachments?: unknown[];
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
}

export interface NotificameMessagePayload {
  from: string;
  to: string;
  contents: NotificameContent[];
}

export interface NotificameResponse {
  id: string;
  from: string;
  to: string;
  contents: NotificameContent | NotificameContent[];
  direction: "OUT" | "IN";
}

interface NotificameContactInfo {
  messengerId?: string | null;
  instagramId?: string | null;
  telegramId?: string | null;
  webchatId?: string | null;
}

export function resolveChannel(contact: NotificameContactInfo): NotificameChannel | null {
  if (contact.messengerId) return "facebook";
  if (contact.instagramId) return "instagram";
  if (contact.telegramId) return "telegram";
  if (contact.webchatId) return "webchat";
  return null;
}

export function resolveContactId(
  contact: NotificameContactInfo,
  channel: NotificameChannel
): string | null {
  switch (channel) {
    case "facebook":
      return contact.messengerId || null;
    case "instagram":
      return contact.instagramId || null;
    case "telegram":
      return contact.telegramId || null;
    case "webchat":
      return contact.webchatId || null;
    default:
      return null;
  }
}
