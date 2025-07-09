import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductService } from '../../services/product.service';
import { ProductEditModalComponent } from '../product-edit-modal/product-edit-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CategoryDetail } from '../../models/category-list.mode';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ImageService } from '../../../../shared/services/image.service';

@Component({
  selector: 'app-product-create-modal',
  standalone: true,
  imports: [MatDialogModule,
      CommonModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatOptionModule,
      MatSelectModule,
      MatIconModule,
    ],
  templateUrl: './product-create-modal.component.html',
  styleUrl: './product-create-modal.component.scss',
  providers: [ProductService, ImageService]
})
export class ProductCreateModalComponent {
    newProduct: ProductDetail = {
      id: '',             // or undefined, depending on the model
      name: '',
      price: 0,
      originalPrice: 0,
      images: [],
      details: [],
      categoryId: ''
      // add other required fields with defaults
    };
  
    constructor(
      private productService : ProductService,
      private imageService : ImageService,
      private dialogRef: MatDialogRef<ProductEditModalComponent>,
      @Inject(MAT_DIALOG_DATA) public categories: CategoryDetail[]
    ) {
    }
    cancel(): void {
    this.dialogRef.close();
  }

  create(): void {
    this.productService.createProduct(this.newProduct).subscribe(responseProduct => {      
      this.dialogRef.close({ created: true, data: responseProduct });
    });
  }
  addDetail(): void {
    this.newProduct.details.push({ title: '', content: '' });
  }

  removeDetail(index: number): void {
    this.newProduct.details.splice(index, 1);
  }



 
  imagePreviews: string[] = [];

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.imagePreviews = [];
    this.newProduct.images = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.imagePreviews.push(result);
        this.imageService.uploadImage(file).subscribe((newImageDetail)=>{
          this.newProduct.images.push(newImageDetail.filename); // store base64 or URL
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
