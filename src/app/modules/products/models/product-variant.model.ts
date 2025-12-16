export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  attributes: VariantAttribute[];
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  variationImage?: string; // File object or URL
  variationImagePreview?: string; // Base64 or data URL for preview
}

export interface VariantOption {
  name: string;
  values: VariantOptionValue[];
  selectedValues?: VariantOptionValue[];
}

export interface VariantOptionValue {
  name: string;
}