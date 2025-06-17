import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { Inertia } from '@inertiajs/inertia';

type PageProps = {
  brands: Brand[];
};

type Brand = {
    id: number;
    name: string;
    slug: string;
    image?: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Brands',
        href: '/brands',
    },
];

export default function BrandsIndex() {
    const { brands } = usePage<PageProps>().props;

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this brand?')) {
            Inertia.delete(`/brands/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brands" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="rounded border p-6 shadow-xl">
                    <div className="mb-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Brands</h1>
                        <Link href="/brands/create">
                            <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                <PlusIcon size={16} aria-hidden="true" />
                                <span>Create Brand</span>
                            </Button>
                        </Link>
                    </div>
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Active</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {brands.map((brand, idx) => (
                                        <TableRow key={brand.id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{brand.name}</TableCell>
                                            <TableCell>
                                                {brand.image && (
                                                    <img
                                                        src={`/storage/${brand.image}`}
                                                        alt={brand.name}
                                                        className="h-10 w-10 object-cover rounded"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {brand.is_active ? (
                                                    <span className="text-green-600">Active</span>
                                                ) : (
                                                    <span className="text-red-600">Inactive</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/brands/${brand.id}/edit`}>
                                                    <Button size="sm" variant="outline" className="mr-2">Edit</Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(brand.id)}
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