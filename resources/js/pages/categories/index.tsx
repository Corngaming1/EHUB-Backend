import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
// Define a minimal PageProps type if not available from elsewhere
type PageProps = {
    auth?: any;
    [key: string]: any;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='rounded border p-6 shadow-xl'>
                    <div className='mb-4'>
                        <Label htmlFor="category-name">Category Name</Label>
                        <div className="flex items-end gap-2 mt-2">
                            <Input id="category-name" placeholder="Enter category name" type="text" />
                            <Link href="/categories/create">
                                <Button variant="outline" className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                                    <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                                    <span className="max-sm:sr-only">Add new Category</span>
                                </Button>
                            </Link>
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
                                    {categories.map((category, idx) => (
                                        <TableRow key={category.id}>
                                            <TableHead>{idx + 1}</TableHead>
                                            <TableHead>{category.name}</TableHead>
                                            <TableHead>
                                                {category.image ? (
                                                    <img src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded" />
                                                ) : (
                                                    <span className="text-gray-400">No image</span>
                                                )}
                                            </TableHead>
                                            <TableHead>
                                                {category.is_active ? (
                                                    <span className="text-green-600">Active</span>
                                                ) : (
                                                    <span className="text-red-600">Inactive</span>
                                                )}
                                            </TableHead>
                                            <TableHead>
                                                {/* Add edit/delete actions here */}
                                            </TableHead>
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
