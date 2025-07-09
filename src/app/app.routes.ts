import { Routes } from '@angular/router';
import { ProductRoutes } from './modules/products/product.routes';
import { ZnsRoutes } from './modules/zns/zns.routes';

export const appRoutes: Routes = [
    {
        path: 'products',
        children: ProductRoutes
    },
    {
        path: 'zns',
        children: ZnsRoutes
    }
];