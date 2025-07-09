import { Observable } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";
import { CategoryDetail } from "../models/category-list.mode";
import { Injectable } from "@angular/core";

@Injectable()
export class CategoryService{
    private baseUrl = 'category'; // adjust base URL as needed

    constructor(private httpService: HttpService) {}
    getAllCategory() : Observable<CategoryDetail[]>{
        return this.httpService.get<CategoryDetail[]>(this.baseUrl);        
    }
}