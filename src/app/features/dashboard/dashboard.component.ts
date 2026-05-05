import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { VehicleService } from '../../core/services/vehicle.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ExpenseService } from '../../core/services/expense.service';
import { Invoice } from '../../shared/models/invoice.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule, MatTableModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalVehicles = 0;
  vehiclesSold = 0;
  availableVehicles = 0;
  totalRevenue = 0;
  totalFleetValue = 0;
  totalExpenses = 0;
  totalProfit = 0;
  totalLoss = 0;
  profitLoss = 0;
  todaySummary = 0;
  recentInvoices: Invoice[] = [];

  displayedColumns = ['date', 'vehicle', 'type', 'buyer', 'amount'];

  constructor(
    private vehicleService: VehicleService,
    private invoiceService: InvoiceService,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.totalVehicles = this.vehicleService.getTotalCount();
    this.vehiclesSold = this.vehicleService.getSoldCount();
    this.availableVehicles = this.vehicleService.getAvailableCount();
    this.totalRevenue = this.invoiceService.getTotalRevenue();
    this.totalFleetValue = this.vehicleService.getTotalFleetValue();
    this.totalExpenses = this.expenseService.getTotalExpenses();
    
    // Logic for Profit and Loss Boxes
    const invoices = this.invoiceService.getAll();
    const expenses = this.expenseService.getAll();
    
    this.totalProfit = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    this.totalLoss = expenses.reduce((sum, e) => sum + e.amount, 0);
    this.profitLoss = this.totalProfit - this.totalLoss;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = this.invoiceService.getAll()
      .filter(i => i.createdAt.startsWith(today))
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const todayExpenses = this.expenseService.getDailyTotal(today);
    this.todaySummary = todayRevenue - todayExpenses;
    
    this.recentInvoices = this.invoiceService.getRecentInvoices(5);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
