import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {}

  private hasToken(): boolean {
    return !!sessionStorage.getItem('token');
  }

  login(token: string, user: any): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    // Limpiar toda la información de sesión
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Actualizar estado de autenticación
    this.isLoggedInSubject.next(false);
    
    // Redirigir al login
    this.router.navigate(['/login']);
    
    console.log('Sesión cerrada correctamente');
  }

  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }
}