import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    // Check local storage for existing session
    const stored = localStorage.getItem('lbmotors_auth');
    if (stored === 'true') {
      this.isAuthenticatedSubject.next(true);
    }
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(user: string, pass: string): boolean {
    const currentPass = localStorage.getItem('lbmotors_pass') || '1234';
    const currentUser = localStorage.getItem('lbmotors_user') || 'lbmotors';
    
    if (user === currentUser && pass === currentPass) {
      this.isAuthenticatedSubject.next(true);
      localStorage.setItem('lbmotors_auth', 'true');
      return true;
    }
    return false;
  }

  getCurrentUser(): string {
    return localStorage.getItem('lbmotors_user') || 'lbmotors';
  }

  updateProfile(newUser: string): void {
    localStorage.setItem('lbmotors_user', newUser);
  }

  updatePassword(newPass: string): void {
    localStorage.setItem('lbmotors_pass', newPass);
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('lbmotors_auth');
    this.router.navigate(['/login']);
  }
}
