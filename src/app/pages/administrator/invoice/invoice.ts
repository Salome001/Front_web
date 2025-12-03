import { Component, OnInit } from '@angular/core';
import { InvoiceDto, InvoiceDetailDto, ProductDto, ClientDto } from '../../../models/invoice.dto';
import { InvoiceService } from '../../../services/invoice.service';
import { ClienteService } from '../../../services/client.service';
import { ProductService } from '../../../services/product.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchModalComponent } from '../../../shared/search-modal/search-modal';


@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.scss']
})
export class InvoiceComponent implements OnInit {
  invoices: InvoiceDto[] = [];
  dataSource = new MatTableDataSource<InvoiceDto>();
  displayedColumns: string[] = ['invoiceNumber','clientName','issueDate','subtotal','tax','total','actions'];

  currentInvoice: InvoiceDto = {
    invoiceDetails: [],
    subtotal: 0,
    tax: 0,
    total: 0
  };

  clientSearch = new FormControl('');
  productSearch = new FormControl('');
  invoiceSearch = new FormControl('');
  observations = new FormControl('');

  filteredClients: ClientDto[] = [];
  filteredProducts: ProductDto[] = [];

  selectedClient: ClientDto | null = null;
  selectedProduct: ProductDto | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClienteService,
    private productService: ProductService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUserInvoices();

    // Autocompletado cliente
    this.clientSearch.valueChanges.pipe(
      debounceTime(200),
      switchMap(val => val ? this.searchClients(val) : of([]))
    ).subscribe(res => this.filteredClients = res);

    // Autocompletado producto
    this.productSearch.valueChanges.pipe(
      debounceTime(200),
      switchMap(val => val ? this.searchProducts(val) : of([]))
    ).subscribe(res => this.filteredProducts = res);
  }

  loadUserInvoices() {
    // Obtener user ID directamente del JWT token
    const currentUserId = this.userService.getCurrentUserIdFromToken();
    
    if (!currentUserId) {
      console.error('No se pudo obtener el user ID del token JWT');
      this.invoices = [];
      this.dataSource.data = [];
      return;
    }
    
    // Cargar facturas y filtrar por usuario actual
    this.invoiceService.getAll(1, 100, '').subscribe({
      next: (res) => {
        const allInvoices = res.items ?? [];
        console.log('Todas las facturas:', allInvoices);
        console.log('Filtrando por user ID:', currentUserId);
        
        // Filtrar facturas por userId del lado cliente
        this.invoices = allInvoices.filter((invoice: any) => {
          console.log(`Factura ${invoice.invoiceId}: userId=${invoice.userId}`);
          return invoice.userId === currentUserId;
        });
        
        this.dataSource.data = this.invoices;
        console.log(`Cargadas ${this.invoices.length} facturas para el usuario ${currentUserId}`);
      },
      error: (err) => {
        console.error('Error cargando facturas:', err);
        this.invoices = [];
        this.dataSource.data = [];
      }
    });
  }

  searchClients(term: string): Observable<ClientDto[]> {
    return this.clientService.getAll().pipe(
      map(res => res.items.filter(c =>
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(term.toLowerCase()) ||
        c.identificationNumber.includes(term)
      ))
    );
  }

  searchProducts(term: string): Observable<ProductDto[]> {
    return this.productService.getAll().pipe(
      map(res => res.filter(p =>
  p.name.toLowerCase().includes(term.toLowerCase()) ||
  p.code.toLowerCase().includes(term.toLowerCase())
))

    );
  }

  selectClient(client: ClientDto) {
    this.selectedClient = client;
    this.currentInvoice.clientId = client.clientId;
    this.clientSearch.setValue(`${client.firstName} ${client.lastName}`, { emitEvent: false });
    this.filteredClients = [];
  }

  selectProduct(product: ProductDto) {
    this.selectedProduct = product;
    this.productSearch.setValue(product.name, { emitEvent: false });
    this.filteredProducts = [];
  }

  addProductToInvoice(product: ProductDto) {
    if (!product.isActive || product.stock <= 0) return;
    let existing = this.currentInvoice.invoiceDetails.find(d => d.productId === product.productId);
    if (existing) {
      if (existing.quantity + 1 <= product.stock) {
        existing.quantity++;
        existing.subtotal = existing.quantity * existing.unitPrice;
      }
    } else {
      this.currentInvoice.invoiceDetails.push({
        productId: product.productId,
        product: product,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price
      });
    }
    this.calculateTotals();
    this.refreshTable();
  }

  refreshTable() {
    this.currentInvoice.invoiceDetails = [...this.currentInvoice.invoiceDetails];
  }

  removeProduct(detail: InvoiceDetailDto) {
    this.currentInvoice.invoiceDetails = this.currentInvoice.invoiceDetails.filter(d => d.productId !== detail.productId);
    this.calculateTotals();
  }

  increaseQuantity(detail: InvoiceDetailDto) {
    if (detail.quantity < (detail.product?.stock || 0)) {
      detail.quantity++;
      detail.subtotal = detail.quantity * detail.unitPrice;
      this.calculateTotals();
    }
  }

  decreaseQuantity(detail: InvoiceDetailDto) {
    if (detail.quantity > 1) {
      detail.quantity--;
      detail.subtotal = detail.quantity * detail.unitPrice;
      this.calculateTotals();
    }
  }

  updateQuantity(detail: InvoiceDetailDto, quantity: number) {
    if (quantity < 1 || quantity > (detail.product?.stock || 0)) return;
    detail.quantity = quantity;
    detail.subtotal = detail.quantity * detail.unitPrice;
    this.calculateTotals();
  }

  calculateTotals() {
    this.currentInvoice.subtotal = this.currentInvoice.invoiceDetails.reduce((a,b) => a + b.subtotal, 0);
    this.currentInvoice.tax = this.currentInvoice.subtotal * 0.12;
    this.currentInvoice.total = this.currentInvoice.subtotal + this.currentInvoice.tax;
  }

  saveInvoice() {
    if (!this.currentInvoice.clientId || this.currentInvoice.invoiceDetails.length === 0) return;

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        const invoiceToSend = {
          invoiceNumber: `FA-${new Date().toISOString().replace(/[-:.TZ]/g,'')}`,
          clientId: this.currentInvoice.clientId,
          userId: user.id,
          issueDate: new Date().toISOString(),
          observations: this.observations.value || '',
          invoiceDetails: this.currentInvoice.invoiceDetails.map(d => ({
            productId: d.productId,
            quantity: d.quantity,
            unitPrice: d.unitPrice
          }))
        };
        this.invoiceService.create(invoiceToSend).subscribe({
          next: () => {
            // Recargar las facturas del usuario después de crear una nueva
            this.loadUserInvoices();
            
            this.currentInvoice = { invoiceDetails: [], subtotal: 0, tax: 0, total: 0 };
            this.selectedClient = null;
            this.selectedProduct = null;
            this.clientSearch.reset();
            this.productSearch.reset();
            this.observations.reset();
          },
          error: err => console.error('Error al guardar factura:', err)
        });
      },
      error: (err) => console.error('No se pudo obtener el usuario actual', err)
    });
  }

  deleteInvoice(id: number) {
    this.invoiceService.delete(id);
  }




searchInvoices() {
  const dialogRef = this.dialog.open(SearchModalComponent, {
    data: { entity: 'Invoices' } ,// puedes poner 'Invoices' o cualquier identificador que uses,
      width: '90vw',  
  maxWidth: '90vw',    


  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Si el modal devuelve una factura seleccionada
      //this.selectInvoice(result);
    }
  });
}


}
