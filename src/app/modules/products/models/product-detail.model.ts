export interface ProductDetail{
    id?: string,
    name: string,
    price: number,
    originalPrice?: number,
    images: string[],
    categoryId: string,
    brandId?: string,
    details?: DetailContent[],
    colors?: Color[],
    sizes?: string[],
    hasVariants: boolean,
    variants?: ProductVariation[],
    sizeGuide?: string,
    sku?: string,
    stock?: number,
    soldCount?: number
}

export interface DetailContent{
    title: string,
    content: string
}

export interface Color{
    name: string,
    hex: string
}

export interface ProductVariation {
    id?: string,
    attributes: VariantAttribute[],
    price: number,
    originalPrice?: number,
    stock: number,
    sku: string,
    variationImage?: string
}

export interface VariantAttribute {
    name: string,
    value: string
}