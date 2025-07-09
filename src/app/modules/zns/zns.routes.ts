// src/app/features/products/product.routes.ts
import { Routes } from '@angular/router';
import { ZnsDetailComponent } from './components/zns-detail/zns-detail.component';

export const ZnsRoutes: Routes = [
  {
    path: '',
    component: ZnsDetailComponent
  }
];
