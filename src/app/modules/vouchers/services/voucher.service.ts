import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { Voucher, CreateVoucherDto, UpdateVoucherDto } from '../models/voucher.model';

@Injectable()
export class VoucherService {
    private baseUrl = 'voucher';

    constructor(private httpService: HttpService) {}

    getAll(): Observable<Voucher[]> {
        return this.httpService.get<Voucher[]>(this.baseUrl);
    }

    getById(id: string): Observable<Voucher> {
        return this.httpService.get<Voucher>(`${this.baseUrl}/${id}`);
    }

    getByCode(code: string): Observable<Voucher> {
        return this.httpService.get<Voucher>(`${this.baseUrl}/code/${code}`);
    }

    create(voucher: CreateVoucherDto): Observable<Voucher> {
        return this.httpService.post<Voucher>(this.baseUrl, voucher);
    }

    update(id: string, voucher: UpdateVoucherDto): Observable<Voucher> {
        return this.httpService.patch<Voucher>(`${this.baseUrl}/${id}`, voucher);
    }

    delete(id: string): Observable<void> {
        return this.httpService.delete<void>(`${this.baseUrl}/${id}`);
    }
}
