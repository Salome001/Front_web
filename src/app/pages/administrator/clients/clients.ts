import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { ClienteService } from '../../../services/client.service';
import { ClientDto } from '../../../models/client.dto';
import { ClienteFormComponent } from '../cliente-form/cliente-form';
import { SearchModalComponent } from '../../../shared/search-modal/search-modal';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './clients.html',
  styleUrls: ['./clients.scss']
})
export class ClientesComponent implements OnInit {

  displayedColumns = [
    'clientId',
    'identificationType',
    'identificationNumber',
    'firstName',
    'lastName',
    'phone',
    'email',
    'address',
    'actions'
  ];

  dataSource = new MatTableDataSource<ClientDto>();

  constructor(private clienteService: ClienteService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadClientes();
  }

loadClientes(): void {
  this.clienteService.getAll().subscribe({
    next: (res) => {
      this.dataSource.data = [...res.items]; 
    },
    error: (err) => console.error('Error cargando clientes', err)
  });
}

  addCliente(): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, { data: null, width: '600px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadClientes();
    });
  }

  editCliente(cliente: ClientDto): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, { data: cliente, width: '600px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadClientes();
    });
  }

  deleteCliente(id: number): void {
    if (confirm('¿Desea eliminar este cliente?')) {
      this.clienteService.delete(id).subscribe(() => this.loadClientes());
    }
  }

  openSearch(): void {
    const dialogRef = this.dialog.open(SearchModalComponent, { data: { entity: 'Client' }, width: '700px' });
    dialogRef.afterClosed().subscribe(selectedClient => {
      if (selectedClient) this.editCliente(selectedClient);
    });
  }
}
