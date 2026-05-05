import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LedgerService } from '../../../core/services/ledger.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { LedgerEntry } from '../../../shared/models/ledger.model';
import { FormsModule } from '@angular/forms';

export interface LedgerEntryWithBalance extends LedgerEntry {
  balance: number;
}

@Component({
  selector: 'app-ledger-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, MatTableModule, MatPaginatorModule, FormsModule
  ],
  templateUrl: './ledger-list.component.html',
  styleUrl: './ledger-list.component.css'
})
export class LedgerListComponent implements OnInit {
  entries: LedgerEntryWithBalance[] = [];
  pagedEntries: LedgerEntryWithBalance[] = [];

  displayedColumns = ['date', 'description', 'credit', 'debit', 'balance'];

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  runningBalance = 0;
  totalProfit = 0;

  // Filters
  startDate = '';
  endDate = '';

  constructor(
    private ledgerService: LedgerService,
    private invoiceService: InvoiceService,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.ledgerService.ledger$.subscribe(() => {
      this.applyFilters();
    });
  }

  setYesterday(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    this.startDate = dateStr;
    this.endDate = dateStr;
    this.applyFilters();
  }

  setToday(): void {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.ledgerService.getAll();

    if (this.startDate) {
      result = result.filter(e => e.date >= this.startDate);
    }
    if (this.endDate) {
      result = result.filter(e => e.date <= this.endDate);
    }

    // Sort oldest to newest to calculate running balance correctly for the view
    const sortedEntries = [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentBalance = 0;
    let credits = 0;
    let debits = 0;

    const computedEntries: LedgerEntryWithBalance[] = sortedEntries.map(entry => {
      if (entry.type === 'credit') {
        credits += entry.amount;
        currentBalance += entry.amount;
      } else {
        debits += entry.amount;
        currentBalance -= entry.amount;
      }
      return { ...entry, balance: currentBalance };
    });
    
    this.entries = computedEntries.reverse();
    this.totalItems = this.entries.length;
    this.runningBalance = currentBalance;
    this.totalProfit = credits - debits;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedEntries = this.entries.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedData();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  }
}
