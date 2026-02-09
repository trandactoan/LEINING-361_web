import { Component, Inject, OnInit, AfterViewInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ImageService } from '../../../../shared/services/image.service';
import { MatSelectModule } from '@angular/material/select';
import { CategoryDetail } from '../../models/category-list.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-product-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DragDropModule
  ],
  templateUrl: './product-edit-modal.component.html',
  styleUrls: ['./product-edit-modal.component.scss'],
  providers: [ProductService, ImageService]
})
export class ProductEditModalComponent implements OnInit, AfterViewInit {
  editedProduct: any = {
    id: '',
    name: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    brandId: '',
    details: [],
    images: [],
    hasVariants: false,
    variants: [],
    stock: 0,
    sku: '',
    soldCount: 0
  };

  categories: CategoryDetail[] = [];

  // Image management - unified tracking
  imageItems: { preview: string; source: string | File; isOriginal: boolean }[] = [];
  deleteImage: string[] = [];

  // Computed getters for backward compatibility
  get imagePreviews(): string[] {
    return this.imageItems.map(item => item.preview);
  }

  get originalImages(): string[] {
    return this.imageItems.filter(item => item.isOriginal).map(item => item.source as string);
  }

  get imageFiles(): File[] {
    return this.imageItems.filter(item => !item.isOriginal).map(item => item.source as File);
  }

  // Size guide management
  sizeGuidePreview: string = '';
  sizeGuideUrl: string = '';
  originalSizeGuide: string = '';

  // Variants
  hasVariants: boolean = false;
  productVariants: any[] = [];
  variantImagePreviews: Map<number, string> = new Map();
  // Option-based variant generation (like create modal)
  variantOptions: { name: string; values: { name: string }[] }[] = [ { name: '', values: [] } ];
  newOptionValues: string[] = [''];

  // Predefined variant types
  variantTypes: string[] = ['Kích thước', 'Màu', 'Giới tính'];

  // Table columns
  displayedColumns: string[] = ['variant', 'price', 'originalPrice', 'stock', 'soldCount', 'sku', 'variationImage', 'actions'];

  // Template for auto-fill
  variantTemplate = {
    price: 0,
    originalPrice: 0,
    stock: 0,
    soldCount: 0,
    sku: ''
  };

  // ViewChild for image list scroll
  @ViewChild('imageListRef') imageListRef!: ElementRef<HTMLDivElement>;

  // ViewChildren for detail image inputs
  @ViewChildren('detailImageInput') detailImageInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('richTextEditor') richTextEditors!: QueryList<ElementRef<HTMLDivElement>>;
  currentDetailIndex: number = 0;

