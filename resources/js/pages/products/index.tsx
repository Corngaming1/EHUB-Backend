// [unchanged imports at top]
import { useState, useRef, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PlusIcon, MoreVertical } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { type BreadcrumbItem } from '@/types';

type Auth = {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

type Product = {
  in_stock: boolean;
  id: number;
  name: string;
  sku?: string;
  image: string | null;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  is_active: boolean;
  price?: number;
  quantity?: number;
  discount_percentage?: number;
  on_sale?: boolean;
};

type PaginatedProducts = {
  data: Product[];
  links: { url: string | null; label: string; active: boolean }[];
  meta: { current_page: number; last_page: number };
};

type ProductsPageProps = {
  auth?: Auth;
  products: PaginatedProducts;
  filters?: { search?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Products',
    href: '/products',
  },
];

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 9 }).map((_, idx) => (
        <TableCell key={idx}>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function ProductsIndex() {
  const { products, filters } = usePage<ProductsPageProps>().props;
  const [search, setSearch] = useState(filters?.search || '');
  const [debouncedSearch] = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);

  if (!products || !Array.isArray(products.data) || !Array.isArray(products.links)) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Products" />
        <div className="p-8 text-center text-gray-500">Loading products...</div>
      </AppLayout>
    );
  }

  useEffect(() => {
    const unsubscribeStart = Inertia.on('start', () => setLoading(true));
    const unsubscribeFinish = Inertia.on('finish', () => setLoading(false));
    return () => {
      unsubscribeStart();
      unsubscribeFinish();
    };
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      Inertia.get('/products', { search: debouncedSearch }, { preserveState: true, replace: true });
    }
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      Inertia.delete(`/products/${id}`);
    }
  }

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);

  function handleMenuToggle(id: number) {
    if (openMenuId === id) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      setOpenMenuId(id);
      const btn = buttonRefs.current[id];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setMenuPosition({
          left: rect.left,
          top: rect.bottom + 4,
        });
      }
    }
  }

  function handleMenuClose() {
    setOpenMenuId(null);
    setMenuPosition(null);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Products" />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
        </div>
      )}
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-4">
            <Label htmlFor="product-name">Product Name</Label>
            <div className="flex items-end gap-2 mt-2 relative">
              <Input
                id="product-name"
                placeholder="Enter product name or SKU"
                type="text"
                value={search}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <Button
                variant="outline"
                className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => Inertia.get('/products', { search: debouncedSearch }, { preserveState: true, replace: true })}
              >
                Search
              </Button>
              <Link href="/products/create">
                <Button
                  variant="outline"
                  className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Add new Product</span>
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardContent className="min-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 10 }).map((_, idx) => <SkeletonRow key={idx} />)
                    : products.data.map((product, idx) => (
                        <TableRow key={product.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.sku ?? <span className="text-gray-400">No SKU</span>}</TableCell>
                          <TableCell>
                            {product.category ? product.category.name : <span className="text-gray-400">No category</span>}
                          </TableCell>
                          <TableCell>
                            {product.brand ? product.brand.name : <span className="text-gray-400">No brand</span>}
                          </TableCell>
                        <TableCell>
                      {product.on_sale && Number(product.discount_percentage) > 0 ? (
                        <>
                          <span className="line-through text-gray-500 me-1">
                            ₱{Number(product.price).toFixed(2)}
                          </span>
                          <span className="text-green-600 font-semibold">
                            ₱{(
                              Number(product.price) *
                              (1 - Number(product.discount_percentage) / 100)
                            ).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span>₱{Number(product.price).toFixed(2)}</span>
                      )}
                    </TableCell>
                          <TableCell>
                            {typeof product.quantity === 'number' ? product.quantity : 0}
                          </TableCell>
                          <TableCell>
                            {product.quantity && product.quantity > 0 ? (
                              <span className="text-green-600 font-semibold">In Stock</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Out of Stock</span>
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
                            <div className="relative">
                              <Button
                                ref={el => { buttonRefs.current[product.id] = el; }}
                                size="icon"
                                variant="ghost"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleMenuToggle(product.id);
                                }}
                                aria-label="Actions"
                              >
                                <MoreVertical />
                              </Button>
                              {openMenuId === product.id && menuPosition && (
                                <div
                                  ref={menuDropdownRef}
                                  className="fixed z-50 w-32 rounded-md shadow-lg text-gray-900 dark:text-gray-900 bg-white ring-1 ring-black ring-opacity-5"
                                  style={{
                                    left: menuPosition.left,
                                    top: menuPosition.top,
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <div className="py-1 flex flex-col">
                                    <Link href={`/products/${product.id}`}>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        onClick={handleMenuClose}
                                      >
                                        Show
                                      </button>
                                    </Link>
                                    <Link href={`/products/${product.id}/edit`}>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        onClick={handleMenuClose}
                                      >
                                        Edit
                                      </button>
                                    </Link>
                                    <hr className="my-1" />
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                                      onClick={() => {
                                        handleMenuClose();
                                        handleDelete(product.id);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  }
                </TableBody>
              </Table>
              <div className="flex justify-center mt-4 gap-1">
                {products.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url}
                    className={`px-3 py-1 rounded transition
                        ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}
                        ${link.url ? 'hover:bg-blue-500 hover:text-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                      `}
                    onClick={() => link.url && Inertia.visit(link.url!)}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
