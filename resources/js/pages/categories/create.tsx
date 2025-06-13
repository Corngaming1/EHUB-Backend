import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Categories',
        href: '/create/categories',
    },
];

export default function Dashboard() {
    const { data, setData, post } = useForm<{
    name: string;
    slug: string;
    image: File | null;
    is_active: boolean;
}>({
    name: '',
    slug: '',
    image: null,
    is_active: true,
});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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
            setImagePreview(URL.createObjectURL(file));
            setData('image', file); // <-- Add this line
        }
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setData('image', file); // <-- Add this line
            if (fileInputRef.current) {
                // Set the file input's files property (optional, for form submission)
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        }
    }
   
   
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='rounded border p-6 shadow-xl'>
                    <div className='mb-5 flex items-center justify-between'>
                        <div className="text-xl text-slate-600">Create Category</div>
                     <Link href="/categories">
                        <Button variant="outline" className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                            Back To Category
                        </Button>
                    </Link>
                    </div>

                    <Card>
                        <CardContent>
                            <form   onSubmit={e => {
                                e.preventDefault();
                                post(route('categories.store'), {
                                forceFormData: true,
                                onSuccess: () => {
                                    // Optionally reset the form or show a message
                                }
                                });
                            }}>
                              <div className='grid grid-cols-2 gap-4'>
                                     <div className='col-span-2 md:col-span-1'>
                                       <Label htmlFor="name">Name</Label>
                                        <Input
                                            type='text'
                                            id='name'
                                            placeholder='Category name'
                                            value={data.name}
                                            onChange={e => {
                                                setData('name', e.target.value);
                                                setData('slug', slugify(e.target.value));
                                            }}
                                        />
                                    </div>
                                    <div className='col-span-2 md:col-span-1'>
                                       <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            type='text'
                                            id='slug'
                                            placeholder='category-slug'
                                            value={data.slug}
                                            disabled
                                        />
                                    </div>
                                     <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="image">Image</Label>
                                        <div
                                            className="border-2 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={e => e.preventDefault()}
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
                                    </div>
                                    <div className='col-span-2 md:col-span-1 flex items-center gap-2 mt-6'>
                                        <Input type='checkbox' id='is_active' className="w-4 h-4" defaultChecked />
                                        <Label htmlFor="is_active" className="mb-0">Active</Label>
                                    </div>
                                    <div className='col-span-2 mt-4'>
                                        <Button type="submit" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full">
                                            Create Category
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
