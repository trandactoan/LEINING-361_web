import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Voucher } from '../../models/voucher.model';
import { VoucherService } from '../../services/voucher.service';
import { VoucherCreateModalComponent } from '../voucher-create-modal/voucher-create-modal.component';
import { VoucherEditModalComponent } from '../voucher-edit-modal/voucher-edit-modal.component';
import { CategoryService } from '../../../products/services/category.service';
import { CategoryDetail } from '../../../products/models/category-list.model';

@Component({
    selector: 'app-voucher-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule
    ],
    templateUrl: './voucher-list.component.html',
    styleUrls: ['./voucher-list.component.scss'],
    providers: [VoucherService, CategoryService]
})
export class VoucherListComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private voucherService: VoucherService,
        private categoryService: CategoryService
    ) {}

    vouchers: Voucher[] = [];
    categories: CategoryDetail[] = [];

    displayedColumns = ['code', 'name', 'type', 'value', 'usage', 'dates', 'status', 'action'];
    dataSource = new MatTableDataSource<Voucher>(this.vouchers);
    readonly dialog = inject(MatDialog);

    ngOnInit() {
        this.loadVouchers();
        this.categoryService.getAllCategory().subscribe(categories => {
            this.categories = categories;
        });
    }

    loadVouchers() {
        this.voucherService.getAll().subscribe(vouchers => {
            this.vouchers = vouchers;
            this.dataSource.data = this.vouchers;
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    getStatusClass(voucher: Voucher): string {
        if (!voucher.isActive) return 'inactive';
        const now = new Date();
        const startDate = new Date(voucher.startDate);
        const endDate = new Date(voucher.endDate);
        if (now < startDate) return 'scheduled';
        if (now > endDate) return 'expired';
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return 'exhausted';
        return 'active';
    }

    getStatusText(voucher: Voucher): string {
        const status = this.getStatusClass(voucher);
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Tắt';
            case 'scheduled': return 'Chờ kích hoạt';
            case 'expired': return 'Hết hạn';
            case 'exhausted': return 'Hết lượt';
            default: return 'N/A';
        }
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    formatDiscount(voucher: Voucher): string {
        if (voucher.discountType === 'percentage') {
            return `${voucher.discountValue}%`;
        }
        return `${voucher.discountValue.toLocaleString('vi-VN')}₫`;
    }

    onCreate() {
        const dialogRef = this.dialog.open(VoucherCreateModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            disableClose: true,
            data: { categories: this.categories }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.voucherService.create(result).subscribe({
                    next: () => {
                        this.loadVouchers();
                    },
                    error: (err) => {
                        console.error('Error creating voucher:', err);
                    }
                });
            }
        });
    }

    onEdit(voucher: Voucher) {
        const dialogRef = this.dialog.open(VoucherEditModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            disableClose: true,
            data: { voucher, categories: this.categories }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated && voucher.id) {
                this.voucherService.update(voucher.id, result.data).subscribe({
                    next: () => {
                        this.loadVouchers();
                    },
                    error: (err) => {
                        console.error('Error updating voucher:', err);
                    }
                });
            }
        });
    }

    onDelete(voucher: Voucher) {
        if (confirm(`Bạn có chắc chắn muốn xóa voucher "${voucher.code}"?`)) {
            if (voucher.id) {
                this.voucherService.delete(voucher.id).subscribe({
                    next: () => {
                        this.loadVouchers();
                    },
                    error: (err) => {
                        console.error('Error deleting voucher:', err);
                    }
                });
            }
        }
    }
}
