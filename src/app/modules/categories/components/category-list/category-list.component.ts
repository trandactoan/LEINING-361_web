import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { CategoryCreateModalComponent } from '../category-create-modal/category-create-modal.component';
import { CategoryEditModalComponent } from '../category-edit-modal/category-edit-modal.component';

@Component({
    selector: 'app-category-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.scss'],
    providers: [CategoryService]
})
export class CategoryListComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private categoryService: CategoryService) {}

    categories: Category[] = [];
    displayedColumns = ['image', 'name', 'action'];
    dataSource = new MatTableDataSource<Category>(this.categories);
    readonly dialog = inject(MatDialog);

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAll().subscribe(categories => {
            this.categories = categories;
            this.dataSource.data = this.categories;
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    onCreate() {
        const dialogRef = this.dialog.open(CategoryCreateModalComponent, {
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.categoryService.create(result).subscribe({
                    next: () => {
                        this.loadCategories();
                    },
                    error: (err) => {
                        console.error('Error creating category:', err);
                    }
                });
            }
        });
    }

    onEdit(category: Category) {
        const dialogRef = this.dialog.open(CategoryEditModalComponent, {
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            disableClose: true,
            data: { category }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated && category.id) {
                this.categoryService.update(category.id, result.data).subscribe({
                    next: () => {
                        this.loadCategories();
                    },
                    error: (err) => {
                        console.error('Error updating category:', err);
                    }
                });
            }
        });
    }

    onDelete(category: Category) {
        if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
            if (category.id) {
                this.categoryService.delete(category.id).subscribe({
                    next: () => {
                        this.loadCategories();
                    },
                    error: (err) => {
                        console.error('Error deleting category:', err);
                    }
                });
            }
        }
    }
}
