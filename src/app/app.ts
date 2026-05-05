import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  searchQuery = '';
  isAuthenticated$;

  constructor(private router: Router, private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  onSearch(event: any): void {
    if (event.key === 'Enter' && this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Vehicles', icon: 'directions_car', route: '/vehicles' },
    { label: 'Buyers', icon: 'person_outline', route: '/buyers' },
    { label: 'Sellers', icon: 'storefront', route: '/sellers' },
    { label: 'Invoices', icon: 'receipt_long', route: '/invoices' },
    { label: 'Expenses', icon: 'money_off', route: '/expenses' },
    { label: 'Ledger', icon: 'account_balance_wallet', route: '/ledger' },
    { label: 'Profile', icon: 'manage_accounts', route: '/profile' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
