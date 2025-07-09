export interface ProductDetail{
    id : string,
    name: string,
    price: number, 
    originalPrice: number,
    images: string[],
    categoryId: string,
    details: DetailContent[],
}
export interface DetailContent{
    title: string,
    content: string
}