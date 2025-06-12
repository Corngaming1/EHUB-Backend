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
    title: 'Edit Category',
    href: '/categories',
  },
];

export default function EditCategory({ category }: { category: any }) {
  const { data, setData, processing, errors } = useForm<{
    name: string;
    slug: string;
    image: File | null;
    is_active: boolean;
  }>({
    name: category.name || '',
    slug: category.slug || '',
    image: null,
    is_active: !!category.is_active,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(category.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setData('image', file);
      setImagePreview(URL.createObjectURL(file));
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_method', 'PUT'); // Spoof PUT method
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    if (data.image) {
      formData.append('image', data.image);
    }
    formData.append('is_active', data.is_active ? '1' : '0');

    Inertia.post(route('categories.update', category.id), formData, {
      forceFormData: true,
      onSuccess: () => console.log('Update successful'),
      onError: (errs) => console.log('Validation errors:', errs),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Category" />
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl w-full max-w-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xl text-slate-600">Edit Category</div>
            <Link href="/categories">
              <Button
                variant="outline"
                className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back To Category
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
                      placeholder="Category name"
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
                    <Input type="text" id="slug" placeholder="category-slug" value={data.slug} disabled />
                    {errors.slug && <p className="text-red-600 mt-1">{errors.slug}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="image">Image</Label>
                    <div
                      className="border-2 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-32 mb-2" />
                      ) : (
                        <span className="text-gray-400">Click or drag image here</span>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                    {errors.image && <p className="text-red-600 mt-1">{errors.image}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center gap-2 mt-6">
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