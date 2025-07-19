import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";

@Injectable()
export class ZnsService{
    private baseUrl = 'zns'; // adjust base URL as needed
    constructor(private httpService: HttpService) {}
    sendZns(templateData: any){
        const urlRequest = this.baseUrl + '/' + 'send-zns';
        return this.httpService.post(urlRequest, {
            phone: templateData.phone,
            templateId: templateData.templateId,
            templateData,
        });
    }
}