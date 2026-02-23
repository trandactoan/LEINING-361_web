export interface Category {
    id?: string;
    name: string;
    image?: string;
}

export interface CreateCategoryDto {
    name: string;
    image?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    image?: string;
}
