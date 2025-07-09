import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { ProductListElement } from "../models/product-list.model";
import { map, Observable } from "rxjs";
import { ProductDetail } from "../models/product-detail.model";

@Injectable()
export class ProductService{
    private baseUrl = 'product'; // adjust base URL as needed

    constructor(private httpService: HttpService) {}

    getAll(): Observable<ProductListElement[]> {
        return this.httpService.get<ProductListElement[]>(this.baseUrl)
                            .pipe(
                                map(data => data.map(item => ({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                } as ProductListElement)))
                            );
    }
    getProductById(id: string): Observable<ProductDetail>
    {
        const urlRequest = this.baseUrl + "/by-id/" + id;
        return this.httpService.get<ProductDetail>(urlRequest);
    }
    updateProduct(editedProduct: ProductDetail)
    {
        const urlRequest = this.baseUrl + "/" + editedProduct.id;
        return this.httpService.patch(urlRequest, editedProduct);
    }
    deleteProduct(id: string)
    {
        const urlRequest = this.baseUrl + "/" + id;
        return this.httpService.delete<ProductDetail>(urlRequest);
    }
    createProduct(newProduct: ProductDetail) : Observable<ProductDetail>
    {
        const urlRequest = this.baseUrl + "/create-product";
        return this.httpService.post<ProductDetail>(urlRequest, newProduct);
    }
}