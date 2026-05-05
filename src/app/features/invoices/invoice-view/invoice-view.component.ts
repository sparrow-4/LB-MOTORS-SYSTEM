import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../shared/models/invoice.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice-view',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './invoice-view.component.html',
  styleUrl: './invoice-view.component.css'
})
export class InvoiceViewComponent implements OnInit {
  invoice: Invoice | null = null;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoice = this.invoiceService.getById(id) || null;
    }
  }

  printInvoice(): void {
    window.print();
  }

  async saveAsPDF(): Promise<void> {
    const data = document.getElementById('invoicePaper');
    if (!data || !this.invoice) return;

    try {
      const canvas = await html2canvas(data, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const contentDataURL = canvas.toDataURL('image/png');
      
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const pdfBase64 = pdf.output('datauristring');
      const fileName = `Invoice_${this.invoice.invoiceNumber}.pdf`;
      
      // Save to our structured local folder
      await (window as any).electronAPI.saveDocument('invoices', '', fileName, pdfBase64);
      
      this.snackBar.open(`Invoice saved to LB-Motors-Data/documents/invoices/${fileName}`, 'Close', { duration: 5000 });
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackBar.open('Failed to save invoice as PDF', 'Close', { duration: 3000 });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  numberToWords(amount: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (amount === 0) return 'Zero';

    const convert = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    return convert(Math.floor(amount)) + ' Rupees Only';
  }
}
