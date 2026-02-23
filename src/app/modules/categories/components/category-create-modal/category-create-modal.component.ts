import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateCategoryDto } from '../../models/category.model';
import { ImageService } from '../../../../shared/services/image.service';

@Component({
    selector: 'app-category-create-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './category-create-modal.component.html',
    styleUrls: ['./category-create-modal.component.scss'],
    providers: [ImageService]
})
export class CategoryCreateModalComponent {
    category: CreateCategoryDto = {
        name: '',
        image: ''
    };

    imagePreview: string = '';
    imageFile: File | null = null;
    isUploading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<CategoryCreateModalComponent>,
        private imageService: ImageService
    ) {}

    async onImageSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            this.imageFile = file;
            this.isUploading = true;

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload to server
            try {
                const response = await this.imageService.uploadImage(file).toPromise();
                this.category.image = response?.path || response?.url || '';
            } catch (error) {
                console.error('Failed to upload image:', error);
                this.imagePreview = '';
                this.category.image = '';
            } finally {
                this.isUploading = false;
            }

            input.value = '';
        }
    }

    removeImage(): void {
        if (this.category.image) {
            // Optionally delete from server
            this.imageService.removeImage(this.category.image).subscribe({
                error: (err) => console.error('Failed to remove image:', err)
            });
        }
        this.imagePreview = '';
        this.category.image = '';
        this.imageFile = null;
    }

    cancel(): void {
        // Clean up uploaded image if canceling
        if (this.category.image) {
            this.imageService.removeImage(this.category.image).subscribe({
                error: (err) => console.error('Failed to remove image:', err)
            });
        }
        this.dialogRef.close();
    }

    create(): void {
        if (this.isValid()) {
            this.dialogRef.close(this.category);
        }
    }

    isValid(): boolean {
        return !!(this.category.name && this.category.name.trim()) && !this.isUploading;
    }
}
