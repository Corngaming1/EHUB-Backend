import {PlaceholderPattern} from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';

type Order = {
  id: number;
  status: string;
  grand_total: number;
  created_at: string;
};

type Stats = {
  products: number;
  brands: number;
  categories: number;
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

export default function Dashboard() {
  const {
    auth,
    latestOrders = [],
    stats = { products: 0, brands: 0, categories: 0 },
  } = usePage<{
    auth: { user: { name: string } };
    latestOrders?: Order[];
    stats?: Stats;
  }>().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        {/* User Greeting */}
        <div className="text-xl font-semibold">Welcome back, {auth.user.name}!</div>

        {/* Stats Cards */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex flex-col justify-center items-center">
            <div className="text-3xl font-bold">{stats.products}</div>
            <div className="text-lg mt-2">Products</div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex flex-col justify-center items-center">
            <div className="text-3xl font-bold">{stats.brands}</div>
            <div className="text-lg mt-2">Brands</div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex flex-col justify-center items-center">
            <div className="text-3xl font-bold">{stats.categories}</div>
            <div className="text-lg mt-2">Categories</div>
          </div>
        </div>

        {/* Latest Orders Section */}
        <div className="mt-6 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
          <h2 className="mb-4 text-xl font-semibold">Latest Orders</h2>
          {latestOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="text-left py-2 px-3">Order ID</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Total</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 px-3">{order.id}</td>
                    <td className="py-2 px-3 capitalize">{order.status}</td>
                    <td className="py-2 px-3">₱{Number(order.grand_total).toFixed(2)}</td>
                    <td className="py-2 px-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-3">
                      <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
