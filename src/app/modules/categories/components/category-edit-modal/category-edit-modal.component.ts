import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category, UpdateCategoryDto } from '../../models/category.model';
import { ImageService } from '../../../../shared/services/image.service';

@Component({
    selector: 'app-category-edit-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    templateUrl: './category-edit-modal.component.html',
    styleUrls: ['./category-edit-modal.component.scss'],
    providers: [ImageService]
})
export class CategoryEditModalComponent {
    category: UpdateCategoryDto;
    originalCategory: Category;

    imagePreview: string = '';
    originalImage: string = '';
    isUploading: boolean = false;
    newImageUploaded: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<CategoryEditModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { category: Category },
        private imageService: ImageService
    ) {
        this.originalCategory = data.category;
        this.category = {
            name: data.category.name,
            image: data.category.image || ''
        };
        this.imagePreview = data.category.image || '';
        this.originalImage = data.category.image || '';
    }

    async onImageSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
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
                this.newImageUploaded = true;
            } catch (error) {
                console.error('Failed to upload image:', error);
                this.imagePreview = this.originalImage;
                this.category.image = this.originalImage;
            } finally {
                this.isUploading = false;
            }

            input.value = '';
        }
    }

    removeImage(): void {
        // If a new image was uploaded, delete it from server
        if (this.newImageUploaded && this.category.image) {
            this.imageService.removeImage(this.category.image).subscribe({
                error: (err) => console.error('Failed to remove image:', err)
            });
        }
        this.imagePreview = '';
        this.category.image = '';
        this.newImageUploaded = false;
    }

    cancel(): void {
        // Clean up newly uploaded image if canceling
        if (this.newImageUploaded && this.category.image) {
            this.imageService.removeImage(this.category.image).subscribe({
                error: (err) => console.error('Failed to remove image:', err)
            });
        }
        this.dialogRef.close();
    }

    save(): void {
        if (this.isValid()) {
            this.dialogRef.close({
                updated: true,
                data: this.category
            });
        }
    }

    isValid(): boolean {
        return !!(this.category.name && this.category.name.trim()) && !this.isUploading;
    }
}
