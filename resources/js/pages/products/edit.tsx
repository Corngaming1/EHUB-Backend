import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import React, { useRef, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Edit Product',
    href: '/products',
  },
];

export default function EditProduct({ product }: { product: any }) {
  // Track existing images (from backend) and new images (from user)
  const [existingImages, setExistingImages] = useState<string[]>(
    Array.isArray(product.images)
      ? product.images.map((img: string) =>
          img.startsWith('http') ? img : `/storage/${img}`
        )
      : []
  );
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, processing, errors } = useForm<{
    name: string;
    slug: string;
    price: string;
    is_active: boolean;
    in_stock: boolean;
    is_featured: boolean;
    on_sale: boolean;
    images?: File[];
  }>({
    name: product.name || '',
    slug: product.slug || '',
    price: product.price ? String(product.price) : '',
    is_active: !!product.is_active,
    in_stock: !!product.in_stock,
    is_featured: !!product.is_featured,
    on_sale: !!product.on_sale,
  });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  // REPLACE behavior: selecting new images removes all existing images
  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setRemovedImages(existingImages); // Mark all as removed
    setExistingImages([]);            // Clear existing images
    setNewImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    setRemovedImages(existingImages); // Mark all as removed
    setExistingImages([]);            // Clear existing images
    setNewImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  }

  function handleRemoveNew(idx: number) {
    setNewImages(newImages.filter((_, i) => i !== idx));
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    formData.append('price', data.price);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('in_stock', data.in_stock ? '1' : '0');
    formData.append('is_featured', data.is_featured ? '1' : '0');
    formData.append('on_sale', data.on_sale ? '1' : '0');

    // Send new images
    newImages.forEach((file, idx) => {
      formData.append(`images[${idx}]`, file);
    });

    // Send removed images (all old images if replaced)
    removedImages.forEach((img, idx) => {
      formData.append(`removed_images[${idx}]`, img);
    });

    Inertia.post(route('products.update', product.id), formData, {
      forceFormData: true,
      onSuccess: () => console.log('Update successful'),
      onError: (errs) => console.log('Validation errors:', errs),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Product" />
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl w-full max-w-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xl text-slate-600">Edit Product</div>
            <Link href="/products">
              <Button
                variant="outline"
                className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back To Products
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="Product name"
                      value={data.name}
                      onChange={(e) => {
                        setData('name', e.target.value);
                        setData('slug', slugify(e.target.value));
                      }}
                    />
                    {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="slug">Slug</Label>
                    <Input type="text" id="slug" placeholder="product-slug" value={data.slug} disabled />
                    {errors.slug && <p className="text-red-600 mt-1">{errors.slug}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      type="number"
                      id="price"
                      placeholder="Product price"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                    />
                    {errors.price && <p className="text-red-600 mt-1">{errors.price}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="images">Images</Label>
                    <div
                      className="border-2 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-wrap gap-2 justify-center">
                        {/* New images */}
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group">
                            <img src={src} alt={`New ${idx + 1}`} className="max-h-24 rounded" />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs opacity-80 hover:opacity-100"
                              onClick={e => {
                                e.stopPropagation();
                                handleRemoveNew(idx);
                              }}
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      {imagePreviews.length === 0 && (
                        <span className="text-gray-400">Click or drag images here</span>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImagesChange}
                      />
                    </div>
                    {errors.images && <p className="text-red-600 mt-1">{errors.images}</p>}
                  </div>
                  {/* Switches for in_stock, is_active, is_featured, on_sale */}
                  <div className="col-span-2 grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id="in_stock"
                        className="w-4 h-4"
                        checked={data.in_stock}
                        onChange={(e) => setData('in_stock', e.target.checked)}
                      />
                      <Label htmlFor="in_stock" className="mb-0">
                        In Stock
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id="is_active"
                        className="w-4 h-4"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                      />
                      <Label htmlFor="is_active" className="mb-0">
                        Active
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id="is_featured"
                        className="w-4 h-4"
                        checked={data.is_featured}
                        onChange={(e) => setData('is_featured', e.target.checked)}
                      />
                      <Label htmlFor="is_featured" className="mb-0">
                        Featured
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id="on_sale"
                        className="w-4 h-4"
                        checked={data.on_sale}
                        onChange={(e) => setData('on_sale', e.target.checked)}
                      />
                      <Label htmlFor="on_sale" className="mb-0">
                        On Sale
                      </Label>
                    </div>
                  </div>
                  <div className="col-span-2 mt-4">
                    <Button
                      type="submit"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full"
                      disabled={processing}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}