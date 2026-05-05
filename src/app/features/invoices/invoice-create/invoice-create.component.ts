import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VehicleService } from '../../../core/services/vehicle.service';
import { SellerService } from '../../../core/services/seller.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { Seller } from '../../../shared/models/seller.model';
import { GstType } from '../../../shared/models/invoice.model';

@Component({
  selector: 'app-invoice-create',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.css'
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm!: FormGroup;
  availableVehicles: Vehicle[] = [];
  sellers: Seller[] = [];

  selectedVehicle: Vehicle | null = null;
  selectedSeller: Seller | null = null;

  // Computed values
  basePrice = 0;
  gstPercent = 18;
  gstType: GstType = 'intra-state';
  cgst = 0;
  sgst = 0;
  igst = 0;
  totalAmount = 0;

  today = new Date();

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private sellerService: SellerService,
    private invoiceService: InvoiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.availableVehicles = this.vehicleService.getAvailableVehicles();
    this.sellers = this.sellerService.getAll();

    this.invoiceForm = this.fb.group({
      vehicleId: ['', Validators.required],
      buyerId: ['', Validators.required],
      basePrice: [0, [Validators.required, Validators.min(1)]],
      gstPercent: [18, [Validators.required, Validators.min(0), Validators.max(28)]],
      gstType: ['intra-state', Validators.required],
      notes: ['']
    });

    // Recalculate when form changes
    this.invoiceForm.valueChanges.subscribe(() => this.calculateTotals());
  }

  onVehicleChange(): void {
    const vehicleId = this.invoiceForm.get('vehicleId')?.value;
    this.selectedVehicle = this.availableVehicles.find(v => v.id === vehicleId) || null;
    if (this.selectedVehicle) {
      this.invoiceForm.patchValue({ basePrice: this.selectedVehicle.price });
    }
  }

  onBuyerChange(): void {
    const sellerId = this.invoiceForm.get('buyerId')?.value;
    this.selectedSeller = this.sellers.find(s => s.id === sellerId) || null;
  }

  calculateTotals(): void {
    this.basePrice = this.invoiceForm.get('basePrice')?.value || 0;
    this.gstPercent = this.invoiceForm.get('gstPercent')?.value || 0;
    this.gstType = this.invoiceForm.get('gstType')?.value || 'intra-state';

    const gstAmount = (this.basePrice * this.gstPercent) / 100;

    if (this.gstType === 'intra-state') {
      this.cgst = gstAmount / 2;
      this.sgst = gstAmount / 2;
      this.igst = 0;
    } else {
      this.cgst = 0;
      this.sgst = 0;
      this.igst = gstAmount;
    }

    this.totalAmount = this.basePrice + gstAmount;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    if (!this.selectedVehicle || !this.selectedSeller) {
      this.snackBar.open('Please select a vehicle and seller', 'Close', { duration: 3000 });
      return;
    }

    const invoiceData = {
      vehicleId: this.selectedVehicle.id,
      vehicleName: this.selectedVehicle.model,
      vehicleNumber: this.selectedVehicle.vehicleNumber,
      buyerId: this.selectedSeller.id,
      buyerName: this.selectedSeller.name,
      buyerPhone: this.selectedSeller.phone,
      buyerAddress: this.selectedSeller.address,
      basePrice: this.basePrice,
      gstPercent: this.gstPercent,
      gstType: this.gstType,
      cgst: this.cgst,
      sgst: this.sgst,
      igst: this.igst,
      totalAmount: this.totalAmount,
      notes: this.invoiceForm.get('notes')?.value || ''
    };

    const invoice = this.invoiceService.create(invoiceData);
    this.snackBar.open('Invoice generated successfully!', 'Close', { duration: 3000 });
    this.router.navigate(['/invoices/view', invoice.id]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
