// product-create-modal.component.ts
import { Component, OnInit, Inject, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProductService } from '../../services/product.service';
import { ImageService } from '../../../../shared/services/image.service';
import { ProductVariant, VariantAttribute, VariantOption, VariantOptionValue } from '../../models/product-variant.model';
import { CategoryDetail } from '../../models/category-list.model';

export interface ProductDetail {
  title: string;
  content: string;
}

export interface Product {
  id?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  categoryId: string;
  details: ProductDetail[];
  images: Array<string | File>;
  stock?: number;
  sku?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  soldCount?: number;
}

@Component({
  selector: 'app-product-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTableModule,
    DragDropModule
  ],
  templateUrl: './product-create-modal.component.html',
  styleUrls: ['./product-create-modal.component.scss'],
  providers: [ProductService, ImageService]
})
export class ProductCreateModalComponent implements OnInit {
  newProduct: Product = {
    name: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    details: [],
    images: [],
    stock: 0,
    sku: '',
    hasVariants: false,
    variants: [],
    soldCount: 0
  };

  imagePreviews: string[] = [];
  imageFiles: File[] = [];
  imageUrl: string[] = [];

  // Size guide management
  sizeGuidePreview: string = '';
  sizeGuideUrl: string = '';

  // Variants management
  hasVariants = false;
  variantOptions: VariantOption[] = [
    { name: '', values: [] }
  ];
  productVariants: ProductVariant[] = [];
  newOptionValues: string[] = [''];
  variantImagePreviews: Map<number, string> = new Map(); // Store base64 previews by variant index
  
  // Table columns
  displayedColumns: string[] = ['variant', 'price', 'originalPrice', 'stock', 'soldCount', 'sku', 'variationImage', 'actions'];

  // Mock data - replace with actual data from service
  categories: CategoryDetail[] = [];

  // ViewChild for image list scroll
  @ViewChild('imageListRef') imageListRef!: ElementRef<HTMLDivElement>;

