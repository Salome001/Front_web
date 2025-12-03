import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomeAdministratorComponent } from './pages/administrator/home-administrator/home-administrator';
import { RolesComponent } from './pages/administrator/roles/roles';
import { ClientesComponent } from './pages/administrator/clients/clients';
import { ProductsComponent } from './pages/administrator/products/products'; // <-- Importa tu componente de productos
import { UsersComponent } from './pages/administrator/users/users';
import { HomeEmployees } from './pages/employees/home-employees/home-employees';
import { InvoiceComponent } from './pages/administrator/invoice/invoice';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  { path: 'admin',
    component: HomeAdministratorComponent,
    children: [
      { path: '', redirectTo: 'clientes', pathMatch: 'full' }, 
      { path: 'clientes', component: ClientesComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'productos', component: ProductsComponent }, 
      { path: 'usuarios', component: UsersComponent },
      { path: 'facturas', component: InvoiceComponent }
    ],
  },

  { path: 'employees', 
    component: HomeEmployees,
    children: [
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: 'facturas', component: InvoiceComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'productos', component: ProductsComponent }

    ]


  },
  
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/login' }
];
