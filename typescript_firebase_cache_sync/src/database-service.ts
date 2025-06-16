// src/database-service.ts
import { Database, ref, set, get, child, DataSnapshot } from "firebase/database";
import { database } from './firebase-init';

class DatabaseService {
  private dbInstance: Database;

  constructor() {
    this.dbInstance = database;
  }

  async updateUserCache(userId: string, cacheData: Record<string, any>): Promise<void> {
    if (!userId) {
      console.error('User ID is required to update cache.');
      return;
    }
    try {
      const userCacheRef = ref(this.dbInstance, `user_caches/${userId}`);
      await set(userCacheRef, cacheData);
      console.log(`Cache updated successfully for user ${userId}`);
    } catch (error: any) {
      console.error('Error updating cache:', error.message);
      throw error;
    }
  }

  async getUserCache(userId: string): Promise<Record<string, any> | null> {
    if (!userId) {
      console.error('User ID is required to get cache.');
      return null;
    }
    try {
      const dbRefRoot = ref(this.dbInstance);
      const snapshot: DataSnapshot = await get(child(dbRefRoot, `user_caches/${userId}`));
      if (snapshot.exists()) {
        return snapshot.val() as Record<string, any>;
      } else {
        console.log(`No cache found for user ${userId}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error reading cache:', error.message);
      throw error;
    }
  }
}
export const databaseService = new DatabaseService();
