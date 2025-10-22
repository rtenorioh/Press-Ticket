import Contact from "../models/Contact";
import CacheService from "../services/CacheService";
import { logger } from "../utils/logger";

interface ContactCacheOptions {
  ttl?: number;
  forceRefresh?: boolean;
}

class ContactCacheHelper {
  private readonly CACHE_PREFIX = "contact:";
  private readonly DEFAULT_TTL = 600;

  private getCacheKey(identifier: string | number): string {
    return `${this.CACHE_PREFIX}${identifier}`;
  }

  async getContactById(
    contactId: number,
    options: ContactCacheOptions = {}
  ): Promise<Contact | null> {
    const cacheKey = this.getCacheKey(contactId);
    const { ttl = this.DEFAULT_TTL, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = CacheService.get<Contact>(cacheKey);
      if (cached) {
        logger.debug(`Contact ${contactId} retrieved from cache`);
        return cached;
      }
    }

    const contact = await Contact.findByPk(contactId);
    
    if (contact) {
      CacheService.set(cacheKey, contact, ttl);
      logger.debug(`Contact ${contactId} cached`);
    }

    return contact;
  }

  async getContactByNumber(
    number: string,
    options: ContactCacheOptions = {}
  ): Promise<Contact | null> {
    const cacheKey = this.getCacheKey(`number:${number}`);
    const { ttl = this.DEFAULT_TTL, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = CacheService.get<Contact>(cacheKey);
      if (cached) {
        logger.debug(`Contact with number ${number} retrieved from cache`);
        return cached;
      }
    }

    const contact = await Contact.findOne({ where: { number } });
    
    if (contact) {
      CacheService.set(cacheKey, contact, ttl);
      CacheService.set(this.getCacheKey(contact.id), contact, ttl);
      logger.debug(`Contact with number ${number} cached`);
    }

    return contact;
  }

  invalidateContact(contactId: number): void {
    const cacheKey = this.getCacheKey(contactId);
    CacheService.del(cacheKey);
    logger.debug(`Contact ${contactId} cache invalidated`);
  }

  invalidateContactByNumber(number: string): void {
    const cacheKey = this.getCacheKey(`number:${number}`);
    CacheService.del(cacheKey);
    logger.debug(`Contact with number ${number} cache invalidated`);
  }

  invalidateAll(): void {
    const keys = CacheService.keys().filter(key => 
      key.startsWith(this.CACHE_PREFIX)
    );
    CacheService.del(keys);
    logger.info(`Invalidated ${keys.length} contact cache entries`);
  }

  async warmupCache(contactIds: number[]): Promise<void> {
    logger.info(`Warming up cache for ${contactIds.length} contacts`);
    
    const contacts = await Contact.findAll({
      where: { id: contactIds }
    });

    contacts.forEach(contact => {
      CacheService.set(this.getCacheKey(contact.id), contact, this.DEFAULT_TTL);
      if (contact.number) {
        CacheService.set(
          this.getCacheKey(`number:${contact.number}`),
          contact,
          this.DEFAULT_TTL
        );
      }
    });

    logger.info(`Cache warmed up with ${contacts.length} contacts`);
  }

  getCacheStats() {
    const allKeys = CacheService.keys();
    const contactKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
    
    return {
      totalCached: contactKeys.length,
      cacheStats: CacheService.getStats()
    };
  }
}

export default new ContactCacheHelper();
