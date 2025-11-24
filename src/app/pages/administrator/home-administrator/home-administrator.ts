import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-home-administrator',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './home-administrator.html',
  styleUrls: ['./home-administrator.scss']
})
export class HomeAdministratorComponent implements AfterViewInit, OnInit {
  username: string = '';
  role: string = '';
  loading: boolean = true;

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Leer usuario de sessionStorage si existe
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.username = user.userName || 'Usuario';
      this.role = user.roles?.includes('Administrator') ? 'Administrator' : 'user';
      this.loading = false;
    } else {
      this.fetchCurrentUser();
    }
  }

  ngAfterViewInit() {
    if (this.bgVideo) {
      const video = this.bgVideo.nativeElement;
      const playVideo = () => video.play().catch(() => setTimeout(playVideo, 500));
      playVideo();
    }
  }

  fetchCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        this.username = res.userName || 'Usuario';
        this.role = res.roles?.includes('Administrator') ? 'Administrator' : 'user';
        sessionStorage.setItem('user', JSON.stringify(res));
        this.loading = false;
      },
      error: () => {
        this.username = 'Invitado';
        this.role = 'User';
        this.loading = false;
      }
    });
  }

  isAdmin(): boolean {
    return this.role === 'Administrator';
  }
}
