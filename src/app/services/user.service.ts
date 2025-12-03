import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environments';
import { UserDto } from '../models/user.dto';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../models/create-user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.baseUrl}/Users`;

  constructor(private http: HttpClient) {}

  /** 🔹 Método privado para obtener headers con token */
 private getAuthHeaders(): HttpHeaders {
  const token = sessionStorage.getItem('token'); // 👈 Cambiado a sessionStorage
  return new HttpHeaders({
    'Authorization': `Bearer ${token || ''}`
  });
}


  getAll(): Observable<UserDto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDto[]>(this.url, { headers });
  }

  getById(id: string): Observable<UserDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDto>(`${this.url}/${id}`, { headers });
  }


create(user: CreateUserDto): Observable<UserDto> {
  const headers = this.getAuthHeaders();
  
  // Crear FormData para coincidir con [FromForm] del controller
  const formData = new FormData();
  formData.append('IdentificationNumber', user.identificationNumber);
  formData.append('Email', user.email);
  formData.append('UserName', user.userName);
  formData.append('Password', user.password);
  
  // Agregar roles
  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach((role: string, index: number) => {
      formData.append(`Roles[${index}]`, role);
    });
  }
  
  return this.http.post<UserDto>(this.url, formData, { headers });
}


  update(user: any): Observable<void> {
    const headers = this.getAuthHeaders();
    // Crear FormData para coincidir con [FromForm] del controller
    const formData = new FormData();
    formData.append('Id', user.id);
    formData.append('IdentificationNumber', user.identificationNumber);
    formData.append('Email', user.email);
    formData.append('UserName', user.userName);
    formData.append('EmailConfirmed', user.emailConfirmed.toString());
    formData.append('IsLocked', user.isLocked.toString());
    
    // Agregar roles si existen
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((role: string, index: number) => {
        formData.append(`Roles[${index}]`, role);
      });
    }
    
    return this.http.put<void>(`${this.url}/${user.id}`, formData, { headers });
  }

  delete(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.url}/${id}`, { headers });
  }

  /** 🔹 GET: Obtener el usuario actual */
  getCurrentUser(): Observable<UserDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDto>(`${this.url}/me`, { headers });
  }

  /** 🔹 Obtener user ID desde el JWT token */
  getCurrentUserIdFromToken(): string | null {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.warn('No se encontró token JWT en sessionStorage');
        return null;
      }
      
      // Verificar que el token tenga el formato correcto (3 partes separadas por .)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Token JWT inválido: debe tener 3 partes');
        return null;
      }
      
      // Decodificar JWT payload
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('JWT Payload decodificado:', payload);
      
      // El user ID puede estar en diferentes campos dependiendo del backend
      const userId = payload.sub || payload.userId || payload.id || payload.nameid || 
                   payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                   payload.unique_name;
      
      if (userId) {
        console.log('User ID extraído del JWT:', userId);
        return userId.toString();
      } else {
        console.error('No se pudo encontrar user ID en el JWT payload. Campos disponibles:', Object.keys(payload));
        return null;
      }
    } catch (error) {
      console.error('Error decodificando token JWT:', error);
      return null;
    }
  }

   unlock(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.url}/${id}/unlock`, {}, { headers });
  }
}
