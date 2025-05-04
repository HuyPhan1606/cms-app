/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setToken(token: string, userId: string, ttl: number): Promise<void> {
    const key = `token:${token}`;
    const value = JSON.stringify({ userId, token });
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error(`Error saving token to Redis: ${error}`);
      throw error;
    }
  }

  async getToken(token: string): Promise<string | undefined> {
    const key = `token:${token}`;
    return await this.cacheManager.get<string>(key);
  }

  async deleteToken(token: string): Promise<void> {
    const key = `token:${token}`;
    await this.cacheManager.del(key);
  }
}
