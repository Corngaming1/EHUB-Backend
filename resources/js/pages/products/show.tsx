import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';

type Product = {
  quantity: number;
  id: number;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price?: number;
  image?: string | null;
  images?: string[];
  category?: { id: number; name: string } | null;
  brand?: { id: number; name: string } | null;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  on_sale: boolean;
  discount_percentage?: number;
  created_at: string;
  updated_at: string;
};

type ShowPageProps = {
  product: Product;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Products', href: '/products' },
  { title: 'Product Details', href: '' },
];

export default function Show() {
  const { product } = usePage<ShowPageProps>().props;

  if (!product) {
    return <div>Loading product details...</div>;
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Product: ${product.name}`} />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <Link href="/products">
            <Button
              variant="outline"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Back to Products
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                {/* Show multiple images if available, else fallback to single image */}
                {product.images && product.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`/products/${product.id}/image/${idx}`}
                        alt={product.name + ' ' + (idx + 1)}
                        className="max-h-48 w-32 object-contain rounded"
                        loading="lazy"
                      />
                    ))}
                  </div>
                ) : product.image ? (
                  <img
                    src={`/products/${product.id}/image/0`}
                    alt={product.name}
                    className="max-h-48 w-full object-contain rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-48 w-full flex items-center justify-center bg-gray-100 rounded text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <strong>Slug:</strong> <span>{product.slug}</span>
                </div>
                <div>
                  <strong>SKU:</strong> <span>{product.sku || '—'}</span>
                </div>
                <div>
                  <strong>Description:</strong>
                  <p className="whitespace-pre-line mt-1">{product.description || 'No description provided.'}</p>
                </div>
                <div>
                <strong>Price:</strong>{' '}
                {product.price !== undefined && product.price !== null && !isNaN(Number(product.price)) ? (
                  product.on_sale && Number(product.discount_percentage) > 0 ? (
                    <>
                      <span className="line-through text-gray-500 me-2">
                        ₱{Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-green-600 font-semibold">
                        ₱{(
                          Number(product.price) *
                          (1 - Number(product.discount_percentage || 0) / 100)
                        ).toFixed(2)}
                      </span>
                      <span className="ml-2 text-sm text-red-500 font-medium">
                        ({Number(product.discount_percentage)}% OFF)
                      </span>
                    </>
                  ) : (
                    <span>₱{Number(product.price).toFixed(2)}</span>
                  )
                ) : (
                  <span className="text-gray-400">No price</span>
                )}
              </div>
                <div>
                  <strong>Category:</strong>{' '}
                  {product.category ? product.category.name : <span className="text-gray-400">No category</span>}
                </div>
                <div>
                  <strong>Brand:</strong>{' '}
                  {product.brand ? product.brand.name : <span className="text-gray-400">No brand</span>}
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <StatusBadge label="In Stock" active={product.in_stock} />
                  <StatusBadge label="Active" active={product.is_active} />
                  <StatusBadge label="Featured" active={product.is_featured} />
                  <StatusBadge label="On Sale" active={product.on_sale} />
                </div>
                <div className="mb-2">
                  <strong>In Stock:</strong>{' '}
                  {typeof product.quantity === 'number'
                    ? `${product.quantity} in stock`
                    : product.in_stock
                      ? 'In Stock'
                      : 'Out of Stock'}
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  <div>Created at: {new Date(product.created_at).toLocaleString()}</div>
                  <div>Last updated: {new Date(product.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {label}: {active ? 'Yes' : 'No'}
    </span>
  );
}