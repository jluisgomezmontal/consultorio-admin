import { db, SyncQueueItem } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export class SyncQueueRepository {
  async add(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<SyncQueueItem> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: uuidv4(),
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    await db.syncQueue.add(queueItem);
    return queueItem;
  }

  async getAll(): Promise<SyncQueueItem[]> {
    return await db.syncQueue.toArray();
  }

  async getPending(): Promise<SyncQueueItem[]> {
    return await db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('timestamp');
  }

  async getPendingByPriority(): Promise<SyncQueueItem[]> {
    const pending = await this.getPending();
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return pending.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }

  async getById(id: string): Promise<SyncQueueItem | undefined> {
    return await db.syncQueue.get(id);
  }

  async updateStatus(id: string, status: SyncQueueItem['status'], error?: string): Promise<void> {
    const updates: Partial<SyncQueueItem> = { status };
    if (error) updates.error = error;
    await db.syncQueue.update(id, updates);
  }

  async incrementRetries(id: string): Promise<void> {
    const item = await this.getById(id);
    if (item) {
      await db.syncQueue.update(id, { retries: item.retries + 1 });
    }
  }

  async updateRemoteId(id: string, remoteId: string): Promise<void> {
    await db.syncQueue.update(id, { remoteId, status: 'completed' });
  }

  async delete(id: string): Promise<void> {
    await db.syncQueue.delete(id);
  }

  async clearCompleted(): Promise<void> {
    const completed = await db.syncQueue
      .where('status')
      .equals('completed')
      .toArray();
    
    const ids = completed.map(item => item.id);
    await db.syncQueue.bulkDelete(ids);
  }

  async clearAll(): Promise<void> {
    await db.syncQueue.clear();
  }

  async getCount(): Promise<number> {
    return await db.syncQueue.count();
  }

  async getPendingCount(): Promise<number> {
    return await db.syncQueue.where('status').equals('pending').count();
  }
}

export const syncQueueRepository = new SyncQueueRepository();
