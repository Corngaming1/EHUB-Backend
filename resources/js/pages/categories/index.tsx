import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
// Define a minimal PageProps type if not available from elsewhere
type PageProps = {
    auth?: unknown;
    [key: string]: unknown;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

export default function Dashboard() {
    type Category = {
        id: number;
        name: string;
        image: string | null;
        is_active: boolean;
    };

    type CategoriesPageProps = PageProps & {
        categories: Category[];
    };

        const { categories } = usePage<CategoriesPageProps>().props;

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Category | null>(null);

    // Filter categories for suggestions and table
    const suggestions = search
        ? categories.filter(cat =>
            cat.name.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const filteredCategories = selected
        ? categories.filter(cat => cat.id === selected.id)
        : search
            ? suggestions
            : categories;

    function handleSelect(cat: Category) {
        setSelected(cat);
        setSearch(cat.name);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value);
        setSelected(null);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && suggestions.length > 0) {
            setSelected(suggestions[0]);
            setSearch(suggestions[0].name);
        }
    }

    function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
        // Use Inertia to send a delete request
        Inertia.delete(`/categories/${id}`);
    }
}



    return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='rounded border p-6 shadow-xl'>
                    <div className='mb-4'>
                        <Label htmlFor="category-name">Category Name</Label>
                        <div className="flex items-end gap-2 mt-2 relative">
                            <Input
                                id="category-name"
                                placeholder="Enter category name"
                                type="text"
                                value={search}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                            />
                            <Link href="/categories/create">
                                <Button variant="outline" className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                                    <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                                    <span className="max-sm:sr-only">Add new Category</span>
                                </Button>
                            </Link>
                            {/* Suggestions dropdown */}
                            {search && !selected && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 z-10 w-full text-gray-500 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                                    {suggestions.map(cat => (
                                        <div
                                            key={cat.id}
                                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                            onClick={() => handleSelect(cat)}
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                   <TableBody>
                                    {filteredCategories.map((category, idx) => (
                                        <TableRow key={category.id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell>
                                                    {category.image ? (
                                                        <img
                                                            src={`/storage/${category.image}`}
                                                            alt={category.name}
                                                            className="h-10 w-10 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400">No image</span>
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                {category.is_active ? (
                                                    <span className="text-green-600">Active</span>
                                                ) : (
                                                    <span className="text-red-600">Inactive</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/categories/${category.id}/edit`}>
                                                    <Button size="sm" variant="outline" className="mr-2">Edit</Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(category.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
           </div>
        </AppLayout>
    );
}
