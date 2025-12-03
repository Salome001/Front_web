import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClienteService } from '../../../services/client.service';
import { ClientDto } from '../../../models/client.dto';
import { UserService } from '../../../services/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { Alert } from '../../../shared/alert/alert';


@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    Alert
  ],
  templateUrl: './cliente-form.html',
  styleUrls: ['./cliente-form.scss']
})
export class ClienteFormComponent {
  cliente: ClientDto = {
    clientId: 0,
    identificationType: '',
    identificationNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: ''
  };
userRole: string[] = [];

  errors: any = {
    identificationType: '',
    identificationNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: ''
  };

  alertMessage = '';
  alertShow = false;

  constructor(
    private clienteService: ClienteService,
    private dialogRef: MatDialogRef<ClienteFormComponent>,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: ClientDto | null
  ) {
    if (data) this.cliente = { ...data };
    this.loadUserRole();
  }

  // Validación de cédula ecuatoriana
  validarCedulaEcuatoriana(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false;
    
    const tercerDigito = parseInt(cedula[2], 10);
    if (tercerDigito >= 6) return false;
    
    let suma = 0;
    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    
    for (let i = 0; i < 9; i++) {
      let mult = parseInt(cedula[i]) * coef[i];
      if (mult >= 10) mult -= 9;
      suma += mult;
    }
    
    const verificador = (10 - (suma % 10)) % 10;
    return verificador === parseInt(cedula[9]);
  }

  // Validación de pasaporte (alfanumérico, 6-9 caracteres)
  validarPasaporte(pasaporte: string): boolean {
    return /^[A-Za-z0-9]{6,9}$/.test(pasaporte);
  }

  // Validación de email
  validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Validación de nombres (solo letras y espacios)
  validarNombre(nombre: string): boolean {
    return /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim());
  }

  // Validación de teléfono (solo números, hasta 10 dígitos)
  validarTelefono(telefono: string): boolean {
    return /^\d{7,10}$/.test(telefono);
  }

  // Validación de teléfono ecuatoriano (móvil o fijo)
  validarTelefonoEcuatoriano(telefono: string): boolean {
    // Teléfono móvil: 09XXXXXXXX (10 dígitos)
    const movil = /^09\d{8}$/.test(telefono);
    // Teléfono fijo: 0[2-7]XXXXXXX (9 dígitos)
    const fijo = /^0[2-7]\d{7}$/.test(telefono);
    
    return movil || fijo;
  }

  // Validación en tiempo real
  validateField(fieldName: string): void {
    switch(fieldName) {
      case 'identificationType':
        if (!this.cliente.identificationType) {
          this.errors.identificationType = 'Seleccione un tipo de identificación';
        } else {
          this.errors.identificationType = '';
          // Re-validar el número cuando cambia el tipo
          if (this.cliente.identificationNumber) {
            this.validateField('identificationNumber');
          }
        }
        break;
        
      case 'identificationNumber':
        if (!this.cliente.identificationNumber?.trim()) {
          this.errors.identificationNumber = 'El número de identificación es obligatorio';
        } else if (this.cliente.identificationType === 'CEDULA') {
          if (!this.validarCedulaEcuatoriana(this.cliente.identificationNumber)) {
            this.errors.identificationNumber = 'Cédula ecuatoriana no válida (10 dígitos)';
          } else {
            this.errors.identificationNumber = '';
          }
        } else if (this.cliente.identificationType === 'PASAPORTE') {
          if (!this.validarPasaporte(this.cliente.identificationNumber)) {
            this.errors.identificationNumber = 'Pasaporte debe tener 6-9 caracteres alfanuméricos';
          } else {
            this.errors.identificationNumber = '';
          }
        }
        break;
        
      case 'firstName':
        if (!this.cliente.firstName?.trim()) {
          this.errors.firstName = 'El nombre es requerido';
        } else if (this.cliente.firstName.trim().length < 2 || this.cliente.firstName.trim().length > 50) {
          this.errors.firstName = 'El nombre debe tener entre 2 y 50 caracteres';
        } else if (!this.validarNombre(this.cliente.firstName)) {
          this.errors.firstName = 'El nombre solo puede contener letras y espacios';
        } else {
          this.errors.firstName = '';
        }
        break;
        
      case 'lastName':
        if (!this.cliente.lastName?.trim()) {
          this.errors.lastName = 'El apellido es requerido';
        } else if (this.cliente.lastName.trim().length < 2 || this.cliente.lastName.trim().length > 50) {
          this.errors.lastName = 'El apellido debe tener entre 2 y 50 caracteres';
        } else if (!this.validarNombre(this.cliente.lastName)) {
          this.errors.lastName = 'El apellido solo puede contener letras y espacios';
        } else {
          this.errors.lastName = '';
        }
        break;
        
      case 'phone':
        if (!this.cliente.phone?.trim()) {
          this.errors.phone = 'El teléfono es requerido';
        } else if (!this.validarTelefonoEcuatoriano(this.cliente.phone)) {
          this.errors.phone = 'Teléfono ecuatoriano inválido (ej: 0987654321 o 022345678)';
        } else {
          this.errors.phone = '';
        }
        break;
        
      case 'email':
        if (!this.cliente.email?.trim()) {
          this.errors.email = 'El email es requerido';
        } else if (this.cliente.email.length > 100) {
          this.errors.email = 'El email no puede exceder 100 caracteres';
        } else if (!this.validarEmail(this.cliente.email)) {
          this.errors.email = 'Formato de email inválido';
        } else {
          this.errors.email = '';
        }
        break;
        
      case 'address':
        if (!this.cliente.address?.trim()) {
          this.errors.address = 'La dirección es requerida';
        } else if (this.cliente.address.length > 200) {
          this.errors.address = 'La dirección no puede exceder 200 caracteres';
        } else if (this.cliente.address.trim().length < 5) {
          this.errors.address = 'La dirección debe tener al menos 5 caracteres';
        } else {
          this.errors.address = '';
        }
        break;
    }
  }

  // Métodos para restricciones de entrada
  soloNumeros(event: any): void {
    event.target.value = event.target.value.replace(/[^0-9]/g, '').substring(0, 10);
    this.cliente.phone = event.target.value;
    this.validateField('phone');
  }

  soloLetras(event: any, field: string): void {
    // Permitir letras, espacios y caracteres con tildes/ñ
    event.target.value = event.target.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
    if (field === 'firstName') {
      this.cliente.firstName = event.target.value;
      this.validateField('firstName');
    } else if (field === 'lastName') {
      this.cliente.lastName = event.target.value;
      this.validateField('lastName');
    }
  }

  // Métodos para validación en tiempo real durante la escritura
  onInputChange(field: string): void {
    this.validateField(field);
  }

  onEmailChange(): void {
    this.validateField('email');
  }

  onAddressChange(): void {
    this.validateField('address');
  }

  soloIdentificacion(event: any): void {
    if (this.cliente.identificationType === 'CEDULA') {
      // Solo números para cédula
      event.target.value = event.target.value.replace(/[^0-9]/g, '').substring(0, 10);
    } else {
      // Alfanumérico para pasaporte
      event.target.value = event.target.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 9);
    }
    this.cliente.identificationNumber = event.target.value;
    this.validateField('identificationNumber');
  }
