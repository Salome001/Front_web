import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environments';
import { Observable } from 'rxjs';
import { InvoiceDto, InvoiceDetailDto } from '../models/invoice.dto';
import { tap } from 'rxjs/operators';

export interface PagedInvoiceResponse {
  items: InvoiceDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}


@Injectable({ providedIn: 'root' })



export class InvoiceService {
  private url = `${environment.baseUrl}/Invoice`;

  constructor(private http: HttpClient) {}

  // Encabezados con token
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }



  // Obtener una factura por ID
  getById(id: number): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

getDetails(invoiceId: number): Observable<InvoiceDetailDto[]> {
  return this.http.get<InvoiceDetailDto[]>(`${this.url}/${invoiceId}/details`, {
    headers: this.getAuthHeaders()
  });
}


  // Crear factura
  create(invoice: any): Observable<void> {
    return this.http.post<void>(this.url, invoice, { headers: this.getAuthHeaders() });
  }

  // Actualizar factura
  update(id: number, invoice: InvoiceDto): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, invoice, { headers: this.getAuthHeaders() });
  }

  // Eliminar factura
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Agregar producto a una factura
  addProduct(invoiceId: number, detail: InvoiceDetailDto): Observable<void> {
    return this.http.post<void>(`${this.url}/${invoiceId}/add-product`, detail, { headers: this.getAuthHeaders() });
  }

  // Eliminar producto de una factura
  removeProduct(invoiceId: number, productId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${invoiceId}/remove-product/${productId}`, { headers: this.getAuthHeaders() });
  }
getAll(page: number, pageSize: number, search: string): Observable<PagedInvoiceResponse> {
  const params = {
    page: page.toString(),
    pageSize: pageSize.toString(),
    search: search
  };
  return this.http.get<PagedInvoiceResponse>(this.url, { headers: this.getAuthHeaders(), params })
    .pipe(
      tap(res => console.log('getAll Response:', res))
    );
}


}
