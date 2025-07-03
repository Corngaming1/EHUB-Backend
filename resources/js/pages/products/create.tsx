import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useRef, useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Create Products',
    href: '/create/products',
  },
];

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

interface CreateProductProps {
  categories?: Category[];
  brands?: Brand[];
}

export default function CreateProduct({ categories = [], brands = [] }: CreateProductProps) {
  const { data, setData, post, processing, errors } = useForm<{
    name: string;
    slug: string;
    description: string;
    price: number | '';
    category_id: number | '';
    brand_id: number | '';
    images: File[]; // changed from image: File | null
    in_stock: boolean;
    is_active: boolean;
    is_featured: boolean;
    on_sale: boolean;
    quantity: number | '';
  }>({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    brand_id: '',
    images: [], // changed from image: null
    in_stock: true,
    is_active: true,
    is_featured: false,
    on_sale: false,
    quantity: '',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setData('images', files);

    // Clean up old previews
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    setData('images', files);

    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);

    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  }

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('products.store'), {
      forceFormData: true,
      onSuccess: () => {
        // Optionally reset form or show success message
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Product" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto max-w-3xl mx-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-xl text-slate-600">Create Product</h1>
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
                        const newName = e.target.value;
                        setData('name', newName);
                        setData('slug', slugify(newName));
                      }}
                      required
                    />
                    {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      type="text"
                      id="slug"
                      placeholder="product-slug"
                      value={data.slug}
                      disabled
                    />
                    {errors.slug && <p className="text-red-600 mt-1">{errors.slug}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Product description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      className="w-full border rounded p-2"
                      rows={4}
                    />
                    {errors.description && <p className="text-red-600 mt-1">{errors.description}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      type="number"
                      id="price"
                      placeholder="Price"
                      value={data.price}
                      onChange={e => setData('price', e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      step="1.0"
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

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                      id="category_id"
                      value={data.category_id}
                      onChange={e => setData('category_id', Number(e.target.value))}
                      required
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Category</option>
                      {(categories || []).map(cat => (
                        <option key={cat.id} value={cat.id} style={{ color: 'black' }}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category_id && <p className="text-red-600 mt-1">{errors.category_id}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="brand_id">Brand</Label>
                    <select
                      id="brand_id"
                      value={data.brand_id}
                      onChange={e => setData('brand_id', Number(e.target.value))}
                       className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Brand</option>
                      {(brands || []).map(brand => (
                        <option key={brand.id} value={brand.id} style={{ color: 'black' }}>{brand.name}</option>
                      ))}
                    </select>
                    {errors.brand_id && <p className="text-red-600 mt-1">{errors.brand_id}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="images">Images</Label>
                    <div
                      className="border-2 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                    >
                      {imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {imagePreviews.map((src, idx) => (
                            <img key={idx} src={src} alt={`Preview ${idx + 1}`} className="max-h-32 mb-2" loading="lazy"/>
                          ))}
                        </div>
                      ) : (
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
                        onChange={handleImageChange}
                      />
                    </div>
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

                  <div className="col-span-2 mt-4">
                    <Button
                      type="submit"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full"
                      disabled={processing}
                    >
                      Create Product
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