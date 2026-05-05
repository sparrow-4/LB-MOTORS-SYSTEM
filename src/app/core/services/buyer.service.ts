import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Buyer } from '../../shared/models/buyer.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'lb_motors_buyers';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private buyersSubject = new BehaviorSubject<Buyer[]>([]);
  buyers$: Observable<Buyer[]> = this.buyersSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const buyers = this.storage.get<Buyer>(STORAGE_KEY);
    this.buyersSubject.next(buyers);
  }

  private saveToStorage(buyers: Buyer[]): void {
    this.storage.set(STORAGE_KEY, buyers);
    this.buyersSubject.next(buyers);
  }

  getAll(): Buyer[] {
    return this.buyersSubject.getValue();
  }

  getById(id: string): Buyer | undefined {
    return this.getAll().find(b => b.id === id);
  }

  add(buyer: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Buyer {
    const now = new Date().toISOString();
    const newBuyer: Buyer = {
      ...buyer,
      id: this.storage.generateId(),
      createdAt: now,
      updatedAt: now
    };
    const buyers = [...this.getAll(), newBuyer];
    this.saveToStorage(buyers);
    return newBuyer;
  }

  update(id: string, updates: Partial<Buyer>): Buyer | undefined {
    const buyers = this.getAll();
    const index = buyers.findIndex(b => b.id === id);
    if (index === -1) return undefined;

    buyers[index] = {
      ...buyers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage([...buyers]);
    return buyers[index];
  }

  delete(id: string): void {
    const buyers = this.getAll().filter(b => b.id !== id);
    this.saveToStorage(buyers);
  }
}
