import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Alert } from '../../shared/alert/alert';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, Alert],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements AfterViewInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  alertBg: string = '#e74c3c';
  alertColor: string = '#ffffff';
  showAlert: boolean = false;

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(private http: HttpClient, private router: Router) {}

  ngAfterViewInit() {
    const video = this.bgVideo.nativeElement;
    const playVideo = () => {
      video.play().catch(() => setTimeout(playVideo, 500));
    };
    playVideo();
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.showError("Todos los campos son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showError("Ingrese un correo válido");
      return;
    }

    const body = { email: this.email, password: this.password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(`${environment.baseUrl}/Auth/login`, body, { headers }).subscribe({
      next: (res) => {
        console.log('Respuesta del login:', res);

        sessionStorage.setItem('token', res.token);

        const user = {
          email: res.user.email,
          userName: res.user.username,
          roles: res.user.roles
        };
        sessionStorage.setItem('user', JSON.stringify(user));

        console.log('Usuario guardado en sessionStorage:', user);

        if (user.roles?.includes('Administrator')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/employees']);
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Error en el inicio de sesión');
      }
    });
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 3000);
  }
}
