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
  showPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

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
  ) {
    console.log('UserFormComponent constructor - data recibida:', this.data);
  }

  ngOnInit(): void {
    this.loadRoles();
    this.initializeFormData();
  }

  initializeFormData(): void {
    if (this.data) {
      console.log('Datos recibidos para edición:', this.data);
      this.isEditMode = true;
      
      // Cargar todos los datos del usuario
      this.user = {
        id: this.data.id || null,
        identificationNumber: this.data.identificationNumber || '',
        email: this.data.email || '',
        userName: this.data.userName || '',
        password: '',
        roles: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        emailConfirmed: this.data.emailConfirmed || false,
        isLocked: this.data.isLocked || false
      };

      // Manejar los roles
      if (this.data.roles) {
        if (Array.isArray(this.data.roles) && this.data.roles.length > 0) {
          this.user.roles = this.data.roles[0];
        } else if (typeof this.data.roles === 'string') {
          this.user.roles = this.data.roles;
        }
      }

      console.log('Usuario inicializado para edición:', this.user);
    } else {
      console.log('Modo creación - sin datos previos');
      this.isEditMode = false;
    }
  }

  loadRoles() {
    this.rolesService.getAll().subscribe({
      next: (r) => {
        this.rolesList = r || [];
        this.loadingRoles = false;
        console.log('Roles cargados:', this.rolesList);
        
        // Si estamos en modo edición y ya tenemos los datos, asegurar que el rol esté seleccionado
        if (this.isEditMode && this.data) {
          this.initializeFormData();
        }
      },
      error: (err) => {
        console.error('Error cargando roles:', err);
        this.loadingRoles = false;
        this.rolesList = [];
        if (err.status === 401) {
          this.showAlert('Token de autenticación inválido. Por favor, inicie sesión nuevamente.');
        } else {
          this.showAlert('Error cargando roles. Verifique su conexión.');
        }
      }
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

  validarPassword(password: string): boolean {
    // Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#+-])[A-Za-z\d@$!%*?&_#+-]{8,}$/;
    console.log('Validando contraseña:', password, 'Resultado:', regex.test(password));
    return regex.test(password);
  }

  togglePasswordVisibility(field: string): void {
    switch(field) {
      case 'password': this.showPassword = !this.showPassword; break;
      case 'currentPassword': this.showCurrentPassword = !this.showCurrentPassword; break;
      case 'newPassword': this.showNewPassword = !this.showNewPassword; break;
      case 'confirmPassword': this.showConfirmPassword = !this.showConfirmPassword; break;
    }
  }

  // Validación en tiempo real
  validateField(fieldName: string): void {
    switch(fieldName) {
      case 'identificationNumber':
        if (!this.user.identificationNumber?.trim()) {
          this.errors.identificationNumber = "La cédula es obligatoria";
        } else if (!this.validarCedula(this.user.identificationNumber)) {
          this.errors.identificationNumber = "La cédula no es válida";
        } else {
          this.errors.identificationNumber = '';
        }
        break;
      
      case 'email':
        if (!this.user.email?.trim()) {
          this.errors.email = "El correo es obligatorio";
        } else if (!this.validarEmail(this.user.email)) {
          this.errors.email = "El correo no tiene un formato válido";
        } else {
          this.errors.email = '';
        }
        break;
      
      case 'userName':
        if (!this.user.userName?.trim()) {
          this.errors.userName = "El usuario es obligatorio";
        } else if (this.user.userName.length < 3) {
          this.errors.userName = "El usuario debe tener mínimo 3 caracteres";
        } else {
          this.errors.userName = '';
        }
        break;
      
      case 'password':
        if (!this.isEditMode) {
          if (!this.user.password?.trim()) {
            this.errors.password = "La contraseña es obligatoria";
          } else if (!this.validarPassword(this.user.password)) {
            this.errors.password = "Debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial";
          } else {
            this.errors.password = '';
          }
        }
        break;
      
      case 'newPassword':
        if (this.isEditMode) {
          if (this.user.newPassword && this.user.newPassword.trim()) {
            if (!this.validarPassword(this.user.newPassword)) {
              this.errors.newPassword = "Debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial";
            } else {
              this.errors.newPassword = '';
            }
          } else {
            this.errors.newPassword = '';
          }
        }
        break;
      
      case 'confirmNewPassword':
        if (this.isEditMode) {
          if (this.user.confirmNewPassword && this.user.confirmNewPassword.trim()) {
            if (this.user.newPassword !== this.user.confirmNewPassword) {
              this.errors.confirmNewPassword = "Las contraseñas no coinciden";
            } else {
              this.errors.confirmNewPassword = '';
            }
          } else {
            this.errors.confirmNewPassword = '';
          }
        }
        break;
      
      case 'roles':
        if (!this.user.roles || this.user.roles === '') {
          this.errors.roles = "Debe seleccionar un rol";
        } else {
          this.errors.roles = '';
        }
        break;
    }
  }

  validateForm(): boolean {
    // Validar todos los campos
    this.validateField('identificationNumber');
    this.validateField('email');
    this.validateField('userName');
    this.validateField('roles');
    
    if (!this.isEditMode) {
      this.validateField('password');
    }
    // En modo edición no validamos contraseñas ya que el controller actual no las maneja

    // Verificar si hay errores
    return Object.values(this.errors).every(error => error === '');
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

    // Crear payload simplificado que coincida con el UserUpdateDto del backend
    const updatePayload: any = {
      id: this.user.id,
      identificationNumber: this.user.identificationNumber,
      email: this.user.email,
      userName: this.user.userName,
      roles: this.user.roles ? [this.user.roles] : [],
      emailConfirmed: this.user.emailConfirmed,
      isLocked: this.user.isLocked
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
