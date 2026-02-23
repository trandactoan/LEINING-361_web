import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

@Injectable()
export class CategoryService {
    private baseUrl = 'category';

    constructor(private httpService: HttpService) {}

    getAll(): Observable<Category[]> {
        return this.httpService.get<Category[]>(this.baseUrl);
    }

    getById(id: string): Observable<Category> {
        return this.httpService.get<Category>(`${this.baseUrl}/${id}`);
    }

    create(category: CreateCategoryDto): Observable<Category> {
        return this.httpService.post<Category>(this.baseUrl, category);
    }

    update(id: string, category: UpdateCategoryDto): Observable<Category> {
        return this.httpService.patch<Category>(`${this.baseUrl}/${id}`, category);
    }

    delete(id: string): Observable<void> {
        return this.httpService.delete<void>(`${this.baseUrl}/${id}`);
    }
}
