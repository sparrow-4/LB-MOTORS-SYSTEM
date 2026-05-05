import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Invoice } from '../../shared/models/invoice.model';
import { StorageService } from './storage.service';
import { VehicleService } from './vehicle.service';
import { LedgerService } from './ledger.service';

const STORAGE_KEY = 'lb_motors_invoices';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  invoices$: Observable<Invoice[]> = this.invoicesSubject.asObservable();

  constructor(
    private storage: StorageService,
    private vehicleService: VehicleService,
    private ledgerService: LedgerService
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const invoices = this.storage.get<Invoice>(STORAGE_KEY);
    this.invoicesSubject.next(invoices);
  }

  private saveToStorage(invoices: Invoice[]): void {
    this.storage.set(STORAGE_KEY, invoices);
    this.invoicesSubject.next(invoices);
  }

  getAll(): Invoice[] {
    return this.invoicesSubject.getValue();
  }

  getById(id: string): Invoice | undefined {
    return this.getAll().find(i => i.id === id);
  }

  generateInvoiceNumber(): string {
    const count = this.getAll().length + 1;
    const year = new Date().getFullYear();
    return `LBM-INV-${year}-${count.toString().padStart(4, '0')}`;
  }

  create(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: this.storage.generateId(),
      invoiceNumber: this.generateInvoiceNumber(),
      createdAt: new Date().toISOString()
    };

    // Mark vehicle as sold
    this.vehicleService.updateStatus(invoiceData.vehicleId, 'Sold');

    const invoices = [...this.getAll(), newInvoice];
    this.saveToStorage(invoices);

    this.ledgerService.addEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'credit',
      amount: newInvoice.totalAmount,
      description: `Invoice: ${newInvoice.invoiceNumber} for ${newInvoice.vehicleName}`,
      referenceId: newInvoice.id
    });

    return newInvoice;
  }

  delete(id: string): void {
    const invoices = this.getAll().filter(i => i.id !== id);
    this.saveToStorage(invoices);
  }

  getTotalRevenue(): number {
    return this.getAll().reduce((sum, i) => sum + i.totalAmount, 0);
  }

  getRecentInvoices(limit: number = 5): Invoice[] {
    return this.getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
