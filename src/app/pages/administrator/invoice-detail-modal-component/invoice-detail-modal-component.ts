import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../services/invoice.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, CurrencyPipe],
  templateUrl: './invoice-detail-modal-component.html',
  styleUrls: ['./invoice-detail-modal-component.scss']
})
export class InvoiceDetailModalComponent implements OnInit {

  details: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<InvoiceDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private invoiceService: InvoiceService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.data?.invoiceId) {
      console.log('Solicitud de detalles para invoiceId:', this.data.invoiceId);
      this.invoiceService.getDetails(this.data.invoiceId).subscribe(
        res => {
          console.log('Respuesta de detalles de factura:', res);
          this.details = res;

          // Forzar Angular a detectar cambios después de actualizar details
          this.cd.detectChanges();
        },
        err => {
          console.error('Error al obtener detalles de la factura:', err);
        }
      );
    } else {
      console.warn('No se proporcionó invoiceId en los datos del modal');
    }
  }

  close() {
    this.dialogRef.close();
  }
}
