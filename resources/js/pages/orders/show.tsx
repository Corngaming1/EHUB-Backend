import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';

type User = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

type Item = {
  id: number;
  quantity: number;
  unit_amount: number;
  product?: Product | null;
};

type Order = {
  id: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  currency: string;
  shipping_amount?: number | null;
  shipping_method?: string | null;
  notes?: string | null;
  user?: User | null;
  items: Item[];
  created_at: string;
  updated_at: string;
};

type ShowPageProps = {
  order: Order;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Orders', href: '/orders' },
  { title: 'Order Details', href: '' },
];

export default function Show() {
  const { order } = usePage<ShowPageProps>().props;

  if (!order) {
    return <div>Loading order details...</div>;
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Order #${order.id}`} />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <Link href="/orders">
            <Button
                variant="outline"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                Back to Orders
          </Button>
          </Link>
        </div>

        <Card>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>User:</strong>{' '}
                {order.user ? (
                 <Link href={`/users/${order.user.id}/edit`} className="text-blue-600 hover:underline">
                  {order.user.name}
                </Link>
                ) : (
                  <span className="text-gray-400">No user assigned</span>
                )}
              </div>

              <div>
                <strong>Grand Total:</strong> {order.currency} {Number(order.grand_total).toFixed(2)}
              </div>

              <div>
                <strong>Payment Status:</strong>{' '}
                <PaymentStatusBadge status={order.payment_status} />
              </div>

              <div>
                <strong>Status:</strong>{' '}
                <StatusBadge label={order.status} active={order.status !== 'canceled'} />
              </div>

              <div>
                <strong>Shipping Amount:</strong>{' '}
                {order.shipping_amount !== null && order.shipping_amount !== undefined ? (
                  <>
                    {order.currency} {Number(order.shipping_amount).toFixed(2)}
                  </>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>

              <div>
                <strong>Shipping Method:</strong>{' '}
                {order.shipping_method || <span className="text-gray-400">N/A</span>}
              </div>

              <div>
                <strong>Notes:</strong>{' '}
                {order.notes ? (
                  <p className="whitespace-pre-line">{order.notes}</p>
                ) : (
                  <span className="text-gray-400">No notes provided.</span>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <div>Created at: {new Date(order.created_at).toLocaleString()}</div>
                <div>Last updated: {new Date(order.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card className="mt-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            {order.items && order.items.length > 0 ? (
     <table className="w-full table-auto border-collapse border border-gray-300 text-gray-900 dark:text-white">
  <thead>
    <tr className="bg-gray-100 dark:bg-black">
      <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
      <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
      <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
      <th className="border border-gray-300 px-4 py-2 text-right">Total Price</th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-black">
    {order.items.map((item) => (
      <tr
        key={item.id}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <td className="border border-gray-300 px-4 py-2 dark:text-white">
          {item.product ? (
            <Link href={`/products/${item.product.id}`} className="text-blue-600 hover:underline">
              {item.product.name}
            </Link>
          ) : (
            'Unknown Product'
          )}
        </td>
        <td className="border border-gray-300 px-4 py-2 text-right dark:text-white">{item.quantity}</td>
        <td className="border border-gray-300 px-4 py-2 text-right dark:text-white">
          {order.currency} {Number(item.unit_amount).toFixed(2)}
        </td>
        <td className="border border-gray-300 px-4 py-2 text-right dark:text-white">
          {order.currency} {(item.unit_amount * item.quantity).toFixed(2)}
        </td>
      </tr>
    ))}
  </tbody>
</table>
            ) : (
              <p className="text-gray-500">No products found for this order.</p>
            )}
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
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  switch (status.toLowerCase()) {
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'new':
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'failed':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}