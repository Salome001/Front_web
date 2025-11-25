import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ProductService } from '../../../services/product.service';
import { ProductDto } from '../../../models/product.dto';
import { ProductFormComponent } from '../product-form/product-form';
import { SearchModalComponent } from '../../../shared/search-modal/search-modal';
import { UserService } from '../../../services/user.service';   // 👈 AÑADIDO

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit {

  products: ProductDto[] = [];
  displayedColumns = ['code','name', 'description','price','stock','isActive', 'actions'];
  dataSource = new MatTableDataSource<ProductDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

userRole: string[] = [];


  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private userService: UserService     // 👈 AÑADIDO
  ) {}

  ngOnInit(): void {
    this.loadUserRole();   // 👈 Obtener el rol al iniciar
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

loadUserRole() {
  this.userService.getCurrentUser().subscribe(user => {

    console.log("📌 Usuario recibido desde getCurrentUser():", user);
    console.log("📌 Roles recibidos:", user.roles);

    this.userRole = user.roles; 
  });
}


  loadProducts(): void {
    this.productService.getAll().subscribe(res => {
      setTimeout(() => {
        this.products = res;
        this.dataSource.data = res;
      });
    });
  }

  addProduct(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, { data: null });
    dialogRef.afterClosed().subscribe(result => { if(result) this.loadProducts(); });
  }

  editProduct(product: ProductDto): void {
    const dialogRef = this.dialog.open(ProductFormComponent, { data: product });
    dialogRef.afterClosed().subscribe(result => { if(result) this.loadProducts(); });
  }

  deleteProduct(id: number): void {
    if(confirm('¿Desea eliminar este producto?')) {
      this.productService.delete(id).subscribe(() => this.loadProducts());
    }
  }

  openSearch(): void {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      data: { entity: 'Product' },
      width: '90vw',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe(selectedProduct => {
      if(selectedProduct) this.editProduct(selectedProduct);
    });
  }
}
