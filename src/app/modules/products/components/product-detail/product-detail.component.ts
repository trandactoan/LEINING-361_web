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
import { CategoryDetail } from '../../models/category-list.model';
import { CategoryService } from '../../services/category.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, FormsModule, MatGridListModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  providers: [ProductService, CategoryService]
})
export class ProductDetailComponent {
  productId: string | null = null;
  product!: ProductDetail;
  // option groups derived from variants
  optionGroups: { name: string; values: string[] }[] = [];
  selectedOptions: Record<string, string> = {};
  selectedVariant: any | undefined;
  displayedImage?: string;
  categories!: CategoryDetail[]
  readonly dialog = inject(MatDialog);


  constructor(private route: ActivatedRoute, private productService: ProductService, private categoryService: CategoryService) {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.productService.getProductById(this.productId ?? "").subscribe(responseProduct => {
      this.product = responseProduct;
      this.setupVariants();
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
          this.setupVariants();
      });
    }
  }

    setupVariants() {
      // initialize displayed image
      this.displayedImage = this.product.images?.[0];

      // build option groups from variants or fallback to colors/sizes
      if (this.product.hasVariants && Array.isArray(this.product.variants) && this.product.variants.length > 0) {
        const map: Record<string, Set<string>> = {};
        this.product.variants.forEach(v => {
          (v.attributes || []).forEach((a: any) => {
            map[a.name] = map[a.name] || new Set<string>();
            map[a.name].add(String(a.value));
          });
        });
        this.optionGroups = Object.keys(map).map(name => ({ name, values: Array.from(map[name]) }));
        // select defaults
        this.optionGroups.forEach(g => {
          this.selectedOptions[g.name.toLowerCase()] = g.values[0];
        });
        this.findSelectedVariant();
      } else {
        // fallback: use colors/sizes
        this.optionGroups = [];
        if (this.product.colors && this.product.colors.length) {
          this.optionGroups.push({ name: 'Color', values: this.product.colors.map(c => c.name) });
          this.selectedOptions['color'] = this.product.colors[0].name;
        }
        if (this.product.sizes && this.product.sizes.length) {
          this.optionGroups.push({ name: 'Size', values: this.product.sizes });
          this.selectedOptions['size'] = this.product.sizes[0];
        }
      }
    }

    selectOption(groupName: string, value: string) {
      this.selectedOptions[groupName.toLowerCase()] = value;
      this.findSelectedVariant();
    }

    findSelectedVariant() {
      if (!this.product.hasVariants || !this.product.variants) {
        this.selectedVariant = undefined;
        return;
      }
      const sel = this.selectedOptions;
      this.selectedVariant = this.product.variants.find((v: any) => {
        return (v.attributes || []).every((a: any) => sel[a.name.toLowerCase()] === String(a.value));
      });
      if (this.selectedVariant) {
        // override displayed image and price where needed
        if (this.selectedVariant.variationImage) {
          this.displayedImage = this.selectedVariant.variationImage;
        } else {
          this.displayedImage = this.product.images?.[0];
        }
      } else {
        this.displayedImage = this.product.images?.[0];
      }
    }
  openEditDialog(): void {
    const dialogRef = this.dialog.open(ProductEditModalComponent, {
      width: '90vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      data: {product: this.product, categories: this.categories}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.product = result?.updatedProduct
      }
    });
  }
}
