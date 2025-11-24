export interface ProductDto {
  productId: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  imageUri: string;
}
