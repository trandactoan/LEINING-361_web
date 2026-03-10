import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageService } from '../../../../shared/services/image.service';
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
        MatProgressBarModule,
    ],
    templateUrl: './banner-edit-modal.component.html',
    styleUrls: ['./banner-edit-modal.component.scss'],
    providers: [ImageService],
})
export class BannerEditModalComponent {
    banner: UpdateBannerDto;
    imagePreview: string = '';
    isUploading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<BannerEditModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { banner: Banner },
        private imageService: ImageService,
    ) {
        this.banner = {
            imageUrl: data.banner.imageUrl,
            order: data.banner.order,
            link: data.banner.link ?? '',
            isActive: data.banner.isActive,
        };
        this.imagePreview = data.banner.imageUrl;
    }

    async onImageSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        input.value = '';

        const oldUrl = this.banner.imageUrl;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload new image
        this.isUploading = true;
        try {
            const response = await this.imageService.uploadImage(file).toPromise();
            this.banner.imageUrl = response?.path ?? '';
            // Remove old image after successful upload
            if (oldUrl) {
                this.imageService.removeImage(oldUrl).subscribe();
            }
        } catch (err) {
            console.error('Image upload failed:', err);
            this.imagePreview = this.data.banner.imageUrl;
            this.banner.imageUrl = this.data.banner.imageUrl;
        } finally {
            this.isUploading = false;
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {
        if (!this.isValid()) return;
        const payload = { ...this.banner, link: this.banner.link || undefined };
        this.dialogRef.close({ updated: true, data: payload });
    }

    isValid(): boolean {
        return !!this.banner.imageUrl && !this.isUploading;
    }
}
