export interface ProductDetail{
    id : string,
    name: string,
    price: number, 
    originalPrice: number,
    images: string[],
    categoryId: string,
    details: DetailContent[],
    colors: Color[],
    sizes: string[]
}
export interface DetailContent{
    title: string,
    content: string
}
export interface Color{
    name: string,
    hex: string
};