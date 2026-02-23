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
import { Voucher, UpdateVoucherDto } from '../../models/voucher.model';
import { CategoryDetail } from '../../../products/models/category-list.model';

@Component({
    selector: 'app-voucher-edit-modal',
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
    templateUrl: './voucher-edit-modal.component.html',
    styleUrls: ['./voucher-edit-modal.component.scss']
})
export class VoucherEditModalComponent implements OnInit {
    voucher: Voucher;
    categories: CategoryDetail[] = [];

    constructor(
        public dialogRef: MatDialogRef<VoucherEditModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.voucher = { ...data.voucher };
        // Convert date strings to Date objects
        this.voucher.startDate = new Date(this.voucher.startDate);
        this.voucher.endDate = new Date(this.voucher.endDate);

        if (data?.categories) {
            this.categories = data.categories;
        }
    }

    ngOnInit(): void {}

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {
        if (this.isValid()) {
            const updateData: UpdateVoucherDto = {
                name: this.voucher.name,
                description: this.voucher.description,
                discountType: this.voucher.discountType,
                discountValue: this.voucher.discountValue,
                minOrderAmount: this.voucher.minOrderAmount,
                maxDiscountAmount: this.voucher.maxDiscountAmount,
                usageLimit: this.voucher.usageLimit,
                startDate: this.voucher.startDate,
                endDate: this.voucher.endDate,
                isActive: this.voucher.isActive,
                applicableCategories: this.voucher.applicableCategories
            };
            this.dialogRef.close({ updated: true, data: updateData });
        }
    }

    isValid(): boolean {
        return !!(
            this.voucher.name &&
            this.voucher.discountValue > 0 &&
            this.voucher.startDate &&
            this.voucher.endDate
        );
    }
}
