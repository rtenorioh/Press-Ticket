/* eslint-disable prefer-template */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-array-constructor */
import Mustache from "mustache";
import Ticket from "../models/Ticket";

export const msgsd = (): string => {

  let ms = "";

  const hh = new Date().getHours();

  if (hh >= 6) { ms = "Bom Dia"; }
  if (hh > 11) { ms = "Boa Tarde"; }
  if (hh > 17) { ms = "Boa Noite"; }
  if (hh > 23 || hh < 6) { ms = "Boa Madrugada"; }

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

export const firstName = (ticket?: Ticket): string => {
  if (ticket && ticket.contact.name) {
    const nameArr = ticket.contact.name.split(' ');
    return nameArr[0];
  }
  return '';
};

export default (body: string, ticket?: Ticket): string => {
  const view = {
    firstName: firstName(ticket),
    name: ticket ? ticket.contact.name : "",
    user: ticket ? ticket?.user : "",
    ticket_id: ticket ? ticket.id : "",
    ms: msgsd(),
    hour: hour(),
    date: date(),
    queue: ticket ? ticket?.queue?.name : "",
    connection: ticket ? ticket.whatsapp.name : "",
    protocol: new Array(
      control(),
      ticket ? ticket.id.toString() : ""
    ).join(""),
  };
  return Mustache.render(body, view);
};
