import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Banner } from '../../models/banner.model';
import { BannerService } from '../../services/banner.service';
import { BannerCreateModalComponent } from '../banner-create-modal/banner-create-modal.component';
import { BannerEditModalComponent } from '../banner-edit-modal/banner-edit-modal.component';

@Component({
    selector: 'app-banner-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
    ],
    templateUrl: './banner-list.component.html',
    styleUrls: ['./banner-list.component.scss'],
    providers: [BannerService],
})
export class BannerListComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    banners: Banner[] = [];
    displayedColumns = ['preview', 'order', 'link', 'status', 'action'];
    dataSource = new MatTableDataSource<Banner>(this.banners);
    readonly dialog = inject(MatDialog);

    constructor(private bannerService: BannerService) {}

    ngOnInit() {
        this.loadBanners();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    loadBanners() {
        this.bannerService.getAll().subscribe((banners) => {
            this.banners = banners;
            this.dataSource.data = this.banners;
            this.dataSource.paginator = this.paginator;
        });
    }

    onCreate() {
        const dialogRef = this.dialog.open(BannerCreateModalComponent, {
            width: '500px',
            maxWidth: '90vw',
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.bannerService.create(result).subscribe({
                    next: () => this.loadBanners(),
                    error: (err) => console.error('Error creating banner:', err),
                });
            }
        });
    }

    onEdit(banner: Banner) {
        const dialogRef = this.dialog.open(BannerEditModalComponent, {
            width: '500px',
            maxWidth: '90vw',
            disableClose: true,
            data: { banner },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.updated && banner.id) {
                this.bannerService.update(banner.id, result.data).subscribe({
                    next: () => this.loadBanners(),
                    error: (err) => console.error('Error updating banner:', err),
                });
            }
        });
    }

    onDelete(banner: Banner) {
        if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            if (banner.id) {
                this.bannerService.delete(banner.id).subscribe({
                    next: () => this.loadBanners(),
                    error: (err) => console.error('Error deleting banner:', err),
                });
            }
        }
    }
}
