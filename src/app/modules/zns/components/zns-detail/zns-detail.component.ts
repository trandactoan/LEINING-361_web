import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ZnsService } from '../../services/zns.service';

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
  constructor(private znsService: ZnsService){}
  sendApi(){
    this.znsService.sendZns(this.templateData);
  }
}
