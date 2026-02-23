import { Routes } from '@angular/router';
import { ProductRoutes } from './modules/products/product.routes';
import { ZnsRoutes } from './modules/zns/zns.routes';
import { VoucherRoutes } from './modules/vouchers/voucher.routes';

export const appRoutes: Routes = [
    {
        path: 'products',
        children: ProductRoutes
    },
    {
        path: 'zns',
        children: ZnsRoutes
    },
    {
        path: 'vouchers',
        children: VoucherRoutes
    }
];