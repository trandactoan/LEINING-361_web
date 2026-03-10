export interface Banner {
    id?: string;
    imageUrl: string;
    order: number;
    link?: string;
    isActive: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface CreateBannerDto {
    imageUrl: string;
    order: number;
    link?: string;
    isActive?: boolean;
}

export interface UpdateBannerDto {
    imageUrl?: string;
    order?: number;
    link?: string;
    isActive?: boolean;
}
