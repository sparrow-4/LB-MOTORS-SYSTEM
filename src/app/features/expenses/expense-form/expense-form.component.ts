import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-expense-form',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Expense</h2>
    
    <mat-dialog-content class="p-6">
      <form [formGroup]="expenseForm" class="flex flex-col gap-4 mt-2">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Date *</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" required>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="expenseForm.get('date')?.hasError('required')">Date is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Title *</mat-label>
          <input matInput formControlName="title" placeholder="e.g. Office Rent" required>
          <mat-error *ngIf="expenseForm.get('title')?.hasError('required')">Title is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Category *</mat-label>
          <mat-select formControlName="category" required>
            <mat-option value="General">General</mat-option>
            <mat-option value="Maintenance">Maintenance</mat-option>
            <mat-option value="Marketing">Marketing</mat-option>
            <mat-option value="Salaries">Salaries</mat-option>
            <mat-option value="Utilities">Utilities</mat-option>
          </mat-select>
          <mat-error *ngIf="expenseForm.get('category')?.hasError('required')">Category is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Amount (INR) *</mat-label>
          <input matInput type="number" formControlName="amount" required min="1">
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('required')">Amount is required</mat-error>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('min')">Amount must be greater than 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions class="flex justify-between px-6 pb-6">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="expenseForm.invalid" (click)="onSubmit()">Save Expense</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field { width: 100%; }
    .mat-mdc-dialog-content { padding-top: 10px !important; }
  `]
})
export class ExpenseFormComponent implements OnInit {
  expenseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.expenseForm = this.fb.group({
      date: [today, Validators.required],
      title: ['', Validators.required],
      category: ['General', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = { ...this.expenseForm.value };
      
      // format date to YYYY-MM-DD
      const d = new Date(formValue.date);
      formValue.date = d.toISOString().split('T')[0];

      this.dialogRef.close(formValue);
    } else {
      this.expenseForm.markAllAsTouched();
    }
  }
}
