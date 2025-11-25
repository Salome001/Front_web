import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { UserDto } from '../../../models/user.dto';
import { UserFormComponent } from '../user-form/user-form';
import { SearchModalComponent } from '../../../shared/search-modal/search-modal';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];

  constructor(
    private usersService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getAll().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  addUser(): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadUsers();
    });
  }

  editUser(user: UserDto): void {
    const data = {
      ...user,
      roles: user.roles && user.roles.length > 0 ? user.roles[0] : ''
    };

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadUsers();
    });
  }

  deleteUser(id: string): void {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usersService.delete(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error eliminando usuario:', err)
      });
    }
  }

  unlockUser(id: string): void {
    if (confirm('¿Deseas desbloquear este usuario?')) {
      this.usersService.unlock(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error desbloqueando usuario:', err)
      });
    }
  }

  openSearch(): void {
  const dialogRef = this.dialog.open(SearchModalComponent, {
    data: { entity: 'Usuarios' },
    width: '90vw',     
  maxWidth: '90vw',  
    disableClose: false
  });

  dialogRef.afterClosed().subscribe((selectedUser) => {
    if (selectedUser) {
      this.editUser(selectedUser);
    }
  });
}
}
