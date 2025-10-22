import NodeCache from "node-cache";
import { logger } from "../utils/logger";

class CacheService {
  private cache: NodeCache;
  
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: false,
      deleteOnExpire: true
    });

    this.cache.on("expired", (key, value) => {
      logger.debug(`Cache expired: ${key}`);
    });

    this.cache.on("del", (key, value) => {
      logger.debug(`Cache deleted: ${key}`);
    });
  }

  set(key: string, value: any, ttl?: number): boolean {
    try {
      return this.cache.set(key, value, ttl || 600);
    } catch (err) {
      logger.error(`Error setting cache for key ${key}:`, err);
      return false;
    }
  }

  get<T>(key: string): T | undefined {
    try {
      return this.cache.get<T>(key);
    } catch (err) {
      logger.error(`Error getting cache for key ${key}:`, err);
      return undefined;
    }
  }

  del(key: string | string[]): number {
    try {
      return this.cache.del(key);
    } catch (err) {
      logger.error(`Error deleting cache for key ${key}:`, err);
      return 0;
    }
  }

  flush(): void {
    try {
      this.cache.flushAll();
      logger.info("Cache flushed successfully");
    } catch (err) {
      logger.error("Error flushing cache:", err);
    }
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  keys(): string[] {
    return this.cache.keys();
  }

  getStats() {
    return this.cache.getStats();
  }

  setMultiple(items: Array<{ key: string; value: any; ttl?: number }>): void {
    items.forEach(item => {
      this.set(item.key, item.value, item.ttl);
    });
  }

  getMultiple<T>(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();
    keys.forEach(key => {
      const value = this.get<T>(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    });
    return result;
  }
}

export default new CacheService();
