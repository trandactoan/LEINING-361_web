import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProductListElement } from '../../models/product-list.model';
import { ProductService } from '../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductEditModalComponent } from '../product-edit-modal/product-edit-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductCreateModalComponent } from '../product-create-modal/product-create-modal.component';
import { CategoryDetail } from '../../models/category-list.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  providers: [ProductService, CategoryService]
})
export class ProductListComponent {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(private productService: ProductService, private categoryService: CategoryService, private router: Router){}
  
  products! : ProductListElement[]
  categories! : CategoryDetail[]
  
  displayedColumns = ['id', 'name', 'price', 'action']
  dataSource = new MatTableDataSource<ProductListElement>(this.products);
  readonly dialog = inject(MatDialog);
  
  
  ngOnInit(){
    this.productService.getAll().subscribe(responseProducts => {
      this.products = responseProducts;    
      this.dataSource.data = this.products;
      this.dataSource.paginator = this.paginator;  
    });
    this.categoryService.getAllCategory().subscribe(responseCategories => {
      this.categories = responseCategories;
    });
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  onEdit(element: ProductListElement) {
    this.productService.getProductById(element.id).subscribe(product => {
      const dialogRef = this.dialog.open(ProductEditModalComponent, {
        width: '1000px',
        maxHeight: '90vh',
        data: {product: product, categories: this.categories},
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result?.updated) {
          const index = this.products.findIndex(product => product.id === result?.updatedProduct.id);
          if (index !== -1) {
            this.products[index].name = result?.updatedProduct.name;
            this.products[index].price = result?.updatedProduct.price;
          }
          this.dataSource.data = this.products;
          this.dataSource.paginator = this.paginator; 
        }
      });
    })
  }

  
  onCreate() {
    const dialogRef = this.dialog.open(ProductCreateModalComponent, {
      width: '90%',
      maxWidth: '1400px',
      maxHeight: '90vh',
      data: this.categories,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result contains the product data from the modal
        this.productService.createProduct(result).subscribe({
          next: (createdProduct) => {
            this.productService.getAll().subscribe(responseProducts => {
              this.products = responseProducts;
              this.dataSource.data = this.products;
              this.dataSource.paginator = this.paginator;
            });
          },
          error: (err) => {
            console.error('Error creating product:', err);
          }
        });
      }
    });
  }

  onDelete(element: ProductListElement) {
    this.productService.deleteProduct(element.id).subscribe(_ => {
      this.productService.getAll().subscribe(responseProducts => {
        this.products = responseProducts;
        this.dataSource.data = this.products;
        this.dataSource.paginator = this.paginator;
      });
    });
  }
}
