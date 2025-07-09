// src/app/core/services/http.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = environment.base_url; // optional base URL

  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: HttpParams | { [param: string]: string | string[] }): Observable<T> {
    return this.http.get<T>(this.baseUrl + url, { params });
  }

  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, body, { headers });
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(this.baseUrl + url, body);
  }

  
  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(this.baseUrl + url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.baseUrl + url);
  }
}
