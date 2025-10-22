import Message from "../models/Message";
import CacheService from "../services/CacheService";
import { logger } from "../utils/logger";

interface MessageCacheOptions {
  ttl?: number;
  forceRefresh?: boolean;
}

class MessageCacheHelper {
  private readonly CACHE_PREFIX = "message:";
  private readonly TICKET_MESSAGES_PREFIX = "ticket_messages:";
  private readonly DEFAULT_TTL = 300;
  private readonly TICKET_MESSAGES_TTL = 180;

  private getCacheKey(identifier: string | number): string {
    return `${this.CACHE_PREFIX}${identifier}`;
  }

  private getTicketMessagesCacheKey(ticketId: number): string {
    return `${this.TICKET_MESSAGES_PREFIX}${ticketId}`;
  }

  async getMessageById(
    messageId: string,
    options: MessageCacheOptions = {}
  ): Promise<Message | null> {
    const cacheKey = this.getCacheKey(messageId);
    const { ttl = this.DEFAULT_TTL, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = CacheService.get<Message>(cacheKey);
      if (cached) {
        logger.debug(`Message ${messageId} retrieved from cache`);
        return cached;
      }
    }

    const message = await Message.findByPk(messageId);
    
    if (message) {
      CacheService.set(cacheKey, message, ttl);
      logger.debug(`Message ${messageId} cached`);
    }

    return message;
  }

  cacheTicketMessages(ticketId: number, messages: Message[]): void {
    const cacheKey = this.getTicketMessagesCacheKey(ticketId);
    CacheService.set(cacheKey, messages, this.TICKET_MESSAGES_TTL);
    
    messages.forEach(message => {
      CacheService.set(
        this.getCacheKey(message.id),
        message,
        this.DEFAULT_TTL
      );
    });
    
    logger.debug(`Cached ${messages.length} messages for ticket ${ticketId}`);
  }

  getTicketMessagesFromCache(ticketId: number): Message[] | undefined {
    const cacheKey = this.getTicketMessagesCacheKey(ticketId);
    const cached = CacheService.get<Message[]>(cacheKey);
    
    if (cached) {
      logger.debug(`Retrieved ${cached.length} messages for ticket ${ticketId} from cache`);
    }
    
    return cached;
  }

  invalidateMessage(messageId: string): void {
    const cacheKey = this.getCacheKey(messageId);
    CacheService.del(cacheKey);
    logger.debug(`Message ${messageId} cache invalidated`);
  }

  invalidateTicketMessages(ticketId: number): void {
    const cacheKey = this.getTicketMessagesCacheKey(ticketId);
    CacheService.del(cacheKey);
    logger.debug(`Ticket ${ticketId} messages cache invalidated`);
  }

  invalidateAll(): void {
    const keys = CacheService.keys().filter(key => 
      key.startsWith(this.CACHE_PREFIX) || 
      key.startsWith(this.TICKET_MESSAGES_PREFIX)
    );
    CacheService.del(keys);
    logger.info(`Invalidated ${keys.length} message cache entries`);
  }

  getCacheStats() {
    const allKeys = CacheService.keys();
    const messageKeys = allKeys.filter(key => 
      key.startsWith(this.CACHE_PREFIX) || 
      key.startsWith(this.TICKET_MESSAGES_PREFIX)
    );
    
    return {
      totalCached: messageKeys.length,
      cacheStats: CacheService.getStats()
    };
  }
}

export default new MessageCacheHelper();
