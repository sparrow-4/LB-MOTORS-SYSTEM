import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Vehicle, VehicleType } from '../../../shared/models/vehicle.model';

@Component({
  selector: 'app-vehicle-list',
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatIconModule, MatTableModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatPaginatorModule, MatMenuModule, MatSnackBarModule
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  pagedVehicles: Vehicle[] = [];

  displayedColumns = ['vehicleNumber', 'buyer', 'seller', 'model', 'type', 'price', 'status', 'actions'];

  // Filters
  searchNumber = '';
  searchModel = '';
  searchBuyer = '';
  searchSeller = '';
  filterType: VehicleType | '' = '';
  filterPriceRange = '';

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  showAll = false;

  constructor(
    private vehicleService: VehicleService,
    private buyerService: BuyerService,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.showAll = params['all'] === 'true';
      this.applyFilters();
    });

    this.vehicleService.vehicles$.subscribe(vehicles => {
      this.vehicles = vehicles;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.vehicles];

    if (this.searchNumber.trim()) {
      result = result.filter(v =>
        v.vehicleNumber.toLowerCase().includes(this.searchNumber.toLowerCase())
      );
    }

    if (this.searchModel.trim()) {
      result = result.filter(v =>
        v.model.toLowerCase().includes(this.searchModel.toLowerCase())
      );
    }

    if (this.searchBuyer.trim()) {
      result = result.filter(v =>
        this.getBuyerName(v).toLowerCase().includes(this.searchBuyer.toLowerCase())
      );
    }

    if (this.searchSeller.trim()) {
      result = result.filter(v =>
        this.getSellerName(v).toLowerCase().includes(this.searchSeller.toLowerCase())
      );
    }

    if (this.filterType) {
      result = result.filter(v => v.type === this.filterType);
    }

    if (this.filterPriceRange) {
      const [min, max] = this.filterPriceRange.split('-').map(Number);
      result = result.filter(v => {
        const p = v.salesPrice || 0;
        if (max) return p >= min && p <= max;
        return p >= min;
      });
    }

    // Sort by newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredVehicles = result;
    this.totalItems = result.length;
    
    if (this.showAll) {
      this.pageIndex = 0;
    }
    
    this.updatePagedData();
  }

  updatePagedData(): void {
    if (this.showAll) {
      const start = this.pageIndex * this.pageSize;
      this.pagedVehicles = this.filteredVehicles.slice(start, start + this.pageSize);
    } else {
      this.pagedVehicles = this.filteredVehicles.slice(0, 10);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedData();
  }

  toggleShowAll(): void {
    if (this.showAll) {
      this.router.navigate(['/vehicles']);
    } else {
      this.router.navigate(['/vehicles'], { queryParams: { all: 'true' } });
    }
  }

  clearFilters(): void {
    this.searchNumber = '';
    this.searchModel = '';
    this.searchBuyer = '';
    this.searchSeller = '';
    this.filterType = '';
    this.filterPriceRange = '';
    this.showAll = false;
    this.applyFilters();
  }

  onViewDocument(vehicle: Vehicle): void {
    if (vehicle.document && vehicle.document.filePath) {
      (window as any).electronAPI.openFile(vehicle.document.filePath).then((success: boolean) => {
        if (!success) {
          this.snackBar.open('Could not open document. File might have been moved or deleted.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteVehicle(id: string): void {
    this.vehicleService.delete(id);
    this.snackBar.open('Vehicle deleted successfully', 'Close', { duration: 3000 });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  get totalFleetValue(): number {
    return this.vehicleService.getTotalFleetValue();
  }

  get availableCount(): number {
    return this.vehicleService.getAvailableCount();
  }

  get soldCount(): number {
    return this.vehicleService.getSoldCount();
  }

  get carCount(): number {
    return this.vehicles.filter(v => v.type === 'Car').length;
  }

  get bikeCount(): number {
    return this.vehicles.filter(v => v.type === 'Bike').length;
  }

  getBuyerName(vehicle: Vehicle): string {
    if (!vehicle.buyerId) return '-';
    const buyer = this.buyerService.getById(vehicle.buyerId);
    return buyer ? buyer.name : '-';
  }

  getSellerName(vehicle: Vehicle): string {
    const invoices = this.invoiceService.getAll().filter(i => i.vehicleId === vehicle.id);
    if (invoices.length > 0) {
      const latest = invoices[invoices.length - 1];
      return latest.buyerName;
    }
    return '-';
  }
}
