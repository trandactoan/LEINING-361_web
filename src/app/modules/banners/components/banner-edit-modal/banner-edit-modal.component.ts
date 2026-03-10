import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Banner, UpdateBannerDto } from '../../models/banner.model';

@Component({
    selector: 'app-banner-edit-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
    ],
    templateUrl: './banner-edit-modal.component.html',
    styleUrls: ['./banner-edit-modal.component.scss'],
})
export class BannerEditModalComponent {
    banner: UpdateBannerDto;

    constructor(
        public dialogRef: MatDialogRef<BannerEditModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { banner: Banner },
    ) {
        this.banner = {
            imageUrl: data.banner.imageUrl,
            order: data.banner.order,
            link: data.banner.link ?? '',
            isActive: data.banner.isActive,
        };
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {
        if (this.isValid()) {
            const payload = { ...this.banner, link: this.banner.link || undefined };
            this.dialogRef.close({ updated: true, data: payload });
        }
    }

    isValid(): boolean {
        return !!this.banner.imageUrl;
    }
}
