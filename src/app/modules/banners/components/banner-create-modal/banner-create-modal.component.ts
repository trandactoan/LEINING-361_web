import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageService } from '../../../../shared/services/image.service';
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
        MatProgressBarModule,
    ],
    templateUrl: './banner-create-modal.component.html',
    styleUrls: ['./banner-create-modal.component.scss'],
    providers: [ImageService],
})
export class BannerCreateModalComponent {
    banner: CreateBannerDto = {
        imageUrl: '',
        order: 0,
        link: '',
        isActive: true,
    };

    imagePreview: string = '';
    isUploading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<BannerCreateModalComponent>,
        private imageService: ImageService,
    ) {}

    async onImageSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        input.value = '';

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload to server
        this.isUploading = true;
        try {
            const response = await this.imageService.uploadImage(file).toPromise();
            this.banner.imageUrl = response?.url ?? '';
        } catch (err) {
            console.error('Image upload failed:', err);
            this.imagePreview = '';
            this.banner.imageUrl = '';
        } finally {
            this.isUploading = false;
        }
    }

    removeImage(): void {
        if (this.banner.imageUrl) {
            this.imageService.removeImage(this.banner.imageUrl).subscribe();
        }
        this.banner.imageUrl = '';
        this.imagePreview = '';
    }

    cancel(): void {
        if (this.banner.imageUrl) {
            this.imageService.removeImage(this.banner.imageUrl).subscribe();
        }
        this.dialogRef.close();
    }

    create(): void {
        if (!this.isValid()) return;
        const payload = { ...this.banner, link: this.banner.link || undefined };
        this.dialogRef.close(payload);
    }

    isValid(): boolean {
        return !!this.banner.imageUrl && !this.isUploading;
    }
}