loadUserRole() {
  this.userService.getCurrentUser().subscribe(user => {
    this.userRole = user.roles;
    this.cd.detectChanges();  // 👈 FUERZA ACTUALIZAR LA VISTA
  });
}

  validateForm(): boolean {
    // Validar todos los campos
    this.validateField('identificationType');
    this.validateField('identificationNumber');
    this.validateField('firstName');
    this.validateField('lastName');
    this.validateField('phone');
    this.validateField('email');
    this.validateField('address');

    // Verificar si hay errores
    return Object.values(this.errors).every(error => error === '');
  }

  save() {
    if (!this.validateForm()) {
      this.showAlert('Por favor corrige los errores en el formulario.');
      return;
    }

    if (this.cliente.clientId && this.cliente.clientId > 0) {
      // Modo edición - usar ClientDto completo
      const updatePayload: ClientDto = { ...this.cliente };
      this.clienteService.update(this.cliente.clientId!, updatePayload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.handleError(err, 'actualizar')
      });
    } else {
      // Modo creación - crear payload con nombres PascalCase para ClientCreateDto
      const createPayload = {
        IdentificationType: this.cliente.identificationType,
        IdentificationNumber: this.cliente.identificationNumber,
        FirstName: this.cliente.firstName,
        LastName: this.cliente.lastName,
        Phone: this.cliente.phone,
        Email: this.cliente.email,
        Address: this.cliente.address
      };
      
      console.log('Payload para crear cliente:', createPayload);
      
      this.clienteService.create(createPayload).subscribe({
        next: () => {
          this.showAlert('Cliente creado exitosamente');
          setTimeout(() => this.dialogRef.close(true), 1500);
        },
        error: (err) => this.handleError(err, 'crear')
      });
    }
  }

  private handleError(err: any, action: string): void {
    console.error(`Error al ${action} cliente:`, err);
    
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
        this.showAlert(`Error de validación al ${action} el cliente.`);
      }
    } else if (err.status === 401) {
      this.showAlert('No tienes permisos para realizar esta acción.');
    } else if (err.status === 409) {
      this.showAlert('Ya existe un cliente con este número de identificación.');
    } else {
      this.showAlert(`Error interno del servidor al ${action} el cliente.`);
    }
  }

  private showAlert(message: string): void {
    this.alertMessage = message;
    this.alertShow = true;
    setTimeout(() => this.alertShow = false, 5000); // Se oculta automáticamente después de 5 segundos
  }

  close() {
    this.dialogRef.close(false);
  }
}
