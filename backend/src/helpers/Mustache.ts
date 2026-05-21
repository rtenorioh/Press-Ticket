/* eslint-disable @typescript-eslint/no-array-constructor */
import Mustache from "mustache";
import sanitizeHtml from "sanitize-html";
import Ticket from "../models/Ticket";

export const msgsd = (): string => {
  let ms = "";

  const hh = new Date().getHours();

  if (hh >= 6) {
    ms = "Bom Dia";
  }
  if (hh > 11) {
    ms = "Boa Tarde";
  }
  if (hh > 17) {
    ms = "Boa Noite";
  }
  if (hh > 23 || hh < 6) {
    ms = "Boa Madrugada";
  }

  return ms;
};

export const control = (): string => {
  const Hr = new Date();

  const dd: string = ("0" + Hr.getDate()).slice(-2);
  const mm: string = ("0" + (Hr.getMonth() + 1)).slice(-2);
  const yy: string = Hr.getFullYear().toString();

  const ctrl = yy + mm + dd + "T";
  return ctrl;
};

export const date = (): string => {
  const Hr = new Date();

  const dd: string = ("0" + Hr.getDate()).slice(-2);
  const mm: string = ("0" + (Hr.getMonth() + 1)).slice(-2);
  const yy: string = Hr.getFullYear().toString();

  const dates = dd + "-" + mm + "-" + yy;
  return dates;
};

export const hour = (): string => {
  const Hr = new Date();

  const hh: number = Hr.getHours();
  const min: string = ("0" + Hr.getMinutes()).slice(-2);
  const ss: string = ("0" + Hr.getSeconds()).slice(-2);

  const hours = hh + ":" + min + ":" + ss;
  return hours;
};

function sanitizeStr(value: unknown): string {
  if (typeof value !== "string") return "";
  const noTriple = value.replace(/\{\{\{/g, "{{").replace(/\}\}\}/g, "}}");
  return sanitizeHtml(noTriple, { allowedTags: [] });
}

export default (body: string, ticket?: Ticket): string => {
  const view: Record<string, string> = Object.assign(Object.create(null), {
    name: sanitizeStr(ticket?.contact?.name),
    user: sanitizeStr(ticket?.user?.name),
    ticket_id: ticket ? String(ticket.id) : "",
    ms: msgsd(),
    hour: hour(),
    date: date(),
    queue: sanitizeStr(ticket?.queue?.name),
    connection: sanitizeStr(ticket?.whatsapp?.name),
    protocol: [control(), ticket ? ticket.id.toString() : ""].join("")
  });

  // Prevent unescaped triple-brace output in user-configured templates
  const safeBody = body.replace(/\{\{\{/g, "{{").replace(/\}\}\}/g, "}}");
  return Mustache.render(safeBody, view);
};
