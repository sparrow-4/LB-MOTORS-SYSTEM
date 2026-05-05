import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="login-wrapper">
      <!-- Main Login Card -->
      <div class="login-card">
        
        <!-- Logo Area -->
        <div class="logo-container">
          <div class="logo-box">
            <img src="lb-logo.jpg" alt="LB Motors Logo" class="login-logo-img" />
          </div>
        </div>

          <!-- Header -->
          <div class="header-text">
            <h1>Welcome back</h1>
            <p>Please enter your details to sign in.</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
            
            <!-- Username -->
            <div class="input-group">
              <label>Username</label>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username" 
                placeholder="Enter your username" 
                class="form-input"
                required
              >
            </div>

            <!-- Password -->
            <div class="input-group">
              <div class="password-header">
                <label>Password</label>
                <a href="#" (click)="$event.preventDefault()">Forgot password?</a>
              </div>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="••••••••" 
                class="form-input password-input"
                required
              >
            </div>

            <!-- Remember me -->
            <div class="remember-group">
              <input type="checkbox" id="remember">
              <label for="remember">Remember for 30 days</label>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="submit-btn"
              [disabled]="loginForm.invalid || isLoading"
            >
              <ng-container *ngIf="!isLoading">Sign in</ng-container>
              <ng-container *ngIf="isLoading">...</ng-container>
            </button>
            
          </form>
        </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .login-wrapper {
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      overflow: hidden;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem 2.5rem;
      background-color: #ffffff;
      border-radius: 1.5rem;
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
      border: 1px solid #f1f5f9;
      box-sizing: border-box;
      margin: 0 1rem;
    }

    @keyframes cardEntrance {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .logo-box {
      width: 120px;
      height: 120px;
      background-color: #ffffff;
      border-radius: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      border: 1px solid #f1f5f9;
      animation: logoPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes logoPop {
      0% { opacity: 0; transform: scale(0.5); }
      100% { opacity: 1; transform: scale(1); }
    }

    .login-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-text {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .header-text h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
    }

    .header-text p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }

    .password-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .password-header a {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;
    }

    .password-header a:hover {
      color: #0f172a;
    }

    .form-input {
      width: 100%;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 0.875rem 1rem;
      font-size: 0.875rem;
      color: #0f172a;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-input::placeholder {
      color: #94a3b8;
    }

    .form-input:focus {
      border-color: #94a3b8;
      box-shadow: 0 0 0 4px #f1f5f9;
      background-color: #ffffff;
    }

    .password-input {
      letter-spacing: 0.2em;
    }

    .remember-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .remember-group input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      border: 1px solid #cbd5e1;
      cursor: pointer;
    }

    .remember-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
      cursor: pointer;
      user-select: none;
    }

    .submit-btn {
      width: 100%;
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 600;
      border-radius: 0.75rem;
      padding: 0.875rem;
      margin-top: 0.5rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1);
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #1e293b;
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .submit-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.isLoading = true;

    // Simulate network delay for a premium feel
    setTimeout(() => {
      const success = this.authService.login(this.username, this.password);
      
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.isLoading = false;
        this.snackBar.open('Invalid username or password', 'Close', { 
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    }, 600);
  }
}
