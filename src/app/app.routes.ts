import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'vehicles',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
  },
  {
    path: 'vehicles/add',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent)
  },
  {
    path: 'vehicles/edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent)
  },
  {
    path: 'buyers',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/buyers/buyer-list/buyer-list.component').then(m => m.BuyerListComponent)
  },
  {
    path: 'sellers',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/sellers/seller-list/seller-list.component').then(m => m.SellerListComponent)
  },
  {
    path: 'invoices',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/invoices/invoice-create/invoice-create.component').then(m => m.InvoiceCreateComponent)
  },
  {
    path: 'invoices/view/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/invoices/invoice-view/invoice-view.component').then(m => m.InvoiceViewComponent)
  },
  {
    path: 'expenses',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent)
  },
  {
    path: 'ledger',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/ledger/ledger-list/ledger-list.component').then(m => m.LedgerListComponent)
  },
  {
    path: 'search',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/search/search-results/search-results.component').then(m => m.SearchResultsComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
