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

  errors: any = { 
    code: '', 
    name: '', 
    description: '', 
    price: '', 
    stock: '', 
    image: '' 
  };
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
    setTimeout(() => this.alertShow = false, 5000);
  }

  // Validaciones en tiempo real
  validateField(fieldName: string): void {
    switch(fieldName) {
      case 'code':
        if (!this.product.code?.trim()) {
          this.errors.code = 'El código es requerido';
        } else if (this.product.code.length < 2 || this.product.code.length > 10) {
          this.errors.code = 'El código debe tener entre 2 y 10 caracteres';
        } else {
          this.errors.code = '';
        }
        break;
        
      case 'name':
        if (!this.product.name?.trim()) {
          this.errors.name = 'El nombre es requerido';
        } else if (this.product.name.length < 2 || this.product.name.length > 100) {
          this.errors.name = 'El nombre debe tener entre 2 y 100 caracteres';
        } else {
          this.errors.name = '';
        }
        break;
        
      case 'description':
        if (this.product.description && this.product.description.length > 500) {
          this.errors.description = 'La descripción no puede exceder 500 caracteres';
        } else {
          this.errors.description = '';
        }
        break;
        
      case 'price':
        if (!this.product.price || this.product.price <= 0) {
          this.errors.price = 'El precio debe ser mayor que 0';
        } else if (this.product.price > 999999.99) {
          this.errors.price = 'El precio no puede exceder 999,999.99';
        } else {
          this.errors.price = '';
        }
        break;
        
      case 'stock':
        if (this.product.stock < 0) {
          this.errors.stock = 'El stock no puede ser negativo';
        } else if (this.product.stock > 999999) {
          this.errors.stock = 'El stock no puede exceder 999,999';
        } else {
          this.errors.stock = '';
        }
        break;
    }
  }

  // Métodos para restricciones de entrada
  soloNumeros(event: any, field: string): void {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    // Evitar múltiples puntos decimales
    const parts = value.split('.');
    if (parts.length > 2) {
      event.target.value = parts[0] + '.' + parts.slice(1).join('');
    } else {
      event.target.value = value;
    }
    
    if (field === 'price') {
      this.product.price = parseFloat(event.target.value) || 0;
      this.validateField('price');
    } else if (field === 'stock') {
      this.product.stock = parseInt(event.target.value) || 0;
      this.validateField('stock');
    }
  }

  

  formatearCodigo(event: any): void {
    // Convertir a mayúsculas y remover espacios
    event.target.value = event.target.value.toUpperCase().replace(/\s/g, '');
    this.product.code = event.target.value;
    this.validateField('code');
  }

  validateForm(): boolean {
    // Validar todos los campos
    this.validateField('code');
    this.validateField('name');
    this.validateField('description');
    this.validateField('price');
    this.validateField('stock');

    // Verificar si hay errores
    return Object.values(this.errors).every(error => error === '');
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
      this.showAlert('Por favor corrige los errores en el formulario.');
      return;
    }

    const formData = new FormData();
    formData.append('Code', this.product.code.toUpperCase());
    formData.append('Name', this.product.name);
    formData.append('Description', this.product.description || '');
    formData.append('Price', this.product.price.toString());
    formData.append('Stock', this.product.stock.toString());
    
    if (this.product.productId && this.product.productId > 0) {
      // Modo actualización
      formData.append('IsActive', this.product.isActive.toString());
      if (this.selectedFile) {
        formData.append('Image', this.selectedFile, this.selectedFile.name);
      }
      
      console.log('Actualizando producto:', this.product.productId);
      this.logFormData(formData);
      
      this.productService.update(this.product.productId, formData).subscribe({
        next: (response) => {
          console.log('Producto actualizado:', response);
          this.showAlert('Producto actualizado exitosamente');
          setTimeout(() => this.dialogRef.close(true), 1500);
        },
        error: (err) => this.handleError(err, 'actualizar')
      });
    } else {
      // Modo creación
      if (this.selectedFile) {
        formData.append('Image', this.selectedFile, this.selectedFile.name);
      }
      
      console.log('Creando nuevo producto');
      this.logFormData(formData);
      
      this.productService.create(formData).subscribe({
        next: (response) => {
          console.log('Producto creado:', response);
          this.showAlert('Producto creado exitosamente');
          setTimeout(() => this.dialogRef.close(true), 1500);
        },
        error: (err) => this.handleError(err, 'crear')
      });
    }
  }

  private logFormData(formData: FormData): void {
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });
  }

  private handleError(err: any, action: string): void {
    console.error(`Error al ${action} producto:`, err);
    
    if (err.status === 400) {
      if (err.error?.errors) {
        // Errores de validación del ModelState
        const validationErrors = err.error.errors;
        let errorMessage = 'Errores de validación:\n';
        
        Object.keys(validationErrors).forEach(key => {
          const fieldErrors = validationErrors[key];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach(error => {
              errorMessage += `• ${error}\n`;
            });
          }
        });
        
        this.showAlert(errorMessage);
      } else if (err.error?.message) {
        this.showAlert(err.error.message);
      } else {
        this.showAlert(`Error de validación al ${action} el producto.`);
      }
    } else if (err.status === 401) {
      this.showAlert('No tienes permisos para realizar esta acción.');
    } else if (err.status === 409) {
      this.showAlert('Ya existe un producto con este código.');
    } else {
      this.showAlert(`Error interno del servidor al ${action} el producto.`);
    }
  }

  soloEnteros(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Permitir solo números enteros
    const regex = /^[0-9]*$/;
    
    if (!regex.test(value)) {
      target.value = value.slice(0, -1);
      this.product.stock = Number(target.value) || 0;
    } else {
      this.product.stock = Number(value) || 0;
    }
  }

  close() {
    this.dialogRef.close(false);
  }
}
