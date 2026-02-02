import { Component, Inject, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
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
    sku: ''
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

  // Table columns
  displayedColumns: string[] = ['variant', 'price', 'originalPrice', 'stock', 'sku', 'variationImage', 'actions'];

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
      this.productVariants.forEach((variant: any, idx: number) => {
        if (variant?.variationImage && typeof variant.variationImage === 'string') {
          this.variantImagePreviews.set(idx, variant.variationImage);
        }
      });
      // initialize variantOptions from existing variants if any
      if (this.productVariants.length > 0) {
        const optionMap: Record<string, Set<string>> = {};
        this.productVariants.forEach(v => {
          (v.attributes || []).forEach((a: any) => {
            optionMap[a.name] = optionMap[a.name] || new Set<string>();
            optionMap[a.name].add(a.value);
          });
        });
        const opts = Object.keys(optionMap).map(name => ({ name, values: Array.from(optionMap[name]).map(v => ({ name: v })) }));
        if (opts.length > 0) {
          this.variantOptions = opts;
          this.newOptionValues = opts.map(() => '');
        }
      }
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
      originalPrice: this.editedProduct.originalPrice
    };

    if (this.hasVariants) {
      base.variants = this.productVariants.map(v => ({
        id: v.id,
        attributes: v.attributes,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
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

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageItems.push({
          preview: e.target.result,
          source: file,
          isOriginal: false
        });
      };
      reader.readAsDataURL(file);
    });
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
    if (this.variantOptions.length < 2) {
      this.variantOptions.push({ name: '', values: [] });
      this.newOptionValues.push('');
      this.updateVariantsFromOptions();
    }
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
      return;
    }
    this.productVariants = this.generateVariantCombinations(validOptions);
  }

  // alias to match create modal API
  updateVariants(): void {
    this.updateVariantsFromOptions();
  }

  applyToAllVariants(): void {
    const price = this.editedProduct.price || 0;
    this.productVariants.forEach(v => v.price = price);
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

  generateVariantCombinations(options: { name: string; values: { name: string }[] }[]): any[] {
    if (!options || options.length === 0) return [];
    const combinations: any[] = [];
    const generate = (index: number, current: any[]) => {
      if (index === options.length) {
        combinations.push({ attributes: [...current], price: this.editedProduct.price || 0, originalPrice: this.editedProduct.originalPrice || 0, stock: 0, sku: '', variationImage: undefined });
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

  // Variation image handling
  onVariationImageSelected(event: Event, variantIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // store File on the variant for upload
      if (!this.productVariants[variantIndex]) return;
      this.productVariants[variantIndex].variationImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const preview = e.target.result as string;
        this.variantImagePreviews.set(variantIndex, preview);
        // also set on the variant for template parity with create modal
        this.productVariants[variantIndex].variationImagePreview = preview;
      };
      reader.readAsDataURL(file);
    }
  }

  removeVariationImage(variantIndex: number): void {
    if (!this.productVariants[variantIndex]) return;
    // If previously had a string URL, mark it for deletion by setting to null (handled server-side)
    this.productVariants[variantIndex].variationImage = undefined;
    this.variantImagePreviews.delete(variantIndex);
  }

  getVariationImagePreview(variantIndex: number): string | undefined {
    return  this.productVariants[variantIndex]?.variationImage
  }

  trackByIndex(index: number): number { return index; }
  isSaving: boolean = false;
}
