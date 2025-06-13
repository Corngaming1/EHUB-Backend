import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Edit User',
    href: '/users',
  },
];

type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
};


export default function EditUser({ user }: { user: User }) {
  const { data, setData, processing, errors } = useForm<{
    name: string;
    email: string;
    is_active: boolean;
  }>({
    name: user.name || '',
    email: user.email || '',
    is_active: !!user.is_active,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    Inertia.put(route('users.update', user.id), data, {
      onSuccess: () => console.log('Update successful'),
      onError: (errs) => console.log('Validation errors:', errs),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="rounded border p-6 shadow-xl w-full max-w-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-xl text-slate-600">Edit User</div>
            <Link href="/users">
              <Button
                variant="outline"
                className="aspect-square max-sm:p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back To Users
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
                      placeholder="User name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="User email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-red-600 mt-1">{errors.email}</p>}
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