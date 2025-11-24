import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.scss']
})
export class Alert {
  @Input() message: string = '';
  @Input() bgColor: string = '#e74c3c';
  @Input() textColor: string = '#ffffff';
  @Input() show: boolean = false;
}
