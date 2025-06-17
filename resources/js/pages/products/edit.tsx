import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import React, { useRef, useState, useEffect } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Edit Product',
    href: '/products',
  },
];

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  is_active: boolean;
  in_stock: boolean;
  is_featured: boolean;
  on_sale: boolean;
  images?: string[];
  category_id?: number;
  brand_id?: number;
};

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

export default function EditProduct({
  product,
  categories = [],
  brands = [],
}: {
  product: Product;
  categories?: Category[];
  brands?: Brand[];
}) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URLs for selected images
  useEffect(() => {
    if (selectedImages.length < 1) {
      setPreviewUrls([]);
      return;
    }

    const urls = selectedImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup URLs on unmount or when selectedImages changes
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedImages]);

  const { data, setData, processing, errors } = useForm<{
    name: string;
    slug: string;
    price: string;
    is_active: boolean;
    in_stock: boolean;
    is_featured: boolean;
    on_sale: boolean;
    category_id: number | '';
    brand_id: number | '';
    images?: File[];
  }>({
    name: product.name || '',
    slug: product.slug || '',
    price: product.price ? String(product.price) : '',
    is_active: !!product.is_active,
    in_stock: !!product.in_stock,
    is_featured: !!product.is_featured,
    on_sale: !!product.on_sale,
    category_id: product.category_id ?? '',
    brand_id: product.brand_id ?? '',
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(filesArray);
      setData('images', filesArray);
    }
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
    formData.append('category_id', data.category_id ? String(data.category_id) : '');
    formData.append('brand_id', data.brand_id ? String(data.brand_id) : '');

    selectedImages.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Edit Product</h1>
            <Link
              href="/products"
              className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Back
            </Link>
          </div>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-600' : ''}
                    />
                    {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  {/* Slug */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={data.slug}
                      onChange={e => setData('slug', e.target.value)}
                      className={errors.slug ? 'border-red-600' : ''}
                    />
                    {errors.slug && <p className="text-red-600 mt-1">{errors.slug}</p>}
                  </div>

                  {/* Price */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={data.price}
                      onChange={e => setData('price', e.target.value)}
                      className={errors.price ? 'border-red-600' : ''}
                    />
                    {errors.price && <p className="text-red-600 mt-1">{errors.price}</p>}
                  </div>

                  {/* Category */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                      id="category_id"
                      value={data.category_id}
                      onChange={e => setData('category_id', Number(e.target.value))}
                      className="block w-full rounded border px-3 py-2"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <p className="text-red-600 mt-1">{errors.category_id}</p>}
                  </div>

                  {/* Brand */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="brand_id">Brand</Label>
                    <select
                      id="brand_id"
                      value={data.brand_id}
                      onChange={e => setData('brand_id', Number(e.target.value))}
                      className="block w-full rounded border px-3 py-2"
                    >
                      <option value="">Select brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand_id && <p className="text-red-600 mt-1">{errors.brand_id}</p>}
                  </div>

                  {/* Existing images preview */}
                  <div className="col-span-2">
                    <Label>Existing Images</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {product.images && product.images.length > 0 ? (
                        product.images.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`Existing product image ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                        ))
                      ) : (
                        <p className="text-gray-500">No existing images</p>
                      )}
                    </div>
                  </div>

                  {/* New images preview */}
                  <div className="col-span-2 mt-4">
                    <Label>New Images Preview</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {previewUrls.length > 0 ? (
                        previewUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Selected image preview ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                        ))
                      ) : (
                        <p className="text-gray-500">No new images selected</p>
                      )}
                    </div>
                  </div>

                  {/* File input for images */}
                  <div className="col-span-2">
                    <Label htmlFor="images">Select New Images</Label>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="block w-full rounded border px-3 py-2"
                       accept="image/*" // <-- Add this line
                    />
                    {errors.images && <p className="text-red-600 mt-1">{errors.images}</p>}
                  </div>

                  {/* Submit */}
                  <div className="col-span-2 flex justify-end">
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Updating...' : 'Update Product'}
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
