import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUsername = this.authService.getCurrentUser();

    this.profileForm = this.fb.group({
      username: [currentUsername, [Validators.required, Validators.minLength(4)]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.authService.updateProfile(this.profileForm.value.username);
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
    }
  }

  onUpdatePassword(): void {
    if (this.passwordForm.valid) {
      this.authService.updatePassword(this.passwordForm.value.newPassword);
      this.passwordForm.reset();
      this.snackBar.open('Password updated successfully!', 'Close', { duration: 3000 });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }
}
