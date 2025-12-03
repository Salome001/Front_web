import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environments';
import { RolDto } from '../models/role.dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private url = `${environment.baseUrl}/Roles`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.warn('No hay token de autenticación disponible');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<RolDto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<RolDto[]>(this.url, { headers });
  }

  getById(id: string): Observable<RolDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<RolDto>(`${this.url}/${id}`, { headers });
  }

  create(role: RolDto): Observable<RolDto> {
    const headers = this.getAuthHeaders();
    return this.http.post<RolDto>(this.url, role, { headers });
  }

  update(role: RolDto): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.url}/${role.id}`, role, { headers });
  }

  delete(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.url}/${id}`, { headers });
  }

  search(filters: any) {
  const headers = this.getAuthHeaders();
  return this.http.get<RolDto[]>(this.url, { headers, params: filters });
}


}
