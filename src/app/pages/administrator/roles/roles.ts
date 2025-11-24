import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { RoleService } from '../../../services/role.service';
import { RolDto } from '../../../models/role.dto';
import { RoleFormComponent } from '../role-form/role-form';
import { SearchModalComponent } from '../../../shared/search-modal/search-modal';
import { Alert } from '../../../shared/alert/alert';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    Alert
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class RolesComponent implements OnInit {
  roles: RolDto[] = [];
  displayedColumns = ['name', 'description', 'isActive', 'actions'];

  alertMessage = '';
  alertShow = false;

  constructor(private roleService: RoleService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  showAlert(msg: string) {
    this.alertMessage = msg;
    this.alertShow = true;
    setTimeout(() => this.alertShow = false, 3500);
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => this.roles = res,
      error: () => this.showAlert('Error cargando roles.')
    });
  }

  addRole(): void {
    const dialogRef = this.dialog.open(RoleFormComponent, { data: null });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadRoles();
    });
  }

  editRole(role: RolDto): void {
    const dialogRef = this.dialog.open(RoleFormComponent, { data: role });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadRoles();
    });
  }

  deleteRole(id: string): void {
    if (!id) {
      this.showAlert('ID del rol no válido.');
      return;
    }
    if (confirm('¿Desea eliminar este rol?')) {
      this.roleService.delete(id).subscribe({
        next: () => this.loadRoles(),
        error: () => this.showAlert('Error eliminando rol.')
      });
    }
  }

  openSearch(): void {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      data: { entity: 'Roles' },
      width: '700px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((selectedRole) => {
      if (!selectedRole) return;
      this.editRole(selectedRole);
    });
  }
}
