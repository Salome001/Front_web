import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductDto } from '../models/product.dto';
import { environment } from '../environments/environments';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.baseUrl}/Product`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(includeContentType: boolean = true): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.warn('No hay token de autenticación disponible en ProductService');
    }
    
    const headers: any = { 'Authorization': `Bearer ${token}` };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return new HttpHeaders(headers);
  }

  private getFormDataHeaders(): HttpHeaders {
    // Para FormData, no incluir Content-Type para que el navegador lo establezca automáticamente
    return this.getAuthHeaders(false);
  }

  // Obtener todos los productos
  getAll(pageNumber: number = 1, pageSize: number = 100, searchTerm: string = ''): Observable<ProductDto[]> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    return this.http.get<{ items: ProductDto[] }>(`${this.url}/all-including-deleted`, { headers: this.getAuthHeaders(true), params })
      .pipe(map(res => res.items));
  }

  // Obtener por ID
  getById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.url}/${id}`, { headers: this.getAuthHeaders(true) });
  }

  // Crear producto con FormData
  create(formData: FormData): Observable<any> {
    console.log('Creando producto con FormData:', formData);
    return this.http.post(`${this.url}`, formData, { headers: this.getFormDataHeaders() });
  }

  // Actualizar producto con FormData
  update(id: number, formData: FormData): Observable<any> {
    console.log('Actualizando producto con FormData:', formData);
    return this.http.put(`${this.url}/${id}`, formData, { headers: this.getFormDataHeaders() });
  }

  // Eliminar producto
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }
}
