import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { SellerService } from '../../../core/services/seller.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatSnackBarModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent implements OnInit {
  searchQuery = '';
  
  vehicle: any = null;
  invoices: any[] = [];
  relatedBuyer: any = null;
  relatedSeller: any = null;
  
  matchingBuyers: any[] = [];
  matchingSellers: any[] = [];

  invoiceColumns = ['date', 'invoiceNumber', 'buyerName', 'amount'];

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private invoiceService: InvoiceService,
    private buyerService: BuyerService,
    private sellerService: SellerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.performSearch();
      }
    });
  }

  performSearch(): void {
    const query = this.searchQuery.toLowerCase();
    
    // Find vehicle by number or model
    this.vehicle = this.vehicleService.getAll().find(v => 
      v.vehicleNumber.toLowerCase() === query || 
      v.vehicleNumber.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    );

    if (this.vehicle) {
      // 1. Resolve Origin Buyer (Purchased From)
      if (this.vehicle.buyerId) {
        this.relatedBuyer = this.buyerService.getById(this.vehicle.buyerId);
      }

      // 2. Resolve Destination Seller (Sold To) from invoices
      this.invoices = this.invoiceService.getAll().filter(i => i.vehicleId === this.vehicle.id);
      if (this.invoices.length > 0) {
        const latestInvoice = this.invoices[this.invoices.length - 1];
        // Note: Invoice model calls it buyerId, but it stores the destination Seller ID
        this.relatedSeller = this.sellerService.getById(latestInvoice.buyerId);
      }
    }

    // Also search across all Buyers
    this.matchingBuyers = this.buyerService.getAll().filter(b => 
      b.name.toLowerCase().includes(query) || 
      b.phone.includes(query) || 
      b.aadhaarNumber.includes(query)
    );

    // Also search across all Sellers
    this.matchingSellers = this.sellerService.getAll().filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.phone.includes(query) || 
      s.aadhaarNumber.includes(query)
    );
  }

  openNativeFile(filePath: string): void {
    if (!filePath) {
      this.snackBar.open('Document file path not found', 'Close', { duration: 3000 });
      return;
    }
    
    (window as any).electronAPI.openFile(filePath).then((success: boolean) => {
      if (!success) {
        this.snackBar.open('Could not open document. The file may have been moved or deleted.', 'Close', { duration: 3000 });
      }
    });
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
}
