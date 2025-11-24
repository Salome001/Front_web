import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { Alert } from '../../../shared/alert/alert';
import { RolDto } from '../../../models/role.dto';
import { CreateUserDto } from '../../../models/create-user.dto';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Alert],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserFormComponent implements OnInit {

  user: any = {
    id: null,
    identificationNumber: '',
    email: '',
    userName: '',
    password: '',
    roles: '', 
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    emailConfirmed: false,
    isLocked: false
  };

  rolesList: RolDto[] = [];
  alertMessage = '';
  alertShow = false;
  loadingRoles = true;

  errors: any = {
    identificationNumber: '',
    email: '',
    userName: '',
    password: '',
    roles: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  isEditMode = false;

  constructor(
    private usersService: UserService,
    private rolesService: RoleService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.rolesService.getAll().subscribe({
      next: (r) => {
        this.rolesList = r;
        this.loadingRoles = false;

        if (this.data) {
          setTimeout(() => {
            this.isEditMode = true;
            this.user = { ...this.data };

            if (this.data.roles && Array.isArray(this.data.roles)) {
              this.user.roles = this.data.roles[0];
            }

            this.user.currentPassword = '';
            this.user.newPassword = '';
            this.user.confirmNewPassword = '';
          });
        }
      },
      error: () => this.showAlert('Error cargando roles.')
    });
  }

  showAlert(msg: string) {
    this.alertMessage = msg;
    this.alertShow = true;
    setTimeout(() => this.alertShow = false, 3500);
  }

  validarCedula(ci: string): boolean { 
    if (!/^\d{10}$/.test(ci)) return false; 
    const tercerDigito = parseInt(ci[2], 10); 
    if (tercerDigito >= 6) return false; 
    let suma = 0; 
    const coef = [2,1,2,1,2,1,2,1,2]; 
    for (let i = 0; i < 9; i++) { 
      let mult = parseInt(ci[i]) * coef[i]; 
      if (mult >= 10) mult -= 9; 
      suma += mult; 
    } 
    const verificador = (10 - (suma % 10)) % 10; 
    return verificador === parseInt(ci[9]); 
  } 

  validarEmail(email: string): boolean { 
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); 
  }

  validateForm(): boolean {
    this.errors = { 
      identificationNumber: '', email: '', userName: '', 
      password: '', roles: '', currentPassword: '', newPassword: '', confirmNewPassword: '' 
    };

    let valid = true;

    if (!this.user.identificationNumber?.trim()) {
      this.errors.identificationNumber = "La cédula es obligatoria";
      valid = false;
    } else if (!this.validarCedula(this.user.identificationNumber)) {
      this.errors.identificationNumber = "La cédula no es válida";
      valid = false;
    }

    if (!this.user.email?.trim()) {
      this.errors.email = "El correo es obligatorio";
      valid = false;
    } else if (!this.validarEmail(this.user.email)) {
      this.errors.email = "El correo no tiene un formato válido";
      valid = false;
    }

    if (!this.user.userName?.trim()) {
      this.errors.userName = "El usuario es obligatorio";
      valid = false;
    }

    if (!this.user.roles || this.user.roles === '') {
      this.errors.roles = "Debe seleccionar un rol";
      valid = false;
    }

    if (!this.user.id) {
      if (!this.user.password?.trim()) {
        this.errors.password = "La contraseña es obligatoria";
        valid = false;
      } else {
        if (this.user.password.length < 6) this.errors.password = "Debe tener mínimo 6 caracteres";
        if (!/[A-Z]/.test(this.user.password)) this.errors.password = "Debe incluir al menos 1 mayúscula";
        if (!/[a-z]/.test(this.user.password)) this.errors.password = "Debe incluir al menos 1 minúscula";
        if (!/[0-9]/.test(this.user.password)) this.errors.password = "Debe incluir al menos 1 número";
      }
    }

    if (this.isEditMode) {
      if (!this.user.currentPassword?.trim()) {
        this.errors.currentPassword = "Debe ingresar la contraseña actual";
        valid = false;
      }
      if (!this.user.newPassword?.trim()) {
        this.errors.newPassword = "Debe ingresar la nueva contraseña";
        valid = false;
      }
      if (this.user.newPassword !== this.user.confirmNewPassword) {
        this.errors.confirmNewPassword = "Las contraseñas no coinciden";
        valid = false;
      }
      if (this.user.newPassword?.length < 6) {
        this.errors.newPassword = "Debe tener mínimo 6 caracteres";
        valid = false;
      }
    }

    return valid;
  }

  save() {
    if (!this.validateForm()) {
      this.showAlert("Corrige los campos marcados en rojo.");
      return;
    }

    if (!this.user.id) {
      const payload: CreateUserDto = {
        identificationNumber: this.user.identificationNumber,
        email: this.user.email,
        userName: this.user.userName,
        password: this.user.password,
        roles: [this.user.roles]
      };

      this.usersService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          if (err.status === 400) return this.showAlert("El usuario ya existe.");
          this.showAlert("Error creando usuario.");
        }
      });
      return;
    }

    const updatePayload: any = {
      id: this.user.id,
      identificationNumber: this.user.identificationNumber,
      email: this.user.email,
      userName: this.user.userName,
      roles: this.user.roles ? [this.user.roles] : [],
      emailConfirmed: this.user.emailConfirmed,
      isLocked: this.user.isLocked,
      currentPassword: this.user.currentPassword,
      newPassword: this.user.newPassword,
      confirmNewPassword: this.user.confirmNewPassword
    };

    this.usersService.update(updatePayload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.log('Error PUT:', err);
        this.showAlert("Error actualizando el usuario.");
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  soloNumeros(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
    this.user.identificationNumber = event.target.value;
  }
}
