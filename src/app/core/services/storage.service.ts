import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private cache: { [key: string]: any[] } = {};

  constructor(private ipc: IpcService) {}

  async initialize(): Promise<void> {
    const keys = ['lb_motors_vehicles', 'lb_motors_buyers', 'lb_motors_sellers', 'lb_motors_invoices', 'lb_motors_expenses', 'lb_motors_ledger'];
    const storageKeys = ['vehicles', 'buyers', 'sellers', 'invoices', 'expenses', 'ledger'];

    for (let i=0; i<keys.length; i++) {
        const electronKey = storageKeys[i];
        const data = await this.ipc.readData(electronKey);
        this.cache[keys[i]] = data || [];
    }
  }

  get<T>(key: string): T[] {
    return this.cache[key] || [];
  }

  set<T>(key: string, data: T[]): void {
    this.cache[key] = data;
    const electronKey = key.replace('lb_motors_', '');
    this.ipc.writeData(electronKey, data);
  }

  clear(key: string): void {
    this.cache[key] = [];
    const electronKey = key.replace('lb_motors_', '');
    this.ipc.writeData(electronKey, []);
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
