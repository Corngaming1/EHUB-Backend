import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Create Users',
    href: '/create/users',
  },
];

export default function CreateUser() {
  const { data, setData, post, processing, errors } = useForm<{
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    email_verified_at: string | null;
     role: string;
  }>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '', 
    email_verified_at: null,
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto max-w-3xl mx-auto">
        <div className="rounded border p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-xl text-slate-600">Create User</h1>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  post(route('users.store'), {
                    onSuccess: () => {
                      // Optionally reset form or show a success message
                    },
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="User name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                      autoComplete="name"
                      disabled={processing}
                    />
                    {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="Email address"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                      autoComplete="email"
                      disabled={processing}
                    />
                    {errors.email && <p className="text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      placeholder="Password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                      autoComplete="new-password"
                      disabled={processing}
                    />
                    {errors.password && <p className="text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input
                      type="password"
                      id="password_confirmation"
                      placeholder="Confirm password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      required
                      autoComplete="new-password"
                      disabled={processing}
                    />
                    {errors.password_confirmation && <p className="text-red-600 mt-1">{errors.password_confirmation}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="email_verified_at">Email Verified At</Label>
                    <Input
                      type="datetime-local"
                      id="email_verified_at"
                      value={data.email_verified_at ?? ''}
                      onChange={(e) => setData('email_verified_at', e.target.value)}
                      disabled={processing}
                    />
                    {errors.email_verified_at && <p className="text-red-600 mt-1">{errors.email_verified_at}</p>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={data.role}
                      onChange={(e) => setData('role', e.target.value)}
                      required
                      disabled={processing}
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="">Select role</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="customer">Customer</option>
                    </select>
                    {errors.role && <p className="text-red-600 mt-1">{errors.role}</p>}
                  </div>

                  <div className="col-span-2 mt-4">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white w-full"
                    >
                      Create User
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