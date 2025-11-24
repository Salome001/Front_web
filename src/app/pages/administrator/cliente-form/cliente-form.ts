import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClienteService } from '../../../services/client.service';
import { ClientDto } from '../../../models/client.dto';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
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

  errors: any = {
    identificationType: '',
    identificationNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: ''
  };

  constructor(
    private clienteService: ClienteService,
    private dialogRef: MatDialogRef<ClienteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientDto | null
  ) {
    if (data) this.cliente = { ...data };
  }

  validateForm(): boolean {
    this.errors = {
      identificationType: '',
      identificationNumber: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: ''
    };
    let valid = true;

    if (!this.cliente.identificationType) {
      this.errors.identificationType = 'Seleccione un tipo de identificación';
      valid = false;
    }
    if (!this.cliente.identificationNumber?.trim()) {
      this.errors.identificationNumber = 'El número de identificación es obligatorio';
      valid = false;
    }
    if (!this.cliente.firstName?.trim()) {
      this.errors.firstName = 'El nombre es obligatorio';
      valid = false;
    }
    if (!this.cliente.lastName?.trim()) {
      this.errors.lastName = 'El apellido es obligatorio';
      valid = false;
    }
    if (!this.cliente.phone?.trim()) {
      this.errors.phone = 'El teléfono es obligatorio';
      valid = false;
    }
    if (!this.cliente.email?.trim()) {
      this.errors.email = 'El correo electrónico es obligatorio';
      valid = false;
    }
    if (!this.cliente.address?.trim()) {
      this.errors.address = 'La dirección es obligatoria';
      valid = false;
    }

    return valid;
  }

  save() {
    if (!this.validateForm()) return;

    const payload: ClientDto = { ...this.cliente };

    if (this.cliente.clientId && this.cliente.clientId > 0) {
      this.clienteService.update(this.cliente.clientId!, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error al actualizar cliente', err)
      });
    } else {
      this.clienteService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error al crear cliente', err)
      });
    }
  }

  close() {
    this.dialogRef.close(false);
  }
}
