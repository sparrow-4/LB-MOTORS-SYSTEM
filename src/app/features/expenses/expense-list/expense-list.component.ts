import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense } from '../../../shared/models/expense.model';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';

@Component({
  selector: 'app-expense-list',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatTableModule, MatButtonModule,
    MatPaginatorModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  pagedExpenses: Expense[] = [];

  displayedColumns = ['date', 'title', 'category', 'amount', 'actions'];

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.expenseService.expenses$.subscribe(expenses => {
      this.expenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.totalItems = this.expenses.length;
      this.updatePagedData();
    });
  }

  updatePagedData(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedExpenses = this.expenses.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedData();
  }

  openExpenseDialog(): void {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
      width: '100%',
      maxWidth: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.expenseService.add(result);
        this.snackBar.open('Expense added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteExpense(id: string): void {
    this.expenseService.delete(id);
    this.snackBar.open('Expense deleted', 'Close', { duration: 3000 });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  }
}
