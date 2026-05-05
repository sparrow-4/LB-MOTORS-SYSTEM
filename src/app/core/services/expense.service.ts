import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { LedgerService } from './ledger.service';
import { Expense } from '../../shared/models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly STORAGE_KEY = 'lb_motors_expenses';
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  constructor(
    private storage: StorageService,
    private ledgerService: LedgerService
  ) {
    this.loadExpenses();
  }

  private loadExpenses(): void {
    const expenses = this.storage.get<Expense>(this.STORAGE_KEY);
    this.expensesSubject.next(expenses);
  }

  getAll(): Expense[] {
    return this.expensesSubject.value;
  }

  add(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: this.storage.generateId(),
      createdAt: new Date().toISOString()
    };
    
    const current = this.getAll();
    const updated = [...current, newExpense];
    
    this.storage.set(this.STORAGE_KEY, updated);
    this.expensesSubject.next(updated);
    
    this.ledgerService.addEntry({
      date: newExpense.date,
      type: 'debit',
      amount: newExpense.amount,
      description: `Expense: ${newExpense.title} (${newExpense.category})`,
      referenceId: newExpense.id
    });

    return newExpense;
  }

  delete(id: string): void {
    const updated = this.getAll().filter(e => e.id !== id);
    this.storage.set(this.STORAGE_KEY, updated);
    this.expensesSubject.next(updated);
  }

  getTotalExpenses(): number {
    return this.getAll().reduce((sum, e) => sum + e.amount, 0);
  }

  getDailyTotal(dateStr: string): number {
    return this.getAll()
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getMonthlyTotal(yearMonth: string): number { // format: 'YYYY-MM'
    return this.getAll()
      .filter(e => e.date.startsWith(yearMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  }
}
