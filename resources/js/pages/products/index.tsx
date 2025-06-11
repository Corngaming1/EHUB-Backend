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

type PageProps = {
  auth?: any;
  [key: string]: any;
};

type Product = {
  id: number;
  name: string;
  image: string | null;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  is_active: boolean;
  price?: number;
  // ...add other fields as needed
};

type ProductsPageProps = PageProps & {
  products: Product[];
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Products',
    href: '/products',
  },
];

export default function ProductsIndex() {
  const { products } = usePage<ProductsPageProps>().props;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  // Filter products for suggestions and table
  const suggestions = search
    ? products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const filteredProducts = selected
    ? products.filter(product => product.id === selected.id)
    : search
    ? suggestions
    : products;

  function handleSelect(product: Product) {
    setSelected(product);
    setSearch(product.name);
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
    if (confirm('Are you sure you want to delete this product?')) {
      Inertia.delete(`/products/${id}`);
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Products" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-4">
            <Label htmlFor="product-name">Product Name</Label>
            <div className="flex items-end gap-2 mt-2 relative">
              <Input
                id="product-name"
                placeholder="Enter product name"
                type="text"
                value={search}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <Link href="/products/create">
                <Button
                  variant="outline"
                  className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Add new Product</span>
                </Button>
              </Link>
              {/* Suggestions dropdown */}
              {search && !selected && suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-10 w-full text-gray-500 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                  {suggestions.map(product => (
                    <div
                      key={product.id}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelect(product)}
                    >
                      {product.name}
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
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, idx) => (
                    <TableRow key={product.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.image ? (
                          <img
                            src={
                              product.image.startsWith('http')
                                ? product.image
                                : `/storage/${product.image}`
                            }
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.category ? product.category.name : <span className="text-gray-400">No category</span>}
                      </TableCell>
                      <TableCell>
                        {product.brand ? product.brand.name : <span className="text-gray-400">No brand</span>}
                      </TableCell>
                      <TableCell>
  {product.price !== undefined && product.price !== null ? (
    <span>₱{product.price}</span>
  ) : (
    <span className="text-gray-400">No price</span>
  )}
</TableCell>
                      <TableCell>
                        {product.is_active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline" className="mr-2">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
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