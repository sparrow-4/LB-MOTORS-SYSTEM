import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SellerService } from '../../../core/services/seller.service';
import { IpcService } from '../../../core/services/ipc.service';
import { Seller } from '../../../shared/models/seller.model';
import { UploadedDocument } from '../../../shared/models/buyer.model';

@Component({
  selector: 'app-seller-list',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatTableModule, MatButtonModule,
    MatPaginatorModule, MatMenuModule, MatSnackBarModule
  ],
  templateUrl: './seller-list.component.html',
  styleUrl: './seller-list.component.css'
})
export class SellerListComponent implements OnInit {
  sellers: Seller[] = [];
  filteredSellers: Seller[] = [];
  pagedSellers: Seller[] = [];

  displayedColumns = ['name', 'phone', 'aadhaarNumber', 'totalVehicles', 'actions'];

  searchQuery = '';
  showForm = false;
  isEditing = false;
  editingSellerId: string | null = null;

  sellerForm!: FormGroup;
  uploadedDoc: UploadedDocument | null = null;
  filePreviewUrl: string | null = null;

  // Pagination
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private sellerService: SellerService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ipc: IpcService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.sellerService.sellers$.subscribe(sellers => {
      this.sellers = sellers;
      this.applyFilter();
    });
  }

  initForm(): void {
    this.sellerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]]
    });
  }

  applyFilter(): void {
    let result = [...this.sellers];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.aadhaarNumber.includes(q)
      );
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.filteredSellers = result;
    this.totalItems = result.length;
    this.pageIndex = 0;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedSellers = this.filteredSellers.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedData();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.sellerForm.reset();
    this.isEditing = false;
    this.editingSellerId = null;
    this.uploadedDoc = null;
    this.filePreviewUrl = null;
  }

  editSeller(seller: Seller): void {
    this.isEditing = true;
    this.editingSellerId = seller.id;
    this.showForm = true;
    this.sellerForm.patchValue(seller);
    if (seller.document) {
      this.uploadedDoc = seller.document;
      this.ipc.getDocument(seller.document.base64Content).then(data => {
        this.filePreviewUrl = data || seller.document!.base64Content;
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.uploadedDoc = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Content: base64,
        uploadedAt: new Date().toISOString()
      };
      this.filePreviewUrl = base64;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.uploadedDoc = null;
    this.filePreviewUrl = null;
  }

  async onSubmit(): Promise<void> {
    if (this.sellerForm.invalid) {
      this.sellerForm.markAllAsTouched();
      return;
    }

    let finalDoc = this.uploadedDoc;
    // Generate or use existing ID for the folder path
    const entityId = this.editingSellerId || Date.now().toString(36);

    if (finalDoc && finalDoc.base64Content.startsWith('data:')) {
      const filePath = await this.ipc.saveDocument('sellers', entityId, finalDoc.fileName, finalDoc.base64Content);
      if (filePath) {
        finalDoc = { ...finalDoc, base64Content: filePath };
      }
    }

    const formData = {
      ...this.sellerForm.value,
      totalVehiclesSupplied: 0,
      document: finalDoc || undefined
    };

    if (this.isEditing && this.editingSellerId) {
      const existing = this.sellerService.getById(this.editingSellerId);
      formData.totalVehiclesSupplied = existing?.totalVehiclesSupplied || 0;
      this.sellerService.update(this.editingSellerId, formData);
      this.snackBar.open('Seller updated successfully', 'Close', { duration: 3000 });
    } else {
      this.sellerService.add(formData);
      this.snackBar.open('Seller added successfully', 'Close', { duration: 3000 });
    }

    this.showForm = false;
    this.resetForm();
  }

  deleteSeller(id: string): void {
    this.sellerService.delete(id);
    this.snackBar.open('Seller deleted successfully', 'Close', { duration: 3000 });
  }

  onViewDocument(seller: Seller): void {
    if (seller.document?.base64Content) {
      this.ipc.openFile(seller.document.base64Content);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getError(field: string): string {
    const control = this.sellerForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength')) return `Minimum ${control.errors?.['minlength']?.requiredLength} characters`;
    if (control?.hasError('pattern')) {
      if (field === 'phone') return 'Enter valid 10-digit phone number';
      if (field === 'aadhaarNumber') return 'Enter valid 12-digit Aadhaar number';
    }
    return '';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
