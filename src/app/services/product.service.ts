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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Obtener todos los productos
  getAll(pageNumber: number = 1, pageSize: number = 100, searchTerm: string = ''): Observable<ProductDto[]> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    return this.http.get<{ items: ProductDto[] }>(this.url, { headers: this.getAuthHeaders(), params })
      .pipe(map(res => res.items));
  }

  // Obtener por ID
  getById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Crear producto
  create(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}`, formData, { headers: this.getAuthHeaders() });
  }

  // Actualizar producto
  update(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.url}/${id}`, formData, { headers: this.getAuthHeaders() });
  }

  // Eliminar producto
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }
}
