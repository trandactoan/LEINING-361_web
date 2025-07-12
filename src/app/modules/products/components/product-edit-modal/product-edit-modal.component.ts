import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';
import { MatSelectModule } from '@angular/material/select';
import { CategoryDetail } from '../../models/category-list.mode';
import { MatIconModule } from '@angular/material/icon';
import { ImageService } from '../../../../shared/services/image.service';

@Component({
  selector: 'app-product-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-edit-modal.component.html',
  providers: [ProductService]
})
export class ProductEditModalComponent {
  editedProduct: ProductDetail;
  categories: CategoryDetail[];

  constructor(
    private productService : ProductService,
    private imageService: ImageService,
    private dialogRef: MatDialogRef<ProductEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.editedProduct = { ...data.product }; // clone to edit safely
    this.categories = data.categories;
  }
  ngOnInit(){
    this.imagePreviews = this.editedProduct.images.map(url => ({
      previewUrl: url,
      isNew: false
    }));
  }

  save(){
    this.productService.updateProduct(this.editedProduct).subscribe({
      next: () => {
        this.dialogRef.close({ updated: true, updatedProduct: this.editedProduct });
      },
      error: (err) => {
        console.error('Update failed', err);
      }
    });
    this.deleteImage.forEach((imageName) => {
      this.imageService.removeImage(imageName).subscribe();
    });
    this.deleteImage = [];
  }

  cancel(): void {  
    this.deleteImage = [];
    this.dialogRef.close();
  }

  addDetail(): void {
    this.editedProduct.details.push({ title: '', content: '' });
  }

  removeDetail(index: number): void {
    this.editedProduct.details.splice(index, 1);
  }

  imagePreviews: { previewUrl: string; file?: File; isNew: boolean }[] = [];
  deleteImage: string[] = [];

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push({
          previewUrl: reader.result as string,
          file: file,
          isNew: true
        });
        this.imageService.uploadImage(file).subscribe((newImageDetail)=>{
          this.editedProduct.images.push(newImageDetail.filename); // store base64 or URL
        });
      };
      reader.readAsDataURL(file);
    });
  }
  removeImage(index: number){
    var name = this.editedProduct.images[index];
    if(this.imagePreviews[index].isNew == true){
      this.editedProduct.images.splice(index, 1);
      this.imageService.removeImage(name).subscribe();
    } else {
      this.deleteImage.push(name);
    }
    this.imagePreviews.splice(index, 1);
  }
    addColor() {
    this.editedProduct.colors.push({ name: '', hex: '' });
  }

  removeColor(index: number) {
    this.editedProduct.colors.splice(index, 1);
  }
}
