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
  isLoading = false;
  errorMessage = '';
  private cachedUsers: UserDto[] = [];
  private lastLoadTime = 0;
  private cacheExpiry = 30000; // 30 segundos

  constructor(
    private usersService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsersOptimized();
  }

  loadUsersOptimized(): void {
    const now = Date.now();
    
    // Si tenemos datos en caché y no han expirado, usarlos
    if (this.cachedUsers.length > 0 && (now - this.lastLoadTime) < this.cacheExpiry) {
      this.users = [...this.cachedUsers];
      console.log('Usuarios cargados desde caché');
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data || [];
        this.cachedUsers = [...this.users]; // Actualizar caché
        this.lastLoadTime = Date.now();
        this.isLoading = false;
        console.log('Usuarios cargados desde API:', this.users);
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Token de autenticación inválido. Por favor, inicie sesión nuevamente.';
        } else if (err.status === 0) {
          this.errorMessage = 'Error de conexión. Verifique su internet y que la API esté disponible.';
        } else {
          this.errorMessage = `Error cargando usuarios: ${err.status} - ${err.message}`;
        }
      }
    });
  }

  // Método para forzar recarga (usado por el botón actualizar)
  forceReload(): void {
    this.cachedUsers = [];
    this.lastLoadTime = 0;
    this.loadUsers();
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
    console.log('Editando usuario:', user);
    
    // Preparar datos completos para la edición
    const userData = {
      id: user.id,
      identificationNumber: user.identificationNumber,
      email: user.email,
      userName: user.userName,
      emailConfirmed: user.emailConfirmed,
      isLocked: user.isLocked,
      roles: user.roles && user.roles.length > 0 ? user.roles[0] : ''
    };

    console.log('Datos preparados para el formulario:', userData);

    // Abrir modal inmediatamente con datos precargados
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: userData,
      autoFocus: false // Evita delay de focus
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Usuario actualizado, recargando lista');
        this.cachedUsers = []; // Invalidar caché
        this.loadUsers();
      }
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
      data: { 
        entity: 'Usuarios',
        items: this.users // Pasar datos existentes para búsqueda inmediata
      },
      width: '90vw',     
      maxWidth: '90vw',  
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((selectedUser) => {
      if (selectedUser) {
        this.editUser(selectedUser);
      }
    });
  }
}
