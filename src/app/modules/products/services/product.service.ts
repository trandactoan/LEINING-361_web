import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { ProductListElement } from "../models/product-list.model";
import { map, Observable } from "rxjs";
import { ProductDetail } from "../models/product-detail.model";
import { ImageService } from "../../../shared/services/image.service";

@Injectable()
export class ProductService{
    private baseUrl = 'product'; // adjust base URL as needed

    constructor(
        private httpService: HttpService,
        private imageService: ImageService
    ) {}

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
        return new Observable(observer => {
            this.uploadUpdateImages(editedProduct).then(productWithUrls => {
                this.httpService.patch<ProductDetail>(urlRequest, productWithUrls).subscribe({
                    next: (result) => {
                        observer.next(result);
                        observer.complete();
                    },
                    error: (err) => {
                        observer.error(err);
                    }
                });
            }).catch(err => {
                observer.error(err);
            });
        });
    }

    deleteProduct(id: string)
    {
        const urlRequest = this.baseUrl + "/" + id;
        return this.httpService.delete<ProductDetail>(urlRequest);
    }

    createProduct(newProduct: any): Observable<ProductDetail>
    {
        const urlRequest = this.baseUrl + "/create-product";
        return new Observable(observer => {
            this.uploadProductImages(newProduct).then(productWithUrls => {
                this.httpService.post<ProductDetail>(urlRequest, productWithUrls).subscribe({
                    next: (result) => {
                        observer.next(result);
                        observer.complete();
                    },
                    error: (err) => {
                        observer.error(err);
                    }
                });
            }).catch(err => {
                observer.error(err);
            });
        });
    }

    private async uploadProductImages(product: any): Promise<any> {
        const productCopy = JSON.parse(JSON.stringify(product));

        // Upload main images
        if (productCopy.images && Array.isArray(productCopy.images)) {
            const uploadedImages = [];
            for (const image of productCopy.images) {
                if (image instanceof File) {
                    const response = await this.imageService.uploadImage(image).toPromise();
                    uploadedImages.push(response?.path || response?.url);
                } else if (typeof image === 'string') {
                    uploadedImages.push(image);
                }
            }
            productCopy.images = uploadedImages;
        }

        // Upload variation images in parallel
        if (productCopy.variants && Array.isArray(productCopy.variants)) {
            await Promise.all(productCopy.variants.map(async (variant: any) => {
                if (variant.variationImage instanceof File) {
                    const response = await this.imageService.uploadImage(variant.variationImage).toPromise();
                    variant.variationImage = response?.path || response?.url;
                }
            }));
        }

        return productCopy;
    }

    private async uploadUpdateImages(editedProduct: any): Promise<any> {
        // Do not stringify because it will drop File objects. Work on a shallow clone.
        const productCopy: any = { ...editedProduct };

        const deleteImages: string[] = Array.isArray(editedProduct.deleteImages) ? editedProduct.deleteImages : [];

        // Upload new images in parallel while preserving order
        if (editedProduct.images && Array.isArray(editedProduct.images)) {
            const results = await Promise.all(editedProduct.images.map(async (img: any) => {
                if (img instanceof File) {
                    const response = await this.imageService.uploadImage(img).toPromise();
                    return response?.path || response?.url || "";
                } else if (typeof img === 'string' && !deleteImages.includes(img)) {
                    return img;
                }
                return null;
            }));
            productCopy.images = results.filter(Boolean) as string[];
        }

        // Upload variation images in parallel
        if (editedProduct.variants && Array.isArray(editedProduct.variants)) {
            productCopy.variants = await Promise.all(editedProduct.variants.map(async (variant: any) => {
                const vCopy: any = { ...variant };
                if (vCopy.variationImage instanceof File) {
                    const resp = await this.imageService.uploadImage(vCopy.variationImage).toPromise();
                    vCopy.variationImage = resp?.path || resp?.url;
                }
                return vCopy;
            }));
        }

        // Delete removed images in parallel (best-effort)
        await Promise.all(deleteImages
            .filter((imgUrl: string) => typeof imgUrl === 'string' && imgUrl)
            .map(async (imgUrl: string) => {
                try {
                    await this.imageService.removeImage(imgUrl).toPromise();
                } catch (_err) {
                    // Best-effort: continue even if deletion fails
                }
            }));

        // Clean up helper fields
        delete productCopy.newImages;
        delete productCopy.deleteImages;

        return productCopy;
    }
}