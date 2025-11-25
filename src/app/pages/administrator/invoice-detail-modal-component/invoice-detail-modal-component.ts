import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../services/invoice.service';
import { CurrencyPipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
          this.cd.detectChanges();
        },
        err => {
          console.error('Error al obtener detalles:', err);
        }
      );
    }
  }

  close() {
    this.dialogRef.close();
  }

  // 🔥🔥 Exportación estéticamente avanzada en PDF 🔥🔥
  exportPDF() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const title = `Factura #${this.data.invoiceNumber}`;

    // ░░ Encabezado elegante ░░
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 80, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 20, 50);

    // ░░ Información del cliente ░░
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);

    const infoY = 110;
    doc.text(`Cliente:  ${this.data.client?.firstName} ${this.data.client?.lastName}`, 20, infoY);
    doc.text(`Fecha emisión:  ${new Date(this.data.issueDate).toLocaleDateString()}`, 20, infoY + 20);
    doc.text(`Subtotal: $${this.data.subtotal.toFixed(2)}`, 20, infoY + 40);
    doc.text(`IVA: $${this.data.tax.toFixed(2)}`, 20, infoY + 60);
    doc.text(`Total: $${this.data.total.toFixed(2)}`, 20, infoY + 80);

    // ░░ Tabla de detalles de factura ░░
    const tableBody = this.details.map(d => [
      d.product?.code,
      d.product?.name,
      d.product?.description,
      `$${d.unitPrice.toFixed(2)}`,
      d.quantity,
      `$${d.subtotal.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: infoY + 110,
      head: [['Código', 'Producto', 'Descripción', 'Precio', 'Cant.', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 80 },
        2: { cellWidth: 110 },
        3: { cellWidth: 50 },
        4: { cellWidth: 40 },
        5: { cellWidth: 50 }
      }
    });

    // ░░ Footer elegante ░░
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(11);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento generado automáticamente por el sistema', 20, pageHeight - 20);

    // Guardar PDF
    doc.save(`Factura_${this.data.invoiceNumber}.pdf`);
  }
}
