import Mustache from "mustache";
import Contact from "../models/Contact";

export default (body: string, contact: Contact): string => {
  
  let ms = "";

  const Hr = new Date();

  const dd: string = ("0" + Hr.getDate()).slice(-2);
  const mm: string = ("0" + (Hr.getMonth() + 1)).slice(-2);
  const yy: string = Hr.getFullYear().toString();
  const hh: number = Hr.getHours();
  const min: string = ("0" + Hr.getMinutes()).slice(-2);
  const ss: string = ("0" + Hr.getSeconds()).slice(-2);

  if (hh >= 6){ms = "בוקר טוב";}
  if (hh > 11){ms = "צהרים טובים";}
  if (hh > 17){ms = "ערב טוב";}
  if (hh > 23 || hh < 6){ms = "בוקר טוב";}

  let protocol = yy+mm+dd+String(hh)+min+ss;
  
  let hora = hh+":"+min+":"+ss;

  const view = {
    name: contact ? contact.name : "",
    ms: ms,
    protocol: protocol,
    hora: hora,
  };

  return Mustache.render(body, view);

};
