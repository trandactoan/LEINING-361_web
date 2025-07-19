import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ZnsService } from '../../services/zns.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-zns-detail',
  standalone: true,
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule , MatIconModule ,FormsModule   ],
  templateUrl: './zns-detail.component.html',
  styleUrl: './zns-detail.component.scss',
  providers: [ZnsService]
})
export class ZnsDetailComponent {
  templateData = {
    phone: '',
    templateId: '',
    orderCode: '',
    templatePhone: '',
    price: '',
    status: '',
    date: '',
    name: '',
    trackingId: ''
  };
  constructor(private snackBar: MatSnackBar, private znsService: ZnsService){}
  sendApi(){
    this.znsService.sendZns(this.templateData).subscribe({
      next: () => {
        this.snackBar.open('✅ ZNS sent successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        const errorMessage =
          ('❌ ' + err?.error?.message) || '❌ Failed to send ZNS. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 4000,
          panelClass: ['snackbar-error'],
          verticalPosition: 'top',
        });
      },
    });
  }
}
