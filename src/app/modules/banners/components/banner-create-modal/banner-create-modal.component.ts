import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CreateBannerDto } from '../../models/banner.model';

@Component({
    selector: 'app-banner-create-modal',
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
    templateUrl: './banner-create-modal.component.html',
    styleUrls: ['./banner-create-modal.component.scss'],
})
export class BannerCreateModalComponent {
    banner: CreateBannerDto = {
        imageUrl: '',
        order: 0,
        link: '',
        isActive: true,
    };

    constructor(public dialogRef: MatDialogRef<BannerCreateModalComponent>) {}

    cancel(): void {
        this.dialogRef.close();
    }

    create(): void {
        if (this.isValid()) {
            const payload = { ...this.banner, link: this.banner.link || undefined };
            this.dialogRef.close(payload);
        }
    }

    isValid(): boolean {
        return !!this.banner.imageUrl;
    }
}
