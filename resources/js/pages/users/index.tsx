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

type PageProps = {
  auth?: any;
  [key: string]: any;
};

type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
};

type UsersPageProps = PageProps & {
  users: User[];
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Users',
    href: '/users',
  },
];

export default function UsersDashboard() {
  const { users } = usePage<UsersPageProps>().props;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  // Dropdown menu state and refs
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);

  // Filter users for suggestions and table
  const suggestions = search
    ? users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const filteredUsers = selected
    ? users.filter(user => user.id === selected.id)
    : search
    ? suggestions
    : users;

  function handleSelect(user: User) {
    setSelected(user);
    setSearch(user.name);
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
    if (confirm('Are you sure you want to delete this user?')) {
      Inertia.delete('/users/${id}');
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-4">
            <Label htmlFor="user-name">User Name</Label>
            <div className="flex items-end gap-2 mt-2 relative">
              <Input
                id="user-name"
                placeholder="Enter user name"
                type="text"
                value={search}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <Link href="/users/create">
                <Button
                  variant="outline"
                  className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Add new User</span>
                </Button>
              </Link>
              {/* Suggestions dropdown */}
              {search && !selected && suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-10 w-full text-gray-500 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                  {suggestions.map(user => (
                    <div
                      key={user.id}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelect(user)}
                    >
                      {user.name}
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
                    <TableHead>Email</TableHead>
                    <TableHead>Email Verified At</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, idx) => (
                    <TableRow key={user.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.email_verified_at ? user.email_verified_at : <span className="text-gray-400">Not verified</span>}
                      </TableCell>
                      <TableCell>{user.created_at}</TableCell>
                      <TableCell>
                        <div className="relative">
                          <Button
                            ref={el => { buttonRefs.current[user.id] = el; }}
                            size="icon"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              handleMenuToggle(user.id);
                            }}
                            aria-label="Actions"
                          >
                            <MoreVertical />
                          </Button>
                          {openMenuId === user.id && menuPosition && (
                            <div
                              ref={menuDropdownRef}
                              className="fixed z-50 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                              style={{
                                left: menuPosition.left,
                                top: menuPosition.top,
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="py-1 flex flex-col">
                                <Link href={`/users/${user.id}/edit`}>
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
                                    handleDelete(user.id);
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}