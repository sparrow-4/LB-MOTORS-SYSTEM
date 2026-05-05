import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { LedgerEntry } from '../../shared/models/ledger.model';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {
  private readonly STORAGE_KEY = 'lb_motors_ledger';
  private ledgerSubject = new BehaviorSubject<LedgerEntry[]>([]);
  ledger$ = this.ledgerSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadLedger();
  }

  private loadLedger(): void {
    const entries = this.storage.get<LedgerEntry>(this.STORAGE_KEY);
    this.ledgerSubject.next(entries);
  }

  getAll(): LedgerEntry[] {
    return this.ledgerSubject.value;
  }

  addEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
    const newEntry: LedgerEntry = {
      ...entry,
      id: this.storage.generateId(),
      createdAt: new Date().toISOString()
    };
    
    const current = this.getAll();
    const updated = [...current, newEntry];
    
    this.storage.set(this.STORAGE_KEY, updated);
    this.ledgerSubject.next(updated);
    
    return newEntry;
  }

  getRunningBalance(): number {
    return this.getAll().reduce((balance, entry) => {
      return entry.type === 'credit' 
        ? balance + entry.amount 
        : balance - entry.amount;
    }, 0);
  }
}
