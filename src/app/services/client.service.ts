import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environments';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ClientDto } from '../models/client.dto';


export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
  isEmpty: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private baseUrl = `${environment.baseUrl}/Client`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  // Obtener todos los clientes (con paginación de API)
  getAll(): Observable<PagedResponse<ClientDto>> {
    const headers = this.getAuthHeaders();

    // Traemos la primera página para saber cuántas páginas hay
    const params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', '10'); // cualquier tamaño inicial

    return this.http.get<PagedResponse<ClientDto>>(this.baseUrl, { headers, params }).pipe(
      switchMap(firstPage => {
        const totalPages = firstPage.totalPages;
        const observables = [];

        // Si hay más páginas, las agregamos a la lista de observables
        for (let i = 2; i <= totalPages; i++) {
          observables.push(
            this.http.get<PagedResponse<ClientDto>>(this.baseUrl, { headers, params: new HttpParams().set('pageNumber', i).set('pageSize', '10') })
          );
        }

        if (observables.length === 0) {
          // Solo hay una página
          return of(firstPage);
        }

        // Esperamos a que terminen todas las páginas
        return forkJoin(observables).pipe(
          map(pages => {
            // Combinamos todos los items en un solo array
            const allItems = [...firstPage.items];
            pages.forEach(p => allItems.push(...p.items));

            return {
              ...firstPage,
              items: allItems,
              totalCount: allItems.length,
              totalPages: 1,
              pageNumber: 1,
              pageSize: allItems.length,
              hasNextPage: false,
              hasPreviousPage: false,
              firstItemIndex: 1,
              lastItemIndex: allItems.length,
              isEmpty: allItems.length === 0
            } as PagedResponse<ClientDto>;
          })
        );
      })
    );
  }


  // Obtener un cliente por ID
  get(id: number): Observable<ClientDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<ClientDto>(`${this.baseUrl}/${id}`, { headers });
  }

  // Crear un nuevo cliente
  create(cliente: ClientDto): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(this.baseUrl, cliente, { headers });
  }

  // Actualizar un cliente existente
  update(id: number, cliente: ClientDto): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}/${id}`, cliente, { headers });
  }

  // Eliminar un cliente
  delete(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/${id}`, { headers });
  }
}
