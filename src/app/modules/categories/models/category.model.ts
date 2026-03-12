export interface Category {
    id?: string;
    name: string;
    image?: string;
    priority?: number;
}

export interface CreateCategoryDto {
    name: string;
    image?: string;
    priority?: number;
}

export interface UpdateCategoryDto {
    name?: string;
    image?: string;
    priority?: number;
}
