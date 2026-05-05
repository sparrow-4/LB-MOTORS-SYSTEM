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
      price: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      buyerId: ['']
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
      }
    }
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const formData = this.vehicleForm.value;

    if (this.isEditMode && this.vehicleId) {
      this.vehicleService.update(this.vehicleId, formData);
      this.snackBar.open('Vehicle updated successfully', 'Close', { duration: 3000 });
    } else {
      this.vehicleService.add(formData);
      this.snackBar.open('Vehicle added successfully', 'Close', { duration: 3000 });
    }

    this.router.navigate(['/vehicles']);
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
      price: 'Price'
    };
    return labels[field] || field;
  }
}
