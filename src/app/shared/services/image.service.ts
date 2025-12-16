import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { Observable } from "rxjs";
import { ImageDetail } from "../models/image-detail";

@Injectable({
  providedIn: 'root'
})
export class ImageService{
    private baseUrl = 'image'; // adjust base URL as needed

    constructor(private httpService: HttpService) {}
    uploadImage(file: File) : Observable<ImageDetail> {
        const formData = new FormData();
        formData.append('file', file);
        const requestUrl = this.baseUrl + '/upload';
        
        return this.httpService.post<{ filename: string; url: string, path: string }>(
            requestUrl,
            formData
        );
    }
    removeImage(fileLink: string) {
        var filename = fileLink.split('/').pop() || '';
        const requestUrl = this.baseUrl + '/remove/' + filename;
        console.log('Deleting image at URL:', filename);
        return this.httpService.delete(requestUrl);
    }
}