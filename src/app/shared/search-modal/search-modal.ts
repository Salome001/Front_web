import { Component, Inject, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { ProductService } from '../../services/product.service';
import { ClienteService } from '../../services/client.service';
import { ProductDto } from '../../models/product.dto';
import { RolDto } from '../../models/role.dto';
import { ClientDto } from '../../models/client.dto';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';
import { InvoiceService } from '../../services/invoice.service';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceDetailModalComponent } from '../../pages/administrator/invoice-detail-modal-component/invoice-detail-modal-component'; // Ajusta la ruta


@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule],
  templateUrl: './search-modal.html',
  styleUrls: ['./search-modal.scss']
})
export class SearchModalComponent implements OnInit, AfterViewInit {

  allItems: any[] = [];
  filteredItems: any[] = [];
  searchTerm: string = '';

  constructor(
    private dialogRef: MatDialogRef<SearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { entity: string },
    private roleService: RoleService,
    private productService: ProductService,
    private clienteService: ClienteService,
    private usersService: UserService,
  private invoiceService: InvoiceService, 
    private cd: ChangeDetectorRef,
    private dialog: MatDialog 
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // CARGA DESPUÉS DEL PRIMER CICLO DE DETECCIÓN
    if (this.data.entity === 'Roles') {
      this.roleService.getAll().subscribe(res => {
        this.allItems = res;
        this.filteredItems = [...this.allItems];
        this.cd.detectChanges();
      });
    }
    else if (this.data.entity === 'Product') {
      this.productService.getAll().subscribe(res => {
        this.allItems = res;
        this.filteredItems = [...this.allItems];
        this.cd.detectChanges();
      });
    }
    

    else if (this.data.entity === 'Client') {
      this.clienteService.getAll().subscribe(res => {
        this.allItems = res.items ?? [];
        this.filteredItems = [...this.allItems];
        this.cd.detectChanges();
      });
    }

    else if (this.data.entity === 'Usuarios') {
  this.usersService.getAll().subscribe(res => {
    this.allItems = res;
    this.filteredItems = [...this.allItems];
    this.cd.detectChanges();
  });
}
else if (this.data.entity === 'Invoices') {
  this.invoiceService.getAll(1, 100, '').subscribe(res => {
    this.allItems = res.items ?? [];  // <-- Aquí usamos la propiedad 'items'
    this.filteredItems = [...this.allItems];
    this.cd.detectChanges();
  });
}


  }

  openInvoiceDetail(invoice: any) {
  const dialogRef = this.dialog.open(InvoiceDetailModalComponent, {
    width: '600px', // Tamaño del modal
    data: invoice
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      if (result.action === 'update') {
        console.log('Actualizar factura:', result.invoice);
        // Aquí llamas a tu servicio para actualizar
      } else if (result.action === 'delete') {
        console.log('Eliminar factura:', result.invoice);
        // Aquí llamas a tu servicio para eliminar
      }
    }
  });
}

onSearchChange() {
  const term = this.searchTerm.toLowerCase();

  this.filteredItems = this.allItems.filter(item => {

    // ------ ROLES ------
    if (this.data.entity === 'Roles') {
      const rol = item as RolDto;
      return (
        (rol.name || '').toLowerCase().includes(term) ||
        (rol.description || '').toLowerCase().includes(term) ||
        ((rol.isActive ? 'sí' : 'no').toLowerCase().includes(term))
      );
    }

    // ------ PRODUCTOS ------
    else if (this.data.entity === 'Product') {
      const product = item as ProductDto;
      return (
        (product.name || '').toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term) ||
        (product.code || '').toLowerCase().includes(term) ||
        ((product.isActive ? 'sí' : 'no').toLowerCase().includes(term))
      );
    }

    // ------ CLIENTES ------
    else if (this.data.entity === 'Client') {
      const client = item as ClientDto;
      return (
        ((client.clientId ?? '') + '').toLowerCase().includes(term) ||
        (client.identificationType || '').toLowerCase().includes(term) ||
        ((client.identificationNumber ?? '') + '').toLowerCase().includes(term) ||
        (client.firstName || '').toLowerCase().includes(term) ||
        (client.lastName || '').toLowerCase().includes(term) ||
        (client.email || '').toLowerCase().includes(term) ||
        (client.phone || '').toLowerCase().includes(term) ||
        (client.address || '').toLowerCase().includes(term)
      );
    }

    // ------ USUARIOS ------
    else if (this.data.entity === 'Usuarios') {
      const user = item;
      return (
        (user.identificationNumber || '').toLowerCase().includes(term) ||
        (user.userName || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        ((user.isLocked ? 'sí' : 'no').toLowerCase().includes(term)) ||
        ((user.emailConfirmed ? 'sí' : 'no').toLowerCase().includes(term))
      );
    }

    // ------ FACTURAS ------
    else if (this.data.entity === 'Invoices') {
      const invoice = item;
      return (
        (invoice.invoiceNumber ?? '').toString().toLowerCase().includes(term) ||
        (invoice.client?.firstName ?? '').toLowerCase().includes(term) ||
        (invoice.client?.lastName ?? '').toLowerCase().includes(term) ||
        (invoice.subtotal?.toString() ?? '').toLowerCase().includes(term) ||
        (invoice.tax?.toString() ?? '').toLowerCase().includes(term) ||
        (invoice.total?.toString() ?? '').toLowerCase().includes(term)
      );
    }

    return false;
  });
}


  selectItem(item: any) {
    this.dialogRef.close(item);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
