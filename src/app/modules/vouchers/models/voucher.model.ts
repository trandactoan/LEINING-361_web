export interface Voucher {
    id?: string;
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usedCount: number;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
    applicableCategories: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface CreateVoucherDto {
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    startDate: Date | string;
    endDate: Date | string;
    isActive?: boolean;
    applicableCategories?: string[];
}

export interface UpdateVoucherDto {
    name?: string;
    description?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    startDate?: Date | string;
    endDate?: Date | string;
    isActive?: boolean;
    applicableCategories?: string[];
}
