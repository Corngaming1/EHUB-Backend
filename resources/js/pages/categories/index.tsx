import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type Category = {
  id: number;
  name: string;
  image: string | null;
  is_active: boolean;
};

type PaginatedCategories = {
  data: Category[];
  links: { url: string | null; label: string; active: boolean }[];
  meta: { current_page: number; last_page: number; };
};

type PageProps = {
  auth?: AuthUser;
  categories: PaginatedCategories;
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Categories',
    href: '/categories',
  },
];

export default function Dashboard() {
  const { categories, filters } = usePage<PageProps & { filters: { search?: string } }>().props;

    // Defensive check
    if (
    !categories ||
    !Array.isArray(categories.data) ||
    !Array.isArray(categories.links)
  ) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Categories" />
        <div className="p-8 text-center text-gray-500">Loading categories...</div>
      </AppLayout>
    );
  }

  const [search, setSearch] = useState(filters?.search || '');
  const [selected, setSelected] = useState<Category | null>(null);

  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);


  const filteredCategories = categories.data;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
  setSearch(e.target.value);
  setSelected(null);
}

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') {
    Inertia.get('/categories', { search }, { preserveState: true, replace: true });
  }
}

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      Inertia.delete(`/categories/${id}`);
      setOpenMenuId(null);
      setMenuPosition(null);
    }
  }

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

  // Listen for Inertia navigation events
  useEffect(() => {
    const start = () => setLoading(true);
    const finish = () => setLoading(false);

    const unsubscribeStart = Inertia.on('start', start);
    const unsubscribeFinish = Inertia.on('finish', finish);

    return () => {
      unsubscribeStart();
      unsubscribeFinish();
    };
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
        </div>
      )}

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-4">
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
                <Button
                  variant="outline"
                  className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                >
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
                        <div className="relative">
                          <Button
                            ref={el => { buttonRefs.current[category.id] = el; }}
                            size="icon"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              handleMenuToggle(category.id);
                            }}
                            aria-label="Actions"
                          >
                            <MoreVertical />
                          </Button>
                          {openMenuId === category.id && menuPosition && (
                            <div
                              ref={menuDropdownRef}
                              className="fixed z-50 w-32 rounded-md shadow-lg bg-white text-gray-900 dark:text-gray-900 ring-1 ring-black ring-opacity-5"
                              style={{
                                left: menuPosition.left,
                                top: menuPosition.top,
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="py-1 flex flex-col">
                                <Link href={`/categories/${category.id}/edit`}>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={handleMenuClose}
                                  >
                                    Edit
                                  </button>
                                </Link>
                                <hr className="my-1" />
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  onClick={() => {
                                    handleMenuClose();
                                    handleDelete(category.id);
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
                  ))}
                </TableBody>
              </Table>
                 <div className="flex justify-center mt-4 gap-1">
                {categories.links.map((link, idx) => (
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