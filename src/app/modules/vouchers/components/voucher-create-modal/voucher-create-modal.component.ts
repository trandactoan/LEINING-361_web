import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CreateVoucherDto } from '../../models/voucher.model';
import { CategoryDetail } from '../../../products/models/category-list.model';

@Component({
    selector: 'app-voucher-create-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './voucher-create-modal.component.html',
    styleUrls: ['./voucher-create-modal.component.scss']
})
export class VoucherCreateModalComponent implements OnInit {
    voucher: CreateVoucherDto = {
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: undefined,
        usageLimit: undefined,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        applicableCategories: []
    };

    categories: CategoryDetail[] = [];

    constructor(
        public dialogRef: MatDialogRef<VoucherCreateModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        if (data?.categories) {
            this.categories = data.categories;
        }
    }

    ngOnInit(): void {
        // Set default end date to 30 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        this.voucher.endDate = endDate;
    }

    onCodeInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.voucher.code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    cancel(): void {
        this.dialogRef.close();
    }

    create(): void {
        if (this.isValid()) {
            this.dialogRef.close(this.voucher);
        }
    }

    isValid(): boolean {
        return !!(
            this.voucher.code &&
            this.voucher.name &&
            this.voucher.discountValue > 0 &&
            this.voucher.startDate &&
            this.voucher.endDate
        );
    }
}
