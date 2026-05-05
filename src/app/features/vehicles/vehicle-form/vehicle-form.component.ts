import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { VehicleType } from '../../../shared/models/vehicle.model';
import { Buyer } from '../../../shared/models/buyer.model';

@Component({
  selector: 'app-vehicle-form',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatIconModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css'
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;
  isEditMode = false;
  vehicleId: string | null = null;
  vehicleTypes: VehicleType[] = ['Car', 'Bike'];
  buyers: Buyer[] = [];
  
  uploadedDoc: any = null;
  filePreviewUrl: string | null = null;
  selectedFile: File | null = null;
  estimatedProfit: number | null = null;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private buyerService: BuyerService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buyers = this.buyerService.getAll();

    this.vehicleForm = this.fb.group({
      vehicleNumber: ['', [Validators.required, Validators.minLength(3)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Car', Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(1)]],
      salesPrice: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      buyerId: ['']
    });

    // Profit calculation
    this.vehicleForm.valueChanges.subscribe(val => {
      if (val.purchasePrice && val.salesPrice) {
        this.estimatedProfit = val.salesPrice - val.purchasePrice;
      } else {
        this.estimatedProfit = null;
      }
    });

    // Auto-convert vehicle number to uppercase
    this.vehicleForm.get('vehicleNumber')?.valueChanges.subscribe(val => {
      if (val) {
        this.vehicleForm.get('vehicleNumber')?.setValue(val.toUpperCase(), { emitEvent: false });
      }
    });

    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      this.isEditMode = true;
      const vehicle = this.vehicleService.getById(this.vehicleId);
      if (vehicle) {
        this.vehicleForm.patchValue(vehicle);
        if (vehicle.document) {
          this.uploadedDoc = vehicle.document;
        }
      }
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      this.uploadedDoc = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadedDoc = null;
    this.filePreviewUrl = null;
  }

  async onSubmit(): Promise<void> {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const formData = { ...this.vehicleForm.value };
    
    // Handle file upload if a new file was selected
    if (this.selectedFile) {
      try {
        const base64 = await this.toBase64(this.selectedFile);
        const fileName = `RC_${formData.vehicleNumber}_${Date.now()}_${this.selectedFile.name}`;
        const filePath = await (window as any).electronAPI.saveDocument('vehicles', '', fileName, base64);
        
        if (filePath) {
          formData.document = {
            fileName: this.selectedFile.name,
            filePath: filePath,
            fileType: this.selectedFile.type,
            fileSize: this.selectedFile.size
          };
        }
      } catch (error) {
        console.error('Error saving RC document:', error);
        this.snackBar.open('Failed to save RC document', 'Close', { duration: 3000 });
      }
    } else if (this.uploadedDoc) {
      formData.document = this.uploadedDoc;
    }

    if (this.isEditMode && this.vehicleId) {
      this.vehicleService.update(this.vehicleId, formData);
      this.snackBar.open('Vehicle updated successfully', 'Close', { duration: 3000 });
    } else {
      this.vehicleService.add(formData);
      this.snackBar.open('Vehicle added successfully', 'Close', { duration: 3000 });
    }

    this.router.navigate(['/vehicles']);
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getError(field: string): string {
    const control = this.vehicleForm.get(field);
    if (control?.hasError('required')) return `${this.getFieldLabel(field)} is required`;
    if (control?.hasError('minlength')) return `Minimum ${control.errors?.['minlength']?.requiredLength} characters`;
    if (control?.hasError('min')) return 'Must be greater than 0';
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      vehicleNumber: 'Vehicle number',
      model: 'Make & model',
      type: 'Vehicle type',
      purchasePrice: 'Purchase price',
      salesPrice: 'Sales price'
    };
    return labels[field] || field;
  }
}