  constructor(
    private productService: ProductService,
    private imageService: ImageService,
    private dialogRef: MatDialogRef<ProductEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data?.product) {
      this.editedProduct = structuredClone(data.product);
    }
    if (data?.categories) {
      this.categories = data.categories;
    }
  }

  ngOnInit(): void {
    // Initialize images with unified tracking
    const existingImages = Array.isArray(this.editedProduct.images) ? this.editedProduct.images : [];
    this.imageItems = existingImages.map((url: string) => ({
      preview: url,
      source: url,
      isOriginal: true
    }));

    // Initialize size guide
    if (this.editedProduct.sizeGuide) {
      this.originalSizeGuide = this.editedProduct.sizeGuide;
      this.sizeGuideUrl = this.editedProduct.sizeGuide;
      this.sizeGuidePreview = this.editedProduct.sizeGuide;
    }

    // Initialize variants
    this.hasVariants = !!this.editedProduct.hasVariants;
    if (this.hasVariants) {
      this.productVariants = Array.isArray(this.editedProduct.variants) ? structuredClone(this.editedProduct.variants || []) : [];

      // initialize variantOptions from existing variants if any
      if (this.productVariants.length > 0) {
        // Use array to preserve insertion order of option names and values
        const optionNames: string[] = [];
        const optionValuesMap: Record<string, string[]> = {};

        this.productVariants.forEach(v => {
          (v.attributes || []).forEach((a: any) => {
            if (!optionValuesMap[a.name]) {
              optionNames.push(a.name);
              optionValuesMap[a.name] = [];
            }
            if (!optionValuesMap[a.name].includes(a.value)) {
              optionValuesMap[a.name].push(a.value);
            }
          });
        });

        const opts = optionNames.map(name => ({
          name,
          values: optionValuesMap[name].map(v => ({ name: v }))
        }));

        if (opts.length > 0) {
          this.variantOptions = opts;
          this.newOptionValues = opts.map(() => '');

          // Sort variants by options order and rebuild image previews
          this.sortVariantsByOptions(this.productVariants, this.variantOptions);
        }
      }

      // Set image previews after sorting
      this.productVariants.forEach((variant: any, idx: number) => {
        if (variant?.variationImage && typeof variant.variationImage === 'string') {
          this.variantImagePreviews.set(idx, variant.variationImage);
        }
      });
    }

    if (!this.editedProduct.details) this.editedProduct.details = [];
  }

  ngAfterViewInit(): void {
    // Set initial content for rich text editors
    setTimeout(() => {
      this.richTextEditors.forEach((editor, index) => {
        if (this.editedProduct.details[index]?.content) {
          editor.nativeElement.innerHTML = this.editedProduct.details[index].content;
        }
      });
    });
  }

  onVariantsToggle(): void {
    this.hasVariants = !!this.hasVariants;
    if (this.hasVariants) {
      // Ensure productVariants array exists and has at least one entry to allow editing
      if (!Array.isArray(this.productVariants) || this.productVariants.length === 0) {
        this.productVariants = [{ id: undefined, attributes: [], price: this.editedProduct.price || 0, originalPrice: this.editedProduct.originalPrice || 0, stock: 0, sku: '', variationImage: undefined }];
      }
    } else {
      // turning off variants clears productVariants
      this.productVariants = [];
    }
  }

  // Save: prepare structured data and call update on service.
  save(): void {
    const productData = this.prepareProductData();
    this.isSaving = true;

    // ProductService.updateProduct handles uploading new images and variant images.
    this.productService.updateProduct(productData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.dialogRef.close({ updated: true, updatedProduct: res });
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Update failed', err);
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  cancelDialog(): void {
    this.dialogRef.close();
  }

  private prepareProductData(): any {
    // Preserve image order: map imageItems to their sources (URLs or Files)
    const orderedImages = this.imageItems.map(item => item.source);

    const base: any = {
      id: this.editedProduct.id,
      name: this.editedProduct.name,
      categoryId: this.editedProduct.categoryId,
      brandId: this.editedProduct.brandId,
      details: this.editedProduct.details || [],
      // Send ordered images (mixed URLs and Files) to preserve order
      images: orderedImages,
      deleteImages: [...this.deleteImage],
      hasVariants: this.hasVariants,
      sizeGuide: this.sizeGuideUrl || undefined,
      price: this.editedProduct.price,
      originalPrice: this.editedProduct.originalPrice,
      soldCount: this.editedProduct.soldCount || 0
    };

    if (this.hasVariants) {
      base.variants = this.productVariants.map(v => ({
        id: v.id,
        attributes: v.attributes,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
        soldCount: v.soldCount || 0,
        sku: v.sku,
        variationImage: v.variationImage instanceof File ? v.variationImage : v.variationImage
      }));
    } else {
      // non-variant product keeps top-level inventory fields
      base.stock = this.editedProduct.stock;
      base.sku = this.editedProduct.sku;
      base.variants = undefined;
    }

    return base;
  }

  getDiscount(): number {
    if (!this.editedProduct.originalPrice || !this.editedProduct.price) {
      return 0;
    }
    const discount = ((this.editedProduct.originalPrice - this.editedProduct.price) /
                     this.editedProduct.originalPrice) * 100;
    return Math.round(discount);
  }

  // Image selection for main images
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const filesCount = input.files.length;
    let loadedCount = 0;

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageItems.push({
          preview: e.target.result,
          source: file,
          isOriginal: false
        });
        loadedCount++;

        // Scroll to bottom after all images are loaded
        if (loadedCount === filesCount) {
          this.scrollImageListToBottom();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Scroll image list to bottom to show newest images
  private scrollImageListToBottom(): void {
    setTimeout(() => {
      if (this.imageListRef?.nativeElement) {
        this.imageListRef.nativeElement.scrollTop = this.imageListRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  removeImage(index: number): void {
    const item = this.imageItems[index];
    if (item.isOriginal) {
      this.deleteImage.push(item.source as string);
    }
    this.imageItems.splice(index, 1);
  }

  dropImage(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.imageItems, event.previousIndex, event.currentIndex);
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
    if (this.sizeGuideUrl && this.sizeGuideUrl !== this.originalSizeGuide) {
      await this.imageService.removeImage(this.sizeGuideUrl);
    }
    this.sizeGuideUrl = '';
    this.sizeGuidePreview = '';
  }

  addDetail(): void{
    if (!this.editedProduct.details) this.editedProduct.details = [];
    this.editedProduct.details.push({ title: '', content: '' });
  }

  addVariant(): void {
    if (!this.productVariants) this.productVariants = [];
    this.productVariants.push({ id: undefined, attributes: [], price: 0, originalPrice: 0, stock: 0, sku: '', variationImage: undefined });
  }

  // Variant option management (from create modal)
  addVariantOption(): void {
    if (this.variantOptions.length < 3) {
      this.variantOptions.push({ name: '', values: [] });
      this.newOptionValues.push('');
      this.updateVariantsFromOptions();
    }
  }

  // Get available variant types (exclude already selected ones)
  getAvailableVariantTypes(currentIndex: number): string[] {
    const selectedTypes = this.variantOptions
      .filter((_, i) => i !== currentIndex)
      .map(opt => opt.name)
      .filter(name => name);
    return this.variantTypes.filter(type => !selectedTypes.includes(type));
  }

  removeVariantOption(index: number): void {
    this.variantOptions.splice(index, 1);
    this.newOptionValues.splice(index, 1);
    this.updateVariantsFromOptions();
  }

  addOptionValue(optionIndex: number): void {
    const value = this.newOptionValues[optionIndex]?.trim();
    if (!value) return;
    this.variantOptions[optionIndex].values.push({ name: value });
    this.newOptionValues[optionIndex] = '';
    this.updateVariantsFromOptions();
  }

  removeOptionValue(optionIndex: number, valueIndex: number): void {
    this.variantOptions[optionIndex].values.splice(valueIndex, 1);
    this.updateVariantsFromOptions();
  }

  updateVariantsFromOptions(): void {
    if (!this.hasVariants) return;
    const validOptions = this.variantOptions.filter(opt => opt.name && opt.values && opt.values.length > 0);
    if (validOptions.length === 0) {
      this.productVariants = [];
      this.variantImagePreviews.clear();
      return;
    }

    // Save existing variants data keyed by attribute combination string
    const existingVariantsMap = new Map<string, any>();
    const existingPreviewsMap = new Map<string, string>();

    this.productVariants.forEach((variant, idx) => {
      const key = this.getVariantAttributeKey(variant.attributes);
      existingVariantsMap.set(key, variant);
      const preview = this.variantImagePreviews.get(idx);
      if (preview) {
        existingPreviewsMap.set(key, preview);
      }
    });

    // Generate new combinations and preserve existing data
    const newVariants = this.generateVariantCombinations(validOptions, existingVariantsMap);

    // Sort variants by category order (first by option 1 values, then by option 2 values)
    this.sortVariantsByOptions(newVariants, validOptions);

    // Rebuild the image previews map with new indices
    const newPreviews = new Map<number, string>();
    newVariants.forEach((variant, idx) => {
      const key = this.getVariantAttributeKey(variant.attributes);
      const existingPreview = existingPreviewsMap.get(key);
      if (existingPreview) {
        newPreviews.set(idx, existingPreview);
      } else if (variant.variationImage && typeof variant.variationImage === 'string') {
        newPreviews.set(idx, variant.variationImage);
      }
    });

    this.productVariants = newVariants;
    this.variantImagePreviews = newPreviews;
  }

  // Helper to create a unique key from variant attributes
  private getVariantAttributeKey(attributes: { name: string; value: string }[]): string {
    if (!attributes || attributes.length === 0) return '';
    return attributes
      .map(attr => `${attr.name}:${attr.value}`)
      .sort()
      .join('|');
  }

  // Sort variants by the order of values in variantOptions
  private sortVariantsByOptions(variants: any[], options: { name: string; values: { name: string }[] }[]): void {
    // Create map: optionName -> (valueName -> index)
    const orderMap = new Map<string, Map<string, number>>();
    options.forEach(opt => {
      const valueMap = new Map<string, number>();
      opt.values.forEach((val, valIdx) => valueMap.set(val.name, valIdx));
      orderMap.set(opt.name, valueMap);
    });

    variants.sort((a, b) => {
      // Compare by each attribute in order
      for (let i = 0; i < options.length; i++) {
        const optName = options[i].name;
        const aAttr = a.attributes?.find((attr: any) => attr.name === optName);
        const bAttr = b.attributes?.find((attr: any) => attr.name === optName);

        const aIdx = aAttr ? (orderMap.get(optName)?.get(aAttr.value) ?? 999) : 999;
        const bIdx = bAttr ? (orderMap.get(optName)?.get(bAttr.value) ?? 999) : 999;

        if (aIdx !== bIdx) return aIdx - bIdx;
      }
      return 0;
    });
  }

  // alias to match create modal API
  updateVariants(): void {
    this.updateVariantsFromOptions();
  }

  applyToAllVariants(): void {
    const price = this.editedProduct.price || 0;
    this.productVariants.forEach(v => v.price = price);
  }

  // Fill empty variant values from template
  fillEmptyVariantValues(): void {
    this.productVariants.forEach(variant => {
      // Fill price if empty or 0
      if (!variant.price && this.variantTemplate.price) {
        variant.price = this.variantTemplate.price;
      }
      // Fill originalPrice if empty or 0
      if (!variant.originalPrice && this.variantTemplate.originalPrice) {
        variant.originalPrice = this.variantTemplate.originalPrice;
      }
      // Fill stock if empty or 0
      if (!variant.stock && this.variantTemplate.stock) {
        variant.stock = this.variantTemplate.stock;
      }
      // Fill soldCount if empty or 0
      if (!variant.soldCount && this.variantTemplate.soldCount) {
        variant.soldCount = this.variantTemplate.soldCount;
      }
      // Fill sku if empty
      if (!variant.sku && this.variantTemplate.sku) {
        variant.sku = this.variantTemplate.sku;
      }
    });
  }

  removeVariant(index: number): void {
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

  generateVariantCombinations(options: { name: string; values: { name: string }[] }[], existingVariantsMap?: Map<string, any>): any[] {
    if (!options || options.length === 0) return [];
    const combinations: any[] = [];
    const generate = (index: number, current: any[]) => {
      if (index === options.length) {
        const attributes = [...current];
        const key = this.getVariantAttributeKey(attributes);
        const existingVariant = existingVariantsMap?.get(key);

        if (existingVariant) {
          // Preserve existing variant data
          combinations.push({
            id: existingVariant.id,
            attributes,
            price: existingVariant.price,
            originalPrice: existingVariant.originalPrice,
            stock: existingVariant.stock,
            soldCount: existingVariant.soldCount || 0,
            sku: existingVariant.sku,
            variationImage: existingVariant.variationImage
          });
        } else {
          // Create new variant with default values
          combinations.push({
            attributes,
            price: this.editedProduct.price || 0,
            originalPrice: this.editedProduct.originalPrice || 0,
            stock: 0,
            soldCount: 0,
            sku: '',
            variationImage: undefined
          });
        }
        return;
      }
      const option = options[index];
      for (const value of option.values) {
        generate(index + 1, [...current, { name: option.name, value: value.name }]);
      }
    };
    generate(0, []);
    return combinations;
  }

  removeDetail(index: number): void {
    this.editedProduct.details?.splice(index, 1);
  }

  // Rich text editor methods
  execCommand(command: string, detailIndex: number): void {
    document.execCommand(command, false, undefined);
  }

  onContentChange(event: Event, detailIndex: number): void {
    const element = event.target as HTMLElement;
    this.editedProduct.details[detailIndex].content = element.innerHTML;
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
            this.editedProduct.details[detailIndex].content = editorElement.innerHTML;

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

  // Variation image handling - uploads immediately when selected
  async onVariationImageSelected(event: Event, variantIndex: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!this.productVariants[variantIndex]) return;

      // Show base64 preview immediately while uploading
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const preview = e.target.result as string;
        this.variantImagePreviews.set(variantIndex, preview);
        this.productVariants[variantIndex].variationImagePreview = preview;
      };
      reader.readAsDataURL(file);

      try {
        // Upload image immediately
        const response = await this.imageService.uploadImage(file).toPromise();
        const imageUrl = response?.path || response?.url;

        if (imageUrl) {
          // Store the uploaded URL instead of the File object
          this.productVariants[variantIndex].variationImage = imageUrl;
          // Update preview to use the actual URL
          this.variantImagePreviews.set(variantIndex, imageUrl);
        }
      } catch (error) {
        console.error('Failed to upload variation image:', error);
        // On error, clear the preview
        this.variantImagePreviews.delete(variantIndex);
        this.productVariants[variantIndex].variationImage = undefined;
      }

      // Reset input to allow re-selecting the same file
      input.value = '';
    }
  }

  removeVariationImage(variantIndex: number): void {
    if (!this.productVariants[variantIndex]) return;
    // If previously had a string URL, mark it for deletion by setting to null (handled server-side)
    this.productVariants[variantIndex].variationImage = undefined;
    this.variantImagePreviews.delete(variantIndex);
  }

  getVariationImagePreview(variantIndex: number): string | undefined {
    // Check for base64 preview first (for newly selected images being uploaded)
    const preview = this.variantImagePreviews.get(variantIndex);
    if (preview) return preview;

    // Check if variationImage is a string URL (already uploaded)
    const variationImage = this.productVariants[variantIndex]?.variationImage;
    if (typeof variationImage === 'string') return variationImage;

    return undefined;
  }

  trackByIndex(index: number): number { return index; }
  isSaving: boolean = false;
}
