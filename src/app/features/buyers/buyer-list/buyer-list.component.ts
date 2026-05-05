import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BuyerService } from '../../../core/services/buyer.service';
import { IpcService } from '../../../core/services/ipc.service';
import { Buyer, UploadedDocument } from '../../../shared/models/buyer.model';

@Component({
  selector: 'app-buyer-list',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatTableModule, MatButtonModule,
    MatPaginatorModule, MatMenuModule, MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './buyer-list.component.html',
  styleUrl: './buyer-list.component.css'
})
export class BuyerListComponent implements OnInit {
  buyers: Buyer[] = [];
  filteredBuyers: Buyer[] = [];
  pagedBuyers: Buyer[] = [];

  displayedColumns = ['name', 'phone', 'aadhaarNumber', 'actions'];

  searchQuery = '';
  showForm = false;
  isEditing = false;
  editingBuyerId: string | null = null;

  buyerForm!: FormGroup;
  uploadedDoc: UploadedDocument | null = null;
  filePreviewUrl: string | null = null;

  // Pagination
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private buyerService: BuyerService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ipc: IpcService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.buyerService.buyers$.subscribe(buyers => {
      this.buyers = buyers;
      this.applyFilter();
    });
  }

  initForm(): void {
    this.buyerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]]
    });
  }

  applyFilter(): void {
    let result = [...this.buyers];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.aadhaarNumber.includes(q)
      );
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.filteredBuyers = result;
    this.totalItems = result.length;
    this.pageIndex = 0;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedBuyers = this.filteredBuyers.slice(start, start + this.pageSize);
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
    this.buyerForm.reset();
    this.isEditing = false;
    this.editingBuyerId = null;
    this.uploadedDoc = null;
    this.filePreviewUrl = null;
  }

  editBuyer(buyer: Buyer): void {
    this.isEditing = true;
    this.editingBuyerId = buyer.id;
    this.showForm = true;
    this.buyerForm.patchValue(buyer);
    if (buyer.document) {
      this.uploadedDoc = buyer.document;
      this.ipc.getDocument(buyer.document.base64Content).then(data => {
        this.filePreviewUrl = data || buyer.document!.base64Content;
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
    if (this.buyerForm.invalid) {
      this.buyerForm.markAllAsTouched();
      return;
    }

    let finalDoc = this.uploadedDoc;
    // Generate or use existing ID for the folder path
    const entityId = this.editingBuyerId || Date.now().toString(36);

    // If it's a new upload (has base64)
    if (finalDoc && finalDoc.base64Content.startsWith('data:')) {
      const filePath = await this.ipc.saveDocument('buyers', entityId, finalDoc.fileName, finalDoc.base64Content);
      if (filePath) {
        finalDoc = { ...finalDoc, base64Content: filePath }; // Store local path instead of base64
      }
    }

    const formData = {
      ...this.buyerForm.value,
      document: finalDoc || undefined
    };

    if (this.isEditing && this.editingBuyerId) {
      this.buyerService.update(this.editingBuyerId, formData);
      this.snackBar.open('Buyer updated successfully', 'Close', { duration: 3000 });
    } else {
      this.buyerService.add(formData);
      this.snackBar.open('Buyer added successfully', 'Close', { duration: 3000 });
    }

    this.showForm = false;
    this.resetForm();
  }

  deleteBuyer(id: string): void {
    this.buyerService.delete(id);
    this.snackBar.open('Buyer deleted successfully', 'Close', { duration: 3000 });
  }

  onViewDocument(buyer: Buyer): void {
    if (buyer.document?.base64Content) {
      this.ipc.openFile(buyer.document.base64Content);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getError(field: string): string {
    const control = this.buyerForm.get(field);
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
