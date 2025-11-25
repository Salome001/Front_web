import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { ProductDto } from '../../../models/product.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Alert } from '../../../shared/alert/alert';
import { UserService } from '../../../services/user.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    Alert
  ],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductFormComponent {
  product: ProductDto = {
    productId: 0,
    code: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    isActive: true,
    imageUri: ''
  };
userRole: string[] = [];

  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;

  errors: any = { code: '', name: '', price: '', stock: '' };
  alertMessage = '';
  alertShow = false;

  constructor(
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductFormComponent>,
     private userService: UserService,
      private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: ProductDto | null
  ) {
    if (data) {
      this.product = { ...data };
      this.filePreview = this.product.imageUri || null;
      
    }
      this.loadUserRole();
  }
loadUserRole() {
  this.userService.getCurrentUser().subscribe(user => {
    this.userRole = user.roles;
    this.cd.detectChanges();  
  });
}


  showAlert(msg: string) {
    this.alertMessage = msg;
    this.alertShow = true;
    setTimeout(() => this.alertShow = false, 3500);
  }

  validateForm(): boolean {
    this.errors = { code: '', name: '', price: '', stock: '' };
    let valid = true;

    if (!this.product.code?.trim()) {
      this.errors.code = 'El código es obligatorio';
      valid = false;
    }

    if (!this.product.name?.trim()) {
      this.errors.name = 'El nombre es obligatorio';
      valid = false;
    }

    if (this.product.price <= 0) {
      this.errors.price = 'El precio debe ser mayor que 0';
      valid = false;
    }

    if (this.product.stock < 0) {
      this.errors.stock = 'El stock no puede ser negativo';
      valid = false;
    }

    return valid;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => this.filePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.filePreview = this.product.imageUri || null;
    }
  }

  save() {
    if (!this.validateForm()) {
      this.showAlert('Corrige los campos marcados en rojo.');
      return;
    }

    const formData = new FormData();
    formData.append('Code', this.product.code);
    formData.append('Name', this.product.name);
    formData.append('Description', this.product.description || '');
    formData.append('Price', this.product.price.toString());
    formData.append('Stock', this.product.stock.toString());
    if (this.selectedFile) formData.append('Image', this.selectedFile, this.selectedFile.name);

    if (this.product.productId && this.product.productId > 0) {
      this.productService.update(this.product.productId, formData).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.showAlert('Error actualizando el producto.')
      });
    } else {
      this.productService.create(formData).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.showAlert('Error creando el producto.')
      });
    }
  }

  close() {
    this.dialogRef.close(false);
  }
}
