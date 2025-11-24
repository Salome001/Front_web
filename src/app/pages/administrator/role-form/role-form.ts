import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RoleService } from '../../../services/role.service';
import { RolDto } from '../../../models/role.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Alert } from '../../../shared/alert/alert';

@Component({
  selector: 'app-role-form',
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
  templateUrl: './role-form.html',
  styleUrls: ['./role-form.scss']
})
export class RoleFormComponent {
  role: RolDto = { id: '', name: '', description: '', isActive: true, createdAt: '' };

  errors: any = { name: '' };
  alertMessage = '';
  alertShow = false;

  constructor(
    private roleService: RoleService,
    private dialogRef: MatDialogRef<RoleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RolDto | null
  ) {
    if (data) this.role = { ...data };
  }

  showAlert(msg: string) {
    this.alertMessage = msg;
    this.alertShow = true;
    setTimeout(() => this.alertShow = false, 3500);
  }

  validateForm(): boolean {
    this.errors = { name: '' };
    let valid = true;

    if (!this.role.name?.trim()) {
      this.errors.name = 'El nombre del rol es obligatorio';
      valid = false;
    }

    return valid;
  }

  save() {
    if (!this.validateForm()) {
      this.showAlert('Corrige los campos marcados en rojo.');
      return;
    }

    if (this.role.id) {
      this.roleService.update(this.role).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.showAlert('Error actualizando el rol.')
      });
    } else {
      this.roleService.create(this.role).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.showAlert('Error creando el rol.')
      });
    }
  }

  close() {
    this.dialogRef.close(false);
  }
}
