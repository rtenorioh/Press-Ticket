import { Request } from "express";

/**
 * Extrai o IP real do cliente da requisição
 * Considera proxies reversos (nginx, cloudflare, etc)
 */
const GetClientIp = (req: Request): string => {
  // Tenta obter IP de headers comuns de proxies
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
  
  // x-forwarded-for pode conter múltiplos IPs separados por vírgula
  // O primeiro é o IP do cliente original
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  
  // x-real-ip normalmente contém apenas um IP
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0];
  }
  
  // Cloudflare connecting IP
  if (cfConnectingIp) {
    return typeof cfConnectingIp === 'string' ? cfConnectingIp : cfConnectingIp[0];
  }
  
  // Fallback para remoteAddress do socket
  const socketIp = req.socket?.remoteAddress || 
                   req.connection?.remoteAddress ||
                   (req as any).connection?.socket?.remoteAddress;
  
  if (socketIp) {
    // Remove prefixo IPv6 se for localhost
    return socketIp.replace('::ffff:', '');
  }
  
  return 'unknown';
};

export default GetClientIp;
