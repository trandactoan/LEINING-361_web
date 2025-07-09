import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductDetail } from '../../models/product-detail.model';
import { ProductEditModalComponent } from '../product-edit-modal/product-edit-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { CategoryDetail } from '../../models/category-list.mode';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, FormsModule, MatGridListModule, MatCardModule, ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  providers: [ProductService, CategoryService]
})
export class ProductDetailComponent {
  productId: string | null = null;
  product!: ProductDetail;
  categories!: CategoryDetail[]
  readonly dialog = inject(MatDialog);


  constructor(private route: ActivatedRoute, private productService: ProductService, private categoryService: CategoryService) {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.productService.getProductById(this.productId ?? "").subscribe(responseProduct => {
      this.product = responseProduct;
    })
    this.categoryService.getAllCategory().subscribe(categories => {
      this.categories = categories;
    })
  }
  loadProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe((res) => {
        this.product = res;
      });
    }
  }
  openEditDialog(): void {
    const dialogRef = this.dialog.open(ProductEditModalComponent, {
      width: '1000px',
      data: {product: this.product, categories: this.categories}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.product = result?.updatedProduct
      }
    });
  }
}
