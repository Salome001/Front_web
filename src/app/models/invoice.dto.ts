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


export interface ClientDto {
  clientId?: number; 
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

export interface InvoiceDetailDto {
  invoiceDetailId?: number;
  invoiceId?: number;
  productId: number;
  product: ProductDto;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceDto {
  invoiceId?: number;
  invoiceNumber?: string;
  clientId?: number;
  client?: ClientDto;
  userId?: string;
  issueDate?: Date;
  subtotal: number;
  tax: number;
  total: number;
  observations?: string;
  invoiceDetails: InvoiceDetailDto[];
}