  // ViewChildren for detail image inputs
  @ViewChildren('detailImageInput') detailImageInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('richTextEditor') richTextEditors!: QueryList<ElementRef<HTMLDivElement>>;
  currentDetailIndex: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ProductCreateModalComponent>,
    private imageService: ImageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // support either passing categories array directly or an object with `categories`
    if (Array.isArray(data)) {
      this.categories = data;
    } else if (data && Array.isArray(data.categories)) {
      this.categories = data.categories;
    } else {
      this.categories = [];
    }
  }

  ngOnInit(): void {
    // Initialize with one detail row if needed
    if (this.newProduct.details.length === 0) {
      this.addDetail();
    }
  }

  // Image handling
  async onImagesSelected(event: Event): Promise<any> {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesCount = input.files.length;
      let loadedCount = 0;

      var uploadImagePromise = Array.from(input.files).map(async file => {
        this.imageFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
          loadedCount++;

          // Scroll to bottom after all previews are loaded
          if (loadedCount === filesCount) {
            this.scrollImageListToBottom();
          }
        };
        reader.readAsDataURL(file);
        const response = await this.imageService.uploadImage(file).toPromise();
        this.imageUrl.push(response?.url!);
      });
      await Promise.all(uploadImagePromise);
    }
  }

  // Scroll image list to bottom to show newest images
  private scrollImageListToBottom(): void {
    setTimeout(() => {
      if (this.imageListRef?.nativeElement) {
        this.imageListRef.nativeElement.scrollTop = this.imageListRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  async removeImage(index: number): Promise<any> {
    this.imagePreviews.splice(index, 1);
    this.imageFiles.splice(index, 1);
    await this.imageService.removeImage(this.imageUrl[index]);
    this.imageUrl.splice(index, 1);
  }

  dropImage(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.imagePreviews, event.previousIndex, event.currentIndex);
    moveItemInArray(this.imageFiles, event.previousIndex, event.currentIndex);
    moveItemInArray(this.imageUrl, event.previousIndex, event.currentIndex);
  }

  // Size guide handling
  async onSizeGuideSelected(event: Event): Promise<any> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.sizeGuidePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      const response = await this.imageService.uploadImage(file).toPromise();
      this.sizeGuideUrl = response?.url!;
    }
  }

  async removeSizeGuide(): Promise<any> {
    if (this.sizeGuideUrl) {
      await this.imageService.removeImage(this.sizeGuideUrl);
      this.sizeGuideUrl = '';
      this.sizeGuidePreview = '';
    }
  }

  // Details management
  addDetail(): void {
    this.newProduct.details.push({ title: '', content: '' });
  }

  removeDetail(index: number): void {
    this.newProduct.details.splice(index, 1);
  }

  // Rich text editor methods
  execCommand(command: string, detailIndex: number): void {
    document.execCommand(command, false, undefined);
  }

  onContentChange(event: Event, detailIndex: number): void {
    const element = event.target as HTMLElement;
    this.newProduct.details[detailIndex].content = element.innerHTML;
  }

  insertImageInDetail(detailIndex: number): void {
    this.currentDetailIndex = detailIndex;
    const inputArray = this.detailImageInputs.toArray();
    if (inputArray && inputArray[detailIndex]) {
      inputArray[detailIndex].nativeElement.click();
    }
  }

  async onDetailImageSelected(event: Event, detailIndex: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      try {
        // Upload image to server
        const response = await this.imageService.uploadImage(file).toPromise();
        const imageUrl = response?.path;

        if (imageUrl) {
          // Get the editor element
          const editorElements = document.querySelectorAll('.rich-text-editor');
          const editorElement = editorElements[detailIndex] as HTMLElement;

          if (editorElement) {
            // Focus the editor
            editorElement.focus();

            // Save current selection
            const selection = window.getSelection();
            let range: Range;

            if (selection && selection.rangeCount > 0) {
              range = selection.getRangeAt(0);
            } else {
              // If no selection, create one at the end
              range = document.createRange();
              range.selectNodeContents(editorElement);
              range.collapse(false);
            }

            // Create the image element
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Detail image';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '8px 0';
            img.style.display = 'block';

            // Create a paragraph with a text node for typing after the image
            const p = document.createElement('p');
            const textNode = document.createTextNode('\u200B'); // Zero-width space
            p.appendChild(textNode);

            // Insert image first
            range.deleteContents();
            range.insertNode(img);

            // Move range after the image and insert paragraph
            range.setStartAfter(img);
            range.collapse(true);
            range.insertNode(p);

            // Move cursor into the text node at the end
            range.setStart(textNode, 1);
            range.setEnd(textNode, 1);
            selection?.removeAllRanges();
            selection?.addRange(range);

            // Update the content
            this.newProduct.details[detailIndex].content = editorElement.innerHTML;

            // Keep focus
            editorElement.focus();
          }
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }

      // Reset input
      input.value = '';
    }
  }

  // Variant options management
  addVariantOption(): void {
    if (this.variantOptions.length < 2) {
      this.variantOptions.push({ name: '', values: [] });
      this.newOptionValues.push('');
    }
  }

  removeVariantOption(index: number): void {
    this.variantOptions.splice(index, 1);
    this.newOptionValues.splice(index, 1);
    this.updateVariants();
  }

  addOptionValue(optionIndex: number): void {
    const value = this.newOptionValues[optionIndex]?.trim();
    if (!value) return;

    const newValue: VariantOptionValue = {
      name: value,
    };

    this.variantOptions[optionIndex].values.push(newValue);
    this.newOptionValues[optionIndex] = '';

    this.updateVariants();
  }

  removeOptionValue(optionIndex: number, valueIndex: number): void {
    this.variantOptions[optionIndex].values.splice(valueIndex, 1);
    this.updateVariants();
  }

  onVariantsToggle(): void {
    if (this.hasVariants) {
      this.updateVariants();
    } else {
      this.productVariants = [];
    }
  }

  updateVariants(): void {
    if (!this.hasVariants) return;

    // Filter out empty options
    const validOptions = this.variantOptions.filter(
      opt => opt.name && opt.values.length > 0
    );

    if (validOptions.length === 0) {
      this.productVariants = [];
      return;
    }

    // Generate all combinations
    this.productVariants = this.generateVariantCombinations(validOptions);
  }

  generateVariantCombinations(options: VariantOption[]): ProductVariant[] {
    if (options.length === 0) return [];

    const combinations: ProductVariant[] = [];
    
    const generate = (index: number, current: VariantAttribute[]) => {
      if (index === options.length) {
        combinations.push({
          attributes: [...current],
          price: this.newProduct.price || 0,
          originalPrice: this.newProduct.originalPrice || 0,
          stock: 0,
          soldCount: 0,
          sku: '',
          variationImage: undefined,
          variationImagePreview: undefined
        });
        return;
      }

      const option = options[index];
      for (const value of option.values) {
        generate(index + 1, [
          ...current,
          { name: option.name, value: value.name }
        ]);
      }
    };

    generate(0, []);
    return combinations;
  }

  applyToAllVariants(): void {
    const price = this.newProduct.price || 0;
    this.productVariants.forEach(variant => {
      variant.price = price;
    });
  }

  removeVariant(index: number): void {
    // Remove the variation image if it exists
    if (this.productVariants[index]?.variationImage) {
      this.imageService.removeImage(this.productVariants[index].variationImage!).subscribe();
    }

    // Create a new array to trigger Angular change detection
    this.productVariants = this.productVariants.filter((_, i) => i !== index);

    // Re-index the variant image previews map
    const newPreviews = new Map<number, string>();
    this.variantImagePreviews.forEach((value, key) => {
      if (key < index) {
        newPreviews.set(key, value);
      } else if (key > index) {
        newPreviews.set(key - 1, value);
      }
      // Skip the deleted index
    });
    this.variantImagePreviews = newPreviews;
  }

  // Variation image handling
  async onVariationImageSelected(event: Event, variantIndex: number): Promise<any> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      var response = await this.imageService.uploadImage(file).toPromise()
      this.productVariants[variantIndex].variationImage = response?.url;
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const preview = e.target.result;
        this.productVariants[variantIndex].variationImagePreview = preview;
        this.variantImagePreviews.set(variantIndex, preview);
      };
      reader.readAsDataURL(file);
    }
  }

  removeVariationImage(variantIndex: number): void {
    this.imageService.removeImage(this.productVariants[variantIndex].variationImage!).subscribe(()=>{
    this.productVariants[variantIndex].variationImage = undefined;
    this.productVariants[variantIndex].variationImagePreview = undefined;
    this.variantImagePreviews.delete(variantIndex);
    });
  }

  getVariationImagePreview(variantIndex: number): string | undefined {
    return this.variantImagePreviews.get(variantIndex) || this.productVariants[variantIndex]?.variationImage;
  }

  // Pricing helpers
  getDiscount(): number {
    if (!this.newProduct.originalPrice || !this.newProduct.price) {
      return 0;
    }
    const discount = ((this.newProduct.originalPrice - this.newProduct.price) / 
                     this.newProduct.originalPrice) * 100;
    return Math.round(discount);
  }

  // Modal actions
  cancel(): void {
    this.dialogRef.close();
  }

  saveAndHide(): void {
    const productData = this.prepareProductData();
    this.dialogRef.close(productData);
  }

  create(): void {
    const productData = this.prepareProductData();
    this.dialogRef.close(productData);
  }

  private prepareProductData(): any {
    let product: any = {
      name: this.newProduct.name,
      price: this.newProduct.price,
      originalPrice: this.newProduct.originalPrice,
      categoryId: this.newProduct.categoryId,
      details: this.newProduct.details,
      images: this.imageUrl,
      hasVariants: this.hasVariants,
      sizeGuide: this.sizeGuideUrl || undefined,
      soldCount: this.newProduct.soldCount || 0,
    };

    if (this.hasVariants) {
      // Prepare variants: convert variationImage File to actual File object
      product.variants = this.productVariants.map(variant => ({
        attributes: variant.attributes,
        price: variant.price,
        originalPrice: variant.originalPrice,
        stock: variant.stock,
        soldCount: variant.soldCount || 0,
        sku: variant.sku,
        variationImage: variant.variationImage
      }));
    } else {
      // For non-variant products, keep price and originalPrice
      product.price = this.newProduct.price;
      product.originalPrice = this.newProduct.originalPrice;
      product.stock = this.newProduct.stock;
      product.sku = this.newProduct.sku;
      delete product.variants;
    }

    return product;
  }

  trackByIndex(index: number): number {
    return index;
  }
}