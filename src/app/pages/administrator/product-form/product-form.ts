import { Component, Inject, OnDestroy } from '@angular/core';
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
export class ProductFormComponent implements OnDestroy {
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
  codeValidationTimeout: any = null;
  isValidatingCode = false;

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
        } else if (!/^[A-Z0-9]+$/.test(this.product.code)) {
          this.errors.code = 'El código solo puede contener letras mayúsculas y números';
        } else {
          this.errors.code = '';
          // Solo validar código único en modo creación
          if (!this.product.productId) {
            this.validateCodeUniqueness(this.product.code);
          }
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
    // No permitir edición del código si es un producto existente
    if (this.product.productId) {
      return;
    }
    
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
    formData.append('Code', this.product.code.toUpperCase().trim());
    formData.append('Name', this.product.name.trim());
    formData.append('Description', this.product.description?.trim() || '');
    formData.append('Price', this.product.price.toString());
    formData.append('Stock', this.product.stock.toString());
    
    if (this.product.productId && this.product.productId > 0) {
      // Verificar si se está activando un producto que estaba inactivo
      const wasInactive = this.data && !this.data.isActive;
      const isBeingActivated = this.product.isActive && wasInactive;
      
      if (isBeingActivated && this.shouldUseRestoreEndpoint()) {
        // Usar el endpoint de restore para activar el producto
        console.log('Restaurando producto inactivo ID:', this.product.productId);
        
        this.productService.restore(this.product.productId).subscribe({
          next: (response) => {
            console.log('Producto restaurado:', response);
            const message = response?.message || 'Producto activado exitosamente';
            this.showAlert(message);
            
            // Si hay cambios adicionales (imagen, datos), hacer update después del restore
            if (this.selectedFile || this.hasDataChanges()) {
              this.updateProductData(formData);
            } else {
              setTimeout(() => this.dialogRef.close(true), 1500);
            }
          },
          error: (err) => this.handleError(err, 'activar')
        });
      } else {
        // Actualización normal
        this.updateProductData(formData);
      }
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
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  }

  private handleError(err: any, action: string): void {
    console.error(`Error al ${action} producto:`, err);
    console.error('Error details:', err.error);
    
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
              
              // Mapear errores específicos a los campos del formulario
              if (key.toLowerCase().includes('code')) {
                this.errors.code = error;
              } else if (key.toLowerCase().includes('name')) {
                this.errors.name = error;
              } else if (key.toLowerCase().includes('price')) {
                this.errors.price = error;
              } else if (key.toLowerCase().includes('stock')) {
                this.errors.stock = error;
              }
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
    } else if (err.status === 404) {
      this.showAlert('El producto no fue encontrado.');
    } else if (err.status === 409) {
      this.showAlert('Ya existe un producto con este código.');
    } else if (err.status === 500) {
      this.showAlert('Error interno del servidor. Por favor, inténtalo más tarde.');
    } else {
      const actionText = action === 'activar' ? 'activar' : `${action}`;
      this.showAlert(`Error interno del servidor al ${actionText} el producto.`);
    }
  }

  private updateProductData(formData: FormData): void {
    formData.append('IsActive', this.product.isActive.toString());
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile, this.selectedFile.name);
      console.log('Imagen seleccionada para actualización:', this.selectedFile.name);
    } else {
      console.log('No se seleccionó nueva imagen para actualización');
    }
    
    console.log('Actualizando producto ID:', this.product.productId);
    this.logFormData(formData);
    
    this.productService.update(this.product.productId!, formData).subscribe({
      next: (response) => {
        console.log('Producto actualizado:', response);
        const message = response?.message || 'Producto actualizado exitosamente';
        this.showAlert(message);
        setTimeout(() => this.dialogRef.close(true), 1500);
      },
      error: (err) => this.handleError(err, 'actualizar')
    });
  }

  private hasDataChanges(): boolean {
    if (!this.data) return true;
    
    return (
      this.product.code !== this.data.code ||
      this.product.name !== this.data.name ||
      this.product.description !== this.data.description ||
      this.product.price !== this.data.price ||
      this.product.stock !== this.data.stock ||
      this.selectedFile !== null
    );
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

  validateCodeUniqueness(code: string): void {
    // Limpiar timeout anterior si existe
    if (this.codeValidationTimeout) {
      clearTimeout(this.codeValidationTimeout);
    }

    // Debounce de 800ms para evitar muchas consultas
    this.codeValidationTimeout = setTimeout(() => {
      if (code && code.length >= 3) {
        this.isValidatingCode = true;
        
        // Obtener todos los productos para validar unicidad
        this.productService.getAll().subscribe({
          next: (products: ProductDto[]) => {
            this.isValidatingCode = false;
            
            // Si estamos editando, excluir el ID actual
            const currentProductId = this.product.productId;
            const codeExists = products.some(p => 
              p.code?.toUpperCase() === code.toUpperCase() && 
              p.productId !== currentProductId
            );
            
            if (codeExists) {
              this.errors.code = 'Este código ya está en uso por otro producto';
            } else if (this.errors.code === 'Este código ya está en uso por otro producto') {
              // Solo limpiar el error si es el error de código duplicado
              this.errors.code = '';
            }
          },
          error: (err) => {
            console.error('Error al validar código:', err);
            this.isValidatingCode = false;
            // No mostrar error al usuario para no interrumpir la experiencia
          }
        });
      }
    }, 800);
  }

  ngOnDestroy(): void {
    // Limpiar el timeout al destruir el componente
    if (this.codeValidationTimeout) {
      clearTimeout(this.codeValidationTimeout);
    }
  }

  getActiveCheckboxLabel(): string {
    if (!this.data) {
      return 'Producto activo';
    }
    
    const wasInactive = !this.data.isActive;
    const isBeingActivated = this.product.isActive && wasInactive;
    
    if (wasInactive && !this.product.isActive) {
      return 'Producto inactivo';
    } else if (isBeingActivated) {
      return 'Activar producto (restaurar)';
    } else if (this.product.isActive) {
      return 'Producto activo';
    } else {
      return 'Desactivar producto';
    }
  }

  getActiveCheckboxTitle(): string {
    if (!this.data) {
      return 'Marcar si el producto está disponible para venta';
    }
    
    const wasInactive = !this.data.isActive;
    const isBeingActivated = this.product.isActive && wasInactive;
    
    if (isBeingActivated) {
      return 'Al activar un producto inactivo se usará el endpoint /restore';
    } else {
      return 'Controla si el producto está disponible para venta';
    }
  }

  getSaveButtonText(): string {
    if (!this.product.productId) {
      return 'Guardar';
    }
    
    if (this.data && !this.data.isActive && this.product.isActive) {
      return 'Activar Producto';
    }
    
    return 'Actualizar';
  }

  private shouldUseRestoreEndpoint(): boolean {
    // Solo usar restore si el producto estaba marcado como inactivo
    // y ahora se está marcando como activo
    return !!(this.data && 
           !this.data.isActive && 
           this.product.isActive && 
           this.product.productId !== undefined && 
           this.product.productId > 0);
  }

  close() {
    this.dialogRef.close(false);
  }
}
