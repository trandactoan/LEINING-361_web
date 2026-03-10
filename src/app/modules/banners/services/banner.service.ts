import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { Banner, CreateBannerDto, UpdateBannerDto } from '../models/banner.model';

@Injectable()
export class BannerService {
    private baseUrl = 'banners';

    constructor(private httpService: HttpService) {}

    getAll(): Observable<Banner[]> {
        return this.httpService.get<Banner[]>(this.baseUrl);
    }

    create(dto: CreateBannerDto): Observable<Banner> {
        return this.httpService.post<Banner>(this.baseUrl, dto);
    }

    update(id: string, dto: UpdateBannerDto): Observable<Banner> {
        return this.httpService.patch<Banner>(`${this.baseUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.httpService.delete<void>(`${this.baseUrl}/${id}`);
    }
}
