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
  quantity: number | '';
  description?: string;
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
    quantity: string | number | undefined;
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
    description?: string;
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
    quantity: product.quantity ?? '',
    description: product.description || '',
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
    formData.append('quantity', data.quantity !== '' ? String(data.quantity) : '0');
    formData.append('description', data.description || '');

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
             <Link href="/products">
                  <Button
                    variant="outline"
                    className={`
                      cursor-pointer
                      transition
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      active:scale-95
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-400
                      px-4 py-2
                      rounded
                    `}
                  >
                    Back To Products
                  </Button>
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

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="quantity">Quantity In Stock</Label>
                    <Input
                      type="number"
                      id="quantity"
                      placeholder="Quantity"
                      value={data.quantity}
                      onChange={e => setData('quantity', e.target.value === '' ? '' : Number(e.target.value))}
                      min={0}
                      required
                    />
                    {errors.quantity && <p className="text-red-600 mt-1">{errors.quantity}</p>}
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Product description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        className="w-full border rounded p-2"
                        rows={4}
                        required
                      />
                      {errors.description && <p className="text-red-600 mt-1">{errors.description}</p>}
                    </div>

                  {/* Category */}
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                      id="category_id"
                      value={data.category_id}
                      onChange={e => setData('category_id', Number(e.target.value))}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value=""style={{ color: 'black' }}>Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id} style={{ color: 'black' }}>
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
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="" style={{ color: 'black' }}>Select brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id} style={{ color: 'black' }}>
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
                            src={`/products/${product.id}/image/${idx}`}
                            alt={`Existing product image ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded"
                            loading="lazy"
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
                            loading="lazy"
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
                      accept="image/*"
                    />
                    {errors.images && <p className="text-red-600 mt-1">{errors.images}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1 flex flex-col gap-2 mt-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={data.in_stock}
                            onChange={(e) => setData('in_stock', e.target.checked)}
                          />
                          <span>In Stock</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                          />
                          <span>Active</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={data.is_featured}
                            onChange={(e) => setData('is_featured', e.target.checked)}
                          />
                          <span>Featured</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={data.on_sale}
                            onChange={(e) => setData('on_sale', e.target.checked)}
                          />
                          <span>On Sale</span>
                        </label>
                      </div>

                  {/* Submit */}
                  <div className="col-span-2 flex justify-end">
                    <Button
                    type="submit"
                    disabled={processing}
                    className={`
                      cursor-pointer
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      transition
                      active:scale-95
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-400
                      px-4 py-2
                      rounded
                      ${processing ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
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