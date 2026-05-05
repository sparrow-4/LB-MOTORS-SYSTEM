import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Seller } from '../../shared/models/seller.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'lb_motors_sellers';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private sellersSubject = new BehaviorSubject<Seller[]>([]);
  sellers$: Observable<Seller[]> = this.sellersSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const sellers = this.storage.get<Seller>(STORAGE_KEY);
    this.sellersSubject.next(sellers);
  }

  private saveToStorage(sellers: Seller[]): void {
    this.storage.set(STORAGE_KEY, sellers);
    this.sellersSubject.next(sellers);
  }

  getAll(): Seller[] {
    return this.sellersSubject.getValue();
  }

  getById(id: string): Seller | undefined {
    return this.getAll().find(s => s.id === id);
  }

  add(seller: Omit<Seller, 'id' | 'createdAt' | 'updatedAt'>): Seller {
    const now = new Date().toISOString();
    const newSeller: Seller = {
      ...seller,
      id: this.storage.generateId(),
      createdAt: now,
      updatedAt: now
    };
    const sellers = [...this.getAll(), newSeller];
    this.saveToStorage(sellers);
    return newSeller;
  }

  update(id: string, updates: Partial<Seller>): Seller | undefined {
    const sellers = this.getAll();
    const index = sellers.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    sellers[index] = {
      ...sellers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage([...sellers]);
    return sellers[index];
  }

  delete(id: string): void {
    const sellers = this.getAll().filter(s => s.id !== id);
    this.saveToStorage(sellers);
  }

  incrementVehicleCount(id: string): void {
    const seller = this.getById(id);
    if (seller) {
      this.update(id, { totalVehiclesSupplied: seller.totalVehiclesSupplied + 1 });
    }
  }
}
